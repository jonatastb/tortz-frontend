<template>
  <div class="space-y-6 animate-fade-in">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-display text-2xl font-bold text-warm-800">Categorias</h1>
        <p class="text-warm-400 text-sm mt-1">{{ admin.categories.length }} categorias cadastradas</p>
      </div>
      <button @click="openModal()" class="btn-primary">+ Nova Categoria</button>
    </div>

    <div v-if="admin.error" class="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      ⚠️ {{ admin.error }}
    </div>

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <template v-if="admin.loading">
        <div v-for="i in 3" :key="i" class="card p-5 shimmer-bg h-32"></div>
      </template>
      <template v-else>
        <div
          v-for="cat in admin.categories" :key="cat.id"
          class="card p-5 hover:shadow-card-hover transition-shadow"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-2xl">
              {{ cat.icon || '🏷️' }}
            </div>
            <div class="flex gap-1">
              <button @click="openModal(cat)"
                class="px-2.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                Editar
              </button>
              <button @click="confirmDelete(cat)"
                class="px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                ✕
              </button>
            </div>
          </div>
          <h3 class="font-display font-bold text-warm-800">{{ cat.name }}</h3>
          <p class="text-xs text-warm-400 mt-1 line-clamp-2">{{ cat.description || 'Sem descrição' }}</p>
          <p v-if="cat.slug" class="text-xs text-brand-400 mt-1 font-mono">/{{ cat.slug }}</p>
        </div>
        <EmptyState v-if="!admin.categories.length" icon="🏷️" title="Nenhuma categoria" message="Crie a primeira categoria." />
      </template>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal"></div>
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div class="p-6 border-b border-warm-100 flex items-center justify-between">
              <h2 class="font-display text-xl font-bold text-warm-800">
                {{ editing ? 'Editar Categoria' : 'Nova Categoria' }}
              </h2>
              <button @click="closeModal" class="p-2 hover:bg-warm-100 rounded-lg text-warm-400">✕</button>
            </div>
            <div class="p-6 space-y-4">
              <div>
                <label class="label">Nome *</label>
                <input v-model="form.name" type="text" class="input-field" placeholder="Ex: Tortas" />
              </div>
              <div>
                <label class="label">Slug (URL)</label>
                <input v-model="form.slug" type="text" class="input-field" placeholder="tortas" />
              </div>
              <div>
                <label class="label">Ícone (emoji)</label>
                <input v-model="form.icon" type="text" class="input-field" placeholder="🎂" maxlength="4" />
              </div>
              <div>
                <label class="label">Descrição</label>
                <textarea v-model="form.description" class="input-field resize-none" rows="2"
                  placeholder="Descrição da categoria..."></textarea>
              </div>

              <div v-if="saveError" class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                ⚠️ {{ saveError }}
              </div>
            </div>
            <div class="p-6 border-t border-warm-100 flex gap-3 justify-end">
              <button @click="closeModal" class="btn-secondary">Cancelar</button>
              <button @click="save" :disabled="saving" class="btn-primary disabled:opacity-60 disabled:shadow-none">
                <span v-if="saving" class="flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Salvando...
                </span>
                <span v-else>{{ editing ? 'Salvar' : 'Criar' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      :show="showDelete"
      title="Deletar categoria?"
      :message="`Remover <strong>${toDelete?.name}</strong>? Os produtos desta categoria podem ficar sem categoria.`"
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
import EmptyState   from '@/components/ui/EmptyState.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'

const admin      = useAdminStore()
const toast      = useToastStore()
const showModal  = ref(false)
const showDelete = ref(false)
const editing    = ref(null)
const toDelete   = ref(null)
const saving     = ref(false)
const saveError  = ref(null)

const blank = () => ({ name: '', slug: '', icon: '', description: '' })
const form  = reactive(blank())

function openModal(cat = null) {
  editing.value   = cat
  saveError.value = null
  Object.assign(form, cat ? { ...cat } : blank())
  showModal.value = true
}
function closeModal() { showModal.value = false; editing.value = null }

async function save() {
  if (!form.name.trim()) { toast.warning('Nome obrigatório.'); return }
  saving.value    = true
  saveError.value = null
  try {
    if (editing.value) {
      await admin.updateCategory(editing.value.id, { ...form })
      toast.success('Categoria atualizada!')
    } else {
      await admin.createCategory({ ...form })
      toast.success('Categoria criada!')
    }
    closeModal()
  } catch (e) {
    saveError.value = e.userMessage || 'Erro ao salvar categoria.'
  } finally {
    saving.value = false
  }
}

function confirmDelete(cat) { toDelete.value = cat; showDelete.value = true }
async function doDelete() {
  try {
    await admin.deleteCategory(toDelete.value.id)
    toast.success('Categoria removida.')
  } catch (e) {
    toast.error(e.userMessage || 'Erro ao remover categoria.')
  } finally {
    showDelete.value = false
    toDelete.value   = null
  }
}

onMounted(() => admin.fetchCategories())
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
</style>
