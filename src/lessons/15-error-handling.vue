<script setup>
import { ref } from 'vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import Bomb from '@/components/Bomb.vue'

const boom = ref(false)
const boundary = ref(null)

// Errors in ASYNC handlers are NOT caught by onErrorCaptured — you handle those
// with try/catch (or a global window 'unhandledrejection' listener).
const asyncMsg = ref('')
async function riskyAsync() {
  try {
    await Promise.reject(new Error('async failure'))
  } catch (e) {
    asyncMsg.value = `caught in try/catch: ${e.message}`
  }
}
</script>

<template>
  <div>
    <h1>15 · Error handling &amp; error boundaries</h1>

    <div class="demo-box">
      <h3>Component-level boundary</h3>
      <p>
        <code>ErrorBoundary.vue</code> wraps a subtree and uses
        <code>onErrorCaptured</code>. When <code>Bomb</code> throws, only this region shows a
        fallback — the rest of the app keeps working.
      </p>
      <button @click="boom = true">detonate</button>
      <button @click="((boom = false), boundary?.reset())">reset</button>

      <ErrorBoundary ref="boundary">
        <!--
          :key="boom" forces Vue to DESTROY and REMOUNT Bomb every time `boom`
          flips, instead of patching the existing instance's props in place.
          This matters because Bomb's throw lives in setup() — and setup() only
          ever runs ONCE per instance, at mount. Without the :key, clicking
          "detonate" just updates the existing Bomb's `explode` prop and
          re-renders its template; the `if (props.explode) throw` check already
          ran (with explode=false) and never runs again, so nothing crashes.
          With the :key, "detonate" mounts a BRAND NEW Bomb with explode=true
          from the start, so its setup() throws for real.
        -->
        <Bomb :key="boom" :explode="boom" />
      </ErrorBoundary>

      <h3>Async errors</h3>
      <button @click="riskyAsync">reject a promise</button>
      <p><code>{{ asyncMsg }}</code></p>

      <h3>Global handler</h3>
      <p>
        Anything not caught by a boundary hits <code>app.config.errorHandler</code> in
        <code>src/main.js</code> — that's where you'd call Sentry/Datadog. Open the console.
      </p>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>onErrorCaptured(hook)</code> in an ancestor catches descendant errors from render, lifecycle, watchers and <em>sync</em> event handlers. <code>return false</code> stops propagation.</li>
        <li><strong><code>setup()</code> runs once per instance</strong>, at mount — a prop changing later re-renders the template but does NOT re-run <code>setup()</code>. If a bug (or a demo!) needs setup-time logic to run again, either move the logic into a <code>watch(() =&gt; props.x, ...)</code>, or force a remount with a changing <code>:key</code> (what <code>&lt;Bomb :key="boom"&gt;</code> does above). This trips people up well beyond error handling — e.g. "why didn't my composable's setup code re-run when the prop changed?".</li>
        <li>Build a reusable <code>&lt;ErrorBoundary&gt;</code> component — Vue has no built-in one. Give it a <code>reset()</code> and a fallback slot.</li>
        <li><code>app.config.errorHandler</code> is the global net — wire your monitoring here. Also add <code>app.config.warnHandler</code> in dev.</li>
        <li>Async/promise rejections aren't captured — use <code>try/catch</code> in the action, or a store that records an <code>error</code> field (see <code>stores/auth.js</code>), plus a <code>window.addEventListener('unhandledrejection')</code> backstop.</li>
        <li>Pair error boundaries with <code>&lt;Suspense&gt;</code>: boundary for failures, Suspense for loading.</li>
        <li>Router has its own <code>router.onError()</code> for failed lazy-route chunk loads (lesson 17) — handle it to prompt a reload after a deploy.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
button {
  margin-right: 6px;
}
</style>
