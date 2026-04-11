<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="$emit('cancel')"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-slide-up">
          <div class="text-center mb-5">
            <div class="w-16 h-16 mx-auto mb-3 bg-red-50 rounded-full flex items-center justify-center">
              <span class="text-3xl">{{ icon }}</span>
            </div>
            <h3 class="text-lg font-display font-bold text-warm-800">{{ title }}</h3>
            <p class="text-sm text-warm-500 mt-1" v-html="message"></p>
          </div>
          <div class="flex gap-3">
            <button @click="$emit('cancel')" class="btn-secondary flex-1">Cancelar</button>
            <button
              @click="$emit('confirm')"
              class="flex-1 inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-white transition-all"
              :class="danger ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-500 hover:bg-brand-600'"
            >{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  show:        Boolean,
  title:       { type: String, default: 'Confirmar ação' },
  message:     { type: String, default: 'Tem certeza?' },
  confirmText: { type: String, default: 'Confirmar' },
  icon:        { type: String, default: '❓' },
  danger:      { type: Boolean, default: false },
})
defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
