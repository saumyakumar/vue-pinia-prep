<script setup>
import {
  ref,
  reactive,
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,
  onDeactivated,
  onErrorCaptured,
  nextTick,
} from 'vue'

const log = reactive([])
const t = (m) => log.push(`${performance.now().toFixed(0)}ms  ${m}`)

t('setup() runs first — before any hook')

onBeforeMount(() => t('onBeforeMount — DOM not created yet'))
onMounted(() => t('onMounted — DOM exists, safe to touch refs / start observers / fetch'))
onBeforeUpdate(() => t('onBeforeUpdate — state changed, DOM about to patch'))
onUpdated(() => t('onUpdated — DOM patched (runs a lot; avoid heavy work here)'))
onBeforeUnmount(() => t('onBeforeUnmount — still fully functional, good place to save drafts'))
onUnmounted(() => t('onUnmounted — teardown: remove listeners, clear timers, close sockets'))
onActivated(() => t('onActivated — re-entered while kept alive (<KeepAlive>)'))
onDeactivated(() => t('onDeactivated — cached by <KeepAlive> instead of destroyed'))
onErrorCaptured((err) => {
  t(`onErrorCaptured — caught: ${err.message}`)
  return false // stop it propagating to the global handler (lesson 15)
})

const count = ref(0)

async function bump() {
  count.value++
  // The DOM hasn't updated yet on this line:
  t(`right after count++, DOM still shows old value`)
  await nextTick()
  t('after nextTick(), DOM is updated')
}
</script>

<template>
  <div>
    <h1>05 · Lifecycle hooks</h1>
    <p>Navigate away and back (the sidebar) to see unmount → setup → mount again.</p>

    <div class="demo-box">
      <p>count = {{ count }} <button @click="bump">bump + nextTick</button></p>
      <h3>lifecycle log</h3>
      <pre>{{ log.join('\n') }}</pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Order: <code>setup</code> → <code>onBeforeMount</code> → <code>onMounted</code> → (updates) → <code>onBeforeUnmount</code> → <code>onUnmounted</code>.</li>
        <li><code>onMounted</code>: DOM refs are ready — start <code>IntersectionObserver</code>/<code>ResizeObserver</code>, init a chart library, focus an input, kick off a fetch.</li>
        <li><code>onUnmounted</code>: the cleanup pair — remove listeners, <code>clearInterval</code>, close WebSockets, <code>chart.dispose()</code>. Skipping this is the #1 memory-leak source in SPAs.</li>
        <li><code>onUpdated</code> runs after every re-render — do NOT fetch or mutate state here or you loop.</li>
        <li><code>onActivated</code>/<code>onDeactivated</code> replace mount/unmount when the component is wrapped in <code>&lt;KeepAlive&gt;</code> (lesson 11).</li>
        <li>State changes are batched; the DOM updates asynchronously. <code>await nextTick()</code> when you must read the post-update DOM.</li>
        <li>You can register the same hook multiple times (composables each add their own) — all run, in order.</li>
      </ul>
    </details>
  </div>
</template>
