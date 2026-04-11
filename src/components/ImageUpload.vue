<template>
  <div class="image-upload">
    <div class="upload-area" :class="{ 'has-image': preview || imageUrl }">
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/gif"
        @change="handleImageChange"
        class="file-input"
      />
      
      <div class="upload-content" @click="$refs.fileInput.click()">
        <div v-if="!preview && !imageUrl" class="upload-placeholder">
          <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span class="upload-text">Clique para adicionar imagem</span>
          <span class="upload-hint">JPEG, PNG, JPG, GIF (max. 2MB)</span>
        </div>
        
        <div v-else class="image-preview">
          <img :src="preview || imageUrl" alt="Preview" />
          <div class="image-overlay">
            <button type="button" @click.stop="removeImage" class="remove-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button type="button" @click.stop="$refs.fileInput.click()" class="change-btn">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [File, String, null],
    default: null
  },
  imageUrl: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const preview = ref('')
const error = ref('')

// Se tiver imageUrl inicial, mostrar como preview
watch(() => props.imageUrl, (newUrl) => {
  if (newUrl && !props.modelValue) {
    preview.value = newUrl
  }
}, { immediate: true })

// Se tiver modelValue (File), criar preview
watch(() => props.modelValue, (file) => {
  if (file instanceof File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      preview.value = e.target.result
    }
    reader.readAsDataURL(file)
    error.value = ''
  } else if (!file && !props.imageUrl) {
    preview.value = ''
  }
}, { immediate: true })

const handleImageChange = (event) => {
  const file = event.target.files[0]
  
  if (!file) {
    emit('update:modelValue', null)
    return
  }
  
  // Validação
  if (!file.type.match(/^image\/(jpeg|png|jpg|gif)$/)) {
    error.value = 'Formato de arquivo inválido. Use JPEG, PNG, JPG ou GIF.'
    emit('update:modelValue', null)
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    error.value = 'Arquivo muito grande. Tamanho máximo: 2MB.'
    emit('update:modelValue', null)
    return
  }
  
  emit('update:modelValue', file)
}

const removeImage = () => {
  emit('update:modelValue', null)
  preview.value = ''
  fileInput.value.value = ''
  error.value = ''
}
</script>

<style scoped>
.image-upload {
  width: 100%;
}

.upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #9ca3af;
  background-color: #f9fafb;
}

.upload-area.has-image {
  border-color: #d1d5db;
  border-style: solid;
}

.file-input {
  display: none;
}

.upload-content {
  cursor: pointer;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-placeholder {
  text-align: center;
  padding: 2rem;
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

.image-preview {
  position: relative;
  width: 100%;
  height: 200px;
}

.image-preview img {
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.remove-btn,
.change-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
}

.change-btn:hover {
  background: #3b82f6;
  color: white;
}

.remove-btn svg,
.change-btn svg {
  width: 20px;
  height: 20px;
}

.error-message {
  margin-top: 0.5rem;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
