<script setup>
import { ref, useTemplateRef, nextTick } from 'vue'
import FancyInput from '@/components/FancyInput.vue'

// Classic: declare a ref, name it the same as the `ref="..."` attribute.
const box = ref(null)

// Vue 3.5+: useTemplateRef('name') — clearer, decoupled from variable name.
const listRef = useTemplateRef('theList')

// Ref to a child COMPONENT instance — you get whatever it defineExpose()d.
const fancy = ref(null)

const items = ref(['a', 'b', 'c'])
const measured = ref('')

async function addAndMeasure() {
  items.value.push(`item ${items.value.length}`)
  // DOM isn't updated yet:
  measured.value = `before nextTick: ${listRef.value.children.length} children`
  await nextTick()
  measured.value += ` | after nextTick: ${listRef.value.children.length} children`
}
</script>

<template>
  <div>
    <h1>10 · Template refs, defineExpose, nextTick</h1>

    <div class="demo-box" ref="box">
      <p>this box's width: {{ box?.clientWidth }}px (from a DOM ref)</p>

      <h3>Ref to a child component</h3>
      <FancyInput ref="fancy" />
      <button @click="fancy.focus()">call child's exposed focus()</button>
      <span>child focus count: {{ fancy?.focusCount }}</span>

      <h3>nextTick — DOM updates are async</h3>
      <ul ref="theList">
        <li v-for="i in items" :key="i">{{ i }}</li>
      </ul>
      <button @click="addAndMeasure">add + measure</button>
      <p><code>{{ measured }}</code></p>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>A template ref is only populated <strong>after mount</strong> — it's <code>null</code> during <code>setup</code>. Read it in <code>onMounted</code> or an event handler.</li>
        <li><code>&lt;script setup&gt;</code> components are closed by default; the parent's ref sees nothing unless the child calls <code>defineExpose({...})</code>.</li>
        <li><code>useTemplateRef('name')</code> (3.5+) is the current recommended API; the "matching variable name" style still works.</li>
        <li>Refs inside <code>v-for</code> collect into an array (or use a function ref).</li>
        <li>State updates are batched and flushed asynchronously — <code>await nextTick()</code> before reading layout you just triggered, or measuring with <code>getBoundingClientRect()</code>.</li>
        <li>Prefer declarative bindings; reach for refs only for focus management, measuring, integrating non-Vue libs (charts, maps), and scrolling.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-4) 0 var(--space-2);
}
</style>
