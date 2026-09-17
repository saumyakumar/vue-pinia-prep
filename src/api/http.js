// A small, honest fetch wrapper — the kind you'd actually ship.
//
// Responsibilities:
//   - prepend a base URL, send/parse JSON
//   - normalise errors into one shape (never a bare string or a raw Response)
//   - support cancellation via AbortSignal (caller passes one)
//   - retry idempotent requests with exponential backoff + jitter
//   - attach an auth token if present
//
// It deliberately does NOT: cache (that's the caller/composable's job — lesson 24),
// dedupe, or manage loading state (that's the component/store).

// Empty by default so callers pass full paths like '/api/shipments'. Point this
// at an absolute origin (e.g. https://api.example.com) via VITE_API_URL in prod.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

export class HttpError extends Error {
  constructor(message, { status, code, body } = {}) {
    super(message)
    this.name = 'HttpError'
    this.status = status ?? 0
    this.code = code ?? 'unknown'
    this.body = body
  }
  get isNetwork() {
    return this.status === 0
  }
  get isServer() {
    return this.status >= 500
  }
  get isClient() {
    return this.status >= 400 && this.status < 500
  }
}

function getToken() {
  try {
    return JSON.parse(localStorage.getItem('auth') ?? '{}').token ?? null
  } catch {
    return null
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * @param {string} path
 * @param {object} opts
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} [opts.method]
 * @param {any} [opts.body]           auto-JSON-stringified
 * @param {Record<string,any>} [opts.query]
 * @param {AbortSignal} [opts.signal] caller-owned cancellation
 * @param {number} [opts.retries]     retry count for GET (default 2)
 * @param {number} [opts.timeout]     ms; aborts if exceeded (default 10000)
 */
export async function request(path, opts = {}) {
  const { method = 'GET', body, query, signal, retries = method === 'GET' ? 2 : 0, timeout = 10000 } = opts

  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v != null) url.searchParams.set(k, v)
  }

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let attempt = 0
  for (;;) {
    // Combine caller's signal with our own timeout signal.
    const timeoutCtrl = new AbortController()
    const onAbort = () => timeoutCtrl.abort(signal?.reason)
    if (signal) {
      if (signal.aborted) throw toAbortError(signal.reason)
      signal.addEventListener('abort', onAbort, { once: true })
    }
    const timer = setTimeout(() => timeoutCtrl.abort(new DOMException('timeout', 'TimeoutError')), timeout)

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: timeoutCtrl.signal,
      })

      if (!res.ok) {
        const payload = await safeJson(res)
        const err = new HttpError(payload?.message ?? `HTTP ${res.status}`, {
          status: res.status,
          code: payload?.code,
          body: payload,
        })
        // Retry only transient server errors on idempotent requests.
        if (err.isServer && attempt < retries) {
          attempt++
          await sleep(backoff(attempt))
          continue
        }
        throw err
      }

      return res.status === 204 ? null : await res.json()
    } catch (e) {
      if (e.name === 'AbortError' || e.name === 'TimeoutError') {
        if (e.name === 'TimeoutError' && attempt < retries) {
          attempt++
          await sleep(backoff(attempt))
          continue
        }
        throw toAbortError(e)
      }
      if (e instanceof HttpError) throw e
      // fetch() rejects (DNS, offline, CORS) => network error
      if (attempt < retries) {
        attempt++
        await sleep(backoff(attempt))
        continue
      }
      throw new HttpError(e.message || 'Network request failed', { status: 0, code: 'network' })
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }
  }
}

// full jitter: random in [0, base * 2^attempt], capped
function backoff(attempt) {
  return Math.min(8000, Math.random() * 300 * 2 ** attempt)
}

function toAbortError(reason) {
  const e = new HttpError(typeof reason === 'string' ? reason : 'Request aborted', {
    status: 0,
    code: 'aborted',
  })
  e.name = 'AbortError'
  return e
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

export const http = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  put: (path, body, opts) => request(path, { ...opts, method: 'PUT', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  delete: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
}
