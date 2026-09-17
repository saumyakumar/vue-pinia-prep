import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'
import { useCounterStore } from '@/stores/counter'

describe('counter store (option store)', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('starts at zero', () => {
    const s = useCounterStore()
    expect(s.count).toBe(0)
    expect(s.history).toEqual([])
  })

  it('increments by 1 and by N, recording history', () => {
    const s = useCounterStore()
    s.increment()
    s.increment(4)
    expect(s.count).toBe(5)
    expect(s.history).toEqual([1, 5])
  })

  it('exposes cached + parameterised getters', () => {
    const s = useCounterStore()
    s.increment(6)
    expect(s.double).toBe(12)
    expect(s.isMultipleOf(3)).toBe(true)
    expect(s.isMultipleOf(5)).toBe(false)
  })

  it('$reset restores initial state', () => {
    const s = useCounterStore()
    s.increment(10)
    s.reset()
    expect(s.count).toBe(0)
    expect(s.history).toEqual([])
  })
})
