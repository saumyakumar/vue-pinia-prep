<script setup>
// Accessible tabs. Demonstrates:
// - a compound component pattern via a single `tabs` prop + scoped slot
// - ARIA roles (tablist/tab/tabpanel) + arrow-key navigation (lesson 31)
const props = defineProps({
  // [{ value, label }]
  tabs: { type: Array, required: true },
})

const active = defineModel({ default: null })
if (active.value == null && props.tabs.length) active.value = props.tabs[0].value

// Roving tabindex + arrow-key nav: only the active tab is in the tab order,
// arrows move between tabs. The keydown lives on each <button role="tab"> (which
// is already focusable) rather than the container.
function onKeydown(e) {
  const i = props.tabs.findIndex((t) => t.value === active.value)
  if (e.key === 'ArrowRight') active.value = props.tabs[(i + 1) % props.tabs.length].value
  if (e.key === 'ArrowLeft')
    active.value = props.tabs[(i - 1 + props.tabs.length) % props.tabs.length].value
}
</script>

<template>
  <div class="tabs">
    <div role="tablist" class="tablist">
      <button
        v-for="t in tabs"
        :id="`tab-${t.value}`"
        :key="t.value"
        role="tab"
        :aria-selected="active === t.value"
        :tabindex="active === t.value ? 0 : -1"
        class="tab"
        :class="{ active: active === t.value }"
        @click="active = t.value"
        @keydown="onKeydown"
      >
        {{ t.label }}
      </button>
    </div>

    <div
      v-for="t in tabs"
      v-show="active === t.value"
      :key="t.value"
      role="tabpanel"
      :aria-labelledby="`tab-${t.value}`"
      class="panel"
    >
      <slot :name="t.value" />
    </div>
  </div>
</template>

<style scoped>
.tablist {
  display: flex;
  gap: 2px;
  border-bottom: 1px solid var(--color-border);
}
.tab {
  font: inherit;
  border: none;
  background: none;
  padding: 8px 14px;
  cursor: pointer;
  color: var(--color-text-muted);
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: var(--color-primary-strong);
  border-bottom-color: var(--color-primary);
  font-weight: 600;
}
.panel {
  padding: var(--space-4) 0;
}
</style>
