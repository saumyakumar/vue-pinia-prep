<script setup>
// A form field that works with v-model.
//
// `defineModel()` (Vue 3.4+) is the modern way: it returns a ref that is
// automatically wired to the parent's v-model — no manual `modelValue` prop
// + `update:modelValue` emit. See lesson 07.
//
// Accessibility: the <label> is associated with the <input> via a generated id,
// and the error message is linked with aria-describedby. Lesson 31 covers this.
import { useId } from 'vue'

// $attrs (incl. @blur, autocomplete, min, ...) is forwarded to the <input>, not
// the wrapper <div>, so we opt out of automatic fallthrough.
defineOptions({ inheritAttrs: false })

const model = defineModel({ type: [String, Number], default: '' })

defineProps({
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  error: { type: String, default: '' },
  hint: { type: String, default: '' },
})

const id = useId() // stable unique id, SSR-safe
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      :type="type"
      :aria-invalid="!!error"
      :aria-describedby="error ? `${id}-err` : hint ? `${id}-hint` : undefined"
      v-bind="$attrs"
    />
    <p v-if="hint && !error" :id="`${id}-hint`" class="hint">{{ hint }}</p>
    <p v-if="error" :id="`${id}-err`" class="error" role="alert">{{ error }}</p>
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
input {
  font: inherit;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
}
input[aria-invalid='true'] {
  border-color: var(--color-danger);
}
.hint {
  font-size: 0.76rem;
  color: var(--color-text-muted);
  margin: 0;
}
.error {
  font-size: 0.76rem;
  color: var(--color-danger);
  margin: 0;
}
</style>
