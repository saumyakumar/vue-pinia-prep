<script setup>
// Testing is a strategy, not a coverage number. This lesson maps what to test
// with what tool. The real specs are in tests/ — run `npm run test`.
</script>

<template>
  <div>
    <h1>34 · Testing strategy</h1>

    <div class="lesson-note">
      <strong>The pyramid (for a Vue dashboard app)</strong>
      <ul>
        <li><strong>Unit</strong> — pure logic: composables (<code>useForm</code>, <code>useVirtualList</code>, <code>useWebSocket</code>), store actions/getters, formatters, the <code>http.js</code> error mapping. Fast, most of your tests. See <code>tests/composables/</code>, <code>tests/stores/</code>.</li>
        <li><strong>Component</strong> — a component + its template: props render, events emit, user interaction updates the DOM. <code>@vue/test-utils</code> or <code>@testing-library/vue</code>. Mock the network (MSW) and stub child heavy widgets (charts).</li>
        <li><strong>Integration</strong> — a few components + a real router + a real Pinia working together (e.g. "changing the filter bar refetches the table"). Higher value, slower.</li>
        <li><strong>E2E</strong> — Playwright/Cypress, a handful of critical happy paths against a running app (login → dashboard → drill-down → export).</li>
      </ul>
    </div>

    <div class="lesson-note">
      <strong>Recipes</strong>
      <pre>
// composable that needs a component instance
import { withSetup } from '../helpers/withSetup'   // tests/helpers/withSetup.js
const [result, app] = withSetup(() => useThing())
// ... assert on result ...
app.unmount()                                       // triggers cleanup

// store
setActivePinia(createPinia())
const s = useCartStore(); s.add(product); expect(s.count).toBe(1)

// component with stores + async
const wrapper = mount(ShipmentsView, {
  global: { plugins: [createTestingPinia({ stubActions: false })] },
})
await flushPromises()
expect(wrapper.findAll('[data-test=row]')).toHaveLength(8)

// network: intercept, don't hit real endpoints
// vi.mock('@/api/http') OR use MSW handlers

// timers (debounce, backoff, batching)
vi.useFakeTimers(); /* act */; vi.advanceTimersByTime(300); vi.useRealTimers()

// WebSocket: inject a fake socket impl, dispatch MessageEvents, assert on buffer
      </pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Test <strong>behaviour</strong>, not implementation: assert on rendered output and emitted events, not internal refs. <code>@testing-library/vue</code> nudges you toward this.</li>
        <li>Don't test the framework (that <code>ref</code> updates, that Pinia <code>$patch</code> works). Test <em>your</em> logic.</li>
        <li>Mock at the boundary — the HTTP layer (MSW) — not every function. Over-mocking tests your mocks.</li>
        <li>Deterministic: fake timers for debounce/backoff/animation-frame batching; seed randomness; freeze <code>Date.now</code>.</li>
        <li>Coverage is a smell detector, not a goal. 100% of trivial code &lt; 60% of the hard paths.</li>
        <li>Stub heavy children (charts, maps) in component tests — you're testing the container, not ECharts.</li>
        <li>CI runs <code>lint + test + build</code> on every PR (see <code>.github/workflows/ci.yml</code>).</li>
      </ul>
    </details>
  </div>
</template>
