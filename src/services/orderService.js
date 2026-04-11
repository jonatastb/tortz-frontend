// src/services/orderService.js
// Consome a API Laravel — GET /orders, GET /orders/:id, PUT /orders/:id/status

import api from './api'
import { PAYMENT_METHODS, PAYMENT_STATUS, ORDER_STATUS } from '@/constants/payment'

export const orderService = {
  /** GET /orders — lista todos os pedidos (admin) */
  getAll(params = {}) {
    return api.get('/orders', { params })
  },

  /** GET /orders/:id — detalhe de um pedido */
  getById(id) {
    return api.get(`/orders/${id}`)
  },

  /**
   * POST /orders — cria um novo pedido (público, checkout)
   * Payload esperado pelo Laravel:
   * {
   *   user_id: "uuid-user",
   *   items: [{ product_id, quantity, price }],
   *   total_amount: 150.99,
   *   payment_method: 'credit_card' | 'pix' | 'cash' | 'debit_card',
   *   payment_amount: 150.99,
   *   payment_status: 'pending' | 'paid' | 'failed' | 'refunded',
   *   shipping_address: "Rua das Flores, 123",
   *   notes: "Sem cebola",
   *   status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled'
   * }
   */
  create(orderData) {
    return api.post('/orders', {
      user_id: orderData.userId,
      items: orderData.items,
      total_amount: orderData.totalAmount,
      payment_method: orderData.paymentMethod,
      payment_amount: orderData.paymentAmount,
      payment_status: PAYMENT_STATUS.PENDING,
      shipping_address: orderData.shippingAddress,
      notes: orderData.notes || '',
      status: ORDER_STATUS.PENDING
    })
  },

  /**
   * PUT /orders/:id/payment — atualiza pagamento do pedido
   */
  updateOrderPayment(orderId, paymentData) {
    return api.put(`/orders/${orderId}/payment`, {
      payment_method: paymentData.paymentMethod,
      payment_amount: paymentData.paymentAmount,
      payment_status: paymentData.paymentStatus || PAYMENT_STATUS.PENDING,
      paid_at: paymentData.paidAt || null,
      transaction_id: paymentData.transactionId || null
    })
  },

  /**
   * POST /payments/process — processa pagamento
   */
  async processPayment(paymentData) {
    const response = await api.post('/payments/process', {
      method: paymentData.method,
      amount: paymentData.amount,
      order_id: paymentData.orderId,
      payment_details: paymentData.paymentDetails || {}
    })
    return response.data
  },

  /**
   * PUT /orders/:id/status — atualiza status do pedido (admin)
   */
  updateStatus(id, status) {
    return api.put(`/orders/${id}/status`, { status })
  },

  /**
   * PUT /orders/:id/cancel — cancela pedido
   */
  cancelOrder(id) {
    return api.put(`/orders/${id}/cancel`)
  },

  /**
   * GET /payment-methods — métodos disponíveis
   */
  getPaymentMethods() {
    return api.get('/payment-methods')
  },

  /**
   * POST /payments/pix/qrcode — gera QR Code PIX
   */
  generatePixQrCode(orderId, amount) {
    return api.post('/payments/pix/qrcode', {
      order_id: orderId,
      amount
    })
  },

  /**
   * PUT /orders/:id/status — atualiza status do pedido (admin)
   * Payload: { status: 'pendente' | 'pago' | 'enviado' | 'entregue' }
   */
  updateStatus(id, status) {
    return api.put(`/orders/${id}/status`, { status })
  },
}
