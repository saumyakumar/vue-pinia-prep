<script setup>
import { useBreakpoints } from '@/composables/useMediaQuery'

// Most responsiveness should be CSS. Reach for JS only when the RENDER must
// differ (different component on mobile, virtualization window size, etc.).
const { isMobile, isTablet, isDesktop, prefersReducedMotion } = useBreakpoints()
</script>

<template>
  <div>
    <h1>32 · Responsive design</h1>

    <div class="demo-box">
      <h3>JS breakpoints (resize the window)</h3>
      <p>
        <BaseBadge :tone="isMobile ? 'success' : 'neutral'">mobile</BaseBadge>
        <BaseBadge :tone="isTablet ? 'success' : 'neutral'">tablet</BaseBadge>
        <BaseBadge :tone="isDesktop ? 'success' : 'neutral'">desktop</BaseBadge>
        <BaseBadge :tone="prefersReducedMotion ? 'warning' : 'neutral'">reduced-motion</BaseBadge>
      </p>
      <p v-if="isMobile">📱 On mobile you might render a card list instead of a wide table.</p>
      <p v-else>🖥️ On larger screens, the full dashboard grid.</p>

      <h3>Responsive dashboard grid (pure CSS)</h3>
      <div class="dash">
        <div v-for="n in 6" :key="n" class="tile">KPI {{ n }}</div>
      </div>

      <h3>Container query (component adapts to ITS box, not the viewport)</h3>
      <div class="resizable">
        <div class="cq">
          <div class="cq-inner">I switch to a column layout when my container is narrow — drag the corner ↘</div>
        </div>
      </div>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><strong>CSS first</strong>: fluid layouts (<code>flex</code>/<code>grid</code>, <code>minmax</code>, <code>clamp()</code>), <code>@media</code> for breakpoints. JS (<code>matchMedia</code>) only when the DOM/render must change.</li>
        <li><strong>Container queries</strong> (<code>@container</code>) let a component respond to its own width — essential for dashboard widgets that live in panels of varying size. Better than viewport media queries for reusable components.</li>
        <li>Mobile dashboards: prioritise — show the 3 KPIs that matter, collapse tables to cards, make charts full-width and taller, move filters into a sheet/drawer.</li>
        <li>Test touch targets (≥ 44px), and that horizontal scroll never appears on the body (wide tables/charts scroll inside their own container).</li>
        <li><code>useMediaQuery</code> must clean up its listener (<code>onScopeDispose</code>) and guard for SSR/jsdom (no <code>matchMedia</code>).</li>
        <li>Charts: re-call <code>chart.resize()</code> on breakpoint changes; consider fewer axis ticks / simplified tooltips on small screens.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.dash {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
}
.tile {
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  text-align: center;
}
.resizable {
  resize: horizontal;
  overflow: auto;
  border: 1px dashed var(--color-border);
  padding: var(--space-2);
  max-width: 100%;
  width: 480px;
  min-width: 180px;
}
.cq {
  container-type: inline-size;
}
.cq-inner {
  padding: var(--space-4);
  background: var(--color-primary-weak);
  border-radius: var(--radius-sm);
}
@container (max-width: 320px) {
  .cq-inner {
    background: var(--color-surface-2);
    font-weight: 700;
  }
}
</style>
