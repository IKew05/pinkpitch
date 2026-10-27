<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import { X, Loader2 } from 'lucide-vue-next'
import { initials } from '../utils/jersey'

const ALL_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const CATEGORIES = ['Premier League', 'La Liga', 'Bundesliga', 'Serie A', 'Ligue 1', 'National Team', 'Other']

const props = defineProps({ product: { type: Object, default: null }, saving: Boolean, serverError: { type: String, default: '' } })
const emit = defineEmits(['save', 'close'])

const p = props.product
const form = reactive({
  name: p?.name ?? '', teamName: p?.teamName ?? '', season: p?.season ?? '2025/26',
  category: p?.category ?? 'Premier League', description: p?.description ?? '',
  price: p?.price ?? '', sizes: p ? [...p.sizes] : [...ALL_SIZES], color: p?.color ?? '',
  stock: p?.stock ?? 10, imageUrl: p?.imageUrl ?? '', isActive: p?.isActive ?? true,
  primary: p?.kit?.primary ?? '#FF4F9A', secondary: p?.kit?.secondary ?? '#FFFFFF',
})
const errors = reactive({})
const dialog = ref(null)

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  if (!form.name.trim()) errors.name = 'กรุณากรอกชื่อสินค้า'
  if (!form.teamName.trim()) errors.teamName = 'กรุณากรอกชื่อทีม'
  if (!form.season.trim()) errors.season = 'กรุณากรอกฤดูกาล'
  if (!form.description.trim()) errors.description = 'กรุณากรอกรายละเอียดสินค้า'
  if (form.price === '' || !(Number(form.price) > 0)) errors.price = 'ราคาต้องมากกว่า 0'
  if (!form.color.trim()) errors.color = 'กรุณากรอกสี'
  if (!form.sizes.length) errors.sizes = 'เลือกอย่างน้อย 1 ไซซ์'
  if (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = 'สต็อกต้องเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป'
  if (form.imageUrl && !/^(https?:\/\/|\/)/.test(form.imageUrl.trim())) errors.imageUrl = 'ใส่ URL (https://...) หรือพาธ เช่น /images/ไฟล์.jpg'
  return !Object.keys(errors).length
}

function submit() {
  if (props.saving || !validate()) return
  emit('save', {
    name: form.name.trim(), teamName: form.teamName.trim(), season: form.season.trim(), category: form.category,
    description: form.description.trim(), price: Number(form.price), sizes: ALL_SIZES.filter((s) => form.sizes.includes(s)),
    color: form.color.trim(), stock: Number(form.stock), imageUrl: form.imageUrl.trim(), isActive: form.isActive,
    kit: { ...(p?.kit || {}), primary: form.primary, secondary: form.secondary, pattern: p?.kit?.pattern || 'plain', label: p?.kit?.label || initials(form.teamName) },
  })
}
const onKey = (e) => { if (e.key === 'Escape' && !props.saving) emit('close') }
onMounted(() => { document.addEventListener('keydown', onKey); dialog.value?.querySelector('input')?.focus() })
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="modal-backdrop" @mousedown.self="!saving && emit('close')">
    <div ref="dialog" class="modal" role="dialog" aria-modal="true" aria-labelledby="pf-title">
      <div class="row row-between head">
        <h2 id="pf-title">{{ product ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่' }}</h2>
        <button class="btn btn-ghost icon-btn" aria-label="ปิด" :disabled="saving" @click="emit('close')"><X :size="20" /></button>
      </div>
      <div v-if="serverError" class="alert alert-error" role="alert">{{ serverError }}</div>
      <form novalidate @submit.prevent="submit">
        <div class="field"><label for="pf-name">ชื่อสินค้า</label><input id="pf-name" v-model="form.name" class="input" :class="{ 'is-invalid': errors.name }" /><p v-if="errors.name" class="error-text">{{ errors.name }}</p></div>
        <div class="grid-2">
          <div class="field"><label for="pf-team">ชื่อทีม</label><input id="pf-team" v-model="form.teamName" class="input" :class="{ 'is-invalid': errors.teamName }" /><p v-if="errors.teamName" class="error-text">{{ errors.teamName }}</p></div>
          <div class="field"><label for="pf-season">ฤดูกาล</label><input id="pf-season" v-model="form.season" class="input" :class="{ 'is-invalid': errors.season }" /><p v-if="errors.season" class="error-text">{{ errors.season }}</p></div>
          <div class="field"><label for="pf-cat">หมวดหมู่</label><select id="pf-cat" v-model="form.category" class="select"><option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option></select></div>
          <div class="field"><label for="pf-color">สี</label><input id="pf-color" v-model="form.color" class="input" :class="{ 'is-invalid': errors.color }" /><p v-if="errors.color" class="error-text">{{ errors.color }}</p></div>
          <div class="field"><label for="pf-price">ราคา (บาท)</label><input id="pf-price" v-model="form.price" class="input" type="number" min="0" :class="{ 'is-invalid': errors.price }" /><p v-if="errors.price" class="error-text">{{ errors.price }}</p></div>
          <div class="field"><label for="pf-stock">สต็อก</label><input id="pf-stock" v-model="form.stock" class="input" type="number" min="0" :class="{ 'is-invalid': errors.stock }" /><p v-if="errors.stock" class="error-text">{{ errors.stock }}</p></div>
        </div>
        <div class="field"><label for="pf-desc">รายละเอียด</label><textarea id="pf-desc" v-model="form.description" class="textarea" :class="{ 'is-invalid': errors.description }"></textarea><p v-if="errors.description" class="error-text">{{ errors.description }}</p></div>
        <div class="field">
          <span class="label">ไซซ์ที่มีจำหน่าย</span>
          <div class="chip-row"><label v-for="s in ALL_SIZES" :key="s" class="chk"><input v-model="form.sizes" type="checkbox" :value="s" /> {{ s }}</label></div>
          <p v-if="errors.sizes" class="error-text">{{ errors.sizes }}</p>
        </div>
        <div class="field"><label for="pf-img">URL รูปภาพ (ไม่บังคับ)</label><input id="pf-img" v-model="form.imageUrl" class="input" placeholder="/images/jersey.jpg" :class="{ 'is-invalid': errors.imageUrl }" /><p v-if="errors.imageUrl" class="error-text">{{ errors.imageUrl }}</p><p v-else class="hint">หากเว้นว่างหรือรูปโหลดไม่ได้ ระบบจะแสดงภาพเสื้อตัวอย่างตามสีด้านล่างแทน</p></div>
        <div class="row colors">
          <label class="chk">สีหลักของภาพตัวอย่าง <input v-model="form.primary" type="color" /></label>
          <label class="chk">สีรอง <input v-model="form.secondary" type="color" /></label>
          <label class="chk"><input v-model="form.isActive" type="checkbox" /> เปิดขาย</label>
        </div>
        <div class="row foot">
          <button class="btn btn-primary" type="submit" :disabled="saving"><Loader2 v-if="saving" :size="18" class="spin" /> {{ saving ? 'กำลังบันทึก...' : 'บันทึกสินค้า' }}</button>
          <button class="btn btn-ghost" type="button" :disabled="saving" @click="emit('close')">ยกเลิก</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.head { margin-bottom: 12px; }
.head h2 { margin: 0; }
.chk { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; cursor: pointer; padding: 4px 10px; border: 1.5px solid #E4C3D3; border-radius: 999px; background: #fff; }
.colors { margin: 4px 0 20px; }
.colors input[type='color'] { width: 32px; height: 26px; border: 0; padding: 0; background: none; cursor: pointer; }
</style>
