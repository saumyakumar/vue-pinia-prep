// SETUP STORE style, and the store our router guard (lesson 17) reads.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/fakeApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const res = await api.login(credentials)
      token.value = res.token
      user.value = res.user
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
  }

  return { user, token, loading, error, isAuthenticated, login, logout }
}, {
  // Persist just the token + user (see lesson 21). Note: localStorage token
  // storage has XSS trade-offs — lesson 33 covers this honestly.
  persist: {
    pick: ['token', 'user'],
  },
})
