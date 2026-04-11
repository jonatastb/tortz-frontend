<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="t in toastStore.toasts"
          :key="t.id"
          class="flex items-start gap-3 p-4 rounded-2xl shadow-lg border pointer-events-auto cursor-pointer"
          :class="classes[t.type]"
          @click="toastStore.remove(t.id)"
        >
          <span class="text-lg shrink-0 mt-0.5">{{ icons[t.type] }}</span>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold">{{ t.title }}</p>
            <p class="text-xs mt-0.5 opacity-75 leading-relaxed">{{ t.message }}</p>
          </div>
          <button class="opacity-40 hover:opacity-100 transition-opacity shrink-0">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toastStore'
const toastStore = useToastStore()

const classes = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50 border-red-200 text-red-800',
  info:    'bg-brand-50 border-brand-200 text-brand-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
}
const icons = {
  success: '✅', error: '❌', info: '🍰', warning: '⚠️',
}
</script>

<style scoped>
.toast-enter-active  { animation: slideInRight 0.3s ease-out; }
.toast-leave-active  { transition: all 0.25s ease; }
.toast-leave-to      { opacity: 0; transform: translateX(20px); }
.toast-move          { transition: transform 0.3s ease; }
</style>
