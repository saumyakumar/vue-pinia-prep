import { describe, it, expect } from 'vitest'
import { ref, reactive, computed, isRef, toRefs, nextTick, watch } from 'vue'

// These aren't testing "does Vue work" — they're a scratchpad proving the mental
// model from lesson 02. Handy to re-read before an interview.
describe('reactivity mental model', () => {
  it('ref wraps a value behind .value', () => {
    const n = ref(1)
    expect(isRef(n)).toBe(true)
    n.value++
    expect(n.value).toBe(2)
  })

  it('destructuring a reactive object loses reactivity; toRefs restores it', async () => {
    const state = reactive({ a: 1 })
    const { a } = state // plain number snapshot
    state.a = 99
    expect(a).toBe(1) // did NOT track

    const refs = toRefs(state)
    state.a = 5
    expect(refs.a.value).toBe(5) // tracks
  })

  it('computed is cached until a dependency changes', () => {
    let runs = 0
    const n = ref(2)
    const double = computed(() => {
      runs++
      return n.value * 2
    })
    expect(double.value).toBe(4)
    expect(double.value).toBe(4)
    expect(runs).toBe(1) // second read served from cache
    n.value = 3
    expect(double.value).toBe(6)
    expect(runs).toBe(2)
  })

  it('watchers see changes after a tick', async () => {
    const n = ref(0)
    const seen = []
    watch(n, (v) => seen.push(v))
    n.value = 1
    n.value = 2
    await nextTick()
    expect(seen).toEqual([2]) // coalesced to the final value
  })
})
