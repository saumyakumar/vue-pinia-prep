<script setup>
// A component whose setup() throws when it MOUNTS with `explode: true`.
//
// This check only runs once, when the instance is created — it does NOT
// re-run just because `explode` changes on an already-mounted instance
// (setup() never re-runs). The parent must force a remount (e.g. `:key`) to
// get a fresh throw. See lesson 15's takeaways for why.
const props = defineProps({ explode: Boolean })

if (props.explode) {
  throw new Error('Bomb component exploded during render')
}
</script>

<template>
  <p>💣 Bomb is {{ explode ? 'explode' : 'stable' }}.</p>
</template>
