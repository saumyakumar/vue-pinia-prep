<script setup>
// A grandchild that never received props — it pulls shared state straight from
// an ancestor via inject(). Great for "theme", "current user", "form context";
// bad as a substitute for a real store when many unrelated components need it.
import { inject } from 'vue'
import { THEME_KEY } from '@/keys'

// Second arg = default if no provider found (keeps the component usable standalone).
const theme = inject(THEME_KEY, { accent: '#888', density: 'normal', setAccent: () => {} })
</script>

<template>
  <div class="box" :style="{ borderColor: theme.accent, padding: theme.density === 'compact' ? '4px' : '12px' }">
    <p>I'm 2 levels deep. Injected accent: <code>{{ theme.accent }}</code>, density: <code>{{ theme.density }}</code>.</p>
    <!-- The provided object included a method — children can call UP without emits. -->
    <button @click="theme.setAccent('#' + Math.floor(Math.random() * 16777215).toString(16))">
      randomise accent (calls provided method)
    </button>
  </div>
</template>

<style scoped>
.box {
  border: 2px solid;
  border-radius: var(--radius-sm);
}
</style>
