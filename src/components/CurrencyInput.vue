<script setup>
// v-model target component using `defineModel` (Vue 3.4+).
//
// `defineModel()` returns a ref. Reading it = the parent's value; writing it =
// emits `update:modelValue`. You can also declare a custom modifier handler.
//
// Old way (still works, good to know for interviews):
//   const props = defineProps(['modelValue'])
//   const emit = defineEmits(['update:modelValue'])
//   // then emit('update:modelValue', newValue)

// modelValue + a `.capitalize`-style modifier: here we implement `.round`
const [model, modifiers] = defineModel({
  type: Number,
  default: 0,
  set(value) {
    return modifiers.round ? Math.round(value) : value
  },
})
</script>

<template>
  <label class="ci">
    <span>Amount (USD)</span>
    <input
      :value="model"
      type="number"
      step="0.01"
      @input="model = $event.target.valueAsNumber || 0"
    />
    <output>{{ model.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }}</output>
  </label>
</template>

<style scoped>
.ci {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}
input {
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
output {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}
</style>
