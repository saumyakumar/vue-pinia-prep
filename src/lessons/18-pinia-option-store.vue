<script setup>
// Pinia is the official state manager. A "store" is a singleton holding reactive
// state + getters + actions, with devtools, HMR, plugins and SSR support.
//
// This lesson uses an OPTION store (src/stores/counter.js).
import { useCounterStore } from '@/stores/counter'
import { storeToRefs } from 'pinia'

const counter = useCounterStore()

// Destructuring state/getters off the store LOSES reactivity (same reason as
// reactive() in lesson 02). storeToRefs fixes it. Actions can be destructured directly.
const { count, double } = storeToRefs(counter)
const { increment, reset } = counter
</script>

<template>
  <div>
    <h1>18 · Pinia — option stores</h1>

    <div class="demo-box">
      <p>count = {{ count }} · double = {{ double }} · isMultipleOf(3) = {{ counter.isMultipleOf(3) }}</p>
      <BaseButton size="sm" @click="increment()">+1</BaseButton>
      <BaseButton size="sm" @click="increment(5)">+5</BaseButton>
      <BaseButton size="sm" variant="secondary" @click="reset()">$reset()</BaseButton>
      <p>history: <code>{{ counter.history.join(', ') || '—' }}</code></p>
    </div>

    <div class="lesson-note">
      <pre>
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0, history: [] }),         // MUST be a function
  getters: {
    double: (s) => s.count * 2,                     // cached, like computed
    isMultipleOf: (s) => (n) => s.count % n === 0,  // getter returning a fn = "arg"
  },
  actions: {
    increment(by = 1) { this.count += by; this.history.push(this.count) },
    reset() { this.$reset() },                      // $reset ONLY on option stores
  },
})
</pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>state</code> is a function so every app instance / test gets its own copy.</li>
        <li>Mutate state directly in components (<code>counter.count++</code>) or via actions. There are no mutations like Vuex — that's the big simplification.</li>
        <li><code>$patch({...})</code> or <code>$patch(state =&gt; {...})</code> batches multiple changes into one devtools entry.</li>
        <li><code>storeToRefs(store)</code> to destructure state + getters and keep reactivity; actions can be pulled off directly.</li>
        <li>Getters are cached computeds; a getter returning a function is the "parameterised getter" pattern (not cached).</li>
        <li><code>$reset()</code> works only on option stores (it knows the initial <code>state()</code>). Setup stores need a manual reset (lesson 19).</li>
        <li>Pinia vs Vuex: no mutations, no modules (just multiple stores), full TS inference, smaller. Vuex is maintenance-mode.</li>
      </ul>
    </details>
  </div>
</template>
