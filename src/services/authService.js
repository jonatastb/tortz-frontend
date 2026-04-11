// src/services/authService.js
// Autenticação via Laravel Sanctum (Bearer Token)
// Endpoints esperados: POST /auth/login, POST /auth/logout, GET /auth/me

import api from './api'

export const authService = {
  /**
   * POST /auth/login
   * Payload: { email, password }
   * Resposta esperada: { token: string, user: { id, name, email, role } }
   */
  login(credentials) {
    return api.post('/auth/login', credentials)
  },

  /**
   * POST /auth/logout
   * Invalida o token no servidor (Sanctum revoga o token)
   */
  logout() {
    return api.post('/auth/logout')
  },

  /**
   * GET /auth/me
   * Retorna os dados do usuário autenticado via token Bearer
   */
  me() {
    return api.get('/auth/me')
  },
}
