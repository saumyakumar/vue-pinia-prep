<script setup>
// Near-real-time data. useWebSocket handles reconnect/backoff/visibility/buffer;
// this lesson focuses on what the COMPONENT must do: batch high-frequency updates
// so you don't re-render on every message.
import { shallowRef, watch, onUnmounted } from 'vue'
import { useWebSocket } from '@/composables/useWebSocket'
import { simulateOutage } from '@/api/ws'

const { status, buffer, retries, send, open, close, clear } = useWebSocket('wss://mock/stream', {
  maxRetries: 6,
  maxBufferSize: 300,
  pauseWhenHidden: true,
})

// ── BATCHING: the socket may deliver 5–10 messages/sec. Instead of letting each
// one trigger reactivity, we collect into a plain array and flush to reactive
// state on a short timer (~120ms). `requestAnimationFrame` is the smoother choice
// for visible UI, but it PAUSES when the tab is hidden — a timer keeps working.
const feed = shallowRef([])
let pending = []
let flushTimer = null

function enqueue(msg) {
  pending.push(msg)
  if (flushTimer == null) {
    flushTimer = setTimeout(flush, 120)
  }
}
function flush() {
  flushTimer = null
  if (!pending.length) return
  feed.value = [...pending.reverse(), ...feed.value].slice(0, 40)
  pending = []
}

// subscribe to new messages
watch(
  () => buffer.value.length,
  () => {
    const latest = buffer.value.at(-1)
    if (latest) enqueue(latest)
  },
)

function clearAll() {
  clear()
  feed.value = []
  pending = []
}

const onTime = shallowRef(null)
watch(feed, () => {
  const kpi = feed.value.find((m) => m.type === 'kpi' && m.metric === 'on_time_pct')
  if (kpi) onTime.value = kpi.value
})

onUnmounted(() => clearTimeout(flushTimer))
</script>

<template>
  <div>
    <h1>25 · WebSockets &amp; near-real-time</h1>

    <div class="demo-box">
      <p>
        connection:
        <BaseBadge :tone="status === 'open' ? 'success' : status === 'failed' ? 'danger' : 'warning'">
          {{ status }}
        </BaseBadge>
        <span v-if="retries"> · retry #{{ retries }}</span>
        <span v-if="onTime"> · on-time now: <strong>{{ onTime }}%</strong></span>
      </p>

      <div class="controls">
        <BaseButton size="sm" @click="open">connect</BaseButton>
        <BaseButton size="sm" variant="secondary" @click="close">disconnect</BaseButton>
        <BaseButton size="sm" variant="danger" @click="simulateOutage(5000)">
          kill server 5s (watch backoff)
        </BaseButton>
        <BaseButton size="sm" variant="ghost" @click="send({ type: 'ping', at: Date.now() })">
          send ping
        </BaseButton>
        <BaseButton size="sm" variant="ghost" @click="clearAll">clear</BaseButton>
      </div>

      <h3>live feed (batched to one flush per frame)</h3>
      <ul class="feed">
        <li v-for="(m, i) in feed" :key="i">
          <code>{{ m.type }}</code>
          <template v-if="m.type === 'kpi'"> {{ m.metric }} = {{ m.value }}</template>
          <template v-else-if="m.type === 'shipment_event'"> {{ m.id }} · {{ m.carrier }} · {{ m.event }}</template>
          <template v-else> {{ JSON.stringify(m) }}</template>
        </li>
      </ul>
      <p><small>Switch tabs and come back — the stream pauses while hidden and reconnects on return.</small></p>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><strong>Reconnect with exponential backoff + jitter</strong>, capped, with a max-attempts ceiling → then surface a "reconnect" button. Never a tight retry loop.</li>
        <li>Distinguish clean close (code 1000, don't reconnect) from abnormal (1006, do reconnect).</li>
        <li><strong>Batch</strong> high-frequency messages: buffer in a plain array, flush to reactive state once per <code>requestAnimationFrame</code> (or every 250ms). Re-rendering per message kills the frame budget.</li>
        <li><strong>Backpressure</strong>: bound your buffer (drop oldest / sample) so a burst or a slow consumer can't OOM the tab.</li>
        <li><strong>Page Visibility API</strong>: disconnect when <code>document.hidden</code>, reconnect on return — saves battery/CPU/server connections.</li>
        <li>Queue <code>send()</code>s until <code>readyState === OPEN</code>.</li>
        <li>Always <code>close()</code> on unmount and cancel pending reconnect timers — otherwise a socket keeps a destroyed component alive.</li>
        <li>Heartbeat/ping-pong to detect half-open connections that <code>close</code> never fires for.</li>
        <li>Alternatives: SSE (<code>EventSource</code>) for one-way server→client (simpler, auto-reconnect built in); long-polling as a fallback.</li>
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
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-3) 0;
}
.feed {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 260px;
  overflow: auto;
  font-size: 0.82rem;
  font-family: var(--font-mono);
}
.feed li {
  padding: 3px 0;
  border-bottom: 1px solid var(--color-border);
}
</style>
