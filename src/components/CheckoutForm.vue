<template>
  <div class="checkout-form">
    <h2 class="form-title">Finalizar Pedido</h2>
    
    <!-- Cart Items -->
    <div class="order-items">
      <h3 class="section-title">Itens do Pedido</h3>
      <div v-if="orderData.items.length === 0" class="empty-cart">
        <span class="empty-icon">🛒</span>
        <span class="empty-text">Seu carrinho está vazio</span>
      </div>
      <div v-else>
        <div v-for="item in orderData.items" :key="item.id" class="order-item">
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-quantity">Qtd: {{ item.quantity }}</span>
          </div>
          <span class="item-price">R$ {{ formatPrice(item.price * item.quantity) }}</span>
        </div>
      </div>
    </div>

    <!-- Order Totals -->
    <div class="order-totals">
      <div class="total-line">
        <span class="total-label">Subtotal:</span>
        <span class="total-value">R$ {{ formatPrice(subtotal) }}</span>
      </div>
      <div class="total-line">
        <span class="total-label">Taxa de Entrega:</span>
        <span class="total-value">R$ {{ formatPrice(shippingFee) }}</span>
      </div>
      <div class="total-line grand-total">
        <span class="total-label">Total:</span>
        <span class="total-value grand-total-value">R$ {{ formatPrice(orderData.totalAmount) }}</span>
      </div>
    </div>

    <!-- Shipping Information -->
    <div class="shipping-section">
      <h3 class="section-title">Endereço de Entrega</h3>
      <div class="form-group">
        <label class="form-label">Nome Completo:</label>
        <input
          type="text"
          v-model="orderData.customerName"
          class="form-input"
          placeholder="Seu nome completo"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label">Telefone:</label>
        <input
          type="tel"
          v-model="orderData.customerPhone"
          class="form-input"
          placeholder="(00) 00000-0000"
          required
        />
      </div>
      <div class="form-group">
        <label class="form-label">Endereço:</label>
        <textarea
          v-model="orderData.shippingAddress"
          class="form-textarea"
          rows="3"
          placeholder="Rua, número, complemento, bairro, cidade, estado, CEP"
          required
        ></textarea>
      </div>
    </div>

    <!-- Order Notes -->
    <div class="notes-section">
      <h3 class="section-title">Observações do Pedido</h3>
      <div class="form-group">
        <textarea
          v-model="orderData.notes"
          class="form-textarea"
          rows="3"
          placeholder="Instruções especiais para o pedido (ex: sem cebola, ponto de referência, horário de entrega preferido)..."
        ></textarea>
      </div>
    </div>

    <!-- Payment Section -->
    <div class="payment-section">
      <h3 class="section-title">Pagamento</h3>
      <PaymentForm 
        :order-id="orderId"
        :total-amount="orderData.totalAmount"
        @payment-complete="handlePaymentComplete"
        @payment-error="handlePaymentError"
      />
    </div>

    <!-- Submit Button -->
    <div class="submit-section">
      <button 
        type="button"
        @click="handleSubmit"
        :disabled="submitting || orderData.items.length === 0"
        class="submit-button"
      >
        <span v-if="submitting" class="button-spinner"></span>
        {{ submitting ? 'Processando Pedido...' : 'Finalizar Pedido' }}
      </button>
    </div>

    <!-- Success Modal -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-content">
        <div class="success-icon">✓</div>
        <h3>Pedido Criado com Sucesso!</h3>
        <p>Seu pedido #{{ orderNumber }} foi criado e será processado.</p>
        <div v-if="paymentPending" class="payment-pending">
          <p>Aguardando pagamento...</p>
          <PaymentForm 
            :order-id="orderId"
            :total-amount="orderData.totalAmount"
            @payment-complete="handlePaymentComplete"
            @payment-error="handlePaymentError"
          />
        </div>
        <button @click="closeSuccessModal" class="modal-button">
          {{ paymentPending ? 'Fechar' : 'Ir para Meus Pedidos' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { orderService } from '@/services/orderService'
import PaymentForm from './PaymentForm.vue'

const router = useRouter()
const cart = useCartStore()
const toast = useToastStore()

const orderId = ref('')
const orderNumber = ref('')
const submitting = ref(false)
const showSuccessModal = ref(false)
const paymentPending = ref(false)

const orderData = ref({
  items: [],
  customerName: '',
  customerPhone: '',
  shippingAddress: '',
  notes: '',
  totalAmount: 0
})

const subtotal = computed(() => {
  return orderData.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
})

const shippingFee = computed(() => {
  return orderData.value.totalAmount > 100 ? 0 : 10 // Frete grátis acima de R$100
})

const formatPrice = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const initializeOrder = () => {
  // Load cart items
  orderData.value.items = [...cart.items]
  orderData.value.totalAmount = cart.totalPrice
  
  // Load customer data from localStorage if available
  const savedCustomer = localStorage.getItem('customer_data')
  if (savedCustomer) {
    const customer = JSON.parse(savedCustomer)
    orderData.value.customerName = customer.name || ''
    orderData.value.customerPhone = customer.phone || ''
    orderData.value.shippingAddress = customer.address || ''
  }
}

const handleSubmit = async () => {
  if (orderData.value.items.length === 0) {
    toast.warning('Adicione itens ao carrinho antes de finalizar o pedido')
    return
  }

  if (!orderData.value.customerName || !orderData.value.shippingAddress) {
    toast.warning('Preencha nome e endereço de entrega')
    return
  }

  submitting.value = true

  try {
    // Create order
    const order = await orderService.create({
      userId: 'guest', // TODO: Get from auth store when user system is ready
      items: orderData.value.items,
      totalAmount: orderData.value.totalAmount,
      shippingAddress: orderData.value.shippingAddress,
      notes: orderData.value.notes
    })

    orderId.value = order.id
    orderNumber.value = order.id.substring(0, 8).toUpperCase() // Short order number for display
    
    // Save customer data
    const customerData = {
      name: orderData.value.customerName,
      phone: orderData.value.customerPhone,
      address: orderData.value.shippingAddress
    }
    localStorage.setItem('customer_data', JSON.stringify(customerData))

    // Clear cart
    cart.clearCart()

    // Show success modal
    showSuccessModal.value = true
    paymentPending.value = order.payment_status === 'pending'

  } catch (e) {
    toast.error(e.message || 'Erro ao criar pedido. Tente novamente.')
  } finally {
    submitting.value = false
  }
}

const handlePaymentComplete = (paymentData) => {
  // Update order with payment info
  orderService.updateOrderPayment(orderId.value, paymentData)
    .then(() => {
      paymentPending.value = false
      toast.success('Pagamento processado com sucesso!')
    })
    .catch((e) => {
      toast.error('Erro ao processar pagamento.')
    })
}

const handlePaymentError = (error) => {
  toast.error(error || 'Erro no pagamento')
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  
  if (!paymentPending.value) {
    router.push('/meus-pedidos')
  }
}

onMounted(() => {
  initializeOrder()
})
</script>

<style scoped>
.checkout-form {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: #1f2937;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #374151;
}

.order-items {
  margin-bottom: 24px;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
  background: #fef2f2;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 1rem;
  color: #6b7280;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #1f2937;
  display: block;
  margin-bottom: 4px;
}

.item-quantity {
  font-size: 0.875rem;
  color: #6b7280;
}

.item-price {
  font-weight: 600;
  color: #059669;
}

.order-totals {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.total-line:last-child {
  margin-bottom: 0;
}

.grand-total {
  padding-top: 8px;
  border-top: 2px solid #e5e7eb;
}

.total-label {
  font-weight: 500;
  color: #6b7280;
}

.total-value {
  font-weight: 600;
  color: #374151;
}

.grand-total-value {
  font-size: 1.125rem;
  color: #059669;
}

.shipping-section,
.notes-section,
.payment-section {
  margin-bottom: 24px;
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
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-section {
  margin-top: 32px;
}

.submit-button {
  width: 100%;
  padding: 14px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-button:hover:not(:disabled) {
  background: #2563eb;
}

.submit-button:disabled {
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 16px;
}

.modal-content h3 {
  margin-bottom: 12px;
  color: #1f2937;
}

.modal-content p {
  margin-bottom: 20px;
  color: #6b7280;
}

.payment-pending {
  background: #fef3c7;
  padding: 16px;
  border-radius: 8px;
  margin: 20px 0;
}

.modal-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.modal-button:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .checkout-form {
    padding: 16px;
  }
  
  .form-title {
    font-size: 1.25rem;
  }
  
  .modal-content {
    padding: 24px;
  }
}
</style>
