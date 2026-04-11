<template>
  <div class="space-y-6 animate-fade-in">
    <RouterLink to="/admin/pedidos"
      class="inline-flex items-center gap-2 text-sm text-warm-400 hover:text-brand-600 font-semibold transition-colors">
      ← Voltar aos pedidos
    </RouterLink>

    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-4">
        <div class="shimmer-bg h-28 rounded-2xl"></div>
        <div class="shimmer-bg h-48 rounded-2xl"></div>
      </div>
      <div class="space-y-4">
        <div class="shimmer-bg h-40 rounded-2xl"></div>
        <div class="shimmer-bg h-28 rounded-2xl"></div>
      </div>
    </div>

    <!-- Error -->
    <EmptyState v-else-if="apiError" icon="❌" :title="apiError" message="Pedido não encontrado.">
      <RouterLink to="/admin/pedidos" class="btn-primary mt-3">← Voltar</RouterLink>
    </EmptyState>

    <!-- Content -->
    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Header card -->
        <div class="card p-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <p class="text-xs text-warm-400 uppercase tracking-wide font-semibold mb-1">Pedido</p>
            <h1 class="font-display text-2xl font-bold text-warm-800 font-mono">{{ order.id }}</h1>
            <p class="text-sm text-warm-400 mt-1">{{ formatDate(order.created_at) }}</p>
          </div>
          <div>
            <p class="text-xs text-warm-400 mb-1 font-semibold uppercase tracking-wide">Atualizar Status</p>
            <select
              :value="order.status"
              @change="updateStatus($event.target.value)"
              :disabled="updatingStatus"
              class="px-4 py-2 rounded-full border-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-300 cursor-pointer disabled:opacity-60"
              :class="statusClasses[order.status]"
            >
              <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.icon }} {{ s.label }}</option>
            </select>
          </div>
        </div>

        <!-- Items -->
        <div class="card overflow-hidden">
          <div class="p-5 border-b border-warm-100">
            <h2 class="font-display text-lg font-semibold text-warm-800">Itens do Pedido</h2>
          </div>
          <div class="divide-y divide-warm-50">
            <div v-for="item in order.items" :key="item.product_id ?? item.id"
              class="px-5 py-4 flex items-center gap-4">
              <div class="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-xl shrink-0">🎂</div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-warm-800 text-sm">{{ item.name }}</p>
                <p class="text-xs text-warm-400 mt-0.5">
                  {{ item.quantity }} × R$ {{ Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
                </p>
              </div>
              <span class="font-display font-bold text-warm-800 text-sm whitespace-nowrap">
                R$ {{ Number(item.quantity * item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
          <div class="px-5 py-4 bg-cream-50 border-t border-warm-100 flex items-center justify-between">
            <span class="font-semibold text-warm-700">Total do Pedido</span>
            <span class="font-display text-xl font-bold text-terra-600">
              R$ {{ Number(order.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-5">
        <!-- Customer -->
        <div class="card p-5">
          <h3 class="font-display font-bold text-warm-800 mb-4 flex items-center gap-2">
            <span class="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-sm">👤</span>
            Cliente
          </h3>
          <div class="space-y-3 text-sm">
            <div>
              <p class="text-warm-400 text-xs uppercase tracking-wide font-semibold mb-0.5">Nome</p>
              <p class="text-warm-800 font-semibold">{{ order.customer?.name }}</p>
            </div>
            <div v-if="order.customer?.email">
              <p class="text-warm-400 text-xs uppercase tracking-wide font-semibold mb-0.5">E-mail</p>
              <p class="text-warm-700">{{ order.customer.email }}</p>
            </div>
            <div v-if="order.customer?.address">
              <p class="text-warm-400 text-xs uppercase tracking-wide font-semibold mb-0.5">Endereço</p>
              <p class="text-warm-700 leading-relaxed">{{ order.customer.address }}</p>
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="card p-5">
          <h3 class="font-display font-bold text-warm-800 mb-4 flex items-center gap-2">
            <span class="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-sm">💳</span>
            Pagamento
          </h3>
          <div class="flex items-center gap-3 bg-cream-50 rounded-xl p-3 border border-warm-100">
            <span class="text-2xl">{{ paymentIcon[order.payment] || '💳' }}</span>
            <span class="text-sm font-semibold text-warm-700">
              {{ paymentLabel[order.payment] || order.payment }}
            </span>
          </div>
        </div>

        <!-- Timeline -->
        <div class="card p-5">
          <h3 class="font-display font-bold text-warm-800 mb-4">📋 Progresso</h3>
          <div class="space-y-3">
            <div v-for="(step, i) in timeline" :key="i" class="flex items-start gap-3">
              <div class="flex flex-col items-center shrink-0">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  :class="step.done ? 'bg-brand-500 text-white' : 'bg-warm-100 text-warm-400'">
                  {{ step.done ? '✓' : '' }}
                </div>
                <div v-if="i < timeline.length - 1" class="w-0.5 h-6 mt-1 rounded-full"
                  :class="step.done ? 'bg-brand-200' : 'bg-warm-100'"></div>
              </div>
              <div class="pt-0.5">
                <p class="text-sm font-semibold" :class="step.done ? 'text-warm-800' : 'text-warm-400'">
                  {{ step.icon }} {{ step.label }}
                </p>
                <p class="text-xs mt-0.5" :class="step.done ? 'text-brand-500' : 'text-warm-300'">
                  {{ step.done ? 'Concluído' : 'Pendente' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { orderService } from '@/services/orderService'
import { useToastStore } from '@/stores/toastStore'
import EmptyState from '@/components/ui/EmptyState.vue'

const route          = useRoute()
const toast          = useToastStore()
const order          = ref(null)
const loading        = ref(true)
const apiError       = ref(null)
const updatingStatus = ref(false)

const statuses = [
  { value: 'pendente', label: 'Pendente', icon: '⏳' },
  { value: 'pago',     label: 'Pago',     icon: '✅' },
  { value: 'enviado',  label: 'Enviado',  icon: '🚚' },
  { value: 'entregue', label: 'Entregue', icon: '📦' },
]
const statusClasses = {
  pendente: 'bg-amber-100 text-amber-700 border-amber-200',
  pago:     'bg-blue-100  text-blue-700  border-blue-200',
  enviado:  'bg-purple-100 text-purple-700 border-purple-200',
  entregue: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}
const paymentIcon  = { pix: '💠', credit_card: '💳', cash: '💵' }
const paymentLabel = { pix: 'Pix', credit_card: 'Cartão de Crédito', cash: 'Dinheiro na entrega' }

const statusOrder = ['pendente', 'pago', 'enviado', 'entregue']
const timeline = computed(() => {
  if (!order.value) return []
  const currentIdx = statusOrder.indexOf(order.value.status)
  return statuses.map((s, i) => ({ ...s, done: i <= currentIdx }))
})

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—'

async function updateStatus(status) {
  updatingStatus.value = true
  try {
    await orderService.updateStatus(order.value.id, status)
    order.value.status = status
    toast.success('Status do pedido atualizado!')
  } catch (e) {
    toast.error(e.userMessage || 'Erro ao atualizar status.')
  } finally {
    updatingStatus.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await orderService.getById(route.params.id)
    order.value = data.data ?? data
  } catch (e) {
    apiError.value = e.userMessage || 'Pedido não encontrado.'
  } finally {
    loading.value = false
  }
})
</script>
