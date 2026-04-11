/**
 * Constantes para sistema de pagamento
 */

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  PIX: 'pix',
  CASH: 'cash',
  DEBIT_CARD: 'debit_card'
}

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
}

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
}

// Labels para exibição
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CREDIT_CARD]: 'Cartão de Crédito',
  [PAYMENT_METHODS.PIX]: 'PIX',
  [PAYMENT_METHODS.CASH]: 'Dinheiro',
  [PAYMENT_METHODS.DEBIT_CARD]: 'Cartão de Débito'
}

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pendente',
  [PAYMENT_STATUS.PAID]: 'Pago',
  [PAYMENT_STATUS.FAILED]: 'Falhou',
  [PAYMENT_STATUS.REFUNDED]: 'Reembolsado'
}

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pendente',
  [ORDER_STATUS.CONFIRMED]: 'Confirmado',
  [ORDER_STATUS.PREPARING]: 'Preparando',
  [ORDER_STATUS.SHIPPED]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregue',
  [ORDER_STATUS.CANCELLED]: 'Cancelado'
}
