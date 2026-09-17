import { createRouter, createWebHistory } from 'vue-router'
import { flatLessons } from './lessons'

// Build one route per lesson from the manifest.
const lessonRoutes = flatLessons.map((l) => ({
  path: `/lesson/${l.slug}`,
  name: l.slug,
  component: l.component, // lazy import => own chunk
  meta: { title: `${l.num} · ${l.title}` },
}))

const routes = [
  { path: '/', name: 'home', component: () => import('@/lessons/Home.vue'), meta: { title: 'Start here' } },
  ...lessonRoutes,

  // The capstone app is mounted under /dashboard with its own nested router config.
  // (Added in Milestone C — the file is created then.)
  {
    path: '/dashboard/:pathMatch(.*)*',
    name: 'dashboard',
    component: () => import('@/lessons/Home.vue'), // placeholder until Milestone C
    meta: { title: 'Business Insights dashboard (coming in Milestone C)' },
  },

  // 404 catch-all. `pathMatch` is a route param that swallows the rest of the URL.
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/lessons/NotFound.vue') },
]

const router = createRouter({
  // createWebHistory = real URLs (/lesson/computed). Needs the dev server / host to
  // fall back to index.html for unknown paths (Vite does this automatically).
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // Reset scroll to top on navigation, but restore position on back/forward.
  scrollBehavior(to, from, savedPosition) {
    return savedPosition ?? { top: 0 }
  },
})

// A tiny global guard: keep document.title in sync. Guards are covered in lesson 17.
router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Vue Prep` : 'Vue Prep'
})

export default router
