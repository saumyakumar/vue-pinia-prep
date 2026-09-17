// Reactive `matchMedia`. Returns a ref<boolean> that updates on viewport changes.
// Used for responsive logic that can't be pure CSS (e.g. render a different
// component on mobile). Lesson 32.
import { ref, onScopeDispose } from 'vue'

export function useMediaQuery(query) {
  const matches = ref(false)

  // jsdom / SSR guard
  if (typeof window === 'undefined' || !window.matchMedia) return matches

  const mql = window.matchMedia(query)
  matches.value = mql.matches
  const handler = (e) => (matches.value = e.matches)
  mql.addEventListener('change', handler)
  onScopeDispose(() => mql.removeEventListener('change', handler))

  return matches
}

// Convenience breakpoints matching tokens.css intent
export function useBreakpoints() {
  return {
    isMobile: useMediaQuery('(max-width: 640px)'),
    isTablet: useMediaQuery('(min-width: 641px) and (max-width: 1024px)'),
    isDesktop: useMediaQuery('(min-width: 1025px)'),
    prefersReducedMotion: useMediaQuery('(prefers-reduced-motion: reduce)'),
  }
}
