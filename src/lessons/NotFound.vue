<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <div>
    <h1>404 — Not found</h1>
    <p>
      No route matched <code>{{ route.fullPath }}</code
      >. This component is the <code>/:pathMatch(.*)*</code> catch-all in
      <code>src/router/index.js</code>.
    </p>
    <RouterLink to="/">← Back to start</RouterLink>
  </div>
</template>
