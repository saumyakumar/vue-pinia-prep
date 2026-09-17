<script setup>
// A reusable error boundary. `onErrorCaptured` catches errors from descendant
// components' render, watchers, lifecycle hooks and event handlers.
//
// Return `false` to STOP the error propagating further up (and to app.config.errorHandler).
import { ref, onErrorCaptured } from 'vue'

const error = ref(null)

onErrorCaptured((err, instance, info) => {
  error.value = { message: err.message, info }
  return false // handled here
})

function reset() {
  error.value = null
}
defineExpose({ reset })
</script>

<template>
  <slot v-if="!error" />
  <div v-else class="boundary" role="alert">
    <strong>⚠️ This section crashed.</strong>
    <p>{{ error.message }} <small>({{ error.info }})</small></p>
    <slot name="fallback" :reset="reset">
      <button @click="reset">Try again</button>
    </slot>
  </div>
</template>

<style scoped>
.boundary {
  border: 1px solid var(--color-danger);
  background: #fef2f2;
  color: #991b1b;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
}
:root[data-theme='dark'] .boundary {
  background: #3b1111;
  color: #fecaca;
}
</style>
