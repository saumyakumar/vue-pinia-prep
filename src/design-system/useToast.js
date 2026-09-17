// A tiny toast system. This is a "module-level singleton composable": the reactive
// state lives in the module scope, so every component that imports useToast() shares
// the SAME queue. Great for cross-cutting UI concerns; contrast with per-call
// composables like useMouse() (lesson 12).
import { reactive } from 'vue'

const state = reactive({ items: [] })
let nextId = 1

export function useToast() {
  function push(message, { tone = 'info', timeout = 3000 } = {}) {
    const id = nextId++
    state.items.push({ id, message, tone })
    if (timeout) setTimeout(() => dismiss(id), timeout)
    return id
  }
  function dismiss(id) {
    const i = state.items.findIndex((t) => t.id === id)
    if (i !== -1) state.items.splice(i, 1)
  }
  return {
    items: state.items,
    toast: push,
    success: (m, o) => push(m, { ...o, tone: 'success' }),
    error: (m, o) => push(m, { ...o, tone: 'danger' }),
    dismiss,
  }
}
