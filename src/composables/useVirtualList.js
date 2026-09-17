// Windowed rendering: given a big list and a fixed row height, render only the
// rows visible in the scroll container (+ a small overscan). Turns a 50,000-row
// table from "browser freeze" into "smooth". Lesson 28.
//
// Real projects use vue-virtual-scroller / TanStack Virtual (variable heights,
// horizontal, grid). This hand-rolled version shows the mechanism.
import { ref, computed, toValue } from 'vue'

export function useVirtualList(items, { itemHeight = 36, overscan = 6 } = {}) {
  const scrollTop = ref(0)
  const viewportHeight = ref(400)

  const list = computed(() => toValue(items))
  const total = computed(() => list.value.length)
  const totalHeight = computed(() => total.value * itemHeight)

  const range = computed(() => {
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan)
    const visibleCount = Math.ceil(viewportHeight.value / itemHeight) + overscan * 2
    const end = Math.min(total.value, start + visibleCount)
    return { start, end }
  })

  // The slice actually rendered, each carrying its absolute index + y offset.
  const visibleItems = computed(() =>
    list.value.slice(range.value.start, range.value.end).map((item, i) => ({
      item,
      index: range.value.start + i,
      offsetY: (range.value.start + i) * itemHeight,
    })),
  )

  function onScroll(e) {
    scrollTop.value = e.target.scrollTop
  }
  function setViewport(h) {
    viewportHeight.value = h
  }

  return {
    visibleItems,
    totalHeight,
    itemHeight,
    onScroll,
    setViewport,
    range,
  }
}
