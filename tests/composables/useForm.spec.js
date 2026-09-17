import { describe, it, expect, vi } from 'vitest'
import { withSetup } from '../helpers/withSetup'
import { useForm, rules } from '@/composables/useForm'

function makeForm() {
  return withSetup(() =>
    useForm(
      { email: '', password: '', confirm: '' },
      {
        email: [rules.required(), rules.email()],
        password: [rules.minLen(8)],
        confirm: [rules.match('password')],
      },
    ),
  )
}

describe('useForm', () => {
  it('is invalid until all rules pass', () => {
    const [f, app] = makeForm()
    expect(f.isValid.value).toBe(false)
    f.values.email = 'sam@4pl.co'
    f.values.password = 'longenough'
    f.values.confirm = 'longenough'
    expect(f.isValid.value).toBe(true)
    app.unmount()
  })

  it('only surfaces an error after the field is touched', () => {
    const [f, app] = makeForm()
    f.values.email = 'nope'
    f.validateField('email')
    expect(f.errors.email).toBeTruthy()
    expect(f.errorFor('email')).toBeUndefined() // not touched yet
    f.handleBlur('email')
    expect(f.errorFor('email')).toBeTruthy()
    app.unmount()
  })

  it('cross-field match rule reads sibling values', () => {
    const [f, app] = makeForm()
    f.values.password = 'abcd1234'
    f.values.confirm = 'different'
    f.handleBlur('confirm')
    expect(f.errorFor('confirm')).toBe('Does not match')
    f.values.confirm = 'abcd1234'
    f.validateField('confirm')
    expect(f.errors.confirm).toBeUndefined()
    app.unmount()
  })

  it('handleSubmit runs onValid only when valid, toggles submitting', async () => {
    const [f, app] = makeForm()
    const onValid = vi.fn().mockResolvedValue()

    await f.handleSubmit(onValid)
    expect(onValid).not.toHaveBeenCalled() // invalid

    f.values.email = 'sam@4pl.co'
    f.values.password = 'abcd1234'
    f.values.confirm = 'abcd1234'
    await f.handleSubmit(onValid)
    expect(onValid).toHaveBeenCalledWith({ email: 'sam@4pl.co', password: 'abcd1234', confirm: 'abcd1234' })
    expect(f.submitting.value).toBe(false)
    app.unmount()
  })
})
