<script setup>
// D3 the way it's usually best used with Vue: D3 for MATH (scales, line/area path
// generators, axes), Vue for the DOM. We don't let D3 mutate the DOM — we compute
// a path string and bind it. Reactive, testable, no lifecycle juggling.
import { computed } from 'vue'
import { scaleLinear, scaleTime, line, area, extent, curveMonotoneX } from 'd3'

const props = defineProps({
  // [[timestamp, value], ...]
  points: { type: Array, required: true },
  width: { type: Number, default: 240 },
  height: { type: Number, default: 60 },
  stroke: { type: String, default: 'var(--color-primary)' },
})

const x = computed(() =>
  scaleTime()
    .domain(extent(props.points, (d) => d[0]))
    .range([2, props.width - 2]),
)
const y = computed(() =>
  scaleLinear()
    .domain(extent(props.points, (d) => d[1]))
    .nice()
    .range([props.height - 2, 2]),
)

const linePath = computed(() =>
  line()
    .x((d) => x.value(d[0]))
    .y((d) => y.value(d[1]))
    .curve(curveMonotoneX)(props.points),
)
const areaPath = computed(() =>
  area()
    .x((d) => x.value(d[0]))
    .y0(props.height)
    .y1((d) => y.value(d[1]))
    .curve(curveMonotoneX)(props.points),
)
const last = computed(() => props.points.at(-1))
</script>

<template>
  <svg :width="width" :height="height" class="spark" role="img" aria-label="sparkline">
    <path :d="areaPath" fill="var(--color-primary-weak)" opacity="0.5" />
    <path :d="linePath" :stroke="stroke" fill="none" stroke-width="1.5" />
    <circle v-if="last" :cx="x(last[0])" :cy="y(last[1])" r="2.5" :fill="stroke" />
  </svg>
</template>

<style scoped>
.spark {
  display: block;
  overflow: visible;
}
</style>
