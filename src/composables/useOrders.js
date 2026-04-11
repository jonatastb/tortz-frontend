// src/composables/useOrders.js
import { ref } from 'vue'
import { orderService } from '@/services/orderService'

export function useOrders() {
  const orders = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const { data } = await orderService.getAll()
      orders.value = data
    } catch (e) {
      error.value = e.message || 'Erro ao carregar pedidos'
    } finally {
      loading.value = false
    }
  }

  async function updateStatus(id, status) {
    await orderService.updateStatus(id, status)
    const order = orders.value.find(o => o.id === id)
    if (order) order.status = status
  }

  return { orders, loading, error, fetch, updateStatus }
}
