// src/stores/adminStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productService, categoryService } from '@/services/productService'
import { orderService } from '@/services/orderService'
import api from '@/services/api'

export const useAdminStore = defineStore('admin', () => {
  const products   = ref([])
  const categories = ref([])
  const orders     = ref([])
  const stats      = ref(null)
  const loading    = ref(false)
  const error      = ref(null)

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function setError(e) {
    error.value = e?.userMessage || e?.message || 'Erro ao carregar dados.'
  }

  // ─── Products ─────────────────────────────────────────────────────────────
  async function fetchProducts() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await productService.getAll()
      // Laravel pode retornar paginado ({ data: [...] }) ou array direto
      products.value = Array.isArray(data) ? data : (data.data ?? [])
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function createProduct(payload) {
    const { data } = await productService.create(payload)
    const item = data.data ?? data
    products.value.unshift(item)
    return item
  }

  async function updateProduct(id, payload) {
    const { data } = await productService.update(id, payload)
    const item = data.data ?? data
    const idx  = products.value.findIndex(p => p.id === item.id)
    if (idx !== -1) products.value[idx] = item
    return item
  }

  async function deleteProduct(id) {
    await productService.delete(id)
    products.value = products.value.filter(p => p.id !== Number(id))
  }

  // ─── Categories ───────────────────────────────────────────────────────────
  async function fetchCategories() {
    error.value = null
    try {
      const { data } = await categoryService.getAll()
      categories.value = Array.isArray(data) ? data : (data.data ?? [])
    } catch (e) {
      setError(e)
    }
  }

  async function createCategory(payload) {
    const { data } = await categoryService.create(payload)
    const item = data.data ?? data
    categories.value.push(item)
    return item
  }

  async function updateCategory(id, payload) {
    const { data } = await categoryService.update(id, payload)
    const item = data.data ?? data
    const idx  = categories.value.findIndex(c => c.id === item.id)
    if (idx !== -1) categories.value[idx] = item
    return item
  }

  async function deleteCategory(id) {
    await categoryService.delete(id)
    categories.value = categories.value.filter(c => c.id !== Number(id))
  }

  // ─── Orders ───────────────────────────────────────────────────────────────
  async function fetchOrders(params = {}) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await orderService.getAll(params)
      orders.value = Array.isArray(data) ? data : (data.data ?? [])
    } catch (e) {
      setError(e)
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(id, status) {
    const { data } = await orderService.updateStatus(id, status)
    const order = orders.value.find(o => String(o.id) === String(id))
    if (order) order.status = status
    return data
  }

  // ─── Dashboard stats ──────────────────────────────────────────────────────
  // Se o Laravel tiver GET /admin/stats, use api.get('/admin/stats').
  // Se não, computamos a partir dos dados já carregados.
  async function fetchStats() {
    error.value = null
    try {
      // Tenta endpoint dedicado; se não existir, monta localmente
      const { data } = await api.get('/admin/stats')
      stats.value = data.data ?? data
    } catch {
      // Fallback: computa a partir das listas já carregadas
      await Promise.all([
        products.value.length  === 0 ? fetchProducts()  : null,
        categories.value.length=== 0 ? fetchCategories(): null,
        orders.value.length    === 0 ? fetchOrders()    : null,
      ])
      stats.value = {
        totalOrders:      orders.value.length,
        pendingOrders:    orders.value.filter(o => o.status === 'pendente').length,
        totalProducts:    products.value.length,
        totalCategories:  categories.value.length,
        revenue: {
          today: 0,
          month: 0,
          total: orders.value.reduce((s, o) => s + Number(o.total || 0), 0),
        },
        recentOrders: orders.value.slice(0, 4),
      }
    }
  }

  return {
    products, categories, orders, stats, loading, error,
    fetchProducts, createProduct, updateProduct, deleteProduct,
    fetchCategories, createCategory, updateCategory, deleteCategory,
    fetchOrders, updateOrderStatus,
    fetchStats,
  }
})
