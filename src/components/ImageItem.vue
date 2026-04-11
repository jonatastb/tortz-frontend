<template>
  <div class="image-item" :class="{ 'primary': isPrimary }">
    <div class="image-container">
      <img :src="buildImageUrl(image.image_path)" :alt="`Imagem ${image.sort_order}`" />
      
      <div class="image-overlay">
        <div class="image-controls">
          <button
            v-if="!isPrimary"
            @click="$emit('setPrimary')"
            class="control-btn primary-btn"
            title="Definir como capa"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
          
          <button
            @click="$emit('delete')"
            class="control-btn delete-btn"
            title="Remover imagem"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <div class="order-controls">
          <button
            @click="$emit('moveUp')"
            :disabled="isFirst"
            class="order-btn up-btn"
            title="Mover para cima"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <button
            @click="$emit('moveDown')"
            :disabled="isLast"
            class="order-btn down-btn"
            title="Mover para baixo"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    
    <div class="image-info">
      <span class="order-number">#{{ image.sort_order }}</span>
      <span v-if="isPrimary" class="primary-badge">CAPA</span>
    </div>
  </div>
</template>

<script setup>
import { buildImageUrl } from '@/utils/imageHelpers'

const props = defineProps({
  image: {
    type: Object,
    required: true
  },
  isPrimary: {
    type: Boolean,
    default: false
  },
  isFirst: {
    type: Boolean,
    default: false
  },
  isLast: {
    type: Boolean,
    default: false
  }
})

defineEmits(['setPrimary', 'delete', 'moveUp', 'moveDown'])
</script>

<style scoped>
.image-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  transition: all 0.3s ease;
}

.image-item.primary {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.image-container {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.image-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.control-btn {
  background: white;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.control-btn:hover {
  transform: scale(1.05);
}

.primary-btn:hover {
  background: #3b82f6;
  color: white;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
}

.control-btn svg {
  width: 18px;
  height: 18px;
}

.order-controls {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.order-btn {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-btn:hover:not(:disabled) {
  background: white;
  transform: scale(1.05);
}

.order-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.order-btn svg {
  width: 16px;
  height: 16px;
}

.image-info {
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

.primary-badge {
  background: #3b82f6;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
