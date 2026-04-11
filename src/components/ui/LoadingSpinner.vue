<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12">
    <div class="w-10 h-10 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
    <p v-if="message" class="text-sm text-warm-400 font-medium">{{ message }}</p>
  </div>
</template>
<script setup>
defineProps({ message: { type: String, default: 'Carregando...' } })
</script>
