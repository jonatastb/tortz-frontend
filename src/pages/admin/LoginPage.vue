<template>
  <div class="min-h-screen bg-gradient-to-br from-brand-50 via-cream-100 to-terra-50 flex items-center justify-center px-4">
    <div class="w-full max-w-md animate-slide-up">
      <div class="card p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-brand-400 to-terra-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand">
            <span class="text-3xl">🎂</span>
          </div>
          <h1 class="font-display text-2xl font-bold text-warm-800">Doce Tortz</h1>
          <p class="text-warm-400 text-sm mt-1">Painel administrativo</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="label">E-mail</label>
            <input
              v-model="form.email"
              type="email"
              class="input-field"
              placeholder="seu@email.com"
              autocomplete="email"
              :disabled="auth.loading"
            />
          </div>
          <div>
            <label class="label">Senha</label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPwd ? 'text' : 'password'"
                class="input-field pr-11"
                placeholder="••••••••"
                autocomplete="current-password"
                :disabled="auth.loading"
              />
              <button
                type="button"
                @click="showPwd = !showPwd"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600 transition-colors"
              >{{ showPwd ? '🙈' : '👁️' }}</button>
            </div>
          </div>

          <!-- API Error -->
          <Transition name="fade">
            <div v-if="auth.error"
              class="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-start gap-2">
              <span class="shrink-0 mt-0.5">⚠️</span>
              <span>{{ auth.error }}</span>
            </div>
          </Transition>

          <button
            type="submit"
            :disabled="auth.loading"
            class="btn-primary w-full justify-center py-3.5 text-base disabled:opacity-60 disabled:shadow-none"
          >
            <span v-if="auth.loading" class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Autenticando...
            </span>
            <span v-else>Entrar no Painel</span>
          </button>
        </form>

        <div class="mt-6 text-center">
          <RouterLink to="/" class="text-sm text-warm-400 hover:text-brand-600 transition-colors">
            ← Voltar à loja
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const auth   = useAuthStore()
const toast  = useToastStore()
const router = useRouter()
const route  = useRoute()
const showPwd = ref(false)
const form = reactive({ email: '', password: '' })

async function handleLogin() {
  const ok = await auth.login(form)
  if (ok) {
    toast.success('Bem-vindo de volta! 👋')
    router.push(route.query.redirect || '/admin')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
