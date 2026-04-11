<template>
  <div class="image-upload-manager">
    <!-- Product Selection -->
    <div v-if="!productId || productId === 'new'" class="product-warning">
      
      <!-- Upload Section for New Product -->
      <div class="upload-section">
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/gif"
          @change="handleFileChangeForNewProduct"
          :disabled="uploading"
          class="file-input"
          multiple
        />
        
        <div class="upload-area" @click="$refs.fileInput.click()">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="upload-text">
            {{ uploading ? 'Processando imagens...' : 'Clique para adicionar imagens' }}
          </span>
          <span class="upload-hint">JPEG, PNG, JPG, GIF (várias imagens permitidas)</span>
        </div>
      </div>

      <!-- Pending Images Preview -->
      <div v-if="pendingImages.length > 0" class="pending-images">
        <h4>Imagens Adicionadas ({{ pendingImages.length }})</h4>
        <div class="images-grid">
          <div
            v-for="(image, index) in pendingImages"
            :key="image.id"
            :class="['image-item', { 'primary': index === 0 }]"
          >
            <img :src="image.preview" :alt="`Preview ${index + 1}`" />
            <div class="image-overlay">
              <span class="order-number">{{ index + 1 }}</span>
              <!-- <span v-if="index === 0" class="primary-badge">CAPA</span> -->
            </div>
            <button
              @click="removePendingImage(index)"
              class="delete-btn"
              title="Remover imagem"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Upload Section for Existing Product -->
    <div v-else class="upload-section">
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/gif"
        @change="handleFileChange"
        :disabled="uploading"
        class="file-input"
      />
      
      <div class="upload-area" @click="$refs.fileInput.click()">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span class="upload-text">
          {{ uploading ? 'Enviando imagem...' : 'Clique para adicionar imagem' }}
        </span>
        <span class="upload-hint">JPEG, PNG, JPG, GIF (sem limite de tamanho)</span>
      </div>
      
      <!-- Upload Progress -->
      <div v-if="uploading && progress > 0" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
    </div>

    <!-- Images Grid for Existing Products -->
    <div v-if="productId !== 'new' && images.length > 0" class="images-grid">
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
        <img :src="buildImageUrl(image.image_path)" :alt="`Product image ${index + 1}`" />
        
        <div class="image-overlay">
          <span class="order-number">{{ index + 1 }}</span>
        </div>
        
        <div class="image-controls">
          <button
            @click="handleImageDelete(image.id)"
            class="delete-btn"
            :disabled="deleting === image.id"
            title="Remover imagem"
          >
            <svg v-if="deleting === image.id" class="spinner" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          
          <span v-if="index === 0" class="primary-badge">CAPA</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state" v-if="!productId">
      <span class="empty-icon">Imagens</span>
      <span class="empty-text">Nenhuma imagem adicionada</span>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { imageUploadService, validateImageFile } from '@/services/imageUploadService'
import { buildImageUrl } from '@/utils/imageHelpers'

const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  existingImages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['images-change', 'productCreated'])

// Criar cópia reativa das imagens existentes
const images = ref([...props.existingImages])
const sortedImages = ref([...props.existingImages])
const pendingImages = ref([]) // Imagens pendentes de upload

// Atualizar quando a prop mudar
watch(() => props.existingImages, (newImages) => {
  images.value = [...newImages]
  sortedImages.value = [...newImages]
}, { deep: true })

const fileInput = ref(null)
const uploading = ref(false)
const deleting = ref(null)
const progress = ref(0)
const error = ref('')
const draggedImage = ref(null)
const updating = ref(false)
const creating = ref(false)

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  
  if (!file) return
  
  error.value = ''
  
  // Para produtos novos (productId === 'new'), usar fluxo de preview
  if (props.productId === 'new') {
    
    // Validar arquivo
    try {
      validateImageFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewImage = {
          id: `preview-${Date.now()}-${Math.random()}`,
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          type: file.type,
          isNew: true // Marcar como preview de novo produto
        }
        
        // Adicionar ao array de imagens
        const updatedImages = [...images.value, previewImage]
        images.value = updatedImages
        sortedImages.value = updatedImages
        emit('images-change', updatedImages)
        
      }
      reader.readAsDataURL(file)
      
    } catch (e) {
      error.value = e.message || 'Erro ao validar arquivo.'
      console.error('File validation failed:', e)
    }
    
    event.target.value = ''
    return
  }
  
  // Para produtos existentes, fazer upload direto
  if (!props.productId || props.productId === 'undefined') {
    error.value = 'Selecione um produto válido antes de fazer upload de imagens.'
    return
  }
  
  
  try {
    // Validate file type
    validateImageFile(file)
    
    uploading.value = true
    progress.value = 0
    
    // Upload image
    const newImage = await imageUploadService.uploadImage(
      props.productId,
      file,
      (percent) => {
        progress.value = percent
      }
    )
    
    // Debug: Verificar estrutura da resposta
    
    // Garantir que a imagem tenha a estrutura correta
    const imageToAdd = {
      id: newImage.id || newImage.uuid,
      image_path: newImage.image_path || newImage.path || newImage.url,
      sort_order: images.value.length + 1,
      created_at: newImage.created_at || new Date().toISOString()
    }
    
    
    // Add to images list
    const updatedImages = [...images.value, imageToAdd]
    images.value = updatedImages // Atualizar array reativo
    sortedImages.value = updatedImages // Atualizar sortedImages também
    emit('images-change', updatedImages)
    
    
  } catch (e) {
    error.value = e.message || 'Erro ao fazer upload da imagem.'
    console.error('Upload failed:', e)
  } finally {
    uploading.value = false
    progress.value = 0
    event.target.value = ''
  }
}

const handleImageDelete = async (imageId) => {
  if (!confirm('Tem certeza que deseja remover esta imagem?')) return
  
  deleting.value = imageId
  error.value = ''
  
  try {
    await imageUploadService.deleteImage(imageId)
    
    // Remove from images list
    const updatedImages = images.value.filter(img => img.id !== imageId)
    images.value = updatedImages
    sortedImages.value = updatedImages // Atualizar sortedImages também
    emit('images-change', updatedImages)
    
  } catch (e) {
    error.value = e.message || 'Erro ao remover imagem.'
    console.error('Delete failed:', e)
  } finally {
    deleting.value = null
  }
}

const handleDragStart = (image) => {
  draggedImage.value = image
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
    await imageUploadService.reorderImages(props.productId, imageOrders)
    
    // Update local state
    images.value = newImages
    sortedImages.value = newImages // Atualizar sortedImages também
    emit('images-change', newImages)
    

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

const handleFileChangeForNewProduct = (event) => {
  const files = event.target.files
  
  if (!files || files.length === 0) return
  
  error.value = ''
  
  // Adicionar cada arquivo como imagem pendente
  Array.from(files).forEach(file => {
    // Validar arquivo
    try {
      validateImageFile(file)
      
      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const pendingImage = {
          id: `pending-${Date.now()}-${Math.random()}`,
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
          type: file.type
        }
        
        pendingImages.value.push(pendingImage)
        emit('images-change', pendingImages.value)
      }
      reader.readAsDataURL(file)
      
    } catch (e) {
      error.value = e.message || 'Erro ao validar arquivo.'
      console.error('File validation failed:', e)
    }
  })
  
  // Limpar input
  event.target.value = ''
}

const removePendingImage = (index) => {
  pendingImages.value.splice(index, 1)
}

const createNewProduct = async () => {
  if (pendingImages.value.length === 0) {
    error.value = 'Adicione pelo menos uma imagem antes de criar o produto.'
    return
  }
  
  creating.value = true
  error.value = ''
  
  try {
    // Criar produto básico
    const response = await api.post('/products', {
      name: 'Novo Produto',
      description: 'Produto criado com imagens',
      price: 99.99,
      category_id: 1, // Assumir primeira categoria
      featured: false,
      stock: 10,
      active: true
    })
    
    const newProduct = response.data
    
    // Fazer upload das imagens pendentes
    const uploadedImages = []
    
    for (let i = 0; i < pendingImages.value.length; i++) {
      const pendingImage = pendingImages.value[i]
      
      try {
        
        const uploadedImage = await imageUploadService.uploadImage(
          newProduct.id,
          pendingImage.file
        )
        
        // Garantir estrutura correta
        const imageToAdd = {
          id: uploadedImage.id || uploadedImage.uuid,
          image_path: uploadedImage.image_path || uploadedImage.path || uploadedImage.url,
          sort_order: i + 1,
          created_at: uploadedImage.created_at || new Date().toISOString()
        }
        
        uploadedImages.push(imageToAdd)
        
      } catch (uploadError) {
        console.error(`Error uploading image ${i + 1}:`, uploadError)
        error.value = `Erro ao fazer upload da imagem ${i + 1}: ${uploadError.message}`
      }
    }
    
    // Emitir evento com produto criado e imagens
    emit('productCreated', {
      ...newProduct,
      images: uploadedImages
    })
    
    // Limpar imagens pendentes
    pendingImages.value = []
    
    // Limpar input de arquivo
    if (fileInput.value) {
      fileInput.value.value = ''
    }
    
    
  } catch (error) {
    console.error('Error creating product:', error)
    error.value = 'Erro ao criar novo produto. Tente novamente.'
  } finally {
    creating.value = false
  }
}

// Watch para limpar QR Code
// watch(paymentMethod, clearQrCode)
</script>

<style scoped>
.image-upload-manager {
  max-width: 800px;
  margin: 0 auto;
}

.product-warning {
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.warning-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}

.warning-text {
  color: #92400e;
  font-size: 0.875rem;
  line-height: 1.4;
}

.create-product-btn {
  background: #059669;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 12px;
}

.create-product-btn:hover {
  background: #047857;
}

.create-product-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pending-images {
  margin-top: 20px;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.pending-images h4 {
  margin-bottom: 16px;
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-area {
  padding: 20px;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.upload-area:has(input:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.file-input {
  display: none;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #9ca3af;
}

.upload-text {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.upload-hint {
  display: block;
  font-size: 0.875rem;
  color: #6b7280;
}

.upload-progress {
  margin-top: 10px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  height: 8px;
}

.progress-bar {
  height: 100%;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  cursor: move;
  border: 2px solid transparent;
}

.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

.image-controls {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  width: 32px;
  border-radius: 50%;
  height: 32px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.delete-btn:hover:not(:disabled) {
  background: rgba(220, 38, 38, 0.9);
  transform: scale(1.05);
}

.delete-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.delete-btn svg {
  width: 16px;
  height: 16px;
}

.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.primary-badge {
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.error-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .images-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 10px;
  }
  
  .upload-area {
    padding: 16px;
  }
  
  .upload-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
