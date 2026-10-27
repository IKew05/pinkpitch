<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2, ShieldCheck, User, Zap, Sparkles } from 'lucide-vue-next'
import PasswordField from '../components/PasswordField.vue'
import { authStore } from '../stores/authStore'
import { toastStore } from '../stores/toastStore'
import { isEmail } from '../utils/validators'

const route = useRoute()
const router = useRouter()
const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const formError = ref('')
const loading = ref(false)

function validate() {
  errors.email = !form.email.trim() ? 'กรุณากรอกอีเมล' : !isEmail(form.email) ? 'รูปแบบอีเมลไม่ถูกต้อง' : ''
  errors.password = form.password ? '' : 'กรุณากรอกรหัสผ่าน'
  return !errors.email && !errors.password
}

async function submit() {
  if (loading.value) return
  formError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    const user = await authStore.login({ email: form.email.trim(), password: form.password })
    toastStore.success(`ยินดีต้อนรับ ${user.fullName}`)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : (user.role === 'admin' ? '/admin' : '/')
    router.push(redirect)
  } catch (e) {
    formError.value = e.message
  } finally {
    loading.value = false
  }
}

async function quickLogin(role) {
  if (loading.value) return
  formError.value = ''
  loading.value = true
  const creds = role === 'admin'
    ? { email: 'admin@pinkpitch.com', password: 'Admin@1234' }
    : { email: 'demo@pinkpitch.test', password: 'Demo@12345' }

  form.email = creds.email
  form.password = creds.password

  try {
    const user = await authStore.login(creds)
    toastStore.success(`เข้าสู่ระบบสำเร็จในฐานะ ${user.fullName} (${user.role === 'admin' ? 'Admin' : 'ลูกค้า'})`)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : (user.role === 'admin' ? '/admin' : '/products')
    router.push(redirect)
  } catch (e) {
    formError.value = e.message
  } finally {
    loading.value = false
  }
}

function fill(email, password) {
  form.email = email
  form.password = password
}
</script>

<template>
  <div class="auth page container">
    <div class="auth-card card">
      <h1>เข้าสู่ระบบ</h1>
      <p class="muted">ยินดีต้อนรับกลับ เข้าสู่ระบบเพื่อดูคำสั่งซื้อและสั่งซื้อสินค้า</p>

      <!-- Demo Quick Login Box -->
      <div class="demo-box">
        <div class="demo-header">
          <Zap :size="16" class="demo-zap-icon" />
          <span>บัญชีสำหรับทดลองใช้งาน (คลิกเดียวเข้าสู่ระบบทันที)</span>
        </div>
        <div class="demo-grid">
          <!-- Admin Button -->
          <button
            type="button"
            class="demo-card demo-admin"
            :disabled="loading"
            @click="quickLogin('admin')"
          >
            <div class="demo-role">
              <ShieldCheck :size="16" />
              <strong>เข้าสู่ระบบเป็น Admin</strong>
            </div>
            <div class="demo-sub">admin@pinkpitch.com</div>
            <div class="demo-desc">จัดการสินค้า, ตรวจสอบออเดอร์, ดู Dashboard</div>
            <span class="demo-action">คลิกเพื่อเข้าสู่ระบบ Admin ➜</span>
          </button>

          <!-- Customer Button -->
          <button
            type="button"
            class="demo-card demo-customer"
            :disabled="loading"
            @click="quickLogin('customer')"
          >
            <div class="demo-role">
              <User :size="16" />
              <strong>เข้าสู่ระบบเป็น ลูกค้า</strong>
            </div>
            <div class="demo-sub">demo@pinkpitch.test</div>
            <div class="demo-desc">สั่งซื้อสินค้า, ตะกร้า, ดูประวัติการสั่งซื้อ</div>
            <span class="demo-action">คลิกเพื่อเข้าสู่ระบบ ลูกค้า ➜</span>
          </button>
        </div>
      </div>

      <div class="divider">
        <span>หรือเข้าสู่ระบบด้วยบัญชีของคุณ</span>
      </div>

      <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>

      <form novalidate @submit.prevent="submit">
        <div class="field">
          <label for="email">อีเมล</label>
          <input
            id="email"
            v-model="form.email"
            class="input"
            :class="{ 'is-invalid': errors.email }"
            type="email"
            autocomplete="email"
            :aria-invalid="!!errors.email"
            placeholder="เช่น name@example.com"
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>
        <PasswordField id="password" v-model="form.password" label="รหัสผ่าน" :error="errors.password" />
        <button class="btn btn-primary btn-block btn-lg" type="submit" :disabled="loading">
          <Loader2 v-if="loading" :size="18" class="spin" /> {{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Login)' }}
        </button>
      </form>
      <p class="switch">ยังไม่มีบัญชี? <RouterLink to="/register">สมัครสมาชิก</RouterLink></p>
    </div>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  place-items: start center;
  padding: 40px 16px 80px;
}

.auth-card {
  width: min(520px, 100%);
  padding: 36px 32px;
  border-radius: var(--r-lg);
  box-shadow: 0 12px 36px rgba(232, 62, 140, 0.1);
  border: 1px solid var(--line);
}

/* ── Demo Quick Login Box ── */
.demo-box {
  background: linear-gradient(135deg, #FFF0F6 0%, #FFE4EE 100%);
  border: 1.5px dashed var(--pink);
  border-radius: var(--r-md);
  padding: 18px 16px;
  margin: 20px 0;
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--rose-deep);
  margin-bottom: 12px;
}

.demo-zap-icon {
  color: var(--pink);
  fill: var(--pink);
}

.demo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 520px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
}

.demo-card {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: var(--r-sm);
  padding: 14px 12px;
  text-align: left;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.demo-card:hover:not(:disabled) {
  transform: translateY(-2px);
  border-color: var(--pink);
  box-shadow: 0 6px 18px rgba(232, 62, 140, 0.18);
}

.demo-admin:hover:not(:disabled) {
  border-color: var(--navy);
  background: #fafbff;
}

.demo-customer:hover:not(:disabled) {
  border-color: var(--rose);
  background: #fffafd;
}

.demo-role {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.92rem;
  font-family: var(--font-display);
  color: var(--navy);
}

.demo-admin .demo-role {
  color: var(--navy);
}

.demo-customer .demo-role {
  color: var(--rose-deep);
}

.demo-sub {
  font-size: 0.76rem;
  color: var(--muted);
  font-family: monospace;
}

.demo-desc {
  font-size: 0.74rem;
  color: #6c7087;
  line-height: 1.35;
  margin-top: 2px;
}

.demo-action {
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--pink);
  margin-top: 6px;
  display: inline-block;
}

.demo-admin .demo-action {
  color: var(--navy);
}

.demo-customer .demo-action {
  color: var(--rose);
}

/* ── Divider ── */
.divider {
  position: relative;
  text-align: center;
  margin: 22px 0 18px;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--line);
}

.divider span {
  position: relative;
  background: #fff;
  padding: 0 12px;
  font-size: 0.82rem;
  color: var(--muted);
}

.btn-lg {
  padding: 12px 20px;
  font-size: 1rem;
}

.switch {
  text-align: center;
  margin: 22px 0 0;
  font-size: 0.9rem;
}
</style>
