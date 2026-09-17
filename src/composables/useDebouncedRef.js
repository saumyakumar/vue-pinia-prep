// Returns { immediate, debounced }: `immediate` updates on every keystroke,
// `debounced` only updates after `delay` ms of quiet. Used for search inputs so
// you don't fire an API call per character (JD: "optimize API interactions").
import { ref, watch, onScopeDispose } from 'vue'

export function useDebouncedRef(source, delay = 300) {
  const debounced = ref(source.value)
  let timer

  watch(source, (value) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = value
    }, delay)
  })

  // onScopeDispose works in ANY effect scope, not just component setup —
  // slightly more general than onUnmounted for composable cleanup.
  onScopeDispose(() => clearTimeout(timer))

  return debounced
}
