<script setup>
// The REST layer: http.js (a real fetch wrapper) + useFetch (state machine +
// cancellation + cache). Toggle the mock backend's failure rate to see it cope.
import { ref, computed } from 'vue'
import { useFetch } from '@/composables/useFetch'
import { mockConfig } from '@/api/mockBackend'
import { http } from '@/api/http'

// URL is a getter -> useFetch re-runs when `page` changes, cancelling the old request.
const page = ref(1)
const query = computed(() => ({ page: page.value, pageSize: 8 }))
const { data, error, loading, refetch } = useFetch('/api/shipments', {
  query,
  cacheTtl: 10000, // serve from cache for 10s
})

const failRate = ref(0)
function applyFail() {
  mockConfig.failRate = failRate.value
}
function goOffline() {
  mockConfig.offline = true
  setTimeout(() => (mockConfig.offline = false), 3000)
  refetch()
}

// race-condition demo: fire two quick requests, only the latest wins
const raceResult = ref('')
async function raceTest() {
  raceResult.value = 'firing page 5 then page 1 back-to-back…'
  const slow = useOnce({ page: 5, pageSize: 8 })
  const fast = useOnce({ page: 1, pageSize: 8 })
  const [a, b] = await Promise.allSettled([slow, fast])
  raceResult.value = `both resolved; a UI bound to a getter would show page 1 (the latest), not whichever finished last`
  void a
  void b
}
function useOnce(q) {
  return http.get('/api/shipments', { query: q })
}
</script>

<template>
  <div>
    <h1>24 · A real REST layer</h1>
    <p>Open <code>src/api/http.js</code> and <code>src/composables/useFetch.js</code> — the code is
      the lesson.</p>

    <div class="demo-box">
      <div class="controls">
        <BaseButton size="sm" :disabled="page === 1" @click="page--">‹ prev</BaseButton>
        <span>page {{ page }}</span>
        <BaseButton size="sm" @click="page++">next ›</BaseButton>
        <BaseButton size="sm" variant="secondary" @click="refetch">refetch</BaseButton>
      </div>

      <p v-if="loading"><BaseSpinner /> loading…</p>
      <div v-else-if="error" class="error-state" role="alert">
        <strong>Request failed:</strong> {{ error.message }}
        (status {{ error.status }}, code <code>{{ error.code }}</code>)
        <BaseButton size="sm" @click="refetch">retry</BaseButton>
      </div>
      <table v-else-if="data?.rows?.length">
        <thead><tr><th>ID</th><th>Carrier</th><th>Lane</th><th>ETA</th></tr></thead>
        <tbody>
          <tr v-for="r in data.rows" :key="r.id">
            <td>{{ r.id }}</td><td>{{ r.carrier }}</td><td>{{ r.lane }}</td><td>{{ r.etaDays }}d</td>
          </tr>
        </tbody>
      </table>
      <p v-else>No results.</p>

      <hr />
      <h3>Failure handling</h3>
      <label>failure rate:
        <input v-model.number="failRate" type="range" min="0" max="1" step="0.1" @change="applyFail" />
        {{ Math.round(failRate * 100) }}%
      </label>
      <p><small>http.js retries transient 5xx twice with exponential backoff + jitter before surfacing the error.</small></p>
      <BaseButton size="sm" variant="danger" @click="goOffline">simulate 3s offline</BaseButton>

      <h3>Race conditions</h3>
      <BaseButton size="sm" @click="raceTest">fire two overlapping requests</BaseButton>
      <p><code>{{ raceResult }}</code></p>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>One place to: prepend base URL, attach auth, parse JSON, and <strong>normalise errors</strong> into a single class (never leak a raw <code>Response</code> or bare string to callers).</li>
        <li><code>AbortController</code>: cancel the previous request when inputs change and on unmount. Prevents the "stale response overwrites fresh data" race and setState-after-unmount.</li>
        <li>Combine the caller's <code>signal</code> with an internal timeout signal.</li>
        <li>Retry only <strong>idempotent</strong> methods (GET) and only <strong>transient</strong> failures (network, 5xx, timeout) — never a 400/422. Exponential backoff + jitter avoids thundering-herd.</li>
        <li>Caching belongs a layer up (composable/store), keyed by URL+params, with a TTL. For real apps: TanStack Query (vue-query) or Pinia Colada give caching, dedup, background refetch, and devtools.</li>
        <li>Every data view has 4 states: loading / error / empty / data. Design all four.</li>
        <li>Loading/error state lives in the component or store — not in <code>http.js</code>.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-4) 0 var(--space-2);
}
.controls {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-3);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
th,
td {
  text-align: left;
  padding: 5px 8px;
  border-bottom: 1px solid var(--color-border);
}
.error-state {
  background: #fef2f2;
  color: #991b1b;
  padding: var(--space-3);
  border-radius: var(--radius-sm);
}
:root[data-theme='dark'] .error-state {
  background: #3b1111;
  color: #fecaca;
}
</style>
