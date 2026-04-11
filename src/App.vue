<template>
  <RouterView />
  <ToastContainer />
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const auth = useAuthStore()
onMounted(() => auth.fetchUser())
</script>
