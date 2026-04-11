<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
    <!-- Loading -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div class="shimmer-bg rounded-3xl aspect-square"></div>
      <div class="space-y-4 py-4">
        <div class="shimmer-bg h-10 rounded-full w-3/4"></div>
        <div class="shimmer-bg h-5  rounded-full w-1/2"></div>
        <div class="shimmer-bg h-28 rounded-xl"></div>
        <div class="shimmer-bg h-14 rounded-full"></div>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="apiError" class="text-center py-16">
      <EmptyState icon="❌" :title="apiError" message="Tente voltar e carregar o produto novamente.">
        <RouterLink to="/" class="btn-primary mt-3">← Voltar ao início</RouterLink>
      </EmptyState>
    </div>

    <!-- Product -->
    <div v-else-if="product" class="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
      <!-- Image Carousel -->
      <ProductCarousel 
        :product="product"
        :images="product.images || []"
      />

      <!-- Info -->
      <div class="py-2">
        <span class="badge bg-brand-100 text-brand-700 mb-3">
          {{ product.category?.name || product.category }}
        </span>

        <h1 class="font-display text-3xl sm:text-4xl font-bold text-warm-900 leading-tight mb-3">
          {{ product.name }}
        </h1>

        <!-- Rating -->
        <div v-if="product.rating" class="flex items-center gap-2 mb-5">
          <div class="flex gap-0.5">
            <span v-for="i in 5" :key="i" class="text-base"
              :class="i <= Math.round(product.rating) ? 'text-amber-400' : 'text-warm-200'">★</span>
          </div>
          <span class="text-sm text-warm-400">
            {{ product.rating }} ({{ product.reviews_count ?? product.reviews ?? 0 }} avaliações)
          </span>
        </div>

        <!-- Price -->
        <div class="bg-gradient-to-r from-brand-50 to-terra-50 rounded-2xl p-5 mb-6 border border-brand-100">
          <p class="text-xs text-warm-500 mb-1 uppercase tracking-wide font-semibold">Preço por unidade</p>
          <p class="font-display text-4xl font-bold text-terra-600">
            R$ {{ formatPrice(product.price) }}
          </p>
        </div>

        <!-- Description -->
        <p class="text-warm-600 leading-relaxed mb-6">{{ product.description }}</p>

        <!-- Stock indicator -->
        <div class="flex items-center gap-2 mb-6">
          <span class="w-2.5 h-2.5 rounded-full"
            :class="product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'"></span>
          <span class="text-sm text-warm-500">
            <template v-if="product.stock > 10">Em estoque</template>
            <template v-else-if="product.stock > 0">Restam apenas {{ product.stock }} unidades</template>
            <template v-else>Produto esgotado</template>
          </span>
        </div>

        <!-- Quantity + Add to Cart -->
        <div class="flex items-center gap-4 mb-3">
          <div class="flex items-center bg-cream-100 rounded-full px-2 py-1 border border-warm-200">
            <button
              @click="qty > 1 && qty--"
              class="w-9 h-9 rounded-full hover:bg-brand-100 transition-colors flex items-center justify-center text-warm-700 font-bold text-lg"
            >−</button>
            <span class="w-10 text-center font-bold text-warm-800 text-base">{{ qty }}</span>
            <button
              @click="qty < (product.stock || 99) && qty++"
              class="w-9 h-9 rounded-full hover:bg-brand-100 transition-colors flex items-center justify-center text-warm-700 font-bold text-lg"
            >+</button>
          </div>
          <button
            @click="addToCart"
            :disabled="product.stock === 0"
            class="btn-primary flex-1 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            🛒 Adicionar ao carrinho
          </button>
        </div>

        <RouterLink to="/carrinho" class="btn-secondary w-full justify-center">
          Ver carrinho
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { productService } from '@/services/productService'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { getPrimaryImageUrl } from '@/utils/imageHelpers.js'
import EmptyState from '@/components/ui/EmptyState.vue'
import ProductCarousel from '@/components/ProductCarousel.vue'

const route    = useRoute()
const cart     = useCartStore()
const toast    = useToastStore()
const product  = ref(null)
const loading  = ref(true)
const apiError = ref(null)
const imgError = ref(false)
const qty      = ref(1)

const formatPrice = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

onMounted(async () => {
  try {
    const { data } = await productService.getById(route.params.id)
    product.value = data.data ?? data
  } catch (e) {
    apiError.value = e.userMessage || 'Produto não encontrado.'
  } finally {
    loading.value = false
  }
})

function addToCart() {
  cart.addItem(product.value, qty.value)
  toast.success(`${qty.value}× ${product.value.name} no carrinho! 🛒`)
}
</script>
