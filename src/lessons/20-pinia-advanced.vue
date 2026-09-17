<script setup>
import { ref, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
const { count } = storeToRefs(counter)

const events = ref([])
const add = (m) => events.value.unshift(`${new Date().toLocaleTimeString()}  ${m}`)

// $subscribe: fires on ANY state change. { mutation, type, payload } + state.
const stopSub = counter.$subscribe((mutation, state) => {
  add(`$subscribe: ${mutation.type} → count=${state.count}`)
})

// $onAction: fires when an action is called; hook into after / onError.
const stopAction = counter.$onAction(({ name, args, after, onError }) => {
  add(`$onAction: ${name}(${args.join(',')}) started`)
  after(() => add(`  ↳ ${name} finished`))
  onError((e) => add(`  ↳ ${name} threw ${e.message}`))
})

onUnmounted(() => {
  stopSub()
  stopAction()
})

function patchObject() {
  // $patch with an object — shallow merge, one devtools entry
  counter.$patch({ count: counter.count + 10 })
}
function patchFn() {
  // $patch with a function — for array pushes / complex updates, still batched
  counter.$patch((state) => {
    state.count += 1
    state.history.push(state.count)
  })
}
function replaceState() {
  // Replace the whole state object
  counter.$state = { count: 999, history: [999] }
}
</script>

<template>
  <div>
    <h1>20 · storeToRefs, $patch, $subscribe, $onAction</h1>

    <div class="demo-box">
      <p>count = <strong>{{ count }}</strong></p>
      <BaseButton size="sm" @click="counter.increment()">increment() action</BaseButton>
      <BaseButton size="sm" @click="patchObject()">$patch(obj) +10</BaseButton>
      <BaseButton size="sm" @click="patchFn()">$patch(fn) +1</BaseButton>
      <BaseButton size="sm" variant="secondary" @click="replaceState()">$state = {…}</BaseButton>
      <BaseButton size="sm" variant="secondary" @click="counter.$reset()">$reset()</BaseButton>

      <h3>subscription log</h3>
      <pre>{{ events.slice(0, 10).join('\n') }}</pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>storeToRefs(store)</code>: the ONLY correct way to destructure state/getters in a component and keep reactivity. (Actions are plain functions — destructure freely.)</li>
        <li><code>$patch(object)</code> shallow-merges; <code>$patch(fn)</code> gives you the draft for array/nested edits. Both = a single, labelled devtools transaction.</li>
        <li><code>$subscribe((mutation, state) =&gt; ...)</code>: react to any state change (persistence plugins use this). Pass <code>{ detached: true }</code> to survive the component unmounting.</li>
        <li><code>$onAction</code>: intercept actions for logging, analytics, optimistic-UI rollback, timing (our logger plugin uses it — lesson 21).</li>
        <li><code>$state</code> get/set replaces everything; handy for hydration and test setup.</li>
        <li>Subscriptions created in <code>setup</code> auto-stop on unmount unless <code>detached</code>. Keep the returned stop fn otherwise.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-4) 0 var(--space-2);
}
</style>
