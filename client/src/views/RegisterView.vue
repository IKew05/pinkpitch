<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Loader2, PawPrint, Camera, Upload } from 'lucide-vue-next'
import PasswordField from '../components/PasswordField.vue'
import { authStore } from '../stores/authStore'
import { toastStore } from '../stores/toastStore'
import { isEmail } from '../utils/validators'
import { processAvatarFile } from '../utils/imageCompress'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80',
]

const router = useRouter()
const fileInputRef = ref(null)
const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  avatarUrl: PRESET_AVATARS[0]
})
const errors = reactive({ fullName: '', email: '', password: '', confirmPassword: '' })
const formError = ref('')
const loading = ref(false)

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    form.avatarUrl = await processAvatarFile(file)
    toastStore.success('อัปโหลดรูปภาพสำเร็จ')
  } catch (err) {
    toastStore.error(err.message || 'อัปโหลดรูปภาพไม่สำเร็จ')
  }
}

function validate() {
  errors.fullName = form.fullName.trim().length < 2 ? 'กรุณากรอกชื่อ-นามสกุล' : ''
  errors.email = !form.email.trim() ? 'กรุณากรอกอีเมล' : !isEmail(form.email) ? 'รูปแบบอีเมลไม่ถูกต้อง' : ''
  errors.password = form.password.length < 8 ? 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' : ''
  errors.confirmPassword = !form.confirmPassword
    ? 'กรุณายืนยันรหัสผ่าน'
    : form.confirmPassword !== form.password
    ? 'รหัสผ่านทั้งสองช่องไม่ตรงกัน'
    : ''
  return Object.values(errors).every((e) => !e)
}

async function submit() {
  if (loading.value) return
  formError.value = ''
  if (!validate()) return
  loading.value = true
  try {
    await authStore.register({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      avatarUrl: form.avatarUrl || null
    })
    toastStore.success('สมัครสมาชิกสำเร็จ')
    router.push('/')
  } catch (e) {
    if (e.fieldErrors) Object.keys(e.fieldErrors).forEach((k) => { if (k in errors) errors[k] = e.fieldErrors[k] })
    else formError.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth page container">
    <div class="auth-card card">
      <h1>สมัครสมาชิก</h1>
      <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>

      <form novalidate @submit.prevent="submit">
        <!-- Seamless Avatar Picker with File Upload -->
        <div class="avatar-wrap">
          <label class="current-avatar" title="คลิกเพื่ออัปโหลดรูปภาพของคุณ">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="onFileChange"
            />
            <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar" class="avatar-current-img" />
            <span v-else class="avatar-current-empty"><PawPrint :size="26" /></span>
            <span class="upload-badge"><Camera :size="12" /></span>
          </label>

          <div class="animal-presets">
            <button
              v-for="(av, idx) in PRESET_AVATARS"
              :key="idx"
              type="button"
              class="animal-btn"
              :class="{ active: form.avatarUrl === av }"
              @click="form.avatarUrl = av"
            >
              <img :src="av" alt="avatar" class="animal-img" />
            </button>

            <!-- Upload button -->
            <label class="animal-btn upload-btn" title="อัปโหลดรูปภาพของคุณ">
              <input
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="onFileChange"
              />
              <Upload :size="15" />
            </label>
          </div>
        </div>

        <div class="field">
          <label for="fullName">ชื่อ-นามสกุล</label>
          <input
            id="fullName"
            v-model="form.fullName"
            class="input"
            :class="{ 'is-invalid': errors.fullName }"
            autocomplete="name"
            :aria-invalid="!!errors.fullName"
            placeholder="ชื่อ-นามสกุล"
          />
          <p v-if="errors.fullName" class="error-text">{{ errors.fullName }}</p>
        </div>

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
            placeholder="อีเมล"
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <PasswordField
          id="password"
          v-model="form.password"
          label="รหัสผ่าน"
          :error="errors.password"
          autocomplete="new-password"
        />
        <PasswordField
          id="confirmPassword"
          v-model="form.confirmPassword"
          label="ยืนยันรหัสผ่าน"
          :error="errors.confirmPassword"
          autocomplete="new-password"
        />

        <button class="btn btn-primary btn-block btn-submit" type="submit" :disabled="loading">
          <Loader2 v-if="loading" :size="18" class="spin" /> {{ loading ? 'กำลังดำเนินการ...' : 'สมัครสมาชิก' }}
        </button>
      </form>
      <p class="switch">มีบัญชีอยู่แล้ว? <RouterLink to="/login">เข้าสู่ระบบ</RouterLink></p>
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
  width: min(460px, 100%);
  padding: 36px 32px;
  border-radius: var(--r-lg);
  box-shadow: 0 12px 36px rgba(232, 62, 140, 0.1);
  border: 1px solid var(--line);
}
.auth-card h1 {
  font-size: 1.8rem;
  margin-bottom: 20px;
  text-align: center;
}

/* ── Seamless Avatar Bar ── */
.avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #FFF5F9 0%, #FFEBF3 100%);
  border-radius: 999px;
  border: 1px solid var(--line);
}

.current-avatar {
  position: relative;
  width: 54px;
  height: 54px;
  min-width: 54px;
  border-radius: 50%;
  border: 2px solid var(--pink);
  overflow: visible;
  box-shadow: 0 4px 12px rgba(255, 79, 154, 0.28);
  display: grid;
  place-items: center;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.current-avatar:hover {
  transform: scale(1.06);
}

.avatar-current-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar-current-empty {
  color: var(--rose);
}

.upload-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--rose);
  color: #fff;
  display: grid;
  place-items: center;
  border: 1.5px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.hidden-file-input {
  display: none;
}

.animal-presets {
  display: flex;
  align-items: center;
  gap: 7px;
}
.animal-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid transparent;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  background: #fff;
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.3, 1), border-color 0.18s;
  opacity: 0.8;
}
.animal-btn:hover {
  transform: scale(1.12);
  opacity: 1;
}
.animal-btn.active {
  opacity: 1;
  border-color: var(--rose-deep);
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px var(--pink);
  transform: scale(1.1);
}
.animal-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-btn {
  display: grid;
  place-items: center;
  background: #fff;
  border: 1.5px dashed var(--pink);
  color: var(--rose-deep);
  cursor: pointer;
}
.upload-btn:hover {
  background: var(--pink-soft);
  border-color: var(--rose);
  color: var(--rose-deep);
}

.btn-submit {
  margin-top: 8px;
  padding: 12px 20px;
}

.switch {
  text-align: center;
  margin: 20px 0 0;
  font-size: 0.9rem;
}
</style>
