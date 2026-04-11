<template>
  <div class="animate-fade-in">
    <!-- ─── Hero ─────────────────────────────────────────────────────────── -->
    <section class="relative overflow-hidden bg-gradient-to-br from-brand-50 via-cream-100 to-terra-50 min-h-[460px] flex items-center">
      <div class="absolute top-0 right-0 w-96 h-96 bg-brand-200/30 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-64 h-64 bg-terra-200/25 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl pointer-events-none"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div class="animate-slide-up">
          <p class="font-accent text-brand-500 text-2xl mb-1">Bem-vindo à</p>
          <h1 class="font-display text-5xl sm:text-6xl font-bold text-warm-900 leading-tight mb-4">
            Doce <span class="text-brand-500 italic">Tortz</span>
          </h1>
          <p class="text-warm-500 text-lg leading-relaxed mb-8 max-w-md">
            Tortas e doces artesanais feitos com ingredientes frescos, muito amor e receitas exclusivas para tornar cada ocasião inesquecível.
          </p>
          <div class="flex flex-wrap gap-3">
            <button @click="scrollToProducts" class="btn-primary text-base px-8 py-3.5">
              Ver Cardápio 🎂
            </button>
            <RouterLink to="/carrinho" class="btn-secondary text-base px-8 py-3.5">
              Meu Carrinho
            </RouterLink>
          </div>
          <div class="flex gap-8 mt-10">
            <div v-for="s in stats" :key="s.label" class="text-center">
              <p class="font-display text-2xl font-bold text-brand-600">{{ s.value }}</p>
              <p class="text-xs text-warm-400 mt-0.5">{{ s.label }}</p>
            </div>
          </div>
        </div>
        <!-- Decorative hero illustration -->
        <div class="hidden lg:flex justify-center items-center">
          <div class="relative w-72 h-72">
            <div class="absolute inset-0 bg-gradient-to-br from-brand-300 to-terra-400 rounded-full opacity-15 animate-pulse"></div>
            <div class="absolute inset-4 bg-white rounded-full shadow-2xl flex items-center justify-center">
              <span class="text-9xl select-none">🎂</span>
            </div>
            <div v-for="b in bubbles" :key="b.text"
              class="absolute bg-white rounded-2xl shadow-card px-3 py-2 flex items-center gap-2 text-sm font-semibold text-warm-700"
              :style="b.style">
              <span>{{ b.emoji }}</span>{{ b.text }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── API error banner ───────────────────────────────────────────────── -->
    <div v-if="apiError" class="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      <div class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
        <span>⚠️</span>
        <span>{{ apiError }}</span>
        <button @click="fetchData" class="ml-auto underline font-semibold hover:no-underline">Tentar novamente</button>
      </div>
    </div>

    <!-- ─── Categories ────────────────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h2 class="font-display text-2xl font-bold text-warm-800 mb-5">Categorias</h2>
      <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        <button
          @click="selectedCategory = null"
          class="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
          :class="!selectedCategory
            ? 'bg-brand-500 text-white shadow-brand'
            : 'bg-white text-warm-600 border border-warm-200 hover:border-brand-300'"
        >Todos</button>
        <button
          v-for="cat in categories" :key="cat.id"
          @click="selectedCategory = cat.id"
          class="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
          :class="selectedCategory === cat.id
            ? 'bg-brand-500 text-white shadow-brand'
            : 'bg-white text-warm-600 border border-warm-200 hover:border-brand-300'"
        >
          <span v-if="cat.icon">{{ cat.icon }}</span>
          {{ cat.name }}
        </button>
      </div>
    </section>

    <!-- ─── Featured ──────────────────────────────────────────────────────── -->
    <section v-if="!selectedCategory && !searchQuery" class="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-display text-2xl font-bold text-warm-800">✨ Destaques</h2>
      </div>
      <div v-if="loadingFeatured" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SkeletonCard v-for="i in 4" :key="i" />
      </div>
      <div v-else-if="featured.length" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProductCard v-for="p in featured" :key="p.id" :product="p" />
      </div>
    </section>

    <!-- ─── All Products ──────────────────────────────────────────────────── -->
    <section id="produtos" class="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-display text-2xl font-bold text-warm-800">
          {{ sectionTitle }}
        </h2>
        <span v-if="!loading" class="text-sm text-warm-400">{{ filteredProducts.length }} produtos</span>
      </div>

      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <SkeletonCard v-for="i in 8" :key="i" />
      </div>
      <div v-else-if="filteredProducts.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <ProductCard v-for="p in filteredProducts" :key="p.id" :product="p" />
      </div>
      <EmptyState v-else icon="🔍" title="Nenhum produto encontrado" message="Tente outra categoria ou pesquisa." />
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { productService, categoryService } from '@/services/productService'
import ProductCard  from '@/components/product/ProductCard.vue'
import SkeletonCard from '@/components/ui/SkeletonCard.vue'
import EmptyState   from '@/components/ui/EmptyState.vue'

const route            = useRoute()
const loading          = ref(false)
const loadingFeatured  = ref(false)
const products         = ref([])
const featured         = ref([])
const categories       = ref([])
const selectedCategory = ref(null)
const apiError         = ref(null)

const searchQuery = computed(() => route.query.search || '')

const stats = [
  { value: '500+', label: 'Clientes felizes' },
  { value: '30+',  label: 'Sabores únicos' },
  { value: '5⭐',  label: 'Avaliação média' },
]
const bubbles = [
  { emoji: '🌿', text: 'Natural',    style: 'top:0; right:-20px' },
  { emoji: '❤️', text: 'Com amor',   style: 'bottom:20px; left:-30px' },
  { emoji: '✨', text: 'Artesanal',  style: 'bottom:0; right:0' },
]

const filteredProducts = computed(() => {
  let list = products.value
  if (selectedCategory.value) list = list.filter(p => (p.category_id ?? p.category?.id) === selectedCategory.value)
  if (searchQuery.value)      list = list.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  return list
})

const sectionTitle = computed(() => {
  if (searchQuery.value) return `Busca: "${searchQuery.value}"`
  if (selectedCategory.value) return categories.value.find(c => c.id === selectedCategory.value)?.name || 'Produtos'
  return 'Todos os Produtos'
})

async function fetchData() {
  loading.value         = true
  loadingFeatured.value = true
  apiError.value        = null
  try {
    const [prodRes, catRes, featRes] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      productService.getFeatured(),
    ])
    // Suporta resposta paginada do Laravel ({ data: [...] }) ou array direto
    products.value   = Array.isArray(prodRes.data)  ? prodRes.data  : (prodRes.data.data  ?? [])
    categories.value = Array.isArray(catRes.data)   ? catRes.data   : (catRes.data.data   ?? [])
    // getFeatured pode retornar todos se o backend não suportar ?featured=1
    const feat = Array.isArray(featRes.data) ? featRes.data : (featRes.data.data ?? [])
    featured.value = feat.filter(p => p.featured).slice(0, 8)
  } catch (e) {
    apiError.value = e.userMessage || 'Não foi possível carregar os produtos.'
  } finally {
    loading.value         = false
    loadingFeatured.value = false
  }
}

function scrollToProducts() {
  document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(fetchData)
watch(searchQuery, fetchData)
</script>
