// A minimal typed-ish event bus built on the browser's own EventTarget.
// Vue 3 removed the instance $on/$emit bus; this is the modern replacement for
// the rare cases you truly need cross-tree events (usually a Pinia store is better).
import { onScopeDispose } from 'vue'

const target = new EventTarget()

export function useEventBus(name) {
  function emit(detail) {
    target.dispatchEvent(new CustomEvent(name, { detail }))
  }
  function on(handler) {
    const wrapped = (e) => handler(e.detail)
    target.addEventListener(name, wrapped)
    const off = () => target.removeEventListener(name, wrapped)
    onScopeDispose(off) // auto-cleanup when the calling component unmounts
    return off
  }
  return { emit, on }
}
