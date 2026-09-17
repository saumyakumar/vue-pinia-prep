// Reactive IntersectionObserver. Used to lazy-mount expensive widgets (charts,
// images, "below the fold" panels) only when they scroll into view. Lesson 29.
import { ref, watch, onScopeDispose, toValue } from 'vue'

export function useIntersectionObserver(target, options = {}) {
  const isIntersecting = ref(false)
  const hasEntered = ref(false) // latches true — handy for "render once then keep"

  let observer = null

  function cleanup() {
    observer?.disconnect()
    observer = null
  }

  watch(
    () => toValue(target),
    (el) => {
      cleanup()
      if (!el || typeof IntersectionObserver === 'undefined') return
      observer = new IntersectionObserver(([entry]) => {
        isIntersecting.value = entry.isIntersecting
        if (entry.isIntersecting) hasEntered.value = true
      }, { rootMargin: '0px', threshold: 0, ...options })
      observer.observe(el)
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(cleanup)

  return { isIntersecting, hasEntered }
}
