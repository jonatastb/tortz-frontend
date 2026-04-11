// src/stores/toastStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function add(toast) {
    const id = Date.now()
    toasts.value.push({ id, ...toast })
    setTimeout(() => remove(id), toast.duration || 3500)
    return id
  }

  function remove(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  const success = (message, title = 'Sucesso') => add({ type: 'success', title, message })
  const error = (message, title = 'Erro') => add({ type: 'error', title, message })
  const info = (message, title = 'Aviso') => add({ type: 'info', title, message })
  const warning = (message, title = 'Atenção') => add({ type: 'warning', title, message })

  return { toasts, add, remove, success, error, info, warning }
})
