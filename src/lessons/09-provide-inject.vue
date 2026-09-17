<script setup>
// provide/inject passes data to ANY descendant without prop-drilling through
// every intermediate component.
import { reactive, provide } from 'vue'
import { THEME_KEY } from '@/keys'
import InjectConsumer from '@/components/InjectConsumer.vue'

const theme = reactive({
  accent: '#10b981',
  density: 'normal',
  setAccent: (v) => (theme.accent = v),
})

// Provide a REACTIVE object so descendants update when it changes.
// Pattern: expose state + methods together; keep raw state read-only-ish by
// only letting descendants mutate through the provided methods.
provide(THEME_KEY, theme)
</script>

<template>
  <div>
    <h1>09 · provide / inject</h1>
    <p>Ancestor <code>provide()</code>s; any depth of descendant <code>inject()</code>s. No props
      passed through the middle layer.</p>

    <div class="demo-box">
      <label>density:
        <select v-model="theme.density">
          <option>normal</option>
          <option>compact</option>
        </select>
      </label>

      <div class="mid">
        <p>(intermediate component — passes nothing down)</p>
        <InjectConsumer />
      </div>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Use a <code>Symbol</code> key from a shared module — avoids string collisions, works with TS types.</li>
        <li>Provide a <strong>reactive</strong> value (ref/reactive) for descendants to stay in sync. Provide methods alongside state so children mutate through a controlled API.</li>
        <li><code>inject(key, default)</code> — always give a default (or <code>inject(key, undefined, false)</code>) so the component works in isolation and in tests.</li>
        <li>App-level: <code>app.provide(key, value)</code> in <code>main.js</code> for truly global values.</li>
        <li>provide/inject vs Pinia: inject is for <em>hierarchical</em> context (theme, form, current row). Pinia is for <em>app-wide</em> shared state with devtools, actions, and testing support. Don't rebuild a store with inject.</li>
        <li>Downside: implicit coupling — a component's data source isn't visible in its props. Keep it to genuine cross-cutting concerns.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.mid {
  margin-top: var(--space-3);
  padding: var(--space-3);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
}
</style>
