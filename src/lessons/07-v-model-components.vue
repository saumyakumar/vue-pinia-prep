<script setup>
import { ref } from 'vue'
import CurrencyInput from '@/components/CurrencyInput.vue'
import DateRange from '@/components/DateRange.vue'

const amount = ref(312.48)
const from = ref('2026-01-01')
const to = ref('2026-03-31')

// v-model modifiers on native inputs
const trimmed = ref('')
const asNumber = ref(0)
const lazy = ref('')
</script>

<template>
  <div>
    <h1>07 · v-model on components</h1>
    <p><code>v-model</code> is sugar for <code>:value</code> + <code>@update:value</code>. On a
      component you implement the other end with <code>defineModel()</code>.</p>

    <div class="demo-box">
      <h3>Single v-model + a custom <code>.round</code> modifier</h3>
      <CurrencyInput v-model.round="amount" />
      <p>parent amount = <code>{{ amount }}</code></p>

      <h3>Multiple named v-models</h3>
      <DateRange v-model:from="from" v-model:to="to" />
      <p>range = <code>{{ from }}</code> → <code>{{ to }}</code></p>

      <h3>Built-in modifiers on native inputs</h3>
      <label>.trim <input v-model.trim="trimmed" placeholder="  spaces stripped  " /></label>
      <span>= "{{ trimmed }}"</span><br />
      <label>.number <input v-model.number="asNumber" type="text" /></label>
      <span>typeof = {{ typeof asNumber }}</span><br />
      <label>.lazy (updates on change, not input) <input v-model.lazy="lazy" /></label>
      <span>= "{{ lazy }}"</span>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li><code>v-model="x"</code> on a component ⇒ prop <code>modelValue</code> + event <code>update:modelValue</code>. <code>v-model:foo="x"</code> ⇒ prop <code>foo</code> + <code>update:foo</code>.</li>
        <li><code>defineModel()</code> (3.4+) returns a writable ref wired to that pair — no manual prop/emit boilerplate.</li>
        <li>Multiple <code>v-model</code>s let one component manage several two-way values (great for filter bars, date ranges).</li>
        <li>Custom modifiers: <code>const [model, modifiers] = defineModel()</code> then branch on <code>modifiers.xxx</code>.</li>
        <li>Native modifiers: <code>.trim</code>, <code>.number</code>, <code>.lazy</code>.</li>
        <li>Pre-3.4 syntax (<code>modelValue</code> prop + <code>emit('update:modelValue')</code>) still works and is common in existing codebases — know both.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-4) 0 var(--space-2);
}
</style>
