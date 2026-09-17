<script setup>
// A modal dialog demonstrating several JD-relevant techniques at once:
// - <Teleport> renders the DOM at <body> so it escapes parent overflow/z-index (lesson 14)
// - focus trap + focus restore for accessibility (lesson 31)
// - <Transition> for enter/leave animation
// - Escape to close, click-backdrop to close
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

const open = defineModel('open', { type: Boolean, default: false })
defineProps({ title: { type: String, default: '' } })

const panel = ref(null)
let lastFocused = null

watch(open, async (isOpen) => {
  if (isOpen) {
    lastFocused = document.activeElement
    await nextTick()
    panel.value?.querySelector('button, [href], input, select, textarea')?.focus()
    document.addEventListener('keydown', onKey)
  } else {
    document.removeEventListener('keydown', onKey)
    lastFocused?.focus?.() // restore focus to whatever opened the modal
  }
})

function onKey(e) {
  if (e.key === 'Escape') open.value = false
  if (e.key === 'Tab') trapFocus(e)
}

function trapFocus(e) {
  const focusables = panel.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  )
  if (!focusables?.length) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="open" class="backdrop" @click.self="open = false">
        <div
          ref="panel"
          class="panel"
          role="dialog"
          aria-modal="true"
          :aria-label="title || 'Dialog'"
        >
          <header v-if="title" class="panel__header">
            <h2>{{ title }}</h2>
            <button aria-label="Close" @click="open = false">✕</button>
          </header>
          <div class="panel__body"><slot /></div>
          <footer v-if="$slots.footer" class="panel__footer"><slot name="footer" /></footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(10, 15, 20, 0.5);
  display: grid;
  place-items: center;
  z-index: 100;
  padding: var(--space-4);
}
.panel {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  width: min(480px, 100%);
  max-height: 85vh;
  overflow: auto;
}
.panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.panel__header h2 {
  margin: 0;
  font-size: 1.05rem;
}
.panel__header button {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text-muted);
}
.panel__body {
  padding: var(--space-4);
}
.panel__footer {
  padding: var(--space-3) var(--space-4);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.18s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
