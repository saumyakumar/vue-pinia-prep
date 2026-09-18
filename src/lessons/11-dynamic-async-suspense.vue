<script setup>
import { ref, shallowRef, defineAsyncComponent, h } from 'vue'
import KpiTile from '@/components/KpiTile.vue'
import SlotTable from '@/components/SlotTable.vue'

// ── Dynamic components: <component :is="..."> swaps which component renders.
//    `is` can be a component object, or a registered name string.
const tabs = [
  { key: 'tile', label: 'KPI tile', comp: KpiTile },
  { key: 'table', label: 'Table', comp: SlotTable },
]
const current = shallowRef(tabs[0]) // shallowRef: we don't need deep reactivity on a component

// ── Async component: code-split a heavy child; loads on first render.
//    Supports loading/error/delay/timeout options.
const LazyPanel = defineAsyncComponent({
  loader: () => import('@/components/LazyPanel.vue'),
  // render fn, not a `template` string — the production build is runtime-only and
  // can't compile template strings at runtime.
  loadingComponent: { render: () => h('p', '⏳ loading panel chunk…') },
  errorComponent: { render: () => h('p', 'Failed to load panel.') },
  delay: 150,
  timeout: 5000,
})

const showSuspense = ref(false)
const suspenseKey = ref(0)

// AsyncPanel.vue uses top-level await, so it drives <Suspense>'s fallback.
const AsyncPanelForSuspense = defineAsyncComponent(() => import('@/components/AsyncPanel.vue'))
</script>

<template>
  <div>
    <h1>11 · Dynamic / async components &amp; Suspense</h1>

    <div class="demo-box">
      <h3>&lt;component :is&gt; + &lt;KeepAlive&gt;</h3>
      <div class="tabbar">
        <button v-for="t in tabs" :key="t.key" :class="{ on: current.key === t.key }" @click="current = t">
          {{ t.label }}
        </button>
      </div>
      <!-- KeepAlive caches inactive components (state preserved, onDeactivated instead of onUnmounted) -->
      <KeepAlive>
        <component
          :is="current.comp"
          v-bind="current.key === 'tile'
            ? { label: 'Demo', value: 42 }
            : { columns: [{ key: 'id', label: 'ID' }], rows: [{ id: 1 }, { id: 2 }] }"
        />
      </KeepAlive>

      <h3>defineAsyncComponent (lazy chunk)</h3>
      <LazyPanel />

      <h3>&lt;Suspense&gt; for a component with async setup()</h3>
      <button @click="showSuspense = !showSuspense; suspenseKey++">toggle</button>
      <Suspense v-if="showSuspense" :key="suspenseKey">
        <AsyncPanelForSuspense />
        <!-- Both Suspense slots must resolve to a SINGLE root node — wrap
             multi-node fallback content in one element (a bare "<Spinner/> text"
             pair is two roots and Vue throws "slots expect a single root node"). -->
        <template #fallback>
          <p><BaseSpinner label="Fetching products…" /> loading…</p>
        </template>
      </Suspense>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>&lt;component :is&gt;</code> renders a component chosen at runtime — tab UIs, wizards, CMS blocks.</li>
        <li><code>&lt;KeepAlive&gt;</code> caches toggled-away components: state persists, <code>onActivated/onDeactivated</code> fire instead of mount/unmount. <code>:max</code> and <code>include/exclude</code> bound the cache.</li>
        <li><code>defineAsyncComponent</code> = per-component code splitting with built-in loading/error UI. Router lazy imports do the same at the route level (lesson 16).</li>
        <li><code>&lt;Suspense&gt;</code> coordinates one loading state for a subtree whose components use top-level <code>await</code>. Still officially "experimental" but widely used; pair with an error boundary (lesson 15).</li>
        <li>Give <code>&lt;Suspense&gt;</code> a <code>key</code> to force it to re-suspend when inputs change.</li>
        <li>Both the default slot and <code>#fallback</code> must resolve to <strong>exactly one root node</strong>. A stray sibling text node (like the "loading…" next to <code>&lt;BaseSpinner/&gt;</code> above) trips <code>"&lt;Suspense&gt; slots expect a single root node"</code> and the whole subtree fails to render — wrap multi-node content in one element.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.tabbar button {
  margin-right: 4px;
}
.tabbar button.on {
  background: var(--color-primary-weak);
  font-weight: 600;
}
</style>
