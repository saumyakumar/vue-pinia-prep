<script setup>
// Composables = reusable stateful logic. They're just functions that use Vue's
// reactivity APIs. This is THE pattern that replaced mixins.
import { ref } from 'vue'
import { useMouse } from '@/composables/useMouse'
import { useLocalStorage } from '@/composables/useLocalStorage'
import { useDebouncedRef } from '@/composables/useDebouncedRef'

// 1. Per-call state: each useMouse() call is independent.
const { x, y } = useMouse()

// 2. A composable that takes a key and returns a persisted writable ref.
const notes = useLocalStorage('lesson12-notes', 'edit me — I survive reloads')

// 3. Composables can build on other composables.
const search = ref('')
const debouncedSearch = useDebouncedRef(search, 500)
</script>

<template>
  <div>
    <h1>12 · Composables (reusable logic)</h1>

    <div class="demo-box">
      <p>useMouse(): x={{ x }}, y={{ y }} — move your mouse</p>

      <p>useLocalStorage(): <input v-model="notes" style="width: 320px" /> (reload the page)</p>

      <p>
        useDebouncedRef():
        <input v-model="search" placeholder="type fast…" />
      </p>
      <p>live: <code>{{ search }}</code> — debounced(500ms): <code>{{ debouncedSearch }}</code></p>
    </div>

    <div class="lesson-note">
      <strong>Authoring rules</strong> (open the files in <code>src/composables/</code>):
      <ul>
        <li>Name it <code>useXxx</code>.</li>
        <li>Call it synchronously in <code>setup</code> (or another composable) — it registers lifecycle hooks / injects.</li>
        <li>Return <code>ref</code>s (or a <code>reactive</code>) so callers keep reactivity. Don't return <code>.value</code>.</li>
        <li>Register cleanup with <code>onUnmounted</code> / <code>onScopeDispose</code>.</li>
        <li>Accept <code>ref</code>s or getters as inputs when the input can change (use <code>toValue()</code> to normalise).</li>
      </ul>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Composables vs mixins: no naming collisions, explicit data sources, composable, and they work with TypeScript. Mixins are legacy.</li>
        <li>Composables vs Pinia: composables create <em>fresh</em> state per call (unless you deliberately hoist state to module scope, like <code>useToast</code>). Pinia is a single shared instance with devtools + SSR support.</li>
        <li>Composables vs renderless components: composables have no render cost and compose more cleanly. Prefer them.</li>
        <li>A composable that adds event listeners must remove them on unmount or you leak — this is the most common bug.</li>
        <li><code>toValue(x)</code> normalises a value | ref | getter — the modern way to accept flexible inputs.</li>
      </ul>
    </details>
  </div>
</template>
