// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

// Layouts
import PublicLayout from '@/layouts/PublicLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

// Public pages
import HomePage from '@/pages/public/HomePage.vue'
import ProductPage from '@/pages/public/ProductPage.vue'
import CartPage from '@/pages/public/CartPage.vue'
import CheckoutPage from '@/pages/public/CheckoutPage.vue'
import OrderSuccessPage from '@/pages/public/OrderSuccessPage.vue'

// Admin pages
import AdminLoginPage from '@/pages/admin/LoginPage.vue'
import AdminDashboard from '@/pages/admin/DashboardPage.vue'
import AdminProducts from '@/pages/admin/ProductsPage.vue'
import AdminCategories from '@/pages/admin/CategoriesPage.vue'
import AdminOrders from '@/pages/admin/OrdersPage.vue'
import AdminOrderDetail from '@/pages/admin/OrderDetailPage.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: HomePage },
      { path: 'produto/:id', name: 'product', component: ProductPage },
      { path: 'carrinho', name: 'cart', component: CartPage },
      { path: 'checkout', name: 'checkout', component: CheckoutPage },
      { path: 'pedido-confirmado', name: 'order-success', component: OrderSuccessPage },
    ],
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: AdminLoginPage,
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboard },
      { path: 'produtos', name: 'admin-products', component: AdminProducts },
      { path: 'categorias', name: 'admin-categories', component: AdminCategories },
      { path: 'pedidos', name: 'admin-orders', component: AdminOrders },
      { path: 'pedidos/:id', name: 'admin-order-detail', component: AdminOrderDetail },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// Route guard — protege área admin
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin-login' && auth.isAuthenticated) {
    return { name: 'admin-dashboard' }
  }
})

export default router
