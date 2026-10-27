<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Pencil, LogOut, Loader2, PawPrint, Camera, Upload } from 'lucide-vue-next'
import { authStore } from '../stores/authStore'
import { toastStore } from '../stores/toastStore'
import { isEmail } from '../utils/validators'
import { formatDate } from '../utils/format'
import { processAvatarFile } from '../utils/imageCompress'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=150&auto=format&fit=crop&q=80',
]

const router = useRouter()
const editing = ref(false)
const saving = ref(false)
const formError = ref('')
const form = reactive({ fullName: '', email: '', avatarUrl: '' })
const errors = reactive({ fullName: '', email: '' })

function startEdit() {
  form.fullName = authStore.user.fullName
  form.email = authStore.user.email
  form.avatarUrl = authStore.user.avatarUrl || ''
  errors.fullName = errors.email = formError.value = ''
  editing.value = true
}
function cancel() {
  editing.value = false
  formError.value = ''
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    form.avatarUrl = await processAvatarFile(file)
    toastStore.success('อัปโหลดรูปภาพแล้ว อย่าลืมกดบันทึก')
  } catch (err) {
    toastStore.error(err.message || 'อัปโหลดรูปภาพไม่สำเร็จ')
  } finally {
    e.target.value = ''
  }
}

async function onDirectAvatarChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const avatarUrl = await processAvatarFile(file)
    await authStore.updateProfile({
      fullName: authStore.user.fullName,
      email: authStore.user.email,
      avatarUrl,
    })
    toastStore.success('เปลี่ยนรูปโปรไฟล์เรียบร้อยแล้ว')
  } catch (err) {
    toastStore.error(err.message || 'อัปโหลดรูปภาพไม่สำเร็จ')
  } finally {
    e.target.value = ''
  }
}

function validate() {
  errors.fullName = form.fullName.trim().length < 2 ? 'กรุณากรอกชื่อ-นามสกุล' : ''
  errors.email = !form.email.trim() ? 'กรุณากรอกอีเมล' : !isEmail(form.email) ? 'รูปแบบอีเมลไม่ถูกต้อง' : ''
  return !errors.fullName && !errors.email
}

async function save() {
  if (saving.value) return
  formError.value = ''
  if (!validate()) return
  saving.value = true
  try {
    await authStore.updateProfile({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      avatarUrl: form.avatarUrl || null,
    })
    toastStore.success('บันทึกข้อมูลเรียบร้อยแล้ว')
    editing.value = false
  } catch (e) {
    if (e.fieldErrors) Object.keys(e.fieldErrors).forEach((k) => { if (k in errors) errors[k] = e.fieldErrors[k] })
    else formError.value = e.message
    toastStore.error('บันทึกข้อมูลไม่สำเร็จ')
  } finally {
    saving.value = false
  }
}

function logout() {
  authStore.logout()
  toastStore.success('ออกจากระบบแล้ว')
  router.push('/')
}
</script>

<template>
  <div class="page container narrow">
    <div class="page-head">
      <h1>โปรไฟล์ของฉัน</h1>
      <p>ดูและจัดการข้อมูลสมาชิก</p>
    </div>

    <div v-if="authStore.user" class="card profile-card">
      <div class="head">
        <label class="avatar-wrap avatar-wrap-clickable" title="คลิกเพื่อเปลี่ยนรูปภาพ">
          <input
            type="file"
            accept="image/*"
            class="hidden-file-input"
            @change="onDirectAvatarChange"
          />
          <img
            v-if="authStore.user.avatarUrl"
            :src="authStore.user.avatarUrl"
            :alt="authStore.user.fullName"
            class="avatar-img"
          />
          <span v-else class="avatar">{{ authStore.user.fullName.charAt(0).toUpperCase() }}</span>
          <span class="upload-badge"><Camera :size="13" /></span>
        </label>
        <div class="head-info">
          <h2>{{ authStore.user.fullName }}</h2>
          <div class="badge-row">
            <span class="badge" :class="authStore.isAdmin ? 'badge-navy' : 'badge-pink'">
              {{ authStore.isAdmin ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิก (Customer)' }}
            </span>
          </div>
        </div>
      </div>

      <dl v-if="!editing" class="view">
        <div><dt>ชื่อ-นามสกุล</dt><dd>{{ authStore.user.fullName }}</dd></div>
        <div><dt>อีเมล</dt><dd>{{ authStore.user.email }}</dd></div>
        <div v-if="authStore.user.createdAt"><dt>สมัครสมาชิกเมื่อ</dt><dd>{{ formatDate(authStore.user.createdAt) }}</dd></div>
      </dl>

      <form v-else novalidate @submit.prevent="save">
        <div v-if="formError" class="alert alert-error" role="alert">{{ formError }}</div>

        <!-- Seamless Avatar Picker with File Upload -->
        <div class="avatar-edit-bar">
          <label class="current-avatar" title="คลิกเพื่ออัปโหลดรูปภาพของคุณ">
            <input
              type="file"
              accept="image/*"
              class="hidden-file-input"
              @change="onFileChange"
            />
            <img v-if="form.avatarUrl" :src="form.avatarUrl" class="preview-pic" alt="preview" />
            <span v-else class="preview-empty"><PawPrint :size="24" /></span>
            <span class="upload-badge-inner"><Camera :size="11" /></span>
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
              <img :src="av" alt="preset" class="animal-img" />
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
          <label for="p-name">ชื่อ-นามสกุล</label>
          <input
            id="p-name"
            v-model="form.fullName"
            class="input"
            :class="{ 'is-invalid': errors.fullName }"
            autocomplete="name"
          />
          <p v-if="errors.fullName" class="error-text">{{ errors.fullName }}</p>
        </div>

        <div class="field">
          <label for="p-email">อีเมล</label>
          <input
            id="p-email"
            v-model="form.email"
            class="input"
            :class="{ 'is-invalid': errors.email }"
            type="email"
            autocomplete="email"
          />
          <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
        </div>

        <div class="row">
          <button class="btn btn-primary" type="submit" :disabled="saving">
            <Loader2 v-if="saving" :size="18" class="spin" /> {{ saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล' }}
          </button>
          <button class="btn btn-ghost" type="button" :disabled="saving" @click="cancel">ยกเลิก</button>
        </div>
      </form>

      <div v-if="!editing" class="row actions">
        <button class="btn btn-primary" @click="startEdit"><Pencil :size="16" /> แก้ไขข้อมูล</button>
        <RouterLink to="/transactions" class="btn btn-outline">รายการสั่งซื้อ</RouterLink>
        <button class="btn btn-danger" @click="logout"><LogOut :size="16" /> Logout</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.narrow {
  max-width: 680px;
}
.profile-card {
  padding: 32px;
  border-radius: var(--r-lg);
  box-shadow: 0 10px 30px rgba(232, 62, 140, 0.08);
}
.head {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}
.avatar-wrap {
  position: relative;
  width: 76px;
  height: 76px;
  min-width: 76px;
  border-radius: 50%;
  border: 3px solid var(--pink);
  box-shadow: 0 6px 18px rgba(255, 79, 154, 0.35);
  display: grid;
  place-items: center;
  background: #fff;
}
.avatar-wrap-clickable {
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1), box-shadow 0.2s;
}
.avatar-wrap-clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(255, 79, 154, 0.45);
}
.upload-badge {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--rose);
  color: #fff;
  display: grid;
  place-items: center;
  border: 2px solid #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: transform 0.15s;
}
.avatar-wrap-clickable:hover .upload-badge {
  transform: scale(1.12);
}
.hidden-file-input {
  display: none;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--rose), var(--pink));
  color: #fff;
  display: grid;
  place-items: center;
  font-family: var(--font-display);
  font-size: 1.8rem;
  font-weight: 700;
}
.head-info h2 {
  margin: 0 0 6px;
  font-size: 1.6rem;
  color: var(--navy);
}

.view {
  margin: 0 0 26px;
  display: grid;
  gap: 2px;
}
.view div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 13px 0;
  border-bottom: 1px solid var(--line);
}
.view dt {
  color: var(--muted);
  font-weight: 500;
}
.view dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
  color: var(--navy);
}

/* ── Seamless Avatar Edit Bar ── */
.avatar-edit-bar {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 22px;
  padding: 8px 14px;
  background: linear-gradient(135deg, #FFF5F9 0%, #FFEBF3 100%);
  border-radius: 999px;
  border: 1px solid var(--line);
}

.current-avatar {
  position: relative;
  width: 50px;
  height: 50px;
  min-width: 50px;
  border-radius: 50%;
  border: 2px solid var(--pink);
  box-shadow: 0 4px 12px rgba(255, 79, 154, 0.25);
  display: grid;
  place-items: center;
  background: #fff;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1);
}
.current-avatar:hover {
  transform: scale(1.06);
}
.preview-pic {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}
.preview-empty {
  color: var(--rose);
}
.upload-badge-inner {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--rose);
  color: #fff;
  display: grid;
  place-items: center;
  border: 1.5px solid #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
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
  opacity: 0.85;
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
</style>
