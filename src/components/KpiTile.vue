<script setup>
// A child component that shows the full "component contract": typed props with
// defaults + a validator, and typed emits. Used by lesson 06.
const props = defineProps({
  label: { type: String, required: true },
  value: { type: [Number, String], required: true },
  // delta as a fraction: 0.05 => +5%
  delta: { type: Number, default: 0 },
  tone: {
    type: String,
    default: 'neutral',
    validator: (v) => ['neutral', 'good', 'bad'].includes(v),
  },
})

// Declare the events this component can emit. Acts as documentation AND lets Vue
// warn on typos. The second form (object) can validate the payload.
const emit = defineEmits({
  drilldown: (payload) => typeof payload?.label === 'string',
})

function onClick() {
  // Data flow is ONE-WAY: a child never mutates a prop. It emits and lets the
  // parent decide. Mutating `props.value` here would warn in dev.
  emit('drilldown', { label: props.label, value: props.value })
}
</script>

<template>
  <button class="tile" :class="`tile--${tone}`" @click="onClick">
    <span class="label">{{ label }}</span>
    <span class="value">{{ value }}</span>
    <span v-if="delta" class="delta" :class="{ up: delta > 0, down: delta < 0 }">
      {{ delta > 0 ? '▲' : '▼' }} {{ Math.abs(delta * 100).toFixed(1) }}%
    </span>
  </button>
</template>

<style scoped>
.tile {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  min-width: 140px;
}
.tile--good {
  border-left: 3px solid var(--color-success);
}
.tile--bad {
  border-left: 3px solid var(--color-danger);
}
.label {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
}
.value {
  font-size: 1.4rem;
  font-weight: 700;
}
.delta.up {
  color: var(--color-success);
}
.delta.down {
  color: var(--color-danger);
}
</style>
