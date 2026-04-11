<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
    <h1 class="font-display text-3xl font-bold text-warm-800 mb-8">🛒 Meu Carrinho</h1>

    <EmptyState
      v-if="cart.isEmpty"
      icon="🛒" title="Seu carrinho está vazio"
      message="Adicione tortas e doces para começar!"
    >
      <RouterLink to="/" class="btn-primary mt-2">Ver cardápio</RouterLink>
    </EmptyState>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Items list -->
      <div class="lg:col-span-2 space-y-3">
        <TransitionGroup name="cart-item">
          <div
            v-for="item in cart.items" :key="item.id"
            class="card p-4 flex items-center gap-4"
          >
            <div class="w-20 h-20 rounded-xl overflow-hidden bg-cream-200 shrink-0">
              <img :src="item.image" :alt="item.name" class="w-full h-full object-cover"
                @error="e => e.target.style.display='none'" />
            </div>

            <div class="flex-1 min-w-0">
              <h3 class="font-display font-semibold text-warm-800 line-clamp-1">{{ item.name }}</h3>
              <p class="text-brand-600 font-bold mt-0.5">R$ {{ formatPrice(item.price) }}</p>
            </div>

            <!-- Quantity stepper -->
            <div class="flex items-center gap-1 bg-cream-100 rounded-full px-1.5 py-1 border border-warm-200 shrink-0">
              <button
                @click="cart.updateQuantity(item.id, item.quantity - 1)"
                class="w-7 h-7 rounded-full hover:bg-brand-100 flex items-center justify-center text-warm-700 font-bold transition-colors"
              >−</button>
              <span class="w-6 text-center text-sm font-bold text-warm-800">{{ item.quantity }}</span>
              <button
                @click="cart.updateQuantity(item.id, item.quantity + 1)"
                class="w-7 h-7 rounded-full hover:bg-brand-100 flex items-center justify-center text-warm-700 font-bold transition-colors"
              >+</button>
            </div>

            <!-- Subtotal -->
            <span class="font-display font-bold text-warm-800 w-24 text-right text-sm shrink-0">
              R$ {{ formatPrice(item.price * item.quantity) }}
            </span>

            <!-- Remove -->
            <button
              @click="removeItem(item)"
              class="p-2 rounded-lg hover:bg-red-50 text-warm-300 hover:text-red-500 transition-colors shrink-0"
              title="Remover item"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </TransitionGroup>
      </div>

      <!-- Summary -->
      <div>
        <div class="card p-6 sticky top-24">
          <h2 class="font-display text-xl font-bold text-warm-800 mb-5">Resumo</h2>
          <div class="space-y-3 mb-5 text-sm">
            <div class="flex justify-between text-warm-600">
              <span>Subtotal ({{ cart.totalItems }} {{ cart.totalItems === 1 ? 'item' : 'itens' }})</span>
              <span>R$ {{ formatPrice(cart.totalPrice) }}</span>
            </div>
            <div class="flex justify-between text-warm-600">
              <span>Entrega</span>
              <span class="text-emerald-600 font-semibold">Grátis</span>
            </div>
            <div class="border-t border-warm-100 pt-3 flex justify-between font-display font-bold text-warm-800">
              <span>Total</span>
              <span class="text-terra-600 text-xl">R$ {{ formatPrice(cart.totalPrice) }}</span>
            </div>
          </div>
          <RouterLink to="/checkout" class="btn-primary w-full justify-center text-base py-3.5">
            Finalizar Pedido →
          </RouterLink>
          <RouterLink to="/" class="btn-ghost w-full justify-center mt-2 text-sm text-warm-500">
            Continuar comprando
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import EmptyState from '@/components/ui/EmptyState.vue'

const cart  = useCartStore()
const toast = useToastStore()

const formatPrice = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

function removeItem(item) {
  cart.removeItem(item.id)
  toast.info(`${item.name} removido do carrinho.`)
}
</script>

<style scoped>
.cart-item-enter-active, .cart-item-leave-active { transition: all 0.3s ease; }
.cart-item-enter-from  { opacity: 0; transform: translateX(-20px); }
.cart-item-leave-to    { opacity: 0; transform: translateX(20px);  max-height: 0; }
</style>
