<script setup>
// This component uses TOP-LEVEL await in <script setup>. That makes it an
// "async setup" component — it must be rendered inside <Suspense>, which shows
// fallback content until the await resolves.
import { ref } from 'vue'
import { api } from '@/api/fakeApi'

const products = ref([])
// top-level await — no onMounted needed; Suspense coordinates the loading state
products.value = await api.getProducts()
</script>

<template>
  <ul>
    <li v-for="p in products" :key="p.id">{{ p.name }} — ${{ p.price }}</li>
  </ul>
</template>
