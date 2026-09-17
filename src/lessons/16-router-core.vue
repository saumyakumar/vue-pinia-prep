<script setup>
// Vue Router 4 with the Composition API: useRoute() (current location, reactive)
// and useRouter() (the instance you navigate with).
import { computed, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// route.query is reactive. We'll drive a fake filter entirely from the URL —
// this is the right way to make dashboard state shareable/bookmarkable.
const carrier = computed({
  get: () => route.query.carrier ?? 'all',
  set: (value) =>
    router.replace({ query: { ...route.query, carrier: value === 'all' ? undefined : value } }),
})

const page = computed(() => Number(route.query.page ?? 1))
function go(delta) {
  router.push({ query: { ...route.query, page: Math.max(1, page.value + delta) } })
}

const log = ref([])
watch(
  () => route.fullPath,
  (to, from) => log.value.unshift(`nav: ${from} → ${to}`),
)
</script>

<template>
  <div>
    <h1>16 · Router core: params, query, nested</h1>

    <div class="demo-box">
      <h3>URL-driven state (query params)</h3>
      <label>carrier:
        <select v-model="carrier">
          <option>all</option>
          <option>Maersk</option>
          <option>DHL</option>
          <option>DB Schenker</option>
        </select>
      </label>
      <span>· page {{ page }}</span>
      <button @click="go(-1)">‹ prev</button>
      <button @click="go(1)">next ›</button>
      <p>Look at the address bar. <code>route.query</code> = <code>{{ route.query }}</code></p>

      <h3>RouterLink</h3>
      <nav class="links">
        <RouterLink :to="{ path: '/lesson/router-core', query: { carrier: 'Maersk', page: 2 } }">
          object location
        </RouterLink>
        <RouterLink to="/lesson/router-guards">next lesson (string)</RouterLink>
        <RouterLink to="/nope">broken link → 404</RouterLink>
      </nav>
      <p><small>Active links get <code>.router-link-active</code> / <code>.router-link-exact-active</code> classes (styled in <code>App.vue</code>).</small></p>

      <h3>navigation log</h3>
      <pre>{{ log.slice(0, 6).join('\n') }}</pre>
    </div>

    <div class="lesson-note">
      <strong>Route config</strong> lives in <code>src/router/index.js</code>. Patterns you should know:
      <pre>
{ path: '/shipments', component: ShipmentsView },              // static
{ path: '/shipments/:id', component: ShipmentDetail, props: true }, // dynamic segment -> prop
{ path: '/settings', component: Settings, children: [           // NESTED
    { path: '', component: SettingsGeneral },                   //   /settings
    { path: 'billing', component: SettingsBilling },            //   /settings/billing
] },
{ path: '/:pathMatch(.*)*', component: NotFound }               // catch-all 404
</pre>
      A nested route renders into a <code>&lt;RouterView /&gt;</code> <em>inside</em> the parent component.
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>useRoute()</code> is read-only and reactive; <code>useRouter()</code> has <code>push</code>/<code>replace</code>/<code>back</code>/<code>go</code>.</li>
        <li><code>push</code> adds a history entry; <code>replace</code> doesn't (use it for filter changes so Back isn't spammed).</li>
        <li>Prefer <code>props: true</code> on routes so components take route params as props — easier to test, no router coupling.</li>
        <li>Dynamic segment changes (<code>/x/1</code> → <code>/x/2</code>) reuse the component instance — watch <code>route.params</code> or use <code>onBeforeRouteUpdate</code> to refetch.</li>
        <li>Lazy routes (<code>component: () =&gt; import(...)</code>) are per-route code splitting — check the Network tab.</li>
        <li>Keep shareable UI state (filters, tab, page) in the query string; it's free persistence + shareability.</li>
        <li><code>createWebHistory</code> needs a server fallback to <code>index.html</code>; <code>createWebHashHistory</code> doesn't but has ugly URLs.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.links {
  display: flex;
  gap: var(--space-4);
}
button {
  margin-left: 6px;
}
</style>
