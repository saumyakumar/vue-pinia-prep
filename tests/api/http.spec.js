import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { http, HttpError } from '@/api/http'

const realFetch = globalThis.fetch

function jsonRes(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function stubFetch(impl) {
  const fn = vi.fn(impl)
  globalThis.fetch = fn
  return fn
}

beforeEach(() => {
  localStorage.clear()
})
afterEach(() => {
  globalThis.fetch = realFetch
  vi.restoreAllMocks()
})

describe('http.js', () => {
  it('parses JSON on success and builds the query string', async () => {
    const f = stubFetch(() => Promise.resolve(jsonRes({ ok: true })))
    const data = await http.get('/api/x', { query: { a: 1, b: 'two', c: null } })
    expect(data).toEqual({ ok: true })
    const calledUrl = f.mock.calls[0][0].toString()
    expect(calledUrl).toContain('a=1')
    expect(calledUrl).toContain('b=two')
    expect(calledUrl).not.toContain('c=') // null skipped
  })

  it('normalises a 404 into an HttpError with status/code', async () => {
    stubFetch(() => Promise.resolve(jsonRes({ message: 'nope', code: 'not_found' }, 404)))
    await expect(http.get('/api/x', { retries: 0 })).rejects.toMatchObject({
      name: 'HttpError',
      status: 404,
      code: 'not_found',
    })
  })

  it('retries transient 5xx then succeeds', async () => {
    let n = 0
    const f = stubFetch(() => {
      n++
      return Promise.resolve(n === 1 ? jsonRes({ message: 'boom' }, 503) : jsonRes({ recovered: true }))
    })
    const data = await http.get('/api/x', { retries: 2 })
    expect(data).toEqual({ recovered: true })
    expect(f).toHaveBeenCalledTimes(2)
  })

  it('does NOT retry a 4xx', async () => {
    const f = stubFetch(() => Promise.resolve(jsonRes({ message: 'bad' }, 400)))
    await expect(http.get('/api/x', { retries: 3 })).rejects.toBeInstanceOf(HttpError)
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('maps a fetch rejection (offline) to a network HttpError', async () => {
    stubFetch(() => Promise.reject(new TypeError('Failed to fetch')))
    await expect(http.get('/api/x', { retries: 0 })).rejects.toMatchObject({ status: 0, code: 'network' })
  })

  it('attaches a bearer token from localStorage', async () => {
    localStorage.setItem('auth', JSON.stringify({ token: 'abc123' }))
    const f = stubFetch(() => Promise.resolve(jsonRes({})))
    await http.get('/api/x')
    expect(f.mock.calls[0][1].headers.Authorization).toBe('Bearer abc123')
  })
})
