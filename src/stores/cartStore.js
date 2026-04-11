// src/stores/cartStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getPrimaryImageUrl } from '@/utils/imageHelpers.js'

export const useCartStore = defineStore('cart', () => {
  const items = ref(JSON.parse(localStorage.getItem('tortz_cart') || '[]'))

  const save = () => localStorage.setItem('tortz_cart', JSON.stringify(items.value))

  const totalItems = computed(() => items.value.reduce((s, i) => s + i.quantity, 0))
  const totalPrice = computed(() => items.value.reduce((s, i) => s + i.price * i.quantity, 0))
  const isEmpty    = computed(() => items.value.length === 0)

  function addItem(product, quantity = 1) {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        id:       product.id,
        name:     product.name,
        price:    Number(product.price),
        image:    getPrimaryImageUrl(product),
        quantity,
      })
    }
    save()
  }

  function removeItem(id) {
    items.value = items.value.filter(i => i.id !== id)
    save()
  }

  function updateQuantity(id, quantity) {
    if (quantity <= 0) { removeItem(id); return }
    const item = items.value.find(i => i.id === id)
    if (item) { item.quantity = quantity; save() }
  }

  function clearCart() {
    items.value = []
    save()
  }

  return { items, totalItems, totalPrice, isEmpty, addItem, removeItem, updateQuantity, clearCart }
})
