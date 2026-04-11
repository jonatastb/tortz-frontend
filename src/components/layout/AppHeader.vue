<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-100 shadow-soft">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
      <!-- Logo -->
      <RouterLink to="/" class="flex items-center gap-2.5 shrink-0">
        <div class="w-9 h-9 bg-gradient-to-br from-brand-400 to-terra-500 rounded-xl flex items-center justify-center shadow-sm">
          <span class="text-lg">🎂</span>
        </div>
        <div class="hidden sm:block leading-none">
          <span class="font-display text-xl font-bold text-terra-700 block">Doce Tortz</span>
        </div>
      </RouterLink>

      <!-- Search -->
      <div class="flex-1 max-w-md mx-auto hidden md:block">
        <div class="relative">
          <input
            v-model="search"
            @keyup.enter="goSearch"
            type="text"
            placeholder="Buscar tortas e doces..."
            class="w-full pl-10 pr-4 py-2 bg-cream-100 border border-cream-300 rounded-full text-sm
                   text-warm-800 placeholder-warm-400
                   focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400
                   transition-all"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1 ml-auto">
        <RouterLink
          to="/carrinho"
          class="relative p-2.5 rounded-xl hover:bg-brand-50 text-warm-600 hover:text-brand-600 transition-all"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <span
            v-if="cart.totalItems > 0"
            class="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 px-1 bg-brand-500 text-white text-xs
                   font-bold rounded-full flex items-center justify-center animate-bounce-soft"
          >{{ cart.totalItems }}</span>
        </RouterLink>

        <button
          @click="mobileOpen = !mobileOpen"
          class="md:hidden p-2.5 rounded-xl hover:bg-brand-50 text-warm-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile search -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="md:hidden border-t border-brand-100 bg-white px-4 py-3">
        <input
          v-model="search"
          @keyup.enter="goSearch"
          type="text"
          placeholder="Buscar tortas e doces..."
          class="input-field text-sm"
        />
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'

const cart       = useCartStore()
const router     = useRouter()
const search     = ref('')
const mobileOpen = ref(false)

function goSearch() {
  if (search.value.trim()) {
    router.push({ name: 'home', query: { search: search.value } })
    mobileOpen.value = false
    search.value = ''
  }
}
</script>

<style scoped>
.mobile-menu-enter-active, .mobile-menu-leave-active { transition: all 0.2s ease; }
.mobile-menu-enter-from, .mobile-menu-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
