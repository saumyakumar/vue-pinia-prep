<script setup>
import { ref, reactive, watch, watchEffect } from 'vue'

const query = ref('')
const log = reactive([])
function note(msg) {
  log.unshift(`${new Date().toLocaleTimeString()}  ${msg}`)
  if (log.length > 8) log.pop()
}

// ── watch: explicit source(s) + callback with (newVal, oldVal). Lazy by default.
watch(query, (val, old) => {
  console.log('watch1', val, old)
  note(`watch: "${old}" -> "${val}"`)
})

// watch with options
watch(
  query,
  (val) => {console.log('watch2', val); note(`watch{immediate}: fired with "${val}"`)},
  { immediate: true }, // run once right away
)

// watch a getter (needed to watch a property of a reactive object)
const filters = reactive({ carrier: 'all', onTimeOnly: false })
watch(
  () => ({ ...filters }), // getter returning a fresh object
  (val) => note(`filters changed: ${JSON.stringify(val)}`),
  { deep: true },
)

// ── watchEffect: no explicit source. Runs immediately, then re-runs whenever ANY
//    reactive value it read changes. Great for "keep X in sync with whatever it needs".
watchEffect((onCleanup) => {
  const current = query.value
  // Simulate a cancellable async search. onCleanup runs before the next run
  // (or on unmount) — this is how you cancel stale requests / race conditions.
  const id = setTimeout(() => {
    if (current) note(`watchEffect: search request for "${current}" completed`)
  }, 400)
  onCleanup(() => clearTimeout(id))
})

// stop handle: watchers created in setup auto-stop on unmount, but you can stop early.
const stop = watch(query, () => {})
</script>

<template>
  <div>
    <h1>04 · watch vs watchEffect</h1>

    <div class="demo-box">
      <input v-model="query" placeholder="type a search query…" />
      <label><input v-model="filters.onTimeOnly" type="checkbox" /> on-time only</label>
      <label>carrier
        <select v-model="filters.carrier">
          <option>all</option>
          <option>Maersk</option>
          <option>DHL</option>
        </select>
      </label>
      <button @click="stop()">stop the extra watcher</button>

      <h3>event log</h3>
      <pre>{{ log.join('\n') }}</pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>watch</code>: you name the source, callback gets old + new value, lazy unless <code>immediate: true</code>. Best when you need the previous value or want precise control.</li>
        <li><code>watchEffect</code>: auto-collects dependencies, runs eagerly. Best for "sync side effect with reactive inputs". No old value.</li>
        <li>Watching a property of a <code>reactive</code> object: pass a <strong>getter</strong> <code>() =&gt; obj.prop</code>, not <code>obj.prop</code>.</li>
        <li><code>deep: true</code> is expensive on large objects; prefer watching a specific getter.</li>
        <li>The cleanup callback (<code>onCleanup</code> / <code>onInvalidate</code>) is the standard way to cancel stale async work and avoid race conditions — this exact pattern shows up in the REST lesson (24).</li>
        <li><code>flush: 'post'</code> runs the callback after the DOM updates (needed if you must read updated DOM); <code>'pre'</code> (default) runs before; <code>'sync'</code> runs immediately.</li>
        <li>Watchers in <code>&lt;script setup&gt;</code> auto-stop on unmount. Ones created later (inside a callback) do not — keep the stop handle.</li>
      </ul>
    </details>
  </div>
</template>
