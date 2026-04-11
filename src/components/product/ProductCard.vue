<template>
  <div
    class="card overflow-hidden group cursor-pointer animate-fade-in"
    @click="goToProduct"
  >
    <!-- Image -->
    <div class="relative overflow-hidden bg-cream-200 h-52">
      <img
        :src="getPrimaryImageUrl(product)"
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
        @error="imgError = true"
      />
      <div v-if="imgError" class="absolute inset-0 flex items-center justify-center text-5xl bg-cream-100">🎂</div>

      <!-- Category badge -->
      <span class="absolute top-3 left-3 badge bg-white/90 text-terra-700 shadow-sm">
        {{ product.category?.name || product.category }}
      </span>

      <!-- Quick add button -->
      <button
        @click.stop="addToCart"
        class="absolute bottom-3 right-3 bg-brand-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold
               opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0
               hover:bg-brand-600 shadow-brand transition-all duration-200"
      >
        + Carrinho
      </button>

      <!-- Featured star -->
      <div v-if="product.featured" class="absolute top-3 right-3">
        <span class="text-amber-400 text-lg drop-shadow">★</span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <h3 class="font-display font-semibold text-warm-800 text-base leading-tight line-clamp-1">
        {{ product.name }}
      </h3>
      <div v-if="product.rating" class="flex items-center gap-1 mt-1">
        <span class="text-amber-400 text-xs">★</span>
        <span class="text-xs text-warm-400">{{ product.rating }} ({{ product.reviews_count ?? product.reviews ?? 0 }})</span>
      </div>
      <div class="flex items-center justify-between mt-3">
        <span class="font-display font-bold text-terra-600 text-lg">
          {{ formatPrice(product.price) }}
        </span>
        <span v-if="product.stock <= 10 && product.stock > 0" class="text-xs text-warm-400">
          Últimas {{ product.stock }}
        </span>
        <span v-else-if="product.stock === 0" class="text-xs text-red-400 font-medium">
          Esgotado
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { getPrimaryImageUrl } from '@/utils/imageHelpers.js'

const props  = defineProps({ product: { type: Object, required: true } })
const router = useRouter()
const cart   = useCartStore()
const toast  = useToastStore()
const imgError = ref(false)

const formatPrice = (v) =>
  'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

const goToProduct = () =>
  router.push({ name: 'product', params: { id: props.product.id } })

function addToCart() {
  if (props.product.stock === 0) {
    toast.warning('Produto esgotado.')
    return
  }
  cart.addItem(props.product)
  toast.success(`${props.product.name} adicionado! 🛒`)
}
</script>
