<script setup>
// ECharts is the go-to for dense analytics dashboards (dataZoom, large-series
// performance, rich interactions). See src/components/EChart.vue for the wrapper
// pattern; this lesson is about building good options + updating efficiently.
import { ref, computed, onUnmounted } from 'vue'
import EChart from '@/components/EChart.vue'
import { useFetch } from '@/composables/useFetch'

const range = ref('30d')
const { data, loading } = useFetch('/api/kpis', { query: computed(() => ({ range: range.value })) })

const lineOption = computed(() => {
  const s = data.value?.series
  if (!s) return { series: [] }
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['On-time %', 'Cost / shipment'] },
    grid: { left: 48, right: 48, top: 40, bottom: 60 },
    xAxis: { type: 'time' },
    yAxis: [
      { type: 'value', name: '%', min: 80, max: 100 },
      { type: 'value', name: '$', position: 'right' },
    ],
    // dataZoom = the interaction analysts expect: brush to zoom the time axis
    dataZoom: [
      { type: 'inside' },
      { type: 'slider', height: 20, bottom: 16 },
    ],
    series: [
      { name: 'On-time %', type: 'line', smooth: true, showSymbol: false, data: s.onTimePct },
      { name: 'Cost / shipment', type: 'line', yAxisIndex: 1, showSymbol: false, data: s.costPerShipment },
    ],
  }
})

const gaugeOption = computed(() => {
  const v = data.value?.cards?.find((c) => c.id === 'on_time_pct')?.value ?? 0
  return {
    series: [
      {
        type: 'gauge',
        min: 80,
        max: 100,
        progress: { show: true },
        detail: { valueAnimation: true, formatter: '{value}%', fontSize: 20 },
        data: [{ value: v }],
      },
    ],
  }
})

// EFFICIENT UPDATE demo: stream a point onto the line without rebuilding the option
const streaming = ref(false)
let streamTimer = null
const extra = ref([])
function toggleStream() {
  streaming.value = !streaming.value
  if (streaming.value) {
    streamTimer = setInterval(() => {
      const last = data.value?.series?.onTimePct?.at(-1)?.[0] ?? Date.now()
      extra.value.push([last + extra.value.length * 3600_000, 88 + Math.random() * 10])
      if (extra.value.length > 50) extra.value.shift()
    }, 500)
  } else {
    clearInterval(streamTimer)
  }
}
const streamedOption = computed(() => ({
  xAxis: { type: 'time' },
  yAxis: { type: 'value', min: 80, max: 100 },
  animation: false,
  series: [{ type: 'line', showSymbol: false, data: [...(data.value?.series?.onTimePct ?? []), ...extra.value] }],
}))

onUnmounted(() => clearInterval(streamTimer))
</script>

<template>
  <div>
    <h1>26 · Charts with ECharts</h1>

    <div class="demo-box">
      <label>range:
        <select v-model="range">
          <option value="7d">7 days</option>
          <option value="30d">30 days</option>
          <option value="90d">90 days</option>
        </select>
      </label>
      <p v-if="loading"><BaseSpinner /> loading series…</p>

      <h3>Dual-axis line + dataZoom</h3>
      <EChart :option="lineOption" height="320px" />

      <h3>Gauge (single KPI)</h3>
      <EChart :option="gaugeOption" height="220px" />

      <h3>Efficient streaming update</h3>
      <BaseButton size="sm" @click="toggleStream">{{ streaming ? 'stop' : 'start' }} stream</BaseButton>
      <EChart :option="streamedOption" update-mode="merge" height="240px" />
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Lifecycle: <code>echarts.init</code> in <code>onMounted</code>, <code>markRaw</code> the instance, <code>setOption</code> on change, <code>chart.resize()</code> on container resize (ResizeObserver — ECharts won't do it), <code>chart.dispose()</code> in <code>onBeforeUnmount</code>.</li>
        <li><code>setOption(opt)</code> merges by default — good for data updates. Pass <code>{ notMerge: true }</code> when structure (series count, axes) changes, or stale series linger.</li>
        <li>Theme: ECharts themes are applied at <code>init</code> time → re-init on light/dark toggle (a <code>MutationObserver</code> on <code>data-theme</code>).</li>
        <li>Bundle size: <code>import * as echarts</code> pulls everything (~1MB). For prod, import from <code>echarts/core</code> + register only the charts/components you use.</li>
        <li>Big data: <code>large: true</code>, <code>progressive</code> rendering, <code>sampling: 'lttb'</code> for downsampling long time series, canvas (not SVG) renderer.</li>
        <li>Interactions analysts want: <code>dataZoom</code> (inside + slider), <code>tooltip trigger:'axis'</code>, click events for drill-down/cross-filter (capstone).</li>
        <li><code>vue-echarts</code> is a maintained wrapper — same lifecycle rules, less boilerplate.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
</style>
