<template>
  <div class="product-image-carousel">
    <div v-if="!images.length" class="no-images">
      <div class="no-images-content">
        <span class="no-images-icon">cake</span>
        <span class="no-images-text">Sem imagens disponíveis</span>
      </div>
    </div>

    <div v-else class="carousel-container">
      <!-- Main image display -->
      <div class="carousel-main">
        <img
          :src="buildImageUrl(currentImage.image_path)"
          :alt="`${product.name} - Imagem ${currentIndex + 1}`"
          class="main-image"
          @error="handleImageError"
        />
        
        <!-- Navigation buttons -->
        <button
          v-if="images.length > 1"
          @click="prevSlide"
          class="carousel-nav prev-btn"
          :disabled="isLoading"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          v-if="images.length > 1"
          @click="nextSlide"
          class="carousel-nav next-btn"
          :disabled="isLoading"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
        </div>
      </div>

      <!-- Thumbnails -->
      <div v-if="images.length > 1" class="carousel-thumbnails">
        <button
          v-for="(image, index) in images"
          :key="image.id"
          class="thumbnail"
          :class="{ 'active': index === currentIndex, 'primary': image.sort_order === 1 }"
          @click="goToSlide(index)"
        >
          <img
            :src="buildImageUrl(image.image_path)"
            :alt="`Thumbnail ${index + 1}`"
            @error="handleThumbnailError"
          />
          <span v-if="image.sort_order === 1" class="primary-indicator">CAPA</span>
        </button>
      </div>

      <!-- Image counter -->
      <div v-if="images.length > 1" class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { buildImageUrl } from '@/utils/imageHelpers'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  images: {
    type: Array,
    default: () => []
  }
})

const currentIndex = ref(0)
const isLoading = ref(false)
const imageErrors = ref(new Set())

const currentImage = computed(() => {
  return props.images[currentIndex.value] || {}
})

// Auto-reset to first image when images change
watch(() => props.images, (newImages) => {
  if (newImages.length > 0) {
    currentIndex.value = 0
    imageErrors.value.clear()
  }
}, { immediate: true })

const nextSlide = () => {
  if (isLoading.value || props.images.length <= 1) return
  
  isLoading.value = true
  setTimeout(() => {
    currentIndex.value = (currentIndex.value + 1) % props.images.length
    isLoading.value = false
  }, 150)
}

const prevSlide = () => {
  if (isLoading.value || props.images.length <= 1) return
  
  isLoading.value = true
  setTimeout(() => {
    currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length
    isLoading.value = false
  }, 150)
}

const goToSlide = (index) => {
  if (isLoading.value || index === currentIndex.value) return
  
  isLoading.value = true
  setTimeout(() => {
    currentIndex.value = index
    isLoading.value = false
  }, 150)
}

const handleImageError = (event) => {
  imageErrors.value.add(currentIndex.value)
  event.target.style.display = 'none'
}

const handleThumbnailError = (event) => {
  event.target.style.display = 'none'
  event.target.parentElement.style.background = '#f3f4f6'
}

// Keyboard navigation
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') prevSlide()
  if (e.key === 'ArrowRight') nextSlide()
}

// Add keyboard event listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.product-image-carousel {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.no-images {
  aspect-ratio: 1;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.no-images-content {
  text-align: center;
  color: #9ca3af;
}

.no-images-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 0.5rem;
}

.no-images-text {
  font-size: 0.875rem;
  font-weight: 500;
}

.carousel-container {
  position: relative;
}

.carousel-main {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 16px;
  background: #f3f4f6;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-nav:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.8);
  transform: translateY(-50%) scale(1.05);
}

.carousel-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-btn {
  left: 16px;
}

.next-btn {
  right: 16px;
}

.carousel-nav svg {
  width: 24px;
  height: 24px;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 5;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.carousel-thumbnails {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.carousel-thumbnails::-webkit-scrollbar {
  height: 6px;
}

.carousel-thumbnails::-webkit-scrollbar-track {
  background: transparent;
}

.carousel-thumbnails::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 3px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.thumbnail:hover {
  transform: scale(1.05);
}

.thumbnail.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.thumbnail.primary {
  border-color: #10b981;
}

.thumbnail.active.primary {
  border-color: #3b82f6;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.thumbnail:hover img {
  transform: scale(1.1);
}

.primary-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #10b981;
  color: white;
  font-size: 8px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

.thumbnail.active .primary-indicator {
  background: #3b82f6;
}

.image-counter {
  position: absolute;
  bottom: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 16px;
  z-index: 10;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .carousel-thumbnails {
    gap: 8px;
  }
  
  .thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .carousel-nav {
    width: 40px;
    height: 40px;
  }
  
  .carousel-nav svg {
    width: 20px;
    height: 20px;
  }
  
  .prev-btn {
    left: 8px;
  }
  
  .next-btn {
    right: 8px;
  }
}
</style>
