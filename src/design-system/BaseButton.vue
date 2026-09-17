<script setup>
// A design-system button. Note how it exposes a small, deliberate API:
// - `variant` and `size` are enumerated props (not free-form class strings)
// - it forwards clicks and any extra attrs ($attrs) to the real <button>
// - it renders whatever you put between the tags via the default <slot>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'ghost', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  loading: { type: Boolean, default: false },
})
</script>

<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--loading': loading }]"
    :disabled="loading || $attrs.disabled"
  >
    <span v-if="loading" class="spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.btn {
  font: inherit;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: filter 0.12s ease;
}
.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.btn:not(:disabled):hover {
  filter: brightness(0.94);
}
.btn--sm {
  padding: 4px 10px;
  font-size: 0.8rem;
}
.btn--md {
  padding: 7px 14px;
  font-size: 0.9rem;
}
.btn--lg {
  padding: 10px 20px;
  font-size: 1rem;
}
.btn--primary {
  background: var(--color-primary);
  color: #fff;
}
.btn--secondary {
  background: var(--color-surface-2);
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn--ghost {
  background: transparent;
  color: var(--color-primary-strong);
}
.btn--danger {
  background: var(--color-danger);
  color: #fff;
}
.spinner {
  width: 0.9em;
  height: 0.9em;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
