<script setup>
// A perfectly ordinary component. It's "lazy" only because lesson 11 loads it via
// defineAsyncComponent(() => import('./LazyPanel.vue')) — so its code lands in a
// separate chunk fetched on first render. No async setup() here (that would need
// <Suspense> — see AsyncPanel.vue for that variant).
import { ref, onMounted } from 'vue'
import { api } from '@/api/fakeApi'

const products = ref(null)
onMounted(async () => {
  products.value = await api.getProducts()
})
</script>

<template>
  <div class="lazy">
    <p v-if="!products">loading data…</p>
    <ul v-else>
      <li v-for="p in products" :key="p.id">{{ p.name }} — ${{ p.price }}</li>
    </ul>
  </div>
</template>

<style scoped>
.lazy {
  border: 1px dashed var(--color-border);
  padding: var(--space-3);
  border-radius: var(--radius-sm);
}
</style>
