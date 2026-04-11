<template>
  <div class="space-y-8 animate-fade-in">
    <div>
      <h1 class="font-display text-2xl font-bold text-warm-800">
        Olá, {{ firstName }}! 👋
      </h1>
      <p class="text-warm-400 mt-1 text-sm">Aqui está o resumo do seu negócio.</p>
    </div>

    <!-- API Error -->
    <div v-if="admin.error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
      <span>⚠️</span> {{ admin.error }}
      <button @click="load" class="ml-auto underline font-semibold">Tentar novamente</button>
    </div>

    <!-- Stat cards -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="i in 4" :key="i" class="card p-5 shimmer-bg h-28"></div>
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="s in statCards" :key="s.label"
        class="card p-5 hover:shadow-card-hover transition-shadow cursor-default"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            :class="s.bg">{{ s.icon }}</div>
          <span class="badge text-xs" :class="s.badgeClass">{{ s.badge }}</span>
        </div>
        <p class="font-display text-3xl font-bold text-warm-800">{{ s.value }}</p>
        <p class="text-sm text-warm-400 mt-1">{{ s.label }}</p>
      </div>
    </div>

    <!-- Revenue -->
    <div v-if="!loading && stats" class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="card p-5 bg-gradient-to-br from-brand-400 to-brand-600 text-white">
        <p class="text-brand-100 text-xs uppercase tracking-wide font-semibold mb-1">Receita Hoje</p>
        <p class="font-display text-3xl font-bold">R$ {{ fmt(stats.revenue?.today) }}</p>
      </div>
      <div class="card p-5 bg-gradient-to-br from-terra-400 to-terra-600 text-white">
        <p class="text-terra-100 text-xs uppercase tracking-wide font-semibold mb-1">Este Mês</p>
        <p class="font-display text-3xl font-bold">R$ {{ fmt(stats.revenue?.month) }}</p>
      </div>
      <div class="card p-5 bg-gradient-to-br from-warm-600 to-warm-800 text-white">
        <p class="text-warm-300 text-xs uppercase tracking-wide font-semibold mb-1">Total Acumulado</p>
        <p class="font-display text-3xl font-bold">R$ {{ fmt(stats.revenue?.total) }}</p>
      </div>
    </div>

    <!-- Recent orders -->
    <div class="card overflow-hidden">
      <div class="p-5 border-b border-warm-100 flex items-center justify-between">
        <h2 class="font-display text-lg font-semibold text-warm-800">Pedidos Recentes</h2>
        <RouterLink to="/admin/pedidos"
          class="text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors">
          Ver todos →
        </RouterLink>
      </div>
      <div v-if="loading" class="p-5 space-y-3">
        <div v-for="i in 4" :key="i" class="shimmer-bg h-14 rounded-xl"></div>
      </div>
      <div v-else-if="stats?.recentOrders?.length" class="divide-y divide-warm-50">
        <div
          v-for="order in stats.recentOrders" :key="order.id"
          class="px-5 py-4 flex items-center gap-4 hover:bg-cream-50 transition-colors"
        >
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-warm-800 text-sm">{{ order.customer?.name }}</p>
            <p class="text-xs text-warm-400 mt-0.5 font-mono">{{ order.id }}</p>
          </div>
          <span class="badge text-xs" :class="statusClasses[order.status]">
            {{ statusLabels[order.status] }}
          </span>
          <span class="font-display font-bold text-terra-600 text-sm whitespace-nowrap">
            R$ {{ fmt(order.total) }}
          </span>
        </div>
      </div>
      <EmptyState v-else icon="📦" title="Nenhum pedido ainda" message="Os pedidos aparecerão aqui." />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore }  from '@/stores/authStore'
import { useAdminStore } from '@/stores/adminStore'
import EmptyState from '@/components/ui/EmptyState.vue'

const auth    = useAuthStore()
const admin   = useAdminStore()
const loading = ref(true)
const stats   = computed(() => admin.stats)
const firstName = computed(() => auth.user?.name?.split(' ')[0] || 'Admin')

const fmt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

const statusClasses = {
  pendente: 'bg-amber-100 text-amber-700',
  pago:     'bg-blue-100  text-blue-700',
  enviado:  'bg-purple-100 text-purple-700',
  entregue: 'bg-emerald-100 text-emerald-700',
}
const statusLabels = { pendente: 'Pendente', pago: 'Pago', enviado: 'Enviado', entregue: 'Entregue' }

const statCards = computed(() => stats.value ? [
  { icon: '📦', label: 'Total de Pedidos',   value: stats.value.totalOrders,     badge: 'Total',    badgeClass: 'bg-warm-100 text-warm-700',     bg: 'bg-brand-50' },
  { icon: '⏳', label: 'Pedidos Pendentes',  value: stats.value.pendingOrders,   badge: 'Atenção',  badgeClass: 'bg-amber-100 text-amber-700',    bg: 'bg-amber-50' },
  { icon: '🎂', label: 'Produtos Ativos',    value: stats.value.totalProducts,   badge: 'Ativos',   badgeClass: 'bg-brand-100 text-brand-700',    bg: 'bg-brand-50' },
  { icon: '🏷️', label: 'Categorias',         value: stats.value.totalCategories, badge: 'Total',    badgeClass: 'bg-terra-100 text-terra-700',    bg: 'bg-terra-50' },
] : [])

async function load() {
  loading.value = true
  try { await admin.fetchStats() }
  finally { loading.value = false }
}

onMounted(load)
</script>
