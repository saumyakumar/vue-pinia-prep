<script setup>
// Render this ONCE near the app root. It draws whatever useToast() has queued.
// Uses <TransitionGroup> so items animate in/out as the array changes (lesson 14).
import { useToast } from './useToast'
const { items, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <TransitionGroup tag="div" name="toast" class="toast-host" aria-live="polite">
      <div v-for="t in items" :key="t.id" class="toast" :class="`toast--${t.tone}`">
        {{ t.message }}
        <button aria-label="Dismiss" @click="dismiss(t.id)">✕</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  z-index: 200;
}
.toast {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--color-info);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
  padding: var(--space-3) var(--space-4);
  font-size: 0.85rem;
  display: flex;
  gap: var(--space-3);
  align-items: center;
  min-width: 220px;
}
.toast--success {
  border-left-color: var(--color-success);
}
.toast--danger {
  border-left-color: var(--color-danger);
}
.toast--warning {
  border-left-color: var(--color-warning);
}
.toast button {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
  margin-left: auto;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.2s ease;
}
</style>
