// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const token   = ref(localStorage.getItem('auth_token') || null)
  const loading = ref(false)
  const error   = ref(null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin         = computed(() => user.value?.role === 'admin')

  async function login(credentials) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authService.login(credentials)
      token.value = data.token
      user.value  = data.user
      localStorage.setItem('auth_token', data.token)
      return true
    } catch (err) {
      error.value = err.userMessage || 'Credenciais inválidas.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } catch {
      // Ignora erros de logout (token já pode estar expirado)
    } finally {
      token.value = null
      user.value  = null
      localStorage.removeItem('auth_token')
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const { data } = await authService.me()
      user.value = data
    } catch {
      // Token inválido — limpa sessão
      await logout()
    }
  }

  return { user, token, loading, error, isAuthenticated, isAdmin, login, logout, fetchUser }
})
