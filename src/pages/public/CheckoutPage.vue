<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
    <h1 class="font-display text-3xl font-bold text-warm-800 mb-8">Finalizar Pedido</h1>

    <div v-if="cart.isEmpty" class="text-center py-16">
      <p class="text-warm-400 mb-4">Seu carrinho está vazio.</p>
      <RouterLink to="/" class="btn-primary">Ver cardápio</RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Form -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Personal -->
        <div class="card p-6">
          <h2 class="font-display text-lg font-bold text-warm-800 mb-5 flex items-center gap-2">
            <span class="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-sm">👤</span>
            Dados Pessoais
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="label">Nome completo *</label>
              <input v-model="form.name" type="text" class="input-field"
                :class="{ 'input-error': errors.name }" placeholder="Seu nome completo" />
              <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
            </div>
            <div>
              <label class="label">E-mail *</label>
              <input v-model="form.email" type="email" class="input-field"
                :class="{ 'input-error': errors.email }" placeholder="seu@email.com" />
              <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
            </div>
            <div>
              <label class="label">Telefone</label>
              <input v-model="form.phone" type="tel" class="input-field" placeholder="(41) 99999-0000" />
            </div>
          </div>
        </div>

        <!-- Address -->
        <div class="card p-6">
          <h2 class="font-display text-lg font-bold text-warm-800 mb-5 flex items-center gap-2">
            <span class="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-sm">📍</span>
            Endereço de Entrega
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <label class="label">Endereço *</label>
              <input v-model="form.address" type="text" class="input-field"
                :class="{ 'input-error': errors.address }" placeholder="Rua, número, complemento" />
              <p v-if="errors.address" class="text-red-500 text-xs mt-1">{{ errors.address }}</p>
            </div>
            <div>
              <label class="label">Cidade *</label>
              <input v-model="form.city" type="text" class="input-field" placeholder="Curitiba" />
            </div>
            <div>
              <label class="label">CEP</label>
              <input v-model="form.zipcode" type="text" class="input-field" placeholder="80000-000" />
            </div>
          </div>
        </div>

        <!-- Payment -->
        <div class="card p-6">
          <h2 class="font-display text-lg font-bold text-warm-800 mb-5 flex items-center gap-2">
            <span class="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-sm">💳</span>
            Forma de Pagamento
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              v-for="m in paymentMethods" :key="m.value"
              class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all select-none"
              :class="form.payment === m.value
                ? 'border-brand-500 bg-brand-50 shadow-brand'
                : 'border-warm-200 hover:border-brand-300'"
            >
              <input v-model="form.payment" type="radio" :value="m.value" class="sr-only" />
              <span class="text-2xl">{{ m.icon }}</span>
              <span class="text-sm font-semibold text-warm-700">{{ m.label }}</span>
              <span class="text-xs text-warm-400 text-center">{{ m.desc }}</span>
            </label>
          </div>
        </div>

        <!-- API error -->
        <div v-if="apiError" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          ⚠️ {{ apiError }}
        </div>
      </div>

      <!-- Order summary -->
      <div>
        <div class="card p-6 sticky top-24">
          <h2 class="font-display text-lg font-bold text-warm-800 mb-4">Seu Pedido</h2>
          <div class="space-y-2.5 mb-5">
            <div v-for="item in cart.items" :key="item.id" class="flex justify-between text-sm">
              <span class="text-warm-600 line-clamp-1 flex-1 mr-2">{{ item.name }} ×{{ item.quantity }}</span>
              <span class="font-semibold text-warm-800 shrink-0">
                R$ {{ Number(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </span>
            </div>
          </div>
          <div class="border-t border-warm-100 pt-4 flex justify-between font-display font-bold text-warm-800 mb-5">
            <span>Total</span>
            <span class="text-terra-600 text-xl">
              R$ {{ Number(cart.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
            </span>
          </div>
          <button
            @click="submitOrder"
            :disabled="submitting"
            class="btn-primary w-full justify-center text-base py-3.5 disabled:opacity-60 disabled:shadow-none"
          >
            <span v-if="submitting" class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Processando...
            </span>
            <span v-else>Confirmar Pedido ✓</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useCartStore }  from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { orderService }  from '@/services/orderService'

const cart      = useCartStore()
const toast     = useToastStore()
const router    = useRouter()
const submitting = ref(false)
const apiError   = ref(null)

const form = reactive({ name: '', email: '', phone: '', address: '', city: '', zipcode: '', payment: 'pix' })
const errors = reactive({})

const paymentMethods = [
  { value: 'pix',         icon: '💠', label: 'Pix',     desc: 'Aprovação imediata' },
  { value: 'credit_card', icon: '💳', label: 'Cartão',  desc: 'Crédito ou débito'  },
  { value: 'cash',        icon: '💵', label: 'Dinheiro', desc: 'Na entrega'         },
]

function validate() {
  Object.keys(errors).forEach(k => delete errors[k])
  if (!form.name.trim())                       errors.name    = 'Nome obrigatório'
  if (!form.email || !form.email.includes('@')) errors.email   = 'E-mail inválido'
  if (!form.address.trim())                    errors.address = 'Endereço obrigatório'
  return Object.keys(errors).length === 0
}

async function submitOrder() {
  if (!validate()) { toast.warning('Preencha todos os campos obrigatórios.'); return }
  submitting.value = true
  apiError.value   = null
  try {
    const payload = {
      customer: {
        name:    form.name,
        email:   form.email,
        phone:   form.phone,
        address: `${form.address}${form.city ? ', ' + form.city : ''}${form.zipcode ? ' - ' + form.zipcode : ''}`,
      },
      items: cart.items.map(i => ({
        product_id: i.id,
        name:       i.name,
        quantity:   i.quantity,
        price:      i.price,
      })),
      total:   cart.totalPrice,
      payment: form.payment,
    }
    await orderService.create(payload)
    cart.clearCart()
    router.push({ name: 'order-success' })
  } catch (e) {
    apiError.value = e.userMessage || 'Erro ao processar pedido. Tente novamente.'
    toast.error(apiError.value)
  } finally {
    submitting.value = false
  }
}
</script>
