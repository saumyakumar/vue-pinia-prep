// Runs once before the test suite (see vite.config.js -> test.setupFiles).
// jsdom doesn't implement everything a browser does, so we polyfill the bits our code touches.

import { config } from '@vue/test-utils'

// Auto-stub router components so a component using <RouterLink>/<RouterView> can be
// mounted without installing a full router. Pass a real router in the test when you
// actually need navigation.
config.global.stubs = {
  RouterLink: true,
  RouterView: true,
}

// jsdom has no matchMedia — useMediaQuery uses it.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
  })
}

// jsdom has no ResizeObserver / IntersectionObserver.
if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
if (!window.IntersectionObserver) {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
