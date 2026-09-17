// A tiny form/validation composable. Real projects use VeeValidate, FormKit, or
// Zod + a thin wrapper — but rolling this shows you understand the moving parts:
// values, per-field errors, touched state, validate-on-blur + validate-on-submit,
// and an `isValid` gate.
import { reactive, computed, ref } from 'vue'

// A rule is (value, allValues) => string | true
export const rules = {
  required: (msg = 'Required') => (v) => (v != null && v !== '' ? true : msg),
  minLen: (n, msg) => (v) => (String(v ?? '').length >= n ? true : msg ?? `Min ${n} characters`),
  email: (msg = 'Enter a valid email') => (v) => (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) ? true : msg),
  min: (n, msg) => (v) => (Number(v) >= n ? true : msg ?? `Must be ≥ ${n}`),
  match: (field, msg) => (v, all) => (v === all[field] ? true : msg ?? 'Does not match'),
}

export function useForm(initial, schema = {}) {
  const values = reactive({ ...initial })
  const errors = reactive({})
  const touched = reactive({})
  const submitting = ref(false)

  function validateField(name) {
    const fieldRules = schema[name] ?? []
    for (const rule of fieldRules) {
      const result = rule(values[name], values)
      if (result !== true) {
        errors[name] = result
        return false
      }
    }
    delete errors[name]
    return true
  }

  function validateAll() {
    return Object.keys(schema).map(validateField).every(Boolean)
  }

  function handleBlur(name) {
    touched[name] = true
    validateField(name)
  }

  const isValid = computed(() => {
    // pure check without mutating error state
    return Object.entries(schema).every(([name, fieldRules]) =>
      fieldRules.every((rule) => rule(values[name], values) === true),
    )
  })

  const isDirty = computed(() => Object.keys(initial).some((k) => values[k] !== initial[k]))

  async function handleSubmit(onValid) {
    Object.keys(schema).forEach((k) => (touched[k] = true))
    if (!validateAll()) return
    submitting.value = true
    try {
      await onValid({ ...values })
    } finally {
      submitting.value = false
    }
  }

  function reset() {
    Object.assign(values, initial)
    Object.keys(errors).forEach((k) => delete errors[k])
    Object.keys(touched).forEach((k) => delete touched[k])
  }

  // error to SHOW = only after the field was touched
  function errorFor(name) {
    return touched[name] ? errors[name] : undefined
  }

  return {
    values,
    errors,
    touched,
    submitting,
    isValid,
    isDirty,
    handleBlur,
    handleSubmit,
    validateField,
    errorFor,
    reset,
  }
}
