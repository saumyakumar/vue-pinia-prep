// SETUP STORE style — a function that returns state/getters/actions.
//   ref()      -> state
//   computed() -> getter
//   function   -> action
//
// Preferred by many teams: it's just the Composition API, you can use
// composables inside, and tree-shaking is a touch better. The one gotcha:
// you must `return` everything you want exposed.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', () => {
  const items = ref([]) // [{ id, name, price, qty }]

  const count = computed(() => items.value.reduce((n, i) => n + i.qty, 0))
  const subtotal = computed(() => items.value.reduce((n, i) => n + i.price * i.qty, 0))

  // CROSS-STORE usage: just call the other store's hook. Pinia dedupes instances.
  const total = computed(() => {
    const auth = useAuthStore()
    const discount = auth.isAuthenticated ? 0.1 : 0 // 10% for members
    return subtotal.value * (1 - discount)
  })

  function add(product) {
    const existing = items.value.find((i) => i.id === product.id)
    if (existing) existing.qty++
    else items.value.push({ ...product, qty: 1 })
  }

  function remove(id) {
    items.value = items.value.filter((i) => i.id !== id)
  }

  function clear() {
    items.value = []
  }

  return { items, count, subtotal, total, add, remove, clear }
})
