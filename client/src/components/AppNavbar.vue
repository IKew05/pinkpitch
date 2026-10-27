<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  Home,
  Shirt,
  Receipt,
  User,
  ShoppingBag,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown
} from 'lucide-vue-next'
import { authStore } from '../stores/authStore'
import { cartStore } from '../stores/cartStore'
import { toastStore } from '../stores/toastStore'

const router = useRouter()
const route = useRoute()
const mobileOpen = ref(false)
const menuOpen = ref(false)
const menuRef = ref(null)

const links = [
  { to: '/', label: 'Home', icon: Home, exact: true },
  { to: '/products', label: 'Product', icon: Shirt },
  { to: '/transactions', label: 'My Orders', icon: Receipt },
  { to: '/profile', label: 'Profile', icon: User },
]

function onDocClick(e) {
  if (menuRef.value && !menuRef.value.contains(e.target)) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
watch(() => route.fullPath, () => {
  mobileOpen.value = false
  menuOpen.value = false
})

function logout() {
  authStore.logout()
  menuOpen.value = false
  mobileOpen.value = false
  toastStore.success('ออกจากระบบแล้ว')
  router.push('/')
}
</script>

<template>
  <header class="nav">
    <div class="container nav-in">
      <!-- Brand Logo -->
      <RouterLink to="/" class="brand" aria-label="PinkPitch หน้าแรก">
        <img src="/logo.png" alt="PinkPitch Logo" class="brand-logo" />
        <span class="brand-text">Pink<span class="brand-accent">Pitch</span></span>
      </RouterLink>

      <!-- Main Navigation with Lucide Icons -->
      <nav class="links" :class="{ open: mobileOpen }" aria-label="เมนูหลัก">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="link"
          :exact-active-class="l.exact ? 'active' : ''"
          :active-class="l.exact ? '' : 'active'"
        >
          <!-- Display User Avatar if available on Profile link, else show Lucide icon -->
          <img
            v-if="l.to === '/profile' && authStore.user?.avatarUrl"
            :src="authStore.user.avatarUrl"
            class="link-avatar-img"
            :alt="authStore.user.fullName"
          />
          <component v-else :is="l.icon" :size="17" class="link-icon" />
          <span>{{ l.label }}</span>
        </RouterLink>

        <!-- Mobile Auth Drawer -->
        <div class="mobile-auth">
          <template v-if="!authStore.isLoggedIn">
            <RouterLink to="/login" class="btn btn-outline btn-block">
              <User :size="16" /> เข้าสู่ระบบ
            </RouterLink>
            <RouterLink to="/register" class="btn btn-primary btn-block">
              สมัครสมาชิก
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink v-if="authStore.isAdmin" to="/admin" class="btn btn-dark btn-block">
              <LayoutDashboard :size="16" /> Admin Dashboard
            </RouterLink>
            <button class="btn btn-outline btn-block" @click="logout">
              <LogOut :size="16" /> ออกจากระบบ
            </button>
          </template>
        </div>
      </nav>

      <div class="actions">
        <!-- Cart button with item count -->
        <RouterLink to="/cart" class="cart btn btn-ghost icon-btn" aria-label="ตะกร้าสินค้า" title="ตะกร้าสินค้า">
          <ShoppingBag :size="21" />
          <span v-if="cartStore.count" class="cart-count">{{ cartStore.count }}</span>
        </RouterLink>

        <!-- Desktop Auth Section -->
        <div class="desktop-auth">
          <template v-if="!authStore.isLoggedIn">
            <RouterLink to="/login" class="btn btn-outline btn-sm auth-btn">
              <User :size="15" />
              <span>Login</span>
            </RouterLink>
            <RouterLink to="/register" class="btn btn-primary btn-sm auth-btn">
              <span>Register</span>
            </RouterLink>
          </template>
          <div v-else ref="menuRef" class="user">
            <button class="user-btn" :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
              <img
                v-if="authStore.user?.avatarUrl"
                :src="authStore.user.avatarUrl"
                :alt="authStore.user.fullName"
                class="avatar-photo"
              />
              <span v-else class="avatar">{{ authStore.user.fullName.charAt(0).toUpperCase() }}</span>
              <span class="user-name">{{ authStore.user.fullName }}</span>
              <span v-if="authStore.isAdmin" class="badge-role">Admin</span>
              <ChevronDown :size="15" />
            </button>

            <!-- User Menu Dropdown -->
            <div v-if="menuOpen" class="dropdown">
              <div class="dropdown-head">
                <div class="dropdown-user-row">
                  <img
                    v-if="authStore.user?.avatarUrl"
                    :src="authStore.user.avatarUrl"
                    :alt="authStore.user.fullName"
                    class="dropdown-avatar-photo"
                  />
                  <span v-else class="avatar avatar-md">{{ authStore.user.fullName.charAt(0).toUpperCase() }}</span>
                  <div class="dropdown-user-text">
                    <strong>{{ authStore.user.fullName }}</strong>
                    <small>{{ authStore.user.email }}</small>
                  </div>
                </div>
                <div class="badge-row">
                  <span v-if="authStore.isAdmin" class="badge badge-navy">Admin</span>
                  <span v-else class="badge badge-pink">Customer</span>
                </div>
              </div>
              <RouterLink to="/profile"><User :size="16" /> โปรไฟล์ของฉัน</RouterLink>
              <RouterLink to="/transactions"><Receipt :size="16" /> รายการสั่งซื้อ</RouterLink>
              <RouterLink v-if="authStore.isAdmin" to="/admin"><LayoutDashboard :size="16" /> Admin Dashboard</RouterLink>
              <button class="logout-btn" @click="logout"><LogOut :size="16" /> ออกจากระบบ</button>
            </div>
          </div>
        </div>

        <!-- Mobile Burger Button -->
        <button
          class="btn btn-ghost icon-btn burger"
          :aria-label="mobileOpen ? 'ปิดเมนู' : 'เปิดเมนู'"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = !mobileOpen"
        >
          <component :is="mobileOpen ? X : Menu" :size="22" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--line);
}
.nav-in {
  height: var(--nav-h);
  display: flex;
  align-items: center;
  gap: 24px;
}

/* ── Brand Logo ── */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none !important;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.brand:hover {
  transform: translateY(-1px);
}
.brand-logo {
  height: 44px;
  width: 44px;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 4px 10px rgba(255, 79, 154, 0.28));
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.brand:hover .brand-logo {
  transform: rotate(8deg) scale(1.06);
}
.brand-text {
  font-family: var(--font-display);
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  line-height: 1;
}
.brand-accent {
  color: var(--pink);
  margin-left: 1px;
}

/* ── Links with Icons (Home, Product, My Orders, Profile) ── */
.links {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
}
.link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 999px;
  color: var(--ink);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none !important;
  transition: all 0.18s ease;
}
.link-icon {
  color: var(--muted);
  transition: color 0.18s ease, transform 0.18s ease;
}
.link:hover .link-icon {
  color: var(--pink);
  transform: scale(1.1);
}
.link:hover {
  background: var(--pink-soft);
  color: var(--rose-deep);
}
.link.active {
  background: var(--navy);
  color: #fff;
}
.link.active .link-icon {
  color: var(--pink);
}

.link-avatar-img {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--pink);
}

/* ── Actions on Right ── */
.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.cart {
  position: relative;
  color: var(--ink);
  border-radius: 50%;
  transition: background 0.15s, color 0.15s;
}
.cart:hover {
  background: var(--pink-soft);
  color: var(--rose-deep);
}
.cart-count {
  position: absolute;
  top: 1px;
  right: 1px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: var(--rose);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.desktop-auth {
  display: flex;
  gap: 8px;
  align-items: center;
}
.auth-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ── User Profile Button & Dropdown ── */
.user {
  position: relative;
}
.user-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  color: var(--ink);
  transition: border-color 0.15s, background 0.15s;
}
.user-btn:hover {
  border-color: var(--pink);
  background: var(--pink-soft);
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose), var(--pink));
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-family: var(--font-display);
}
.avatar-photo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid var(--pink);
  box-shadow: 0 2px 6px rgba(255, 79, 154, 0.25);
}
.user-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  font-size: 0.9rem;
}
.badge-role {
  background: var(--navy);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 999px;
  text-transform: uppercase;
}

.dropdown {
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  width: 250px;
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: 0 10px 30px rgba(32, 36, 58, 0.12);
  padding: 8px;
  display: grid;
  z-index: 150;
}
.dropdown-head {
  display: grid;
  gap: 6px;
  padding: 8px 10px 12px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 6px;
  justify-items: start;
}
.dropdown-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}
.dropdown-avatar-photo {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--pink);
  box-shadow: 0 2px 8px rgba(255, 79, 154, 0.2);
}
.dropdown-user-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dropdown-user-text strong {
  font-size: 0.92rem;
  color: var(--navy);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dropdown-user-text small {
  color: var(--muted);
  font-size: 0.78rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown a,
.dropdown button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 10px;
  border: 0;
  background: none;
  font: inherit;
  color: var(--ink);
  cursor: pointer;
  text-decoration: none !important;
  text-align: left;
}
.dropdown a:hover,
.dropdown button:hover {
  background: var(--pink-soft);
}
.logout-btn {
  color: var(--danger) !important;
}

/* ── Mobile Drawer ── */
.burger,
.mobile-auth {
  display: none;
}

@media (max-width: 880px) {
  .desktop-auth {
    display: none;
  }
  .burger {
    display: inline-flex;
  }
  .links {
    position: absolute;
    top: var(--nav-h);
    left: 0;
    right: 0;
    flex-direction: column;
    background: #fff;
    padding: 16px 20px 24px;
    border-bottom: 1px solid var(--line);
    display: none;
    box-shadow: var(--shadow-md);
    gap: 8px;
    align-items: stretch;
  }
  .links.open {
    display: flex;
  }
  .link {
    padding: 12px 16px;
  }
  .mobile-auth {
    display: grid;
    gap: 8px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
  }
}
</style>
