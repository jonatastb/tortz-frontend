<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-warm-800">Produtos</h1>
        <p class="text-warm-400 text-sm mt-1">{{ admin.products.length }} produtos cadastrados</p>
      </div>
      <button @click="openModal()" class="btn-primary">+ Novo Produto</button>
    </div>

    <!-- API error -->
    <div v-if="admin.error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
      ⚠️ {{ admin.error }}
      <button @click="load" class="ml-auto underline font-semibold">Tentar novamente</button>
    </div>

    <!-- Table -->
    <div class="card overflow-hidden">
      <div v-if="admin.loading" class="p-6 space-y-3">
        <div v-for="i in 5" :key="i" class="shimmer-bg h-14 rounded-xl"></div>
      </div>
      <EmptyState v-else-if="!admin.products.length" icon="🎂" title="Nenhum produto cadastrado" message="Crie o primeiro produto."/>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-cream-50 border-b border-warm-100 text-xs font-semibold text-warm-400 uppercase tracking-wider">
              <th class="px-4 py-3 text-left">Produto</th>
              <th class="px-4 py-3 text-left hidden md:table-cell">Categoria</th>
              <th class="px-4 py-3 text-left">Preço</th>
              <th class="px-4 py-3 text-left hidden sm:table-cell">Estoque</th>
              <th class="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-warm-50">
            <tr v-for="p in admin.products" :key="p.id" class="hover:bg-cream-50 transition-colors">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
               
                  <div class="w-10 h-10 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                    <img :src="getPrimaryImageUrl(p)" :alt="p.name" class="w-full h-full object-cover"
                      @error="e => e.target.style.display='none'" />
                  </div>
                  <div>
                    <span class="font-semibold text-warm-800 text-sm block line-clamp-1">{{ p.name }}</span>
                    <span v-if="p.featured" class="text-amber-400 text-xs">★ Destaque</span>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="badge bg-brand-100 text-brand-700 text-xs">
                  {{ p.category?.name || p.category || '—' }}
                </span>
              </td>
              <td class="px-4 py-3 font-display font-bold text-terra-600 text-sm">
                R$ {{ Number(p.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) }}
              </td>
              <td class="px-4 py-3 hidden sm:table-cell">
                <span class="text-sm font-medium"
                  :class="p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-500' : 'text-emerald-600'">
                  {{ p.stock ?? '—' }}
                </span>
              </td>
              <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1">
                  <button @click="openModal(p)"
                    class="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    Editar
                  </button>
                  <button @click="confirmDelete(p)"
                    class="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    Deletar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div class="p-6 border-b border-warm-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 class="font-display text-xl font-bold text-warm-800">
                {{ editing ? 'Editar Produto' : 'Novo Produto' }}
              </h2>
              <button @click="closeModal" class="p-2 hover:bg-warm-100 rounded-lg text-warm-400 transition-colors">✕</button>
            </div>
            <div class="p-6 space-y-4">
              {{ form }}
              <div>
                <label class="label">Nome *</label>
                <input v-model="form.name" type="text" class="input-field" placeholder="Nome do produto" />
              </div>
              <div>
                <label class="label">Descrição</label>
                <textarea v-model="form.description" class="input-field resize-none" rows="3"
                  placeholder="Descreva o produto..."></textarea>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="label">Preço (R$) *</label>
                  <input v-model.number="form.price" type="number" step="0.01" min="0"
                    class="input-field" placeholder="0,00" />
                </div>
                <div>
                  <label class="label">Estoque</label>
                  <input v-model.number="form.stock" type="number" min="0"
                    class="input-field" placeholder="0" />
                </div>
              </div>
              <div>
                <label class="label">Categoria *</label>
                <select v-model="form.category_id" class="input-field">
                  <option value="">Selecione uma categoria...</option>
                  <option v-for="cat in admin.categories" :key="cat.id" :value="cat.id">
                    {{ cat.icon ? cat.icon + ' ' : '' }}{{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="label">Imagens do Produto</label>
                <!-- Debug: Mostrar form.images -->
                <div class="text-xs text-gray-500 mb-2">
                  DEBUG form.images: {{ JSON.stringify(form.images) }}
                </div>
                <ImageUploadManager 
                  :product-id="editing?.id || 'new'"
                  :existing-images="form.images"
                  @images-change="handleImagesChange"
                />
              </div>
              <label class="flex items-center gap-3 cursor-pointer select-none">
                <input v-model="form.featured" type="checkbox" class="w-4 h-4 accent-brand-500 rounded" />
                <span class="text-sm font-semibold text-warm-700">Produto em destaque ⭐</span>
              </label>

              <!-- Save error -->
              <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                ⚠️ {{ saveError }}
              </div>
            </div>
            <div class="p-6 border-t border-warm-100 flex gap-3 justify-end sticky bottom-0 bg-white rounded-b-2xl">
              <button @click="closeModal" class="btn-secondary">Cancelar</button>
              <button @click="save" :disabled="saving" class="btn-primary disabled:opacity-60 disabled:shadow-none">
                <span v-if="saving" class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Salvando...
                </span>
                <span v-else>{{ editing ? 'Salvar alterações' : 'Criar produto' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Confirm delete -->
    <ConfirmModal
      :show="showDelete"
      title="Deletar produto?"
      :message="`Deseja remover <strong>${toDelete?.name}</strong>? Esta ação não pode ser desfeita.`"
      confirm-text="Deletar"
      icon="🗑️"
      :danger="true"
      @confirm="doDelete"
      @cancel="showDelete = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAdminStore } from '@/stores/adminStore'
import { useToastStore } from '@/stores/toastStore'
import { productService } from '@/services/productService'
import { getPrimaryImageUrl } from '@/utils/imageHelpers.js'
import EmptyState   from '@/components/ui/EmptyState.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import ImageUploadManager from '@/components/ImageUploadManager.vue'

const admin     = useAdminStore()
const toast     = useToastStore()
const showModal = ref(false)
const showDelete = ref(false)
const editing   = ref(null)
const toDelete  = ref(null)
const saving    = ref(false)
const saveError = ref(null)

const blankForm = () => ({ name: '', description: '', price: '', stock: 0, category_id: '', images: [], featured: false })
const form = reactive(blankForm())

function openModal(product = null) {
  editing.value  = product
  saveError.value = null
  
  if (product) {
    // Garantir que as imagens sejam carregadas corretamente
    const productImages = product.images || []
    console.log('Loading product images:', productImages)
    
    Object.assign(form, {
      ...product, 
      category_id: product.category_id ?? product.category?.id ?? '', 
      images: [...productImages] // Criar cópia para reatividade
    })
  } else {
    Object.assign(form, blankForm())
  }
  
  showModal.value = true
}
function closeModal() { showModal.value = false; editing.value = null }

function handleImagesChange(images) {
  console.log('=== handleImagesChange called ===')
  console.log('Received images:', images)
  console.log('Current form.images before update:', form.images)
  
  form.images = images
  
  console.log('form.images after update:', form.images)
  console.log('Type of form.images:', typeof form.images)
  console.log('Length of form.images:', form.images?.length)
  console.log('=== end handleImagesChange ===')
}


async function save() {
  if (!form.name || !form.price || !form.category_id) {
    toast.warning('Preencha nome, preço e categoria.')
    return
  }
  
  saving.value = true
  saveError.value = null
  
  try {
    // Verificar se há imagens com arquivos (para produtos novos)
    const hasFiles = form.images?.some(img => img.file && img.file instanceof File)
    
    let payload
    
    if (hasFiles && !editing.value) {
      // Usar FormData para produtos novos com arquivos
      payload = new FormData()
      payload.append('name', form.name)
      payload.append('description', form.description || '')
      payload.append('price', form.price)
      payload.append('stock', form.stock || 0)
      payload.append('category_id', form.category_id)
      payload.append('featured', form.featured ? '1' : '0')
      payload.append('active', '1')
      
      // Adicionar arquivos de imagem
      form.images.forEach((img, index) => {
        if (img.file && img.file instanceof File) {
          payload.append(`images[${index}]`, img.file)
        }
      })
      
      console.log('Saving product with FormData (files):', payload)
    } else {
      // Usar JSON para produtos existentes ou sem arquivos
      payload = {
        name: form.name,
        description: form.description || '',
        price: form.price,
        stock: form.stock || 0,
        category_id: form.category_id,
        featured: form.featured,
        active: 1,
        images: form.images || []
      }
      
      console.log('Saving product with JSON payload:', payload)
    }
    
    if (editing.value) {
      await admin.updateProduct(editing.value.id, payload)
      toast.success('Produto atualizado!')
    } else {
      const result = await admin.createProduct(payload)
      console.log('Product created:', result)
      toast.success('Produto criado com sucesso!')
    }
    closeModal()
    // Refresh products list
    await admin.fetchProducts()
  } catch (e) {
    saveError.value = e.userMessage || 'Erro ao salvar produto.'
    toast.error(e.userMessage || 'Erro ao salvar produto.')
  } finally {
    saving.value = false
  }
}

function confirmDelete(p) { toDelete.value = p; showDelete.value = true }
async function doDelete() {
  try {
    await admin.deleteProduct(toDelete.value.id)
    toast.success('Produto removido.')
    // Refresh products list
    await admin.fetchProducts()
  } catch (e) {
    toast.error(e.userMessage || 'Erro ao remover produto.')
  } finally {
    showDelete.value = false
    toDelete.value   = null
  }
}

async function load() {
  await Promise.all([admin.fetchProducts(), admin.fetchCategories()])
}
onMounted(load)
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
