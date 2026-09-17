// Custom directive: call a handler when a click lands OUTSIDE the element.
// Usage: <div v-click-outside="close">
//
// A directive object has lifecycle hooks that receive (el, binding).
// We stash the listener on `el` so `unmounted` can remove exactly it.
export const vClickOutside = {
  mounted(el, binding) {
    el.__clickOutside__ = (event) => {
      if (!el.contains(event.target)) binding.value(event)
    }
    // `true` = capture phase, so we see the click before stopPropagation can hide it.
    document.addEventListener('click', el.__clickOutside__, true)
  },
  unmounted(el) {
    document.removeEventListener('click', el.__clickOutside__, true)
    delete el.__clickOutside__
  },
}
