// ─────────────────────────────────────────────────────────────────────────────
// APP BOOTSTRAP
// This is where an "app instance" is created and plugins are attached.
// Order matters a little: install pinia before router if any router guard reads a store.
// ─────────────────────────────────────────────────────────────────────────────
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import designSystem from './design-system'
import loggerPlugin from './stores/plugins/logger'
import { installMockBackend } from './api/mockBackend'

import './design-system/tokens.css'
import './styles.css'

// Intercept `/api/*` fetches with an in-memory backend (like MSW). Lessons 24–25
// and the capstone hit `http.get('/api/...')` and it just works — no server.
installMockBackend()

const app = createApp(App)

// --- Pinia (state management) ---
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate) // enables `persist: true` in store definitions
pinia.use(loggerPlugin) // our own hand-written plugin (lesson 21) — logs every action
app.use(pinia)

// --- Router ---
app.use(router)

// --- Our design system: registers <BaseButton>, <BaseCard>, ... globally + provides useToast ---
app.use(designSystem)

// --- Global error handler ---
// Any error thrown in a render function, watcher, lifecycle hook or event handler that is
// NOT caught by an onErrorCaptured boundary ends up here. In real apps you'd forward this
// to Sentry/Datadog. See lesson 15 for the component-level version.
app.config.errorHandler = (err, instance, info) => {
  console.error('[global errorHandler]', info, err)
}

app.mount('#app')
