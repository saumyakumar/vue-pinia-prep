<script setup>
// A reusable ECharts wrapper. This is the pattern to internalise:
//   - init once in onMounted against a real DOM node
//   - markRaw the instance (it must NOT be made reactive — huge + has cycles)
//   - setOption on prop change with notMerge tuned to your case
//   - resize on container resize (ECharts doesn't do this itself)
//   - dispose on unmount (the #1 ECharts memory leak)
//   - re-init on theme change (light/dark)
import { ref, shallowRef, onMounted, onBeforeUnmount, watch, markRaw } from 'vue'
// Tree-shaken ECharts: import core + register ONLY what we use. This is the prod
// pattern (lesson 26) — it takes the chart bundle from ~1MB to ~180KB.
import * as echarts from 'echarts/core'
import { LineChart, BarChart, GaugeChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { useElementSize } from '@/composables/useElementSize'

echarts.use([
  LineChart,
  BarChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  MarkLineComponent,
  CanvasRenderer,
])

const props = defineProps({
  option: { type: Object, required: true },
  // 'replace' => notMerge:true (structure changed); 'merge' => incremental data update
  updateMode: { type: String, default: 'merge' },
  height: { type: String, default: '320px' },
})

const emit = defineEmits(['click'])

const el = ref(null)
const chart = shallowRef(null)
const { width: boxWidth, height: boxHeight } = useElementSize(el)

function palette() {
  const css = getComputedStyle(document.documentElement)
  const v = (n) => css.getPropertyValue(n).trim()
  return {
    textStyle: { color: v('--color-text') },
    backgroundColor: 'transparent',
    // axis/grid lines readable in both themes
    axisLine: { lineStyle: { color: v('--color-border') } },
  }
}

function build() {
  if (chart.value) chart.value.dispose()
  // The built-in 'dark' theme isn't bundled with echarts/core — we theme via
  // tokens instead (works for light + dark). Re-run on data-theme change.
  chart.value = markRaw(echarts.init(el.value, null, { renderer: 'canvas' }))
  const p = palette()
  chart.value.setOption({
    textStyle: p.textStyle,
    backgroundColor: p.backgroundColor,
    ...props.option,
  })
  chart.value.on('click', (params) => emit('click', params))
}

onMounted(build)

// data / option changes
watch(
  () => props.option,
  (opt) => chart.value?.setOption(opt, { notMerge: props.updateMode === 'replace' }),
  { deep: true },
)

// container resize -> chart.resize()
watch([boxWidth, boxHeight], () => chart.value?.resize())

// theme toggle -> full re-init (ECharts themes are set at init time)
const themeObserver = new MutationObserver(build)
onMounted(() => themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] }))

onBeforeUnmount(() => {
  themeObserver.disconnect()
  chart.value?.dispose()
  chart.value = null
})
</script>

<template>
  <div ref="el" class="echart" :style="{ height }" role="img" aria-label="chart" />
</template>

<style scoped>
.echart {
  width: 100%;
}
</style>
