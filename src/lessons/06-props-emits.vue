<script setup>
import { ref } from 'vue'
import KpiTile from '@/components/KpiTile.vue'
import MutationDemo from '@/components/MutationDemo.vue'

const lastDrilldown = ref(null)

const kpis = [
  { label: 'On-time %', value: '94.2%', delta: 0.021, tone: 'good' },
  { label: 'Avg dwell', value: '1.2d', delta: -0.08, tone: 'good' },
  { label: 'Cost / shipment', value: '$312', delta: 0.043, tone: 'bad' },
]

// Owned by the PARENT. The child (MutationDemo) only ever gets to read it as a
// prop — every path that changes it routes back through this ref.
const sharedCount = ref(3)
</script>

<template>
  <div>
    <h1>06 · Props &amp; emits (the component contract)</h1>
    <p>
      Parent passes data <strong>down</strong> via props; child sends events
      <strong>up</strong> via emits. Open <code>src/components/KpiTile.vue</code> to see the typed
      declarations.
    </p>

    <div class="demo-box">
      <div class="row">
        <KpiTile
          v-for="k in kpis"
          :key="k.label"
          :label="k.label"
          :value="k.value"
          :delta="k.delta"
          :tone="k.tone"
          @drilldown="lastDrilldown = $event"
        />
      </div>
      <p v-if="lastDrilldown">
        Parent received <code>drilldown</code>: {{ lastDrilldown }}
      </p>
    </div>

    <h2>Modifying data that came from a prop</h2>
    <p>
      A child can <strong>read</strong> a prop but must never <strong>write</strong> it. Here's what
      happens if you try anyway, and the three ways to actually do it. Open
      <code>src/components/MutationDemo.vue</code> — it's the same component demonstrating all four.
    </p>
    <div class="demo-box">
      <p>parent's <code>sharedCount</code> = <strong>{{ sharedCount }}</strong></p>
      <MutationDemo v-model:count="sharedCount" />
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Props are <strong>read-only</strong> in the child: <code>props.count++</code> is blocked in dev (Vue warns — see the demo above) and would just get overwritten by the parent's next render even if it "worked" in prod. Never mutate a prop, including nested mutation of an object/array prop (Vue won't warn about that one, but it's the same anti-pattern and makes data flow untraceable).</li>
        <li>Three correct ways to change data that came from a prop: <strong>(A) emit</strong> and let the parent update its own state (simplest, best when every change should propagate immediately); <strong>(B) a local <code>ref</code></strong> seeded from the prop for free editing, committed with an explicit emit (best for forms/drafts), re-synced with a <code>watch</code> if the parent can also change the prop; <strong>(C) a writable <code>computed</code></strong> that reads the prop and emits on write (best for a single always-in-sync field — this is exactly what <code>defineModel()</code> generates for you, lesson 07).</li>
        <li>Declare props with types + <code>required</code>/<code>default</code> + <code>validator</code>. Object/array defaults must be a factory function.</li>
        <li>Declare emits with <code>defineEmits</code>. It's documentation, prevents fallthrough of the event as a native listener, and can validate payloads.</li>
        <li>Prop names: <code>camelCase</code> in JS, <code>kebab-case</code> in templates (<code>my-prop</code>). Vue maps between them.</li>
        <li>Non-prop attributes (<code>class</code>, <code>id</code>, listeners) "fall through" to the root element automatically; disable with <code>defineOptions({ inheritAttrs: false })</code> and place <code>v-bind="$attrs"</code> yourself.</li>
        <li>One-way data flow makes state changes traceable — a big reason Vue/React scale.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h2 {
  margin: var(--space-6) 0 var(--space-2);
  font-size: 1.15rem;
}
.row {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}
</style>
