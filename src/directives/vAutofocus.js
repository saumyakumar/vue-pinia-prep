// The simplest useful directive. `mounted` fires once the element is in the DOM.
// Usage: <input v-autofocus />
export const vAutofocus = {
  mounted(el) {
    el.focus()
  },
}
