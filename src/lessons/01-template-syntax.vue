<script setup>
// `<script setup>` is the modern Vue 3 authoring style. Everything declared here
// is automatically available in the template. No `return`, no `export default`.
import { ref, computed } from 'vue'

const name = ref('logistics')
const count = ref(0)
const isActive = ref(true)
const rawHtml = '<em>rendered as HTML</em>'
const carriers = ref(['Maersk', 'DHL', 'DB Schenker'])
const color = ref('#10b981')

// v-for over an object gives (value, key, index)
const kpis = { onTime: '94%', dwell: '1.2d', cost: '$3.1M' }

const shout = computed(() => name.value.toUpperCase())
</script>

<template>
  <div>
    <h1>01 · Template syntax &amp; directives</h1>
    <p>The template is HTML plus <strong>directives</strong> (<code>v-</code> attributes) and
      <strong>mustache</strong> interpolation.</p>

    <div class="demo-box">
      <!-- {{ }} interpolation. Any JS EXPRESSION works, not statements. -->
      <p>Hello {{ name }} — shouting: {{ shout }}</p>
      <p>Math in templates: {{ count }} × 2 = {{ count * 2 }}</p>

      <!-- v-bind (shorthand `:`) binds an attribute to an expression -->
      <p :title="`count is ${count}`">Hover me for a bound title attribute.</p>

      <!-- v-html injects raw HTML. DANGER: only for trusted content (XSS) — lesson 33. -->
      <p>v-html: <span v-html="rawHtml" /></p>

      <!-- v-on (shorthand `@`) attaches event listeners -->
      <button @click="count++">count++</button>
      <button @click="count = 0">reset</button>

      <!-- Conditional rendering: v-if removes from DOM, v-show toggles `display` -->
      <p v-if="count > 3">v-if: count is above 3</p>
      <p v-show="count > 3">v-show: same condition, but stays in the DOM (just hidden)</p>

      <!-- Class & style binding: object syntax toggles keys by truthiness -->
      <p :class="{ active: isActive, muted: count === 0 }" :style="{ color }">
        Class/style binding (object syntax).
      </p>

      <!-- List rendering. ALWAYS provide :key — it lets Vue track identity across updates. -->
      <ul>
        <li v-for="(carrier, i) in carriers" :key="carrier">{{ i + 1 }}. {{ carrier }}</li>
      </ul>

      <!-- v-for over an object -->
      <ul>
        <li v-for="(value, key) in kpis" :key="key">{{ key }}: {{ value }}</li>
      </ul>

      <!-- Event modifiers: .prevent, .stop, .once, .self, key modifiers like .enter -->
      <form @submit.prevent="carriers.push('New carrier ' + carriers.length)">
        <input placeholder="press Enter to add a carrier" @keyup.enter.prevent />
        <button type="submit">Add</button>
      </form>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>v-if</code> vs <code>v-show</code>: <code>v-if</code> is lazy and fully mounts/unmounts (cheaper if rarely shown); <code>v-show</code> always renders and toggles CSS (cheaper to toggle often).</li>
        <li>Never put <code>v-if</code> and <code>v-for</code> on the same element — <code>v-if</code> has higher priority in Vue 3 and it reads badly. Wrap with <code>&lt;template v-for&gt;</code> + inner <code>v-if</code>, or filter in a computed.</li>
        <li><code>:key</code> in <code>v-for</code> must be a stable unique id, not the array index, when the list reorders or items are inserted.</li>
        <li>Templates allow expressions only (no <code>if</code>/<code>for</code> statements); move logic into <code>computed</code> or methods.</li>
        <li><code>v-html</code> is an XSS vector — never feed it user input.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
.active {
  font-weight: 700;
}
.muted {
  opacity: 0.5;
}
button {
  margin-right: 6px;
}
</style>
