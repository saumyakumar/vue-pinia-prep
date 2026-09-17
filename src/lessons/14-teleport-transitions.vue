<script setup>
import { ref } from 'vue'
import { useToast } from '@/design-system/useToast'

const { success, error } = useToast()

const modalOpen = ref(false)
const show = ref(true)

// TransitionGroup list demo
let id = 3
const rows = ref([
  { id: 1, name: 'Maersk' },
  { id: 2, name: 'DHL' },
  { id: 3, name: 'DB Schenker' },
])
function addRow() {
  rows.value.splice(Math.floor(Math.random() * (rows.value.length + 1)), 0, {
    id: ++id,
    name: `Carrier ${id}`,
  })
}
function removeRow(rid) {
  rows.value = rows.value.filter((r) => r.id !== rid)
}
function shuffle() {
  rows.value = [...rows.value].sort(() => Math.random() - 0.5)
}
</script>

<template>
  <div>
    <h1>14 · Teleport &amp; transitions</h1>

    <div class="demo-box">
      <h3>&lt;Teleport&gt;</h3>
      <p>
        The modal &amp; toasts render at <code>&lt;body&gt;</code> (via <code>&lt;Teleport to="body"&gt;</code>)
        so they escape this box's <code>overflow</code> / stacking context — see
        <code>design-system/BaseModal.vue</code> and <code>ToastHost.vue</code>.
      </p>
      <BaseButton @click="modalOpen = true">open modal</BaseButton>
      <BaseButton variant="secondary" @click="success('Saved!')">toast</BaseButton>
      <BaseButton variant="danger" @click="error('Something failed')">error toast</BaseButton>

      <BaseModal v-model:open="modalOpen" title="Teleported dialog">
        This DOM lives at the end of <code>&lt;body&gt;</code>, not inside the lesson.
        <template #footer>
          <BaseButton variant="secondary" @click="modalOpen = false">Close</BaseButton>
        </template>
      </BaseModal>

      <h3>&lt;Transition&gt; (single element enter/leave)</h3>
      <BaseButton @click="show = !show">toggle</BaseButton>
      <Transition name="fade">
        <p v-if="show" class="panel">I fade + slide in and out.</p>
      </Transition>

      <h3>&lt;TransitionGroup&gt; (list add / remove / reorder — FLIP animation)</h3>
      <div class="controls">
        <BaseButton size="sm" @click="addRow">add</BaseButton>
        <BaseButton size="sm" variant="secondary" @click="shuffle">shuffle</BaseButton>
      </div>
      <TransitionGroup tag="ul" name="list" class="list">
        <li v-for="r in rows" :key="r.id">
          {{ r.name }}
          <button aria-label="remove" @click="removeRow(r.id)">✕</button>
        </li>
      </TransitionGroup>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>&lt;Teleport to="selector"&gt;</code> moves rendered DOM elsewhere while keeping it logically in the component (props, events, provide/inject still work). Essential for modals, toasts, dropdowns, tooltips.</li>
        <li><code>&lt;Transition&gt;</code> wraps ONE element/component toggled by <code>v-if</code>/<code>v-show</code>/dynamic component. It adds <code>*-enter-from/active/to</code> and <code>*-leave-*</code> classes you style.</li>
        <li><code>&lt;TransitionGroup&gt;</code> animates list changes and does automatic <strong>FLIP</strong> move animations on reorder (<code>*-move</code> class). Stable <code>:key</code> per item is required.</li>
        <li>JS hooks (<code>@enter</code>, <code>@leave</code>, …) integrate GSAP / anime.js; return early with <code>done()</code>.</li>
        <li>Respect <code>prefers-reduced-motion</code> (handled globally in <code>tokens.css</code>).</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.panel {
  background: var(--color-surface-2);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
}
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
.list {
  list-style: none;
  padding: 0;
  max-width: 260px;
}
.list li {
  display: flex;
  justify-content: space-between;
  background: var(--color-surface-2);
  padding: 6px 10px;
  margin: 4px 0;
  border-radius: var(--radius-sm);
}
.list li button {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-leave-active {
  position: absolute;
}
.list-move {
  transition: transform 0.3s ease;
}
.controls {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
}
</style>
