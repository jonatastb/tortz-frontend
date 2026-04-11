<template>
  <div class="min-h-[70vh] flex items-center justify-center px-4">
    <div class="text-center animate-slide-up max-w-md">
      <div class="w-24 h-24 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-brand">
        <span class="text-5xl animate-bounce-soft">🎉</span>
      </div>
      <h1 class="font-display text-4xl font-bold text-warm-800 mb-3">Pedido Confirmado!</h1>
      <p class="text-warm-500 text-lg mb-2">Obrigado pela sua compra!</p>
      <p class="text-warm-400 text-sm mb-10 leading-relaxed">
        Em breve entraremos em contato para confirmar a entrega. Preparamos tudo com muito carinho! 🎂
      </p>
      <div class="bg-gradient-to-r from-brand-50 to-terra-50 border border-brand-100 rounded-2xl p-5 mb-8">
        <p class="text-terra-600 font-semibold text-sm">Acompanhe seu pedido</p>
        <p class="text-warm-500 text-xs mt-1">Você receberá atualizações por e-mail.</p>
      </div>
      <RouterLink to="/" class="btn-primary text-base px-8 py-3.5">Continuar comprando</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
