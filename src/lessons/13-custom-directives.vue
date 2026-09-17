<script setup>
// Custom directives = reusable low-level DOM behaviour. Reach for one when you
// need direct DOM access on a plain element and a component would be overkill:
// autofocus, click-outside, tooltips, lazy-loading images, drag handles.
import { ref } from 'vue'
import { vAutofocus } from '@/directives/vAutofocus'
import { vClickOutside } from '@/directives/vClickOutside'
import { vTooltip } from '@/directives/vTooltip'

// In <script setup>, a local const named `vXxx` is automatically usable as
// `v-xxx` in the template. (Globally: app.directive('xxx', ...) in main.js.)

const open = ref(false)
const tip = ref('I am a tooltip — edit me')
const showInput = ref(false)
</script>

<template>
  <div>
    <h1>13 · Custom directives</h1>

    <div class="demo-box">
      <h3>v-autofocus (mounted hook)</h3>
      <button @click="showInput = !showInput">toggle input</button>
      <input v-if="showInput" v-autofocus placeholder="auto-focused on mount" />

      <h3>v-click-outside (owns a document listener, cleaned up in unmounted)</h3>
      <div v-click-outside="() => (open = false)" class="dd">
        <button @click="open = !open">menu ▾</button>
        <ul v-if="open">
          <li>Export CSV</li>
          <li>Share</li>
          <li>Archive</li>
        </ul>
      </div>
      <span>click anywhere outside to close</span>

      <h3>v-tooltip (reads binding.value, reacts in `updated`)</h3>
      <input v-model="tip" />
      <span v-tooltip="tip" class="hoverme">hover me</span>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Directive hooks: <code>created</code>, <code>beforeMount</code>, <code>mounted</code>, <code>beforeUpdate</code>, <code>updated</code>, <code>beforeUnmount</code>, <code>unmounted</code> — each gets <code>(el, binding, vnode, prevVnode)</code>.</li>
        <li><code>binding.value</code> (current), <code>binding.oldValue</code>, <code>binding.arg</code> (<code>v-x:arg</code>), <code>binding.modifiers</code> (<code>v-x.foo</code>).</li>
        <li>Always undo in <code>unmounted</code> what you set up in <code>mounted</code> (listeners, observers, injected DOM nodes).</li>
        <li>Shorthand: pass a function instead of an object and it runs on both <code>mounted</code> and <code>updated</code>.</li>
        <li>Prefer a component or composable when you need state, template, or lifecycle beyond raw DOM poking. Directives shine for cross-cutting DOM concerns.</li>
        <li>SSR: directives only run on the client unless you provide <code>getSSRProps</code>.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-5) 0 var(--space-2);
}
.dd {
  display: inline-block;
  position: relative;
}
.dd ul {
  position: absolute;
  margin: 4px 0 0;
  padding: 4px;
  list-style: none;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-md);
}
.dd li {
  padding: 4px 12px;
  white-space: nowrap;
}
.dd li:hover {
  background: var(--color-surface-2);
}
.hoverme {
  text-decoration: underline dotted;
  cursor: help;
  margin-left: 8px;
}
</style>
