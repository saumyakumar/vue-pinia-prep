// A directive that shows a tooltip on hover. Demonstrates:
//  - reading the binding value AND reacting when it changes (`updated` hook)
//  - binding.arg / binding.modifiers (v-tooltip:top.light="...")
//  - creating and cleaning up a DOM node the directive owns
export const vTooltip = {
  mounted(el, binding) {
    el.__tip__ = document.createElement('div')
    el.__tip__.className = 'v-tooltip'
    el.__tip__.textContent = binding.value ?? ''
    el.__tip__.style.cssText = `
      position:fixed; padding:4px 8px; font-size:12px; border-radius:4px;
      background:#1c2430; color:#fff; pointer-events:none; opacity:0;
      transition:opacity .12s; z-index:999;`
    document.body.appendChild(el.__tip__)

    el.__show__ = () => {
      const r = el.getBoundingClientRect()
      el.__tip__.style.left = `${r.left + r.width / 2}px`
      el.__tip__.style.top = `${r.top - 30}px`
      el.__tip__.style.transform = 'translateX(-50%)'
      el.__tip__.style.opacity = '1'
    }
    el.__hide__ = () => (el.__tip__.style.opacity = '0')

    el.addEventListener('mouseenter', el.__show__)
    el.addEventListener('mouseleave', el.__hide__)
  },
  updated(el, binding) {
    el.__tip__.textContent = binding.value ?? ''
  },
  unmounted(el) {
    el.removeEventListener('mouseenter', el.__show__)
    el.removeEventListener('mouseleave', el.__hide__)
    el.__tip__.remove()
  },
}
