<script setup>
// Rendering 50,000 rows without freezing the tab.
import { ref, shallowRef, computed, watchEffect } from 'vue'
import { makeShipments } from '@/api/dataset'
import { useVirtualList } from '@/composables/useVirtualList'
import { useDebouncedRef } from '@/composables/useDebouncedRef'

// shallowRef: a 50k-element array does NOT need per-element deep reactivity.
// A plain ref() here would make Vue walk 50k objects on creation — wasteful.
const all = shallowRef(makeShipments(50000))

const search = ref('')
const debounced = useDebouncedRef(search, 250)
const sortKey = ref('id')
const sortDir = ref('asc')

const filtered = computed(() => {
  const q = debounced.value.toLowerCase()
  let rows = all.value
  if (q) rows = rows.filter((r) => r.id.toLowerCase().includes(q) || r.lane.toLowerCase().includes(q))
  // sort a COPY; never mutate the source array
  rows = [...rows].sort((a, b) => {
    const c = a[sortKey.value] < b[sortKey.value] ? -1 : a[sortKey.value] > b[sortKey.value] ? 1 : 0
    return sortDir.value === 'asc' ? c : -c
  })
  return rows
})

const viewport = ref(null)
const { visibleItems, totalHeight, itemHeight, onScroll, setViewport } = useVirtualList(filtered, {
  itemHeight: 34,
  overscan: 8,
})
watchEffect(() => {
  if (viewport.value) setViewport(viewport.value.clientHeight)
})

function toggleSort(key) {
  if (sortKey.value === key) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else {
    sortKey.value = key
    sortDir.value = 'asc'
  }
}

const cols = [
  { key: 'id', label: 'ID' },
  { key: 'carrier', label: 'Carrier' },
  { key: 'lane', label: 'Lane' },
  { key: 'mode', label: 'Mode' },
  { key: 'costUsd', label: 'Cost' },
  { key: 'etaDays', label: 'ETA' },
]

function exportCsv() {
  const header = cols.map((c) => c.label).join(',')
  const body = filtered.value
    .slice(0, 5000)
    .map((r) => cols.map((c) => r[c.key]).join(','))
    .join('\n')
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'shipments.csv'
  a.click()
  URL.revokeObjectURL(a.href)
}
</script>

<template>
  <div>
    <h1>28 · Large datasets &amp; rendering perf</h1>

    <div class="demo-box">
      <div class="bar">
        <input v-model="search" placeholder="filter 50,000 rows…" aria-label="filter rows" />
        <span>{{ filtered.length.toLocaleString() }} rows</span>
        <BaseButton size="sm" variant="secondary" @click="exportCsv">export CSV (first 5k)</BaseButton>
      </div>

      <div class="thead">
        <button v-for="c in cols" :key="c.key" class="th" @click="toggleSort(c.key)">
          {{ c.label }}
          <span v-if="sortKey === c.key">{{ sortDir === 'asc' ? '▲' : '▼' }}</span>
        </button>
      </div>

      <!-- The scroll container. Inner spacer has the FULL height; only ~20 rows
           exist in the DOM at any time, absolutely positioned at their offset. -->
      <div ref="viewport" class="viewport" @scroll="onScroll">
        <div class="spacer" :style="{ height: totalHeight + 'px' }">
          <div
            v-for="{ item, index, offsetY } in visibleItems"
            :key="item.id"
            class="row"
            :style="{ transform: `translateY(${offsetY}px)`, height: itemHeight + 'px' }"
            :class="{ alt: index % 2 }"
          >
            <span>{{ item.id }}</span>
            <span>{{ item.carrier }}</span>
            <span>{{ item.lane }}</span>
            <span>{{ item.mode }}</span>
            <span>${{ item.costUsd.toLocaleString() }}</span>
            <span>{{ item.etaDays }}d</span>
          </div>
        </div>
      </div>
      <p><small>Scroll it. DOM node count stays ~24 no matter the row count. Compare: rendering 50k <code>&lt;tr&gt;</code> would lock the main thread for seconds.</small></p>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><strong>Virtualise</strong> long lists: render only visible rows + overscan, with a full-height spacer for the scrollbar. Libraries: <code>vue-virtual-scroller</code>, TanStack Virtual.</li>
        <li><strong><code>shallowRef</code></strong> for big arrays/immutable data — skip deep reactive conversion. Replace <code>.value</code> to trigger updates.</li>
        <li>Sort/filter a <strong>copy</strong>; keep the source immutable so <code>computed</code> caching and change detection stay predictable.</li>
        <li><strong><code>v-memo</code></strong> on row templates to skip re-render when a row's data is unchanged; correct <code>:key</code> (stable id) so Vue patches instead of recreating.</li>
        <li>Debounce search input (250–300ms) so filtering doesn't run per keystroke.</li>
        <li>Prefer server-side pagination/filtering for truly huge sets; virtual scroll is for "large but already in memory".</li>
        <li>Measure: Vue DevTools "Highlight updates", the Performance panel flame chart, `performance.mark`. Don't guess.</li>
        <li>Other wins: <code>Object.freeze</code> rows you'll never mutate, avoid inline object/array literals in templates (new identity every render), lazy-render off-screen panels (lesson 29).</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.bar {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-2);
}
.bar input {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  flex: 1;
  max-width: 280px;
}
.thead,
.row {
  display: grid;
  grid-template-columns: 1.2fr 1fr 2fr 0.8fr 1fr 0.6fr;
  font-size: 0.82rem;
}
.thead {
  border-bottom: 2px solid var(--color-border);
}
.th {
  text-align: left;
  background: none;
  border: none;
  font: inherit;
  font-weight: 700;
  color: var(--color-text-muted);
  padding: 6px 8px;
  cursor: pointer;
}
.viewport {
  height: 380px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  position: relative;
}
.spacer {
  position: relative;
}
.row {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid var(--color-border);
  will-change: transform;
}
.row.alt {
  background: var(--color-surface-2);
}
.row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
