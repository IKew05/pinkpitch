<script setup>
import { useRouter } from 'vue-router'
import { LayoutDashboard, Shirt, Users, Receipt, Store, LogOut } from 'lucide-vue-next'

import { authStore } from '../stores/authStore'
import { toastStore } from '../stores/toastStore'

const router = useRouter()
const links = [
  { to: '/admin', label: 'ภาพรวม', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'จัดการสินค้า', icon: Shirt },
  { to: '/admin/transactions', label: 'รายการสั่งซื้อ', icon: Receipt },
  { to: '/admin/users', label: 'สมาชิก', icon: Users },
]
function logout() {
  authStore.logout()
  toastStore.success('ออกจากระบบแล้ว')
  router.push('/')
}
</script>

<template>

  <div class="admin">
    <aside class="side">
      <div class="side-brand">
        <img src="/logo.png" alt="PinkPitch" class="side-logo" />
        <span class="side-title">Pink<b>Pitch</b></span>
        <span class="badge badge-pink">Admin</span>
      </div>
      <nav class="side-nav" aria-label="เมนูผู้ดูแล">
        <RouterLink v-for="l in links" :key="l.to" :to="l.to" :exact-active-class="l.exact ? 'active' : ''" :active-class="l.exact ? '' : 'active'">
          <component :is="l.icon" :size="18" /> {{ l.label }}
        </RouterLink>
        <RouterLink to="/"><Store :size="18" /> กลับหน้าร้าน</RouterLink>
      </nav>
      <div class="side-foot">
        <div class="who"><strong>{{ authStore.user?.fullName }}</strong><small>{{ authStore.user?.email }}</small></div>
        <button class="btn btn-outline btn-sm btn-block" @click="logout"><LogOut :size="16" /> ออกจากระบบ</button>
      </div>
    </aside>
    <main class="admin-main"><RouterView /></main>
  </div>
</template>

<style scoped>
.admin { display: grid; grid-template-columns: 250px 1fr; min-height: 100vh; }
.side { background: var(--navy); color: #fff; padding: 24px 16px; display: flex; flex-direction: column; gap: 24px; position: sticky; top: 0; height: 100vh; align-self: start; }
.side-brand { font-family: var(--font-display); font-size: 1.35rem; display: flex; align-items: center; gap: 8px; padding: 0 4px; }
.side-logo { height: 38px; width: 38px; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(255, 79, 154, 0.45)); }
.side-title { font-weight: 700; }
.side-title b { color: var(--pink); }
.side-nav { display: grid; gap: 4px; }
.side-nav a { display: flex; align-items: center; gap: 10px; padding: 11px 12px; border-radius: var(--r-md); color: #d7d9e6; font-weight: 600; text-decoration: none !important; }
.side-nav a:hover { background: rgba(255,255,255,.08); }
.side-nav a.active { background: var(--rose); color: #fff; }
.side-foot { margin-top: auto; display: grid; gap: 12px; }
.who { display: grid; font-size: .85rem; padding: 0 8px; overflow: hidden; }
.who small { color: #9ea2bb; overflow: hidden; text-overflow: ellipsis; }
.side-foot .btn-outline { background: transparent; color: #fff; border-color: rgba(255,255,255,.4); }
.side-foot .btn-outline:hover { background: rgba(255,255,255,.1); }
.admin-main { padding: 32px clamp(16px, 3vw, 40px) 64px; min-width: 0; }
@media (max-width: 860px) {
  .admin { grid-template-columns: 1fr; }
  .side { position: static; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; padding: 14px 16px; gap: 12px; }
  .side-nav { display: flex; flex-wrap: wrap; }
  .side-foot { margin: 0 0 0 auto; display: flex; align-items: center; }
  .who { display: none; }
}
</style>
