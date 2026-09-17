<script setup>
import { ref } from 'vue'

// A combobox is the classic "custom widget needs real ARIA" example.
const options = ['Maersk', 'DHL', 'Kuehne+Nagel', 'DB Schenker', 'DSV', 'Expeditors']
const open = ref(false)
const query = ref('')
const activeIndex = ref(-1)
const selected = ref('')

const filtered = () => options.filter((o) => o.toLowerCase().includes(query.value.toLowerCase()))

function onKeydown(e) {
  const list = filtered()
  if (e.key === 'ArrowDown') {
    open.value = true
    activeIndex.value = Math.min(activeIndex.value + 1, list.length - 1)
    e.preventDefault()
  } else if (e.key === 'ArrowUp') {
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    e.preventDefault()
  } else if (e.key === 'Enter' && activeIndex.value >= 0) {
    choose(list[activeIndex.value])
  } else if (e.key === 'Escape') {
    open.value = false
  }
}
function choose(v) {
  selected.value = v
  query.value = v
  open.value = false
}
</script>

<template>
  <div>
    <h1>31 · Accessibility</h1>

    <div class="lesson-note">
      <strong>The checklist</strong>
      <ul>
        <li><strong>Semantic HTML first</strong>: <code>&lt;button&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;main&gt;</code>, <code>&lt;label&gt;</code>, headings in order. A <code>&lt;div @click&gt;</code> has no role, no focus, no keyboard — you'd rebuild all of it.</li>
        <li><strong>Keyboard</strong>: everything reachable with Tab, operable with Enter/Space/arrows/Escape. Visible <code>:focus-visible</code> ring. Manage focus on route change and when opening/closing dialogs.</li>
        <li><strong>ARIA for custom widgets</strong> only (tabs, combobox, menu, dialog) — follow the WAI-ARIA Authoring Practices. Don't ARIA-ify native elements.</li>
        <li><strong>Forms</strong>: <code>&lt;label for&gt;</code>, <code>aria-invalid</code>, <code>aria-describedby</code> → error, <code>role="alert"</code> on the message.</li>
        <li><strong>Live regions</strong>: <code>aria-live="polite"</code> for toasts / async status (see <code>ToastHost</code>).</li>
        <li><strong>Contrast</strong> ≥ 4.5:1 for text; don't encode meaning in color alone (add icon/text).</li>
        <li><strong>Motion</strong>: honor <code>prefers-reduced-motion</code> (done globally in <code>tokens.css</code>).</li>
        <li><strong>Tooling</strong>: <code>eslint-plugin-vuejs-accessibility</code> (in this repo's lint), axe DevTools, Lighthouse, and actually tab through it + try a screen reader.</li>
      </ul>
    </div>

    <div class="demo-box">
      <h3>Accessible combobox (ARIA + full keyboard)</h3>
      <label id="cb-label" for="cb-input">Carrier</label>
      <div class="cb">
        <input
          id="cb-input"
          v-model="query"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="cb-list"
          :aria-expanded="open"
          :aria-activedescendant="activeIndex >= 0 ? `cb-opt-${activeIndex}` : undefined"
          @focus="open = true"
          @keydown="onKeydown"
        />
        <ul v-if="open && filtered().length" id="cb-list" role="listbox" aria-labelledby="cb-label">
          <li
            v-for="(o, i) in filtered()"
            :id="`cb-opt-${i}`"
            :key="o"
            role="option"
            tabindex="-1"
            :aria-selected="o === selected"
            :class="{ active: i === activeIndex }"
            @mousedown.prevent="choose(o)"
          >
            {{ o }}
          </li>
        </ul>
      </div>
      <p>selected: <code>{{ selected || '—' }}</code></p>

      <h3>Also in this repo</h3>
      <ul>
        <li><code>BaseModal</code> — <code>role="dialog"</code>, <code>aria-modal</code>, focus trap + restore, Escape to close.</li>
        <li><code>BaseTabs</code> — <code>tablist/tab/tabpanel</code>, roving <code>tabindex</code>, arrow keys.</li>
        <li><code>BaseInput</code> — label association + error wiring.</li>
        <li><code>BaseSpinner</code> — <code>role="status"</code> + visually-hidden text.</li>
      </ul>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>"First rule of ARIA: don't use ARIA — use the native element." ARIA is for widgets HTML doesn't have.</li>
        <li>Dialog pattern: trap focus inside, restore focus to the trigger on close, Escape closes, background inert.</li>
        <li>Combobox pattern: <code>role="combobox"</code> on input, <code>aria-expanded</code>, <code>aria-activedescendant</code> points at the highlighted option (focus stays on the input), arrow/Enter/Escape handling.</li>
        <li>SPA gotcha: route changes don't move focus or announce — move focus to the <code>&lt;h1&gt;</code>/main and/or use a live region on navigation.</li>
        <li>Test: keyboard-only pass, axe scan, and a screen reader (VoiceOver ⌘+F5). Automated tools catch ~40%.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.cb {
  position: relative;
  max-width: 280px;
}
.cb input {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.cb ul {
  position: absolute;
  z-index: 5;
  left: 0;
  right: 0;
  margin: 4px 0 0;
  padding: 4px;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
}
.cb li {
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}
.cb li.active {
  background: var(--color-primary-weak);
}
</style>
