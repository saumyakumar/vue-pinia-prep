<script setup>
// A tour of the levers, with two live demos: lazy-mount-on-scroll and v-memo.
import { ref, shallowRef } from 'vue'
import { useIntersectionObserver } from '@/composables/useIntersectionObserver'
import D3Sparkline from '@/components/D3Sparkline.vue'
import { KPI_SERIES } from '@/api/dataset'

// 1. Lazy-mount an expensive widget only when it scrolls into view.
const heavyAnchor = ref(null)
const { hasEntered } = useIntersectionObserver(heavyAnchor)
const spark = KPI_SERIES(40).onTimePct

// 2. v-memo: only re-render a row when its dependency array changes.
// The random number in each cell only changes when that cell actually re-renders.
const rows = shallowRef(
  Array.from({ length: 24 }, (_, i) => ({ id: i, label: `Row ${i}`, hot: false })),
)
const tick = ref(0)
function touch(i) {
  rows.value = rows.value.map((r) => (r.id === i ? { ...r, hot: !r.hot } : r))
}
function forceAll() {
  // change something the memo depends on for every row
  tick.value++
  rows.value = rows.value.map((r) => ({ ...r }))
}
</script>

<template>
  <div>
    <h1>29 · Performance toolkit</h1>

    <div class="lesson-note">
      <strong>Load performance</strong>
      <ul>
        <li><strong>Route-level code splitting</strong>: <code>component: () =&gt; import('./View.vue')</code> — every lesson here is a separate chunk (check the Network tab / <code>npm run build</code> output).</li>
        <li><code>defineAsyncComponent</code> for heavy in-page widgets (charts, editors).</li>
        <li>Prefetch likely-next routes on link hover / idle (<code>&lt;link rel="prefetch"&gt;</code> or router hooks).</li>
        <li>Tree-shake big libs (ECharts <code>echarts/core</code>, lodash-es, date-fns). Check <code>rollup-plugin-visualizer</code>.</li>
        <li>Lazy-load images (<code>loading="lazy"</code>) and off-screen sections (IntersectionObserver — demo below).</li>
      </ul>
      <strong>Runtime performance</strong>
      <ul>
        <li><code>v-memo</code> to skip subtree re-renders; correct <code>:key</code>; <code>v-once</code> for truly static content.</li>
        <li><code>shallowRef</code>/<code>shallowReactive</code>/<code>markRaw</code> for big or third-party data.</li>
        <li><code>computed</code> (cached) over methods for derived template values; avoid new object/array literals in templates.</li>
        <li><code>&lt;KeepAlive&gt;</code> to keep expensive views warm; batch high-frequency updates (lesson 25).</li>
        <li>Measure with Vue DevTools (component render flamegraph, "Highlight updates") and the browser Performance panel — never optimise blind.</li>
      </ul>
    </div>

    <div class="demo-box">
      <h3>Lazy-mount on scroll</h3>
      <p>Scroll down — the sparkline component below only mounts when its placeholder enters the viewport.</p>
      <div class="tall">scroll ⌄</div>
      <div ref="heavyAnchor" class="anchor">
        <template v-if="hasEntered">
          <p>✅ mounted now (it wasn't in the DOM until you scrolled here)</p>
          <D3Sparkline :points="spark" :width="300" :height="70" />
        </template>
        <p v-else>⏳ not mounted yet</p>
      </div>

      <h3>v-memo</h3>
      <p>
        Each cell shows a random number that changes <em>only when that cell re-renders</em>.
        Click one cell → only its number changes (memo dep <code>[r.hot]</code> flipped).
        "force re-render all" → every number changes.
      </p>
      <BaseButton size="sm" variant="secondary" @click="forceAll">force re-render all</BaseButton>
      <div class="grid">
        <div
          v-for="r in rows"
          :key="r.id"
          v-memo="[r.hot, tick]"
          class="cell"
          :class="{ hot: r.hot }"
          @click="touch(r.id)"
        >
          {{ r.label }} · {{ Math.random().toFixed(3) }}
        </div>
      </div>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Biggest wins are usually <strong>load-time</strong>: split routes, defer heavy components, shrink the vendor bundle, lazy assets.</li>
        <li><code>v-memo="[dep]"</code>: skip re-rendering a node and its children unless a dep changed. Rare but powerful in big lists/tables.</li>
        <li>Reactivity cost is real: <code>shallowRef</code> for large/immutable data, <code>markRaw</code> for chart/map instances.</li>
        <li>Profile first: Vue DevTools timeline + Chrome Performance. Optimise the actual hot path.</li>
        <li>Ship metrics: Lighthouse / Web Vitals (LCP, INP, CLS). Watch bundle size in CI.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.tall {
  height: 320px;
  display: grid;
  place-items: center;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
}
.anchor {
  min-height: 100px;
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin-top: var(--space-3);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 4px;
}
.cell {
  font-size: 0.78rem;
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.cell.hot {
  background: var(--color-primary-weak);
  border-color: var(--color-primary);
}
</style>
