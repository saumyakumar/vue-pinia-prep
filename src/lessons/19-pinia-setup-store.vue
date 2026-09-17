<script setup>
// SETUP store (src/stores/cart.js): a function returning refs/computeds/functions.
// It's just the Composition API, so composables, watch, etc. all work inside.
import { storeToRefs } from 'pinia'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api/fakeApi'
import { ref, onMounted } from 'vue'

const cart = useCartStore()
const auth = useAuthStore()
const { items, count, subtotal, total } = storeToRefs(cart)

const products = ref([])
onMounted(async () => (products.value = await api.getProducts()))
</script>

<template>
  <div>
    <h1>19 · Pinia — setup stores</h1>

    <div class="demo-box">
      <h3>Products</h3>
      <ul class="products">
        <li v-for="p in products" :key="p.id">
          {{ p.name }} — ${{ p.price }}
          <BaseButton size="sm" @click="cart.add(p)">add</BaseButton>
        </li>
      </ul>

      <h3>Cart ({{ count }} items)</h3>
      <ul>
        <li v-for="i in items" :key="i.id">
          {{ i.qty }}× {{ i.name }}
          <button aria-label="remove" @click="cart.remove(i.id)">✕</button>
        </li>
      </ul>
      <p>
        subtotal ${{ subtotal.toFixed(2) }} → total <strong>${{ total.toFixed(2) }}</strong>
        <BaseBadge v-if="auth.isAuthenticated" tone="success">member −10%</BaseBadge>
      </p>
      <BaseButton size="sm" variant="secondary" @click="cart.clear()">clear</BaseButton>
      <BaseButton size="sm" @click="auth.isAuthenticated ? auth.logout() : auth.login({ email: 'a@b.co', password: 'x' })">
        toggle membership (cross-store effect on total)
      </BaseButton>
    </div>

    <div class="lesson-note">
      <pre>
export const useCartStore = defineStore('cart', () => {
  const items = ref([])                              // state
  const subtotal = computed(() => /* ... */)         // getter
  const total = computed(() => {
    const auth = useAuthStore()                      // CROSS-STORE: just call the hook
    return subtotal.value * (auth.isAuthenticated ? 0.9 : 1)
  })
  function add(p) { /* ... */ }                       // action
  return { items, subtotal, total, add }             // must return what you expose
})
</pre>
    </div>

    <details class="takeaways">
      <summary>Key takeaways / interview points</summary>
      <ul>
        <li>Mapping: <code>ref</code> → state, <code>computed</code> → getter, <code>function</code> → action. You must <code>return</code> everything public.</li>
        <li>Setup stores can use composables, <code>watch</code>, lifecycle-free effects — more flexible than option stores.</li>
        <li>No built-in <code>$reset()</code>. Add your own: keep an <code>initialState</code> and a <code>reset()</code> action, or <code>store.$reset = () =&gt; store.$patch(freshState())</code> via a plugin.</li>
        <li>Cross-store: call the other <code>useXxxStore()</code> inside a getter/action. Pinia returns the same singleton; circular imports are fine at call time.</li>
        <li>Prefer setup stores when you want composables inside or maximum flexibility; option stores when you like the rigid structure. Teams usually pick one and stay consistent.</li>
      </ul>
    </details>
  </div>
</template>

<style scoped>
h3 {
  margin: var(--space-4) 0 var(--space-2);
}
.products li {
  margin: 4px 0;
}
button {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
}
</style>
