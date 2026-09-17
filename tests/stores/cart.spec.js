import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect, vi } from 'vitest'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

// The cart's `login` action calls the fake api; stub it so tests are fast + deterministic.
vi.mock('@/api/fakeApi', () => ({
  api: {
    login: vi.fn(async () => ({ token: 't', user: { email: 'a@b.co', name: 'a' } })),
  },
  config: {},
}))

const P = { id: 'p1', name: 'Pallet wrap', price: 10 }

describe('cart store (setup store) + cross-store discount', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('adds items and increments qty for duplicates', () => {
    const cart = useCartStore()
    cart.add(P)
    cart.add(P)
    expect(cart.count).toBe(2)
    expect(cart.items).toHaveLength(1)
    expect(cart.subtotal).toBe(20)
  })

  it('removes and clears', () => {
    const cart = useCartStore()
    cart.add(P)
    cart.remove('p1')
    expect(cart.items).toHaveLength(0)
    cart.add(P)
    cart.clear()
    expect(cart.count).toBe(0)
  })

  it('applies a 10% member discount when auth store is authenticated', async () => {
    const cart = useCartStore()
    const auth = useAuthStore()
    cart.add(P) // subtotal 10
    expect(cart.total).toBe(10)

    await auth.login({ email: 'a@b.co', password: 'x' })
    expect(cart.total).toBeCloseTo(9)
  })
})
