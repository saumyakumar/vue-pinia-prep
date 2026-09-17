<script setup>
// In-component guards work in any routed component. This one is a REAL unsaved-
// changes guard — the exact pattern the capstone's ShipmentDetail uses.
import { ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const draft = ref('')
const saved = ref('')
const dirty = () => draft.value !== saved.value

onBeforeRouteLeave(() => {
  if (dirty()) {
    // Returning false cancels navigation. Returning a location redirects.
    return window.confirm('You have unsaved changes. Leave anyway?')
  }
  return true
})

onBeforeRouteUpdate((to, from) => {
  // Fires when the route changes but this component is reused (same route, new params).
  console.log('route updated, same component', from.fullPath, '→', to.fullPath)
})

const auth = useAuthStore()
</script>

<template>
  <div>
    <h1>17 · Navigation guards &amp; data loading</h1>

    <div class="demo-box">
      <h3>Unsaved-changes guard (try it)</h3>
      <label class="sr-only" for="draft">Draft notes</label>
      <textarea
        id="draft"
        v-model="draft"
        rows="3"
        placeholder="type something, then click another lesson"
      />
      <div>
        <BaseButton size="sm" @click="saved = draft">save</BaseButton>
        <BaseBadge :tone="draft !== saved ? 'warning' : 'success'">
          {{ draft !== saved ? 'unsaved changes' : 'clean' }}
        </BaseBadge>
      </div>
      <p><small>With unsaved changes, navigating away (sidebar) triggers a confirm dialog.</small></p>

      <h3>Auth state (read by a global guard)</h3>
      <p>isAuthenticated: <code>{{ auth.isAuthenticated }}</code>
        <BaseButton size="sm" @click="auth.isAuthenticated ? auth.logout() : auth.login({ email: 'a@b.co', password: 'x' })">
          {{ auth.isAuthenticated ? 'log out' : 'log in' }}
        </BaseButton>
      </p>
    </div>

    <div class="lesson-note">
      <strong>The guard hierarchy</strong> (all can be async, all can cancel/redirect):
      <pre>
// GLOBAL — src/router/index.js
router.beforeEach((to, from) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } }
})
router.beforeResolve(async (to) => { /* last chance, after in-component guards */ })
router.afterEach((to) => { document.title = to.meta.title })   // no cancel; analytics/title
router.onError((err) => { /* failed lazy chunk after a deploy -> location.reload() */ })

// PER-ROUTE
{ path: '/admin', component: Admin, beforeEnter: (to) => { ... } }

// IN-COMPONENT
onBeforeRouteLeave(), onBeforeRouteUpdate()   // Composition API
</pre>
      <strong>Data loading:</strong> the common patterns are (a) fetch in <code>onMounted</code> / a
      <code>watch</code> on params with a loading flag in the view, (b) fetch in a Pinia action the
      view calls, or (c) the newer <em>Data Loaders</em> RFC. The capstone uses (b).
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Guard return values: <code>true</code>/<code>undefined</code> = allow, <code>false</code> = cancel, a route location = redirect. Prefer returning values over the old <code>next()</code> callback.</li>
        <li>Use <code>meta: { requiresAuth: true }</code> + one global <code>beforeEach</code> rather than repeating checks per route.</li>
        <li>Guards can be <code>async</code> — await a permission check or a lazy dependency.</li>
        <li><code>onBeforeRouteUpdate</code> is where you refetch when only params changed (component is reused).</li>
        <li><code>afterEach</code> can't cancel — it's for side effects: page titles, analytics pageviews, scroll.</li>
        <li>Handle <code>router.onError</code> for chunk-load failures after deploys — prompt a refresh.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
textarea {
  width: 100%;
  font: inherit;
  padding: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
</style>
