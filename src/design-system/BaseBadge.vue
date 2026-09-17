<script setup>
defineProps({
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'success', 'warning', 'danger', 'info'].includes(v),
  },
})
</script>

<template>
  <span class="badge" :class="`badge--${tone}`"><slot /></span>
</template>

<style scoped>
.badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.badge--neutral {
  background: var(--color-surface-2);
  color: var(--color-text-muted);
}
.badge--success {
  background: #dcfce7;
  color: #15803d;
}
.badge--warning {
  background: #fef3c7;
  color: #b45309;
}
.badge--danger {
  background: #fee2e2;
  color: #b91c1c;
}
.badge--info {
  background: #dbeafe;
  color: #1d4ed8;
}
</style>
