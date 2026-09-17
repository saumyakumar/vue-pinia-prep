// The lesson manifest. ONE place that lists every lesson.
// router/index.js turns this into routes; App.vue turns it into the sidebar.
// `component` is a function => the chunk is lazy-loaded (code-splitting). Open the
// Network tab and watch a new .js file load the first time you visit a lesson.

export const groups = [
  {
    title: 'Part 1 · Vue 3 core',
    lessons: [
      ['01', 'template-syntax', 'Template syntax & directives', () => import('@/lessons/01-template-syntax.vue')],
      ['02', 'reactivity', 'Reactivity: ref, reactive & friends', () => import('@/lessons/02-reactivity.vue')],
      ['03', 'computed', 'Computed properties', () => import('@/lessons/03-computed.vue')],
      ['04', 'watchers', 'watch vs watchEffect', () => import('@/lessons/04-watchers.vue')],
      ['05', 'lifecycle', 'Lifecycle hooks', () => import('@/lessons/05-lifecycle.vue')],
      ['06', 'props-emits', 'Props & emits (component contract)', () => import('@/lessons/06-props-emits.vue')],
      ['07', 'v-model-components', 'v-model on components', () => import('@/lessons/07-v-model-components.vue')],
      ['08', 'slots', 'Slots: default, named, scoped', () => import('@/lessons/08-slots.vue')],
      ['09', 'provide-inject', 'provide / inject', () => import('@/lessons/09-provide-inject.vue')],
      ['10', 'template-refs', 'Template refs, defineExpose, nextTick', () => import('@/lessons/10-template-refs.vue')],
      ['11', 'dynamic-async-suspense', 'Dynamic / async components & Suspense', () => import('@/lessons/11-dynamic-async-suspense.vue')],
      ['12', 'composables', 'Composables (reusable logic)', () => import('@/lessons/12-composables.vue')],
      ['13', 'custom-directives', 'Custom directives', () => import('@/lessons/13-custom-directives.vue')],
      ['14', 'teleport-transitions', 'Teleport & transitions', () => import('@/lessons/14-teleport-transitions.vue')],
      ['15', 'error-handling', 'Error handling & error boundaries', () => import('@/lessons/15-error-handling.vue')],
    ],
  },
  {
    title: 'Part 2 · Vue Router',
    lessons: [
      ['16', 'router-core', 'Router core: params, query, nested', () => import('@/lessons/16-router-core.vue')],
      ['17', 'router-guards', 'Navigation guards & data loading', () => import('@/lessons/17-router-guards.vue')],
    ],
  },
  {
    title: 'Part 3 · Pinia',
    lessons: [
      ['18', 'pinia-option-store', 'Option stores', () => import('@/lessons/18-pinia-option-store.vue')],
      ['19', 'pinia-setup-store', 'Setup stores', () => import('@/lessons/19-pinia-setup-store.vue')],
      ['20', 'pinia-advanced', 'storeToRefs, $patch, $subscribe, $onAction', () => import('@/lessons/20-pinia-advanced.vue')],
      ['21', 'pinia-plugins-persistence', 'Plugins & persistence', () => import('@/lessons/21-pinia-plugins-persistence.vue')],
      ['22', 'pinia-testing', 'Testing Pinia stores', () => import('@/lessons/22-pinia-testing.vue')],
    ],
  },
  {
    title: 'Part 4 · The dashboard skill set',
    lessons: [
      ['23', 'forms-validation', 'Forms & validation', () => import('@/lessons/23-forms-validation.vue')],
      ['24', 'rest-api-layer', 'A real REST layer', () => import('@/lessons/24-rest-api-layer.vue')],
      ['25', 'websockets-realtime', 'WebSockets & near-real-time', () => import('@/lessons/25-websockets-realtime.vue')],
      ['26', 'charts-echarts', 'Charts with ECharts', () => import('@/lessons/26-charts-echarts.vue')],
      ['27', 'charts-chartjs-d3', 'Chart.js & D3', () => import('@/lessons/27-charts-chartjs-d3.vue')],
      ['28', 'large-datasets-perf', 'Large datasets & rendering perf', () => import('@/lessons/28-large-datasets-perf.vue')],
      ['29', 'performance-toolkit', 'Performance toolkit', () => import('@/lessons/29-performance-toolkit.vue')],
      ['30', 'design-system', 'Design systems & component libraries', () => import('@/lessons/30-design-system.vue')],
      ['31', 'accessibility', 'Accessibility', () => import('@/lessons/31-accessibility.vue')],
      ['32', 'responsive-design', 'Responsive design', () => import('@/lessons/32-responsive-design.vue')],
      ['33', 'security', 'Secure frontend practices', () => import('@/lessons/33-security.vue')],
      ['34', 'testing-strategy', 'Testing strategy', () => import('@/lessons/34-testing-strategy.vue')],
      ['35', 'typescript-migration', 'TypeScript migration', () => import('@/lessons/35-typescript-migration.vue')],
    ],
  },
]

// Flat list, handy for iteration / prev-next navigation.
export const flatLessons = groups.flatMap((g) =>
  g.lessons.map(([num, slug, title, component]) => ({ num, slug, title, component, group: g.title })),
)
