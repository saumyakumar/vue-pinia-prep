<script setup>
import { flatLessons } from '@/router/lessons'
</script>

<template>
  <div>
    <h1>Vue 3 + Pinia — Prep Course</h1>
    <p>
      One runnable app that walks every concept you need for a Vue analytics-dashboard role.
      Work top to bottom. Each lesson has a <strong>live demo</strong> plus its own
      <strong>heavily commented source</strong> — the source is the study material, so open the
      <code>.vue</code> file next to each lesson.
    </p>

    <div class="lesson-note">
      <strong>How to study:</strong> read the intro → play with the demo → open the file and read
      every comment → expand “Key takeaways / interview points” at the bottom → move on.
    </div>

    <h2>Milestone A — what's built now</h2>
    <ul>
      <li><strong>Lessons 01–15</strong>: Vue 3 core (reactivity, components, composables, directives, Teleport/transitions, error handling)</li>
      <li><strong>Lessons 16–17</strong>: Vue Router (params, nested routes, guards)</li>
      <li><strong>Lessons 18–22</strong>: Pinia (option &amp; setup stores, advanced APIs, plugins, testing)</li>
      <li>A small <strong>design system</strong> in <code>src/design-system/</code> used throughout</li>
    </ul>

    <h2>Coming next</h2>
    <ul>
      <li><strong>Milestone B</strong> — lessons 23–35: forms, REST layer, WebSockets/real-time, ECharts + Chart.js + D3, large-dataset performance, accessibility, security, testing strategy, TypeScript</li>
      <li><strong>Milestone C</strong> — the “Business Insights” capstone dashboard + test suite + CI</li>
    </ul>

    <h2>All lessons</h2>
    <ol class="all">
      <li v-for="l in flatLessons" :key="l.slug">
        <RouterLink :to="`/lesson/${l.slug}`">{{ l.num }} · {{ l.title }}</RouterLink>
      </li>
    </ol>
  </div>
</template>

<style scoped>
h2 {
  margin-top: var(--space-6);
  font-size: 1.15rem;
}
.all {
  columns: 2;
  gap: var(--space-6);
}
.all li {
  margin: 0.3rem 0;
  break-inside: avoid;
}
</style>
