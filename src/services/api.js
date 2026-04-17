// src/services/api.js
// Instância Axios centralizada — integrada com API Laravel

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ─── Request interceptor: injeta Bearer token ────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response interceptor: normaliza erros ───────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // Token expirado ou inválido → força logout
    if (status === 401) {
      localStorage.removeItem('auth_token')
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }

    // Normaliza mensagem de erro para facilitar uso nos componentes
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      (error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(' ')
        : null) ||
      error.message ||
      'Erro inesperado. Tente novamente.'

    error.userMessage = message
    return Promise.reject(error)
  }
)

export default api
