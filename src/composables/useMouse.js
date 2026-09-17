// The canonical "first composable" example.
//
// Rules it demonstrates:
//  1. Name starts with `use`.
//  2. Creates reactive state with ref().
//  3. Registers side effects (event listeners) and CLEANS THEM UP with the
//     matching lifecycle hook. onUnmounted runs when the component using this
//     composable is destroyed — no leaks.
//  4. Returns refs so the caller keeps reactivity.
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  function update(e) {
    x.value = e.clientX
    y.value = e.clientY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
