<script setup>
// Two things here:
//  1. Our hand-written logger plugin (src/stores/plugins/logger.js) — registered
//     in main.js, it runs $onAction on EVERY store. Open the console and click below.
//  2. Persistence: the auth store declares `persist` (via pinia-plugin-persistedstate,
//     also registered in main.js) so token + user survive a reload.
import { useAuthStore } from '@/stores/auth'
import { useCounterStore } from '@/stores/counter'

const auth = useAuthStore()
const counter = useCounterStore()
</script>

<template>
  <div>
    <h1>21 · Plugins &amp; persistence</h1>

    <div class="demo-box">
      <h3>Custom plugin (logger)</h3>
      <p>Every action call is logged to the console with timing. It also injected <code>store.$log</code>.</p>
      <BaseButton size="sm" @click="counter.increment(); counter.$log('hi from $log')">
        fire an action (check console)
      </BaseButton>

      <h3>Persistence</h3>
      <p>auth token: <code>{{ auth.token ?? 'null' }}</code>, user: <code>{{ auth.user?.name ?? '—' }}</code></p>
      <BaseButton size="sm" @click="auth.login({ email: 'sam@4pl.co', password: 'x' })">log in</BaseButton>
      <BaseButton size="sm" variant="secondary" @click="auth.logout()">log out</BaseButton>
      <p><small>Log in, then <strong>reload the page</strong> — you're still logged in (localStorage). Check DevTools → Application → Local Storage.</small></p>
    </div>

    <div class="lesson-note">
      <pre>
// A plugin is a function run once per store:
export default function loggerPlugin({ store, app, pinia, options }) {
  store.$log = (...a) => console.log(store.$id, ...a)      // inject a property
  store.$onAction(({ name, args, after, onError }) => { /* time it */ })
  store.$subscribe((mutation, state) => { /* persist, etc. */ })
}
pinia.use(loggerPlugin)

// Persistence (pinia-plugin-persistedstate):
defineStore('auth', setup, { persist: { pick: ['token', 'user'] } })
// options: key, storage: sessionStorage, pick / omit, serializer, beforeHydrate
</pre>
      <strong>SSR / hydration note:</strong> on the server each request needs a fresh
      <code>createPinia()</code>; you serialise <code>pinia.state.value</code> into the HTML and
      the client rehydrates it before mount. Persisted-state plugins must be client-only or
      guarded, or you get hydration mismatches.
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Plugin uses: persistence, logging/analytics, injecting a shared <code>router</code>/<code>api</code>/<code>$reset</code>, adding devtools metadata.</li>
        <li>A plugin can <code>return { ... }</code> to add state/props to every store, or assign <code>store.$x</code> directly.</li>
        <li>Persistence is just a <code>$subscribe</code> that writes to storage + a hydrate step at store creation. You could write it yourself in ~10 lines.</li>
        <li>Persist a <em>whitelist</em> (<code>pick</code>) — never blindly persist entire stores (stale data, schema drift, security).</li>
        <li>Storing an auth token in <code>localStorage</code> is XSS-exposed; <code>httpOnly</code> cookies are safer. Lesson 33 covers the trade-off honestly — for many apps localStorage is an accepted risk.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-4) 0 var(--space-2);
}
</style>
