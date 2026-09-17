<script setup>
// A component that throws during render when `explode` is true.
const props = defineProps({ explode: Boolean })

if (props.explode) {
  throw new Error('Bomb component exploded during render')
}
</script>

<template>
  <p>💣 Bomb is stable (explode = false).</p>
</template>
