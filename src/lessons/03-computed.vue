<script setup>
import { ref, computed, reactive } from 'vue'

const first = ref('Ada')
const last = ref('Lovelace')

// READ-ONLY computed: derived value, CACHED. Only recomputes when a reactive
// dependency it actually read changes. Calling it 10× in a template = 1 computation.
const fullName = computed(() => {
  console.log('[computed] recalculating fullName')
  return `${first.value} ${last.value}`
})

// WRITABLE computed: provide get + set. Useful for two-way derived state,
// e.g. a "search string <-> filter object" bridge, or proxying a store value.
const fullNameWritable = computed({
  get: () => `${first.value} ${last.value}`,
  set: (value) => {
    [first.value, last.value] = value.split(' ')
  },
})

// A method for comparison: runs EVERY render, never cached.
function fullNameMethod() {
  return `${first.value} ${last.value}`
}

// Computed over a list — the common dashboard case.
const shipments = reactive([
  { id: 1, onTime: true, cost: 1200 },
  { id: 2, onTime: false, cost: 800 },
  { id: 3, onTime: true, cost: 1500 },
])
const stats = computed(() => ({
  count: shipments.length,
  onTimePct: Math.round((shipments.filter((s) => s.onTime).length / shipments.length) * 100),
  totalCost: shipments.reduce((n, s) => n + s.cost, 0),
}))
</script>

<template>
  <div>
    <h1>03 · Computed properties</h1>

    <div class="demo-box">
      <input v-model="first" /> <input v-model="last" />
      <p>fullName (computed, cached): <strong>{{ fullName }}</strong></p>
      <p>rendered 3× — still one recalculation: {{ fullName }} / {{ fullName }} / {{ fullName }}</p>
      <p>fullNameMethod() (not cached): {{ fullNameMethod() }}</p>

      <hr />
      <label>Writable computed: <input v-model="fullNameWritable" /></label>
      <p>→ first=<code>{{ first }}</code>, last=<code>{{ last }}</code></p>

      <hr />
      <p>Derived dashboard stats: <code>{{ stats }}</code></p>
      <button @click="shipments.push({ id: Date.now(), onTime: Math.random() > 0.5, cost: 1000 })">
        add shipment
      </button>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>computed</code> is <strong>cached</strong> by dependency; a method re-runs on every render. Use computed for anything derived that's read in a template.</li>
        <li>Computed getters must be <strong>pure</strong> — no side effects, no async. For side effects use <code>watch</code>/<code>watchEffect</code> (lesson 04).</li>
        <li>Writable computed (<code>get</code>/<code>set</code>) is the idiomatic way to adapt a value for <code>v-model</code> or to proxy Vuex/Pinia state into a local editable field.</li>
        <li>A computed only tracks dependencies it <em>actually reads</em> during the getter run — conditional branches matter.</li>
        <li>Don't mutate other state inside a computed; you'll get hard-to-trace update loops.</li>
      </ul>
    </details>
  </div>
</template>
