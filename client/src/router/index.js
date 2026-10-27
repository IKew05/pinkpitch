import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { authStore } from '../stores/authStore'
import { toastStore } from '../stores/toastStore'

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: 'หน้าแรก' } },
      { path: 'products', name: 'products', component: () => import('../views/ProductsView.vue'), meta: { title: 'สินค้าทั้งหมด' } },
      { path: 'products/:id', name: 'product-detail', component: () => import('../views/ProductDetailView.vue'), meta: { title: 'รายละเอียดสินค้า' } },
      { path: 'login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { title: 'เข้าสู่ระบบ', guestOnly: true } },
      { path: 'register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { title: 'สมัครสมาชิก', guestOnly: true } },
      { path: 'profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { title: 'โปรไฟล์', requiresAuth: true } },
      { path: 'cart', name: 'cart', component: () => import('../views/CartView.vue'), meta: { title: 'ตะกร้าสินค้า' } },
      { path: 'checkout', name: 'checkout', component: () => import('../views/CheckoutView.vue'), meta: { title: 'ชำระเงิน', requiresAuth: true } },
      { path: 'transactions', name: 'transactions', component: () => import('../views/TransactionsView.vue'), meta: { title: 'รายการสั่งซื้อของฉัน', requiresAuth: true } },
      { path: 'transactions/:id', name: 'transaction-detail', component: () => import('../views/TransactionDetailView.vue'), meta: { title: 'รายละเอียดการสั่งซื้อ', requiresAuth: true } },
    ],
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboardView.vue'), meta: { title: 'แดชบอร์ดผู้ดูแล' } },
      { path: 'products', name: 'admin-products', component: () => import('../views/admin/AdminProductsView.vue'), meta: { title: 'จัดการสินค้า' } },
      { path: 'transactions', name: 'admin-transactions', component: () => import('../views/admin/AdminTransactionsView.vue'), meta: { title: 'รายการสั่งซื้อทั้งหมด' } },
      { path: 'users', name: 'admin-users', component: () => import('../views/admin/AdminUsersView.vue'), meta: { title: 'สมาชิก' } },
      { path: 'users/:userId', name: 'admin-user-detail', component: () => import('../views/admin/AdminUserDetailView.vue'), meta: { title: 'ประวัติการซื้อของสมาชิก' } },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    component: MainLayout,
    children: [{ path: '', name: 'not-found', component: () => import('../views/NotFoundView.vue'), meta: { title: 'ไม่พบหน้านี้' } }],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (to, from, saved) => saved || { top: 0 },
})

// หมายเหตุ: Guard ฝั่ง Frontend ช่วยเรื่อง UX เท่านั้น สิทธิ์จริงต้องตรวจสอบที่ Backend ทุกครั้ง
router.beforeEach(async (to) => {
  await authStore.init()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    toastStore.error('หน้านี้สำหรับผู้ดูแลร้านเท่านั้น')
    return { name: 'home' }
  }
  if (to.meta.guestOnly && authStore.isLoggedIn) return { name: 'home' }
})

// Token หมดอายุ/ไม่ถูกต้อง (API ตอบ 401 ขณะมี Token): authStore ออกจากระบบให้แล้ว ที่นี่พาไปหน้า Login ถ้าอยู่หน้าที่ต้อง Login
window.addEventListener('pinkpitch:unauthorized', () => {
  toastStore.error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่')
  const cur = router.currentRoute.value
  if (cur.meta.requiresAuth) router.push({ name: 'login', query: { redirect: cur.fullPath } })
})

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} | PinkPitch` : 'PinkPitch – Football Jersey Store'
})

export default router
