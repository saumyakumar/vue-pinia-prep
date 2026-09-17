<script setup>
// Stores are the easiest thing to unit-test: plain functions, no DOM.
// The real specs live in tests/stores/ — run `npm run test`.
</script>

<template>
  <div>
    <h1>22 · Testing Pinia stores</h1>

    <div class="lesson-note">
      <strong>Testing a store in isolation</strong> — <code>tests/stores/counter.spec.js</code>:
      <pre>
import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'
import { useCounterStore } from '@/stores/counter'

describe('counter store', () => {
  // Fresh pinia per test => no state bleed between tests.
  beforeEach(() => setActivePinia(createPinia()))

  it('increments and records history', () => {
    const s = useCounterStore()
    s.increment()
    s.increment(4)
    expect(s.count).toBe(5)
    expect(s.double).toBe(10)
    expect(s.history).toEqual([1, 5])
  })
})
</pre>
    </div>

    <div class="lesson-note">
      <strong>Testing a COMPONENT that uses stores</strong> — <code>@pinia/testing</code>:
      <pre>
import { createTestingPinia } from '@pinia/testing'
import { mount } from '@vue/test-utils'

const wrapper = mount(Overview, {
  global: {
    plugins: [createTestingPinia({
      initialState: { kpis: { onTime: 0.9 } },  // seed state
      stubActions: true,                        // actions become spies (no real fetch)
    })],
  },
})
// assert on rendered output, then:
expect(useKpisStore().refresh).toHaveBeenCalled()
</pre>
      (<code>@pinia/testing</code> is added in Milestone C alongside the component tests.)
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>setActivePinia(createPinia())</code> in <code>beforeEach</code> — the single most important line; without it stores share state across tests.</li>
        <li>Unit-test store logic directly (call actions, assert state/getters). No mount, no mocks unless the action hits the network — then mock the api module with <code>vi.mock</code>.</li>
        <li><code>createTestingPinia()</code> for component tests: <code>initialState</code> to seed, <code>stubActions: true</code> (default) so actions are spies you assert on, <code>createSpy</code> to plug in <code>vi.fn</code>.</li>
        <li>Getters are covered for free by testing state + reading the getter.</li>
        <li>Don't test Pinia itself (that <code>$patch</code> works) — test <em>your</em> business logic.</li>
      </ul>
    </details>
  </div>
</template>
