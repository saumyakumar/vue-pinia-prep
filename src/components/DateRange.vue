<script setup>
// MULTIPLE v-model: a component can expose several independent models by NAME.
// Parent:  <DateRange v-model:from="a" v-model:to="b" />
const from = defineModel('from', { type: String, default: '' })
const to = defineModel('to', { type: String, default: '' })
</script>

<template>
  <div class="dr">
    <label>From <input v-model="from" type="date" /></label>
    <label>To <input v-model="to" type="date" /></label>
  </div>
</template>

<style scoped>
.dr {
  display: flex;
  gap: var(--space-3);
}
label {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  gap: 2px;
}
input {
  padding: 5px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
</style>
