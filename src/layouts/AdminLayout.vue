<template>
  <div class="min-h-screen bg-cream-50 flex">
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-warm-100 transition-all duration-300"
      :class="sidebarOpen ? 'w-64' : 'w-16'"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 border-b border-warm-100 overflow-hidden shrink-0">
        <RouterLink to="/admin" class="flex items-center gap-3 min-w-max">
          <div class="w-8 h-8 bg-gradient-to-br from-brand-400 to-terra-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <span class="text-sm">🎂</span>
          </div>
          <Transition name="label">
            <div v-if="sidebarOpen" class="leading-none">
              <span class="font-display text-base font-bold text-terra-700 block">Doce Tortz</span>
              <span class="text-xs text-warm-400">Admin</span>
            </div>
          </Transition>
        </RouterLink>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 overflow-hidden">
        <div class="space-y-0.5 px-2">
          <RouterLink
            v-for="item in navItems" :key="item.name"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-warm-600
                   hover:bg-brand-50 hover:text-brand-700 transition-all duration-200"
            :class="{ 'bg-brand-50 text-brand-700 font-semibold': isActive(item.to) }"
            :title="!sidebarOpen ? item.label : ''"
          >
            <span class="text-lg shrink-0">{{ item.icon }}</span>
            <Transition name="label">
              <span v-if="sidebarOpen" class="text-sm whitespace-nowrap">{{ item.label }}</span>
            </Transition>
          </RouterLink>
        </div>
      </nav>

      <!-- Logout -->
      <div class="p-3 border-t border-warm-100 overflow-hidden">
        <button
          @click="logout"
          class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-warm-500
                 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          :title="!sidebarOpen ? 'Sair' : ''"
        >
          <span class="text-lg shrink-0">🚪</span>
          <Transition name="label">
            <span v-if="sidebarOpen" class="text-sm font-medium whitespace-nowrap">Sair</span>
          </Transition>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <div
      class="flex-1 flex flex-col transition-all duration-300"
      :class="sidebarOpen ? 'ml-64' : 'ml-16'"
    >
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-warm-100 flex items-center px-6 gap-4 sticky top-0 z-30">
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="p-2 rounded-lg hover:bg-warm-100 text-warm-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <h1 class="font-display text-lg font-semibold text-warm-800 flex-1">{{ pageTitle }}</h1>

        <div class="flex items-center gap-3">
          <RouterLink to="/" target="_blank" class="btn-ghost text-sm hidden sm:flex">
            🏪 Ver loja
          </RouterLink>
          <!-- API status indicator -->
          <div class="flex items-center gap-2 text-xs text-warm-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="hidden sm:block">API conectada</span>
          </div>
          <div class="flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-full">
            <div class="w-7 h-7 bg-brand-200 rounded-full flex items-center justify-center">
              <span class="text-xs font-bold text-brand-700">{{ initial }}</span>
            </div>
            <span class="text-sm font-semibold text-terra-700 hidden sm:block">{{ auth.user?.name?.split(' ')[0] || 'Admin' }}</span>
          </div>
        </div>
      </header>

      <!-- Content -->
      <main class="flex-1 p-6 overflow-auto">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const auth        = useAuthStore()
const router      = useRouter()
const route       = useRoute()
const sidebarOpen = ref(true)

const navItems = [
  { name: 'dashboard',   label: 'Dashboard',   icon: '📊', to: '/admin' },
  { name: 'products',    label: 'Produtos',     icon: '🎂', to: '/admin/produtos' },
  { name: 'categories',  label: 'Categorias',   icon: '🏷️', to: '/admin/categorias' },
  { name: 'orders',      label: 'Pedidos',      icon: '📦', to: '/admin/pedidos' },
]

const isActive    = (path) => path === '/admin' ? route.path === '/admin' : route.path.startsWith(path)
const initial     = computed(() => auth.user?.name?.charAt(0).toUpperCase() || 'A')
const pageTitle   = computed(() => {
  const map = { '/admin': 'Dashboard', '/admin/produtos': 'Produtos', '/admin/categorias': 'Categorias', '/admin/pedidos': 'Pedidos' }
  return map[route.path] || route.path.startsWith('/admin/pedidos') ? 'Detalhe do Pedido' : 'Admin'
})

async function logout() {
  await auth.logout()
  router.push('/admin/login')
}
</script>

<style scoped>
.label-enter-active, .label-leave-active { transition: opacity 0.15s, transform 0.15s; }
.label-enter-from, .label-leave-to { opacity: 0; transform: translateX(-8px); }
.page-enter-active, .page-leave-active { transition: opacity 0.2s ease; }
.page-enter-from, .page-leave-to { opacity: 0; }
</style>
