import { describe, it, expect, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { withSetup } from '../helpers/withSetup'
import { useLocalStorage } from '@/composables/useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => localStorage.clear())

  it('returns the default when nothing is stored', () => {
    const [state, app] = withSetup(() => useLocalStorage('k', 'fallback'))
    expect(state.value).toBe('fallback')
    app.unmount()
  })

  it('hydrates from existing storage', () => {
    localStorage.setItem('k', JSON.stringify({ n: 5 }))
    const [state, app] = withSetup(() => useLocalStorage('k', { n: 0 }))
    expect(state.value).toEqual({ n: 5 })
    app.unmount()
  })

  it('persists writes back to storage', async () => {
    const [state, app] = withSetup(() => useLocalStorage('k', 'a'))
    state.value = 'b'
    await nextTick()
    expect(JSON.parse(localStorage.getItem('k'))).toBe('b')
    app.unmount()
  })

  it('ignores corrupt JSON and falls back', () => {
    localStorage.setItem('k', '{not json')
    const [state, app] = withSetup(() => useLocalStorage('k', 'safe'))
    expect(state.value).toBe('safe')
    app.unmount()
  })
})
