// A data-fetching composable built on http.js. Handles the state machine every
// data screen needs: idle → loading → (success | error), plus:
//   - cancels the in-flight request when inputs change or the component unmounts
//     (no setState-after-unmount, no race where an old response overwrites a new one)
//   - re-runs when a reactive/getter URL changes
//   - a tiny in-memory cache with TTL (shared across callers by URL)
//   - manual refetch()
import { ref, shallowRef, watch, toValue, onScopeDispose } from 'vue'
import { http, HttpError } from '@/api/http'

const cache = new Map() // url -> { at, data }

export function useFetch(url, options = {}) {
  const { immediate = true, cacheTtl = 0, query } = options

  const data = shallowRef(null)
  const error = shallowRef(null)
  const loading = ref(false)
  const finished = ref(false)

  let controller = null

  async function execute() {
    const path = toValue(url)
    const q = toValue(query)
    const key = path + (q ? `?${new URLSearchParams(q)}` : '')

    // serve fresh-enough cache
    if (cacheTtl > 0) {
      const hit = cache.get(key)
      if (hit && Date.now() - hit.at < cacheTtl) {
        data.value = hit.data
        error.value = null
        finished.value = true
        return
      }
    }

    controller?.abort() // cancel any previous request
    controller = new AbortController()
    loading.value = true
    error.value = null
    finished.value = false

    try {
      const result = await http.get(path, { query: q, signal: controller.signal })
      data.value = result
      if (cacheTtl > 0) cache.set(key, { at: Date.now(), data: result })
    } catch (e) {
      // An abort is not a real error — a newer request superseded this one.
      if (e instanceof HttpError && e.code === 'aborted') return
      error.value = e
    } finally {
      loading.value = false
      finished.value = true
    }
  }

  if (isWatchable(url) || isWatchable(query)) {
    watch(() => [toValue(url), toValue(query)], execute, { immediate })
  } else if (immediate) {
    execute()
  }

  onScopeDispose(() => controller?.abort())

  return { data, error, loading, finished, refetch: execute }
}

function isWatchable(x) {
  return typeof x === 'function' || (x && typeof x === 'object' && 'value' in x)
}
