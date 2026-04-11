<template>
  <div class="carousel-container">
    <div v-if="!images.length" class="no-images">
      <div class="no-images-content">
        <span class="no-images-icon">cake</span>
        <span class="no-images-text">Sem imagens disponíveis</span>
      </div>
    </div>

    <div v-else class="carousel-wrapper">
      <!-- Main Image -->
      <div class="main-image">
        <img
          :src="buildImageUrl(images[currentIndex].image_path)"
          :alt="`${product.name} - Imagem ${currentIndex + 1}`"
          @error="handleImageError"
        />
        
        <!-- Navigation Buttons -->
        <button
          v-if="images.length > 1"
          @click="prevSlide"
          class="nav-btn prev"
          :disabled="isLoading"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          v-if="images.length > 1"
          @click="nextSlide"
          class="nav-btn next"
          :disabled="isLoading"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="loading-indicator">
          <div class="spinner"></div>
        </div>
      </div>

      <!-- Thumbnails -->
      <div v-if="images.length > 1" class="thumbnails">
        <button
          v-for="(image, index) in images"
          :key="image.id"
          class="thumbnail"
          :class="{ 'active': index === currentIndex }"
          @click="goToSlide(index)"
        >
          <img
            :src="buildImageUrl(image.image_path)"
            :alt="`Thumbnail ${index + 1}`"
            @error="handleThumbnailError"
          />
        </button>
      </div>

      <!-- Image Counter -->
      <div v-if="images.length > 1" class="image-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
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
.carousel-container {
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

.carousel-wrapper {
  position: relative;
}

.main-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 8px;
  background: #f3f4f6;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-50%) scale(1.05);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-btn.prev {
  left: 10px;
}

.nav-btn.next {
  right: 10px;
}

.nav-btn svg {
  width: 20px;
  height: 20px;
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

.thumbnails {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}

.thumbnails::-webkit-scrollbar {
  height: 6px;
}

.thumbnails::-webkit-scrollbar-track {
  background: transparent;
}

.thumbnails::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}

.thumbnail {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.thumbnail:hover {
  border-color: #007bff;
  transform: scale(1.05);
}

.thumbnail.active {
  border-color: #007bff;
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

.capa-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #28a745;
  color: white;
  font-size: 8px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 2px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
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
  .thumbnails {
    gap: 6px;
  }
  
  .thumbnail {
    width: 50px;
    height: 50px;
  }
  
  .nav-btn {
    width: 36px;
    height: 36px;
  }
  
  .nav-btn svg {
    width: 18px;
    height: 18px;
  }
  
  .nav-btn.prev {
    left: 8px;
  }
  
  .nav-btn.next {
    right: 8px;
  }
}
</style>
