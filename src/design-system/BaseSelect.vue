<script setup>
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

const model = defineModel({ default: '' })

defineProps({
  label: { type: String, required: true },
  // options: [{ value, label }] OR plain strings
  options: { type: Array, default: () => [] },
})

const id = useId()

function normalize(opt) {
  return typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
}
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <select :id="id" v-model="model" v-bind="$attrs">
      <option v-for="opt in options" :key="normalize(opt).value" :value="normalize(opt).value">
        {{ normalize(opt).label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: var(--space-3);
}
label {
  font-size: 0.82rem;
  font-weight: 600;
}
select {
  font: inherit;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
}
</style>
