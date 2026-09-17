<script setup>
// Forms: every input type + v-model modifiers + dynamic field arrays + a
// validation composable with touched-state and a11y error wiring.
import { useForm, rules } from '@/composables/useForm'
import { useToast } from '@/design-system/useToast'

const { success } = useToast()

const form = useForm(
  { email: '', password: '', confirm: '', plan: 'standard', seats: 3, terms: false, tags: [] },
  {
    email: [rules.required(), rules.email()],
    password: [rules.required(), rules.minLen(8)],
    confirm: [rules.match('password', 'Passwords must match')],
    seats: [rules.min(1)],
    terms: [(v) => (v ? true : 'You must accept the terms')],
  },
)

const { values, errorFor, handleBlur, handleSubmit, isValid, isDirty, reset, submitting } = form

// dynamic field list
function addTag() {
  values.tags.push('')
}
function removeTag(i) {
  values.tags.splice(i, 1)
}

async function submit() {
  await handleSubmit(async (payload) => {
    await new Promise((r) => setTimeout(r, 600)) // pretend API
    success(`Submitted for ${payload.email}`)
    reset()
  })
}
</script>

<template>
  <div>
    <h1>23 · Forms &amp; validation</h1>

    <form class="demo-box" novalidate @submit.prevent="submit">
      <BaseInput
        v-model.trim="values.email"
        label="Email"
        type="email"
        :error="errorFor('email')"
        autocomplete="email"
        @blur="handleBlur('email')"
      />
      <BaseInput
        v-model="values.password"
        label="Password"
        type="password"
        hint="At least 8 characters"
        :error="errorFor('password')"
        @blur="handleBlur('password')"
      />
      <BaseInput
        v-model="values.confirm"
        label="Confirm password"
        type="password"
        :error="errorFor('confirm')"
        @blur="handleBlur('confirm')"
      />

      <BaseSelect
        v-model="values.plan"
        label="Plan"
        :options="[
          { value: 'standard', label: 'Standard' },
          { value: 'pro', label: 'Pro' },
          { value: 'enterprise', label: 'Enterprise' },
        ]"
      />

      <!-- .number: keeps the bound value a Number even though <input> gives strings -->
      <BaseInput
        v-model.number="values.seats"
        label="Seats"
        type="number"
        min="1"
        :error="errorFor('seats')"
        @blur="handleBlur('seats')"
      />

      <fieldset>
        <legend>Tags (dynamic list)</legend>
        <div v-for="(_, i) in values.tags" :key="i" class="tag-row">
          <input v-model="values.tags[i]" :aria-label="`Tag ${i + 1}`" placeholder="tag" />
          <BaseButton type="button" size="sm" variant="ghost" @click="removeTag(i)">remove</BaseButton>
        </div>
        <BaseButton type="button" size="sm" variant="secondary" @click="addTag">+ add tag</BaseButton>
      </fieldset>

      <label class="check">
        <input v-model="values.terms" type="checkbox" @blur="handleBlur('terms')" />
        I accept the terms
      </label>
      <p v-if="errorFor('terms')" class="err" role="alert">{{ errorFor('terms') }}</p>

      <div class="actions">
        <BaseButton type="submit" :loading="submitting" :disabled="!isValid">
          Submit
        </BaseButton>
        <BaseButton type="button" variant="secondary" :disabled="!isDirty" @click="reset">
          Reset
        </BaseButton>
        <BaseBadge :tone="isValid ? 'success' : 'neutral'">
          {{ isValid ? 'valid' : 'incomplete' }}
        </BaseBadge>
      </div>
    </form>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Modifiers: <code>.trim</code>, <code>.number</code> (string→Number), <code>.lazy</code> (update on <code>change</code>, not each keystroke).</li>
        <li>Checkbox binds boolean by default; bind an array for a checkbox group; <code>:true-value</code>/<code>:false-value</code> for custom on/off values.</li>
        <li><code>&lt;select multiple&gt;</code> with <code>v-model</code> binds an array.</li>
        <li>Show a field error only after it's <strong>touched</strong> (blurred) or after a submit attempt — validating on every keystroke is hostile.</li>
        <li>a11y: associate <code>&lt;label for&gt;</code>, set <code>aria-invalid</code>, link the message with <code>aria-describedby</code>, and give the error <code>role="alert"</code> (see <code>BaseInput.vue</code>).</li>
        <li>Use <code>novalidate</code> on the form and own validation in JS for consistent messaging (native bubbles are inconsistent + unstyleable).</li>
        <li>Dynamic lists: mutate an array in reactive state; key by a stable id if items can reorder (index key is OK for append-only).</li>
        <li>Real projects: VeeValidate / FormKit / Zod. Know the concepts (this composable) so you can evaluate them.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
fieldset {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  margin: var(--space-3) 0;
}
legend {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0 4px;
}
.tag-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 4px;
}
.tag-row input {
  flex: 1;
  padding: 5px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
}
.check {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: var(--space-3) 0 4px;
}
.err {
  color: var(--color-danger);
  font-size: 0.78rem;
  margin: 0 0 var(--space-2);
}
.actions {
  display: flex;
  gap: var(--space-2);
  align-items: center;
  margin-top: var(--space-4);
}
</style>
