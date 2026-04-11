<template>
  <div class="multiple-image-upload">
    <!-- Upload area -->
    <div class="upload-area" @click="triggerFileInput">
      <input
        ref="fileInput"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/jpg,image/gif"
        @change="handleImagesChange"
        class="file-input"
      />
      
      <div class="upload-content">
        <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span class="upload-text">Clique para adicionar imagens</span>
        <span class="upload-hint">JPEG, PNG, JPG, GIF (max. 1MB cada)</span>
        <span class="upload-limit">Máximo 5 imagens</span>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <!-- Existing images -->
    <div v-if="existingImages.length > 0" class="images-section">
      <h3 class="section-title">Imagens existentes ({{ existingImages.length }})</h3>
      <div class="images-grid">
        
        <ImageItem
          v-for="(image, index) in existingImages"
          :key="image.id"
          :image="image"
          :is-primary="image.sort_order === 1"
          :is-first="index === 0"
          :is-last="index === existingImages.length - 1"
          @set-primary="handleSetPrimary(image.id)"
          @delete="handleDeleteImage(image.id)"
          @move-up="handleMoveUp(index)"
          @move-down="handleMoveDown(index)"
        />
      </div>
    </div>

    <!-- New images preview -->
    <div v-if="newImages.length > 0" class="images-section">
      <h3 class="section-title">Novas imagens ({{ newImages.length }})</h3>
      <div class="images-grid">
        <div
          v-for="(newImage, index) in newImages"
          :key="newImage.id"
          class="new-image-item"
        >
          <div class="image-container">
            <img :src="newImage.preview" :alt="`Nova imagem ${index + 1}`" />
            <div class="image-overlay">
              <button
                @click="removeNewImage(newImage.id)"
                class="remove-btn"
                title="Remover imagem"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div class="image-info">
            <span class="order-number">#{{ existingImages.length + index + 1 }}</span>
            <span class="new-badge">NOVA</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Total count -->
    <div class="total-info">
      <div class="total-count">
        Total de imagens: {{ totalImages }} / 5
        <span v-if="totalImages > 5" class="warning">
          (Limite excedido - apenas as 5 primeiras serão enviadas)
        </span>
      </div>
      
      <!-- Upload progress -->
      <div v-if="uploadProgress > 0 || isCompressing" class="upload-status">
        <div v-if="isCompressing" class="compressing">
          <span class="status-text">Comprimindo imagens...</span>
        </div>
        <div v-else-if="uploadProgress > 0" class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          <span class="progress-text">{{ uploadProgress }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ImageItem from './ImageItem.vue'
import { compressImages, isSupportedImage } from '@/utils/imageCompression.js'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['change'])

const fileInput = ref(null)
const newImages = ref([])
const existingImages = ref([])
const error = ref('')

// Initialize existing images from product
watch(() => props.product, (product) => {
  if (product?.images) {
    existingImages.value = [...product.images].sort((a, b) => a.sort_order - b.sort_order)
  } else {
    existingImages.value = []
  }
}, { immediate: true })

const totalImages = computed(() => existingImages.value.length + newImages.value.length)
const uploadProgress = ref(0)
const isCompressing = ref(false)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleImagesChange = async (event) => {
  const files = Array.from(event.target.files)
  
  if (!files.length) return
  
  // Validate total count
  if (totalImages.value + files.length > 5) {
    error.value = 'Limite de 5 imagens por produto.'
    event.target.value = ''
    return
  }
  
  // Validate each file type
  for (const file of files) {
    if (!isSupportedImage(file)) {
      error.value = `Formato inválido: ${file.name}. Use JPEG, PNG, JPG ou GIF.`
      event.target.value = ''
      return
    }
  }
  
  try {
    isCompressing.value = true
    error.value = ''
    
    // Compress images
    const compressedFiles = await compressImages(files, {
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      maxSizeMB: 1
    })
    
    // Create previews
    const newPreviews = compressedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Date.now() + Math.random()
    }))
    
    newImages.value = [...newImages.value, ...newPreviews]
    emit('change', getAllImages())
    
  } catch (e) {
    error.value = 'Erro ao processar imagens. Tente novamente.'
    console.error('Image compression error:', e)
  } finally {
    isCompressing.value = false
    event.target.value = ''
  }
}

const removeNewImage = (id) => {
  const index = newImages.value.findIndex(img => img.id === id)
  if (index !== -1) {
    URL.revokeObjectURL(newImages.value[index].preview)
    newImages.value.splice(index, 1)
    emit('change', getAllImages())
  }
}

const getAllImages = () => {
  return {
    existing: existingImages.value,
    new: newImages.value.map(img => img.file)
  }
}

// Image management functions
const handleSetPrimary = async (imageId) => {
  try {
    emit('setPrimary', imageId)
  } catch (e) {
    error.value = 'Erro ao definir imagem como capa.'
  }
}

const handleDeleteImage = async (imageId) => {
  try {
    emit('deleteImage', imageId)
  } catch (e) {
    error.value = 'Erro ao remover imagem.'
  }
}

const handleMoveUp = async (index) => {
  if (index === 0) return
  
  const images = [...existingImages.value]
  const temp = images[index]
  images[index] = images[index - 1]
  images[index - 1] = temp
  
  // Update sort_order
  images.forEach((img, i) => {
    img.sort_order = i + 1
  })
  
  existingImages.value = images
  emit('reorder', images.map(img => ({ id: img.id, sort_order: img.sort_order })))
}

const handleMoveDown = async (index) => {
  if (index === existingImages.value.length - 1) return
  
  const images = [...existingImages.value]
  const temp = images[index]
  images[index] = images[index + 1]
  images[index + 1] = temp
  
  // Update sort_order
  images.forEach((img, i) => {
    img.sort_order = i + 1
  })
  
  existingImages.value = images
  emit('reorder', images.map(img => ({ id: img.id, sort_order: img.sort_order })))
}

// Cleanup
watch(() => newImages.value, (newImages) => {
  // Revoke object URLs when component unmounts or images are removed
  return () => {
    newImages.forEach(img => URL.revokeObjectURL(img.preview))
  }
}, { flush: 'post' })
</script>

<style scoped>
.multiple-image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  margin-bottom: 1rem;
}

.upload-area:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.file-input {
  display: none;
}

.upload-content {
  padding: 2rem;
  text-align: center;
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
  margin-bottom: 0.25rem;
}

.upload-limit {
  display: block;
  font-size: 0.75rem;
  color: #9ca3af;
}

.error-message {
  margin-bottom: 1rem;
  color: #ef4444;
  font-size: 0.875rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 0.75rem;
}

.images-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
}

.new-image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
  border: 2px solid #10b981;
}

.new-image-item .image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.new-image-item .image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.new-image-item .image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.new-image-item:hover .image-overlay {
  opacity: 1;
}

.remove-btn {
  background: #ef4444;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  transform: scale(1.1);
  background: #dc2626;
}

.remove-btn svg {
  width: 20px;
  height: 20px;
}

.new-image-item .image-info {
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.order-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.new-badge {
  background: #10b981;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.total-info {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #6b7280;
}

.total-count {
  margin-bottom: 0.75rem;
}

.warning {
  color: #f59e0b;
  font-weight: 500;
}

.upload-status {
  margin-top: 0.5rem;
}

.compressing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  font-size: 0.875rem;
}

.status-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-text::before {
  content: '';
  width: 16px;
  height: 16px;
  border: 2px solid #3b82f6;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.progress-bar {
  position: relative;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 12px;
  transition: width 0.3s ease;
  min-width: 20px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
