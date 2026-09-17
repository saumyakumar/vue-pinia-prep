<script setup>
defineProps({ label: { type: String, default: 'Loading…' } })
</script>

<template>
  <span class="wrap" role="status">
    <span class="ring" aria-hidden="true" />
    <span class="sr-only">{{ label }}</span>
  </span>
</template>

<style scoped>
.wrap {
  display: inline-flex;
  align-items: center;
}
.ring {
  width: 1.1em;
  height: 1.1em;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
@keyframes spin {
  to {
    transform: rotate(1turn);
  }
}
</style>
