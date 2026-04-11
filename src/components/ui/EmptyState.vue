<template>
  <div class="flex flex-col items-center justify-center py-16 gap-4 text-center">
    <div class="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center">
      <span class="text-4xl">{{ icon }}</span>
    </div>
    <div>
      <h3 class="text-lg font-display font-semibold text-warm-700">{{ title }}</h3>
      <p class="text-sm text-warm-400 mt-1 max-w-xs">{{ message }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  icon:    { type: String, default: '🎂' },
  title:   { type: String, default: 'Nada encontrado' },
  message: { type: String, default: '' },
})
</script>
