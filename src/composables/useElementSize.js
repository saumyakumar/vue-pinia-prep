// ResizeObserver -> reactive { width, height }. Charts need this: ECharts/Chart.js
// don't reflow on container resize by themselves, so you observe the box and call
// chart.resize(). Lesson 26.
import { ref, onMounted, onScopeDispose, toValue, watch } from 'vue'

export function useElementSize(target) {
  const width = ref(0)
  const height = ref(0)

  let observer = null

  function observe() {
    stop()
    const el = toValue(target)
    if (!el || typeof ResizeObserver === 'undefined') return
    observer = new ResizeObserver(([entry]) => {
      const box = entry.contentBoxSize?.[0]
      width.value = box ? box.inlineSize : entry.contentRect.width
      height.value = box ? box.blockSize : entry.contentRect.height
    })
    observer.observe(el)
  }

  function stop() {
    observer?.disconnect()
    observer = null
  }

  onMounted(observe)
  watch(() => toValue(target), observe)
  onScopeDispose(stop)

  return { width, height }
}
