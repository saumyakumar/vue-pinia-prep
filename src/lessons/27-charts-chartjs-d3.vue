<script setup>
// Chart.js — quick, batteries-included, great for standard chart types.
// D3 — not a chart library; a toolkit (scales, shapes, axes) for BESPOKE visuals.
import { ref, computed } from 'vue'
import ChartjsChart from '@/components/ChartjsChart.vue'
import D3Sparkline from '@/components/D3Sparkline.vue'
import { KPI_SERIES } from '@/api/dataset'

const series = KPI_SERIES(30)

const barData = computed(() => ({
  labels: ['Maersk', 'DHL', 'K+N', 'Schenker', 'DSV'],
  datasets: [
    {
      label: 'On-time %',
      data: [94, 91, 96, 88, 93],
      backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
    },
  ],
}))

const lineData = ref({
  labels: series.onTimePct.map(([t]) => new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
  datasets: [
    { label: 'On-time %', data: series.onTimePct.map(([, v]) => v), tension: 0.3, borderColor: '#10b981' },
    { label: 'Volume (÷20)', data: series.volume.map(([, v]) => v / 20), tension: 0.3, borderColor: '#2563eb' },
  ],
})

const sparkPoints = series.costPerShipment
</script>

<template>
  <div>
    <h1>27 · Chart.js &amp; D3</h1>

    <div class="demo-box">
      <h3>Chart.js — bar</h3>
      <ChartjsChart type="bar" :data="barData" />

      <h3>Chart.js — multi-series line</h3>
      <ChartjsChart type="line" :data="lineData" />

      <h3>D3 — custom SVG sparkline (D3 for math, Vue for DOM)</h3>
      <div class="sparks">
        <div>
          <span>Cost / shipment</span>
          <D3Sparkline :points="sparkPoints" :width="260" :height="64" />
        </div>
        <div>
          <span>On-time %</span>
          <D3Sparkline :points="series.onTimePct" :width="260" :height="64" stroke="#2563eb" />
        </div>
      </div>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><strong>Chart.js</strong>: responsive by default (still <code>destroy()</code> on unmount, <code>update()</code> on data change). Canvas-based, good perf, limited to its built-in types + plugins. Great default for KPI dashboards.</li>
        <li><strong>ECharts</strong>: richer interactions (dataZoom, brush, large-data modes), better for exploratory analytics. Heavier.</li>
        <li><strong>D3</strong>: maximum control, steepest curve. Best pattern with Vue = use D3 for <em>scales / line / area / arc / axis math</em>, compute path strings in <code>computed</code>, let Vue render the SVG. Don't have D3 and Vue both touching the DOM.</li>
        <li>Rule of thumb: standard chart → Chart.js; dense/interactive analytics → ECharts; a visual that doesn't exist as a "chart type" (custom timeline, sankey-ish, annotated) → D3.</li>
        <li>Theming: read CSS custom properties with <code>getComputedStyle(document.documentElement).getPropertyValue('--x')</code> so charts match light/dark.</li>
        <li>All three: turn OFF animation for streaming/real-time data.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.sparks {
  display: flex;
  gap: var(--space-6);
  flex-wrap: wrap;
}
.sparks span {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
}
</style>
