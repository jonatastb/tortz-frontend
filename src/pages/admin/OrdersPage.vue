<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="font-display text-2xl font-bold text-warm-800">Pedidos</h1>
        <p class="text-warm-400 text-sm mt-1">{{ admin.orders.length }} pedidos no total</p>
      </div>
      <select v-model="statusFilter" class="input-field text-sm py-2 w-auto min-w-[160px]">
        <option value="">Todos os status</option>
        <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.icon }} {{ s.label }}</option>
      </select>
    </div>

    <!-- API error -->
    <div v-if="admin.error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
      ⚠️ {{ admin.error }}
      <button @click="admin.fetchOrders()" class="ml-auto underline font-semibold">Tentar novamente</button>
    </div>

    <!-- Status summary cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div
        v-for="s in statuses" :key="s.value"
        class="card p-4 text-center cursor-pointer hover:shadow-card-hover transition-all select-none"
        :class="statusFilter === s.value ? 'ring-2 ring-brand-400 shadow-brand' : ''"
        @click="statusFilter = statusFilter === s.value ? '' : s.value"
      >
        <p class="text-xl mb-1">{{ s.icon }}</p>
        <p class="font-display font-bold text-warm-800 text-xl">{{ countBy(s.value) }}</p>
        <p class="text-xs text-warm-400 mt-0.5">{{ s.label }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="admin.loading" class="p-6 space-y-3">
        <div v-for="i in 6" :key="i" class="shimmer-bg h-14 rounded-xl"></div>
      </div>
      <EmptyState v-else-if="!filteredOrders.length" icon="📦" title="Nenhum pedido encontrado" message="Tente outro filtro." />
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-cream-50 border-b border-warm-100 text-xs font-semibold text-warm-400 uppercase tracking-wider">
              <th class="px-4 py-3 text-left">Pedido</th>
              <th class="px-4 py-3 text-left hidden md:table-cell">Cliente</th>
              <th class="px-4 py-3 text-left hidden sm:table-cell">Data</th>
              <th class="px-4 py-3 text-left">Total</th>
              <th class="px-4 py-3 text-left">Status</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-warm-50">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-cream-50 transition-colors">
              <td class="px-4 py-4">
                <span class="font-mono text-sm font-bold text-warm-800">{{ order.id }}</span>
              </td>
              <td class="px-4 py-4 hidden md:table-cell text-sm text-warm-700">
                {{ order.customer?.name || '—' }}
              </td>
              <td class="px-4 py-4 hidden sm:table-cell text-sm text-warm-400">
                {{ formatDate(order.created_at) }}
              </td>
              <td class="px-4 py-4 font-display font-bold text-terra-600 text-sm">
                R$ {{ Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="px-4 py-4">
                <select
                  :value="order.status"
                  @change="updateStatus(order.id, $event.target.value)"
                  class="text-xs px-3 py-1.5 rounded-full border-0 font-semibold cursor-pointer focus:ring-2 focus:ring-brand-300 outline-none"
                  :class="statusClasses[order.status]"
                >
                  <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </td>
              <td class="px-4 py-4 text-right">
                <RouterLink
                  :to="`/admin/pedidos/${order.id}`"
                  class="px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                >
                  Detalhes
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/adminStore'
import { useToastStore } from '@/stores/toastStore'
import EmptyState from '@/components/ui/EmptyState.vue'

const admin        = useAdminStore()
const toast        = useToastStore()
const statusFilter = ref('')

const statuses = [
  { value: 'pendente', label: 'Pendente', icon: '⏳' },
  { value: 'pago',     label: 'Pago',     icon: '✅' },
  { value: 'enviado',  label: 'Enviado',  icon: '🚚' },
  { value: 'entregue', label: 'Entregue', icon: '📦' },
]
const statusClasses = {
  pendente: 'bg-amber-100 text-amber-700',
  pago:     'bg-blue-100  text-blue-700',
  enviado:  'bg-purple-100 text-purple-700',
  entregue: 'bg-emerald-100 text-emerald-700',
}

const filteredOrders = computed(() =>
  statusFilter.value
    ? admin.orders.filter(o => o.status === statusFilter.value)
    : admin.orders
)
const countBy = (status) => admin.orders.filter(o => o.status === status).length
const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'

async function updateStatus(id, status) {
  try {
    await admin.updateOrderStatus(id, status)
    toast.success('Status atualizado!')
  } catch (e) {
    toast.error(e.userMessage || 'Erro ao atualizar status.')
  }
}

onMounted(() => admin.fetchOrders())
</script>
