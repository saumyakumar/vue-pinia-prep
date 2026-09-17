import { createApp } from 'vue'

// Run a composable that needs an active component instance (lifecycle hooks,
// provide/inject) outside of a real component. Returns [result, app] — call
// app.unmount() to trigger cleanup (onUnmounted / onScopeDispose).
export function withSetup(composable) {
  let result
  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    },
  })
  app.mount(document.createElement('div'))
  return [result, app]
}
