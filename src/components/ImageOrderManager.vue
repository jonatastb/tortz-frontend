<template>
  <div class="image-order-manager">
    <h3 class="section-title">Ordenar Imagens (Arraste e Solte)</h3>
    
    <div v-if="images.length === 0" class="empty-state">
      <span class="empty-icon">image</span>
      <span class="empty-text">Nenhuma imagem para ordenar</span>
    </div>

    <div v-else class="images-grid">
      <div
        v-for="(image, index) in sortedImages"
        :key="image.id"
        :class="['image-item', { 'primary': index === 0 }]"
        draggable
        @dragstart="handleDragStart(image)"
        @dragover="handleDragOver"
        @drop="(e) => handleDrop(e, image)"
        @dragend="handleDragEnd"
      >
        <img :src="buildImageUrl(image.image_path)" :alt="`Imagem ${index + 1}`" />
        
        <div class="image-overlay">
          <span class="order-number">{{ index + 1 }}</span>
          <span v-if="index === 0" class="primary-badge">CAPA</span>
          <span v-if="draggedImage?.id === image.id" class="dragging-indicator">↕️</span>
        </div>
      </div>
    </div>

    <!-- Loading indicator -->
    <div v-if="updating" class="loading-overlay">
      <div class="loading-spinner"></div>
      <span>Atualizando ordem...</span>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { orderService } from '@/services/orderService'
import { buildImageUrl } from '@/utils/imageHelpers'

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  images: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['orderChange'])

const draggedImage = ref(null)
const updating = ref(false)
const error = ref('')
const successMessage = ref('')

// Imagens ordenadas por sort_order
const sortedImages = computed(() => {
  return [...props.images].sort((a, b) => a.sort_order - b.sort_order)
})

const handleDragStart = (image) => {
  draggedImage.value = image
  error.value = ''
  successMessage.value = ''
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleDrop = async (e, targetImage) => {
  e.preventDefault()
  
  if (!draggedImage.value || draggedImage.value.id === targetImage.id) {
    handleDragEnd()
    return
  }

  updating.value = true
  error.value = ''
  successMessage.value = ''

  try {
    // Calculate new order
    const newImages = [...sortedImages.value]
    const draggedIndex = newImages.findIndex(img => img.id === draggedImage.value.id)
    const targetIndex = newImages.findIndex(img => img.id === targetImage.id)

    // Reorder array
    newImages.splice(draggedIndex, 1)
    newImages.splice(targetIndex, 0, draggedImage.value)

    // Update sort_order for API
    const imageOrders = newImages.map((image, index) => ({
      id: image.id,
      sort_order: index + 1
    }))

    // Send to backend
    await orderService.updateImageOrder(props.productId, imageOrders)
    
    // Update local state
    emit('orderChange', newImages)
    successMessage.value = 'Ordem das imagens atualizada com sucesso!'

  } catch (e) {
    error.value = e.message || 'Erro ao atualizar ordem das imagens'
    console.error('Error updating image order:', e)
  } finally {
    updating.value = false
    handleDragEnd()
  }
}

const handleDragEnd = () => {
  draggedImage.value = null
}

// Auto-clear messages
const clearMessages = () => {
  setTimeout(() => {
    error.value = ''
    successMessage.value = ''
  }, 3000)
}

// Watch for messages to auto-clear
watch([error, successMessage], clearMessages)
</script>

<style scoped>
.image-order-manager {
  max-width: 800px;
  margin: 20px auto;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f2937;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 8px;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: move;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  background: white;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.image-item.primary {
  border-color: #3b82f6;
}

.image-item.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.image-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-number {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.primary-badge {
  background: #10b981;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.dragging-indicator {
  background: #f59e0b;
  color: white;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 4px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 8px;
  z-index: 10;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-message {
  margin-top: 12px;
  padding: 12px;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  color: #166534;
  font-size: 0.875rem;
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
    padding: 15px;
  }
  
  .image-item img {
    height: 120px;
  }
  
  .order-number {
    width: 20px;
    height: 20px;
    font-size: 10px;
  }
}
</style>
