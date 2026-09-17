<script setup>
// A layout primitive. Uses NAMED slots so callers control header/body/footer
// independently. `useSlots()` lets us hide the header wrapper when no header is passed.
import { useSlots } from 'vue'
const slots = useSlots()
</script>

<template>
  <section class="card">
    <header v-if="slots.header" class="card__header">
      <slot name="header" />
    </header>
    <div class="card__body">
      <slot />
    </div>
    <footer v-if="slots.footer" class="card__footer">
      <slot name="footer" />
    </footer>
  </section>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.card__header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}
.card__body {
  padding: var(--space-4);
}
.card__footer {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-2);
}
</style>
