<template>
  <footer class="bg-warm-900 text-warm-300 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div class="flex items-center gap-2.5 mb-4">
            <div class="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <span class="text-lg">🎂</span>
            </div>
            <div>
              <span class="font-display text-xl font-bold text-white block leading-none">Doce Tortz</span>
              <span class="font-accent text-brand-400 text-sm">artesanal com amor</span>
            </div>
          </div>
          <p class="text-sm text-warm-400 leading-relaxed">
            Tortas e doces artesanais feitos com ingredientes frescos e muito carinho para adoçar cada momento especial.
          </p>
        </div>
        <div>
          <h3 class="font-semibold text-white mb-4">Navegação</h3>
          <ul class="space-y-2 text-sm">
            <li><RouterLink to="/" class="hover:text-brand-400 transition-colors">Home</RouterLink></li>
            <li><RouterLink to="/carrinho" class="hover:text-brand-400 transition-colors">Carrinho</RouterLink></li>
            <li><RouterLink to="/checkout" class="hover:text-brand-400 transition-colors">Finalizar Pedido</RouterLink></li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold text-white mb-4">Contato</h3>
          <ul class="space-y-2 text-sm text-warm-400">
            <li>📍 Curitiba, PR</li>
            <li>📞 (41) 99999-0000</li>
            <li>✉️ contato@docetortz.com.br</li>
          </ul>
        </div>
      </div>
      <div class="border-t border-warm-800 mt-10 pt-6 text-center text-xs text-warm-600">
        © {{ new Date().getFullYear() }} Doce Tortz — Todos os direitos reservados.
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
