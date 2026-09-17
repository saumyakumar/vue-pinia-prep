<script setup>
// The app shell: a sidebar of lessons + the current lesson in <RouterView>.
import { ref } from 'vue'
import { groups } from '@/router/lessons'

// Mobile: sidebar collapses. `useMediaQuery` (lesson 32) would be cleaner; kept simple here.
const navOpen = ref(false)

function toggleTheme() {
  const el = document.documentElement
  const next = el.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
  el.setAttribute('data-theme', next)
}
</script>

<template>
  <div class="layout">
    <button class="nav-toggle" aria-label="Toggle navigation" @click="navOpen = !navOpen">☰</button>

    <aside class="sidebar" :class="{ open: navOpen }">
      <div class="brand">
        Vue&nbsp;3 + Pinia Prep
        <button class="theme-btn" aria-label="Toggle dark mode" @click="toggleTheme">◐</button>
      </div>

      <nav @click="navOpen = false">
        <RouterLink to="/" class="nav-link home">🏠 Start here</RouterLink>

        <template v-for="group in groups" :key="group.title">
          <p class="nav-group">{{ group.title }}</p>
          <RouterLink
            v-for="[num, slug, title] in group.lessons"
            :key="slug"
            :to="`/lesson/${slug}`"
            class="nav-link"
          >
            <span class="num">{{ num }}</span> {{ title }}
          </RouterLink>
        </template>

        <p class="nav-group">Capstone</p>
        <RouterLink to="/dashboard" class="nav-link">📊 Business Insights dashboard</RouterLink>
      </nav>
    </aside>

    <main class="content">
      <!--
        RouterView renders the matched route component.
        `key` forces a fresh component instance on every navigation so lesson demos
        reset cleanly instead of carrying stale state between lessons.
      -->
      <RouterView v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </RouterView>
    </main>

    <!-- Rendered once; shows any queued toasts (design-system/useToast). -->
    <ToastHost />
  </div>
</template>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  min-height: 100%;
}

.sidebar {
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: var(--space-4);
  overflow-y: auto;
  height: 100vh;
  position: sticky;
  top: 0;
}

.brand {
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.theme-btn,
.nav-toggle {
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 2px 8px;
  font-size: 0.95rem;
  color: inherit;
}

.nav-group {
  margin: var(--space-4) 0 var(--space-2);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
}

.nav-link {
  display: block;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--color-text);
  font-size: 0.86rem;
}

.nav-link:hover {
  background: var(--color-surface-2);
}

.nav-link.router-link-active {
  background: var(--color-primary-weak);
  color: var(--color-primary-strong);
  font-weight: 600;
}

.nav-link .num {
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  margin-right: 4px;
}

.content {
  padding: var(--space-6);
  max-width: 900px;
}

.nav-toggle {
  display: none;
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 20;
}

@media (max-width: 780px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .nav-toggle {
    display: block;
  }
  .sidebar {
    position: fixed;
    inset: 0 30% 0 0;
    z-index: 15;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }
  .sidebar.open {
    transform: none;
  }
  .content {
    padding: var(--space-8) var(--space-4) var(--space-4);
  }
}
</style>
