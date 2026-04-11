// src/services/productService.js
// Consome a API Laravel — GET /products, POST, PUT, DELETE

import api from './api'

export const productService = {
  /**
   * Lista todos os produtos.
   * Suporta filtros via query string: ?category_id=1&search=bolo&featured=1
   * O backend Laravel deve aceitar esses parâmetros no Controller.
   */
  getAll(params = {}) {
    return api.get('/products', { params })
  },

  /** GET /products/:id */
  getById(id) {
    return api.get(`/products/${id}`)
  },

  /**
   * GET /products?featured=1
   * Caso o backend não suporte este param, filtrar no front:
   *   .then(r => ({ ...r, data: r.data.filter(p => p.featured) }))
   */
  getFeatured() {
    return api.get('/products', { params: { featured: 1 } })
  },

  /** POST /api/admin/products — requer autenticação admin */
  create(data, options = {}) {
    // Se tiver imagem, usa FormData, senão JSON normal
    if (data instanceof FormData) {
      return api.post('/admin/products', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 45000, // 45s para upload com imagens
        onUploadProgress: options.onUploadProgress
      })
    }
    return api.post('/admin/products', data)
  },

  /** PUT /products/:id — requer autenticação (não admin) */
  update(id, data, options = {}) {
    // Se tiver imagem, usa FormData, senão JSON normal
    if (data instanceof FormData) {
      return api.put(`/products/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 45000, // 45s para upload com imagens
        onUploadProgress: options.onUploadProgress
      })
    }
    return api.put(`/products/${id}`, data)
  },

  
  /** DELETE /api/admin/products/:id — requer autenticação admin */
  delete(id) {
    return api.delete(`/admin/products/${id}`)
  },
}

export const categoryService = {
  /** GET /categories */
  getAll() {
    return api.get('/categories')
  },

  /** POST /api/admin/categories */
  create(data) {
    return api.post('/admin/categories', data)
  },

  /** PUT /api/admin/categories/:id */
  update(id, data) {
    return api.put(`/admin/categories/${id}`, data)
  },

  /** DELETE /api/admin/categories/:id */
  delete(id) {
    return api.delete(`/admin/categories/${id}`)
  },
}
