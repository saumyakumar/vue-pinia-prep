// v-intersect="onChange" — fires the handler with the IntersectionObserverEntry
// each time the element crosses the viewport threshold. Directive form of
// useIntersectionObserver, for when you just want a callback on a plain element.
export const vIntersect = {
  mounted(el, binding) {
    const options = binding.arg === 'once' ? { threshold: 0 } : { threshold: 0, ...(binding.value?.options ?? {}) }
    const cb = typeof binding.value === 'function' ? binding.value : binding.value?.handler
    el.__io__ = new IntersectionObserver(([entry]) => {
      cb?.(entry)
      if (binding.modifiers.once && entry.isIntersecting) {
        el.__io__.disconnect()
      }
    }, options)
    el.__io__.observe(el)
  },
  unmounted(el) {
    el.__io__?.disconnect()
    delete el.__io__
  },
}
