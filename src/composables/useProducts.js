// src/composables/useProducts.js
import { ref } from 'vue'
import { productService } from '@/services/productService'

export function useProducts() {
  const products = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetch(params = {}) {
    loading.value = true
    error.value = null
    try {
      const { data } = await productService.getAll(params)
      products.value = data
    } catch (e) {
      error.value = e.message || 'Erro ao carregar produtos'
    } finally {
      loading.value = false
    }
  }

  return { products, loading, error, fetch }
}
