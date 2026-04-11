<template>
  <div class="payment-form">
    <h3 class="form-title">Método de Pagamento</h3>
    
    <div class="form-group">
      <label class="form-label">Selecione o método de pagamento:</label>
      <select 
        v-model="paymentMethod" 
        class="form-select"
        required
      >
        <option value="">Selecione...</option>
        <option value="credit_card">Cartão de Crédito</option>
        <option value="pix">PIX</option>
        <option value="cash">Dinheiro</option>
        <option value="debit_card">Cartão de Débito</option>
      </select>
    </div>

    <div class="form-group">
      <label class="form-label">Valor do Pagamento:</label>
      <input
        type="number"
        v-model="paymentAmount"
        class="form-input"
        step="0.01"
        min="0"
        placeholder="0.00"
        required
      />
    </div>

    <!-- PIX QR Code (se método PIX for selecionado) -->
    <div v-if="paymentMethod === 'pix' && qrCodeData" class="qr-code-section">
      <h4>QR Code para Pagamento PIX</h4>
      <div class="qr-code">
        <img :src="qrCodeData.qr_code_url" alt="QR Code PIX" />
        <p class="qr-code-text">Escaneie o QR Code com seu app de pagamento</p>
        <p class="qr-code-pix-key">Chave PIX: {{ qrCodeData.pix_key }}</p>
        <p class="qr-code-amount">Valor: R$ {{ formatPrice(qrCodeData.amount) }}</p>
      </div>
    </div>

    <!-- Cartão de Crédito/Débito -->
    <div v-if="paymentMethod && paymentMethod.includes('card')" class="card-section">
      <h4>Dados do Cartão</h4>
      <div class="form-group">
        <label class="form-label">Número do Cartão:</label>
        <input
          type="text"
          v-model="cardData.number"
          class="form-input"
          placeholder="0000 0000 0000 0000"
          maxlength="19"
        />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">Validade:</label>
          <input
            type="text"
            v-model="cardData.expiry"
            class="form-input"
            placeholder="MM/AA"
            maxlength="5"
          />
        </div>
        <div class="form-group">
          <label class="form-label">CVV:</label>
          <input
            type="text"
            v-model="cardData.cvv"
            class="form-input"
            placeholder="123"
            maxlength="4"
          />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Nome no Cartão:</label>
        <input
          type="text"
          v-model="cardData.name"
          class="form-input"
          placeholder="Nome como está no cartão"
        />
      </div>
    </div>

    <!-- Observações do pagamento -->
    <div class="form-group">
      <label class="form-label">Observações do Pagamento:</label>
      <textarea
        v-model="paymentNotes"
        class="form-textarea"
        rows="3"
        placeholder="Informações adicionais sobre o pagamento..."
      ></textarea>
    </div>

    <button 
      @click="handlePayment"
      :disabled="processing || !paymentMethod || !paymentAmount"
      class="pay-button"
    >
      <span v-if="processing" class="button-spinner"></span>
      {{ processing ? 'Processando...' : 'Pagar Agora' }}
    </button>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { orderService } from '@/services/orderService'
import { PAYMENT_METHODS, PAYMENT_STATUS } from '@/constants/payment'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['paymentComplete', 'paymentError'])

const paymentMethod = ref('')
const paymentAmount = ref(props.totalAmount)
const paymentNotes = ref('')
const processing = ref(false)
const error = ref('')
const qrCodeData = ref(null)

const cardData = ref({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

const isCardPayment = computed(() => {
  return paymentMethod.value && paymentMethod.value.includes('card')
})

const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const handlePayment = async () => {
  if (!paymentMethod.value || !paymentAmount.value) {
    error.value = 'Preencha todos os campos obrigatórios'
    return
  }

  processing.value = true
  error.value = ''

  try {
    let paymentData = {
      method: paymentMethod.value,
      amount: parseFloat(paymentAmount.value),
      orderId: props.orderId
    }

    // Se for PIX, gera QR Code primeiro
    if (paymentMethod.value === PAYMENT_METHODS.PIX) {
      const qrResponse = await orderService.generatePixQrCode(props.orderId, paymentAmount.value)
      qrCodeData.value = qrResponse
      processing.value = false
      return
    }

    // Se for cartão, inclui dados do cartão
    if (isCardPayment.value) {
      paymentData.paymentDetails = {
        card_number: cardData.value.number,
        card_expiry: cardData.value.expiry,
        card_cvv: cardData.value.cvv,
        card_name: cardData.value.name
      }
    }

    // Processa pagamento
    const result = await orderService.processPayment(paymentData)
    
    if (result.success) {
      emit('paymentComplete', {
        payment_method: paymentMethod.value,
        payment_amount: parseFloat(paymentAmount.value),
        payment_status: PAYMENT_STATUS.PAID,
        paid_at: new Date().toISOString(),
        transaction_id: result.transaction_id,
        notes: paymentNotes.value
      })
    } else {
      throw new Error(result.message || 'Falha no pagamento')
    }

  } catch (e) {
    error.value = e.message || 'Erro ao processar pagamento. Tente novamente.'
    emit('paymentError', error.value)
  } finally {
    processing.value = false
  }
}

// Limpa QR Code quando mudar método
const clearQrCode = () => {
  if (paymentMethod.value !== PAYMENT_METHODS.PIX) {
    qrCodeData.value = null
  }
}

// Watch para limpar QR Code
watch(paymentMethod, clearQrCode)
</script>

<style scoped>
.payment-form {
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1f2937;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.qr-code-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
}

.qr-code-section h4 {
  margin-bottom: 16px;
  color: #1f2937;
}

.qr-code {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.qr-code img {
  width: 200px;
  height: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.qr-code-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.qr-code-pix-key {
  font-size: 0.75rem;
  color: #374151;
  font-weight: 500;
  word-break: break-all;
}

.qr-code-amount {
  font-size: 1rem;
  font-weight: 600;
  color: #059669;
}

.card-section {
  margin: 20px 0;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
}

.card-section h4 {
  margin-bottom: 16px;
  color: #1f2937;
}

.pay-button {
  width: 100%;
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.pay-button:hover:not(:disabled) {
  background: #2563eb;
}

.pay-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.button-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-top: 12px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .payment-form {
    padding: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
