<script setup>
// Chart.js wrapper. Chart.js IS responsive by default (responsive:true +
// maintainAspectRatio), so no ResizeObserver needed — but you still must
// destroy() on unmount and update() on data change (mutating then calling
// update is the efficient path; replacing the whole config re-creates it).
import { ref, onMounted, onBeforeUnmount, watch, markRaw } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const props = defineProps({
  type: { type: String, default: 'line' },
  data: { type: Object, required: true },
  options: { type: Object, default: () => ({}) },
})

const canvas = ref(null)
let chart = null

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}

onMounted(() => {
  chart = markRaw(
    new Chart(canvas.value, {
      type: props.type,
      data: props.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: {
          x: { grid: { color: cssVar('--color-border') }, ticks: { color: cssVar('--color-text-muted') } },
          y: { grid: { color: cssVar('--color-border') }, ticks: { color: cssVar('--color-text-muted') } },
        },
        plugins: { legend: { labels: { color: cssVar('--color-text') } } },
        ...props.options,
      },
    }),
  )
})

watch(
  () => props.data,
  (d) => {
    if (!chart) return
    chart.data = d
    chart.update()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  chart?.destroy()
  chart = null
})
</script>

<template>
  <div class="wrap"><canvas ref="canvas" /></div>
</template>

<style scoped>
.wrap {
  position: relative;
  height: 300px;
}
</style>
