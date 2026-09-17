<script setup>
// A child that exposes an imperative method to its parent via defineExpose.
// By default <script setup> components are "closed" — the parent can't reach in.
import { ref } from 'vue'

const el = ref(null)
const count = ref(0)

function focus() {
  el.value?.focus()
  count.value++
}

// Whitelist exactly what the parent may call. Everything else stays private.
defineExpose({ focus, focusCount: count })
</script>

<template>
  <input ref="el" class="fancy" placeholder="parent can focus me" />
</template>

<style scoped>
.fancy {
  padding: 7px 10px;
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-sm);
}
</style>
