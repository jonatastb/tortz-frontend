// src/services/imageUploadService.js
// Serviço para upload de imagens com endpoint separado e UUIDs

import api from './api'

export const imageUploadService = {
  /**
   * Upload individual image
   * @param {string} productId - ID do produto
   * @param {File} imageFile - Arquivo de imagem
   * @param {Function} onProgress - Callback de progresso (opcional)
   * @returns {Promise<Object>} - Dados da imagem uploaded
   */
  async uploadImage(productId, imageFile, onProgress = null) {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('product_id', productId)

    try {
      const response = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000, // 60s para upload (sem limites de tamanho)
        onUploadProgress: onProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        } : undefined
      })

      return response.data.image
    } catch (error) {
      // Handle timeout errors specifically
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Upload demorou demais. Verifique sua conexão e tente novamente.')
      }
      throw error
    }
  },

  /**
   * Delete image by ID
   * @param {string} imageId - ID da imagem (UUID)
   * @returns {Promise<Object>} - Resultado da deleção
   */
  async deleteImage(imageId) {
    try {
      const response = await api.delete(`/images/${imageId}`)
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Reorder images
   * @param {string} productId - ID do produto
   * @param {Array} imageOrders - Array com ordens [{id: uuid, sort_order: 1}]
   * @returns {Promise<Object>} - Resultado da reordenação
   */
  async reorderImages(productId, imageOrders) {
    try {
      const response = await api.put(`/products/${productId}/images/order`, {
        image_orders: imageOrders
      })
      return response.data
    } catch (error) {
      throw error
    }
  },

  /**
   * Set image as primary
   * @param {string} productId - ID do produto
   * @param {string} imageId - ID da imagem (UUID)
   * @returns {Promise<Object>} - Resultado da operação
   */
  async setPrimaryImage(productId, imageId) {
    try {
      const response = await api.put(`/products/${productId}/images/${imageId}/set-primary`)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

// Helper function para validar tipo de imagem
export const validateImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Formato inválido. Use JPEG, PNG, JPG ou GIF.')
  }
  
  return true
}

// Helper function para criar preview
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Arquivo não é uma imagem'))
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsDataURL(file)
  })
}
