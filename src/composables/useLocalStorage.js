// A composable that syncs a ref to localStorage. Shows a composable that
// takes arguments and returns a single writable ref.
//
// `watch(..., { deep: true })` persists nested mutations too. JSON.parse is
// wrapped in try/catch because storage can hold garbage from older versions.
import { ref, watch } from 'vue'

export function useLocalStorage(key, defaultValue) {
  const stored = read()
  const state = ref(stored === undefined ? defaultValue : stored)

  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch {
        /* quota exceeded / storage disabled — fail silently in a demo */
      }
    },
    { deep: true },
  )

  function read() {
    try {
      const raw = localStorage.getItem(key)
      return raw == null ? undefined : JSON.parse(raw)
    } catch {
      return undefined
    }
  }

  return state
}
