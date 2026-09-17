<script setup>
// Vue's reactivity is the #1 thing to understand deeply for interviews.
import { ref, reactive, toRefs, toRef, isRef, unref, shallowRef, triggerRef, markRaw, computed } from 'vue'

// ── ref: a reactive BOX around any value. Access/mutate via `.value` in JS.
//    In the template Vue auto-unwraps top-level refs, so you write `n`, not `n.value`.
const n = ref(0)

// ── reactive: a reactive PROXY of an object. No `.value`, but you can't reassign
//    the whole thing or destructure it without losing reactivity.
const state = reactive({ x: 1, y: 2, nested: { z: 3 } })

// toRefs / toRef: turn reactive object props back into refs so you CAN destructure.
const { x, y } = toRefs(state)
const zRef = toRef(state.nested, 'z')

// ── shallowRef: only `.value` reassignment is tracked, not deep mutation.
//    Use for large data structures (big arrays, class instances, chart data) where
//    deep reactivity would be wasteful. Lesson 28 uses this for a 50k-row table.
const big = shallowRef({ rows: [1, 2, 3] })
console.log('shallowRef', big)
function mutateBigWrong() {
  big.value.rows.push(Math.random()) // NOT tracked — view won't update
}
function mutateBigRight() {
  big.value = { rows: [...big.value.rows, Math.random()] } // new .value — tracked
}
function forceBig() {
  big.value.rows.push(Math.random())
  triggerRef(big) // manually tell Vue "this shallowRef changed"
}

// ── markRaw: opt an object OUT of reactivity forever (e.g. a 3rd-party chart instance).
const rawThing = markRaw({ heavy: true })
console.log('markRaw', rawThing.heavy)

const info = computed(() => ({
  nIsRef: isRef(n),
  unwrapped: unref(n), // unref(x) === isRef(x) ? x.value : x
  rawIsReactive: isRef(rawThing),
}))
</script>

<template>
  <div>
    <h1>02 · Reactivity: ref, reactive &amp; friends</h1>

    <div class="demo-box">
      <h3>ref</h3>
      <p>n = {{ n }} <button @click="n++">n++</button></p>

      <h3>reactive + toRefs</h3>
      <p>state.x={{ x }} state.y={{ y }} nested.z={{ zRef }}</p>
      <button @click="state.x++">state.x++</button>
      <button @click="state.nested.z++">nested.z++</button>

      <h3>shallowRef</h3>
      <p>rows: {{ big.rows.join(', ') }}</p>
      <button @click="mutateBigWrong">push (not tracked)</button>
      <button @click="forceBig">push + triggerRef</button>
      <button @click="mutateBigRight">replace .value (tracked)</button>
      <p><small>“push (not tracked)” updates the data but the UI only catches up on the next unrelated render.</small></p>

      <h3>helpers</h3>
      <pre>{{ info }}</pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>ref</code> vs <code>reactive</code>: prefer <code>ref</code> for primitives and as the default; it survives reassignment and destructuring (via <code>.value</code>). <code>reactive</code> is nice for grouped object state but breaks if you destructure or replace it.</li>
        <li>Losing reactivity: destructuring a <code>reactive</code> object, or spreading it, gives you plain values. Fix with <code>toRefs</code>/<code>toRef</code>. This is the same reason Pinia needs <code>storeToRefs</code> (lesson 20).</li>
        <li><code>ref</code> is auto-unwrapped in templates and as a nested property of a <code>reactive</code> object — but NOT inside a plain array or Map.</li>
        <li><code>shallowRef</code> + <code>triggerRef</code>: performance escape hatch for big/immutable-ish data; deep reactivity has a cost.</li>
        <li><code>markRaw</code>: keep heavy third-party instances (chart objects, maps) out of the proxy so Vue doesn't try to make them reactive.</li>
        <li>Reactivity is based on ES Proxies (Vue 3) — that's why adding a brand-new property to a <code>reactive</code> object works now (unlike Vue 2's <code>Vue.set</code>).</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-4) 0 var(--space-2);
}
button {
  margin: 2px 6px 2px 0;
}
</style>
