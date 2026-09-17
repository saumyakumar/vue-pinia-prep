import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useVirtualList } from '@/composables/useVirtualList'

describe('useVirtualList', () => {
  const items = ref(Array.from({ length: 10000 }, (_, i) => ({ id: i })))

  it('renders only a window of rows, not all 10k', () => {
    const { visibleItems, setViewport, totalHeight } = useVirtualList(items, { itemHeight: 20, overscan: 5 })
    setViewport(400) // 400 / 20 = 20 rows + overscan
    expect(totalHeight.value).toBe(10000 * 20)
    expect(visibleItems.value.length).toBeLessThan(40)
    expect(visibleItems.value[0].index).toBe(0)
  })

  it('shifts the window on scroll and offsets each row', () => {
    const { visibleItems, setViewport, onScroll } = useVirtualList(items, { itemHeight: 20, overscan: 2 })
    setViewport(200)
    onScroll({ target: { scrollTop: 2000 } }) // 2000 / 20 = row 100
    const first = visibleItems.value[0]
    expect(first.index).toBe(98) // 100 - overscan
    expect(first.offsetY).toBe(98 * 20)
  })

  it('clamps to the list length near the end', () => {
    const { visibleItems, setViewport, onScroll } = useVirtualList(items, { itemHeight: 20 })
    setViewport(200)
    onScroll({ target: { scrollTop: 10000 * 20 } })
    expect(visibleItems.value.at(-1).index).toBe(9999)
  })
})
