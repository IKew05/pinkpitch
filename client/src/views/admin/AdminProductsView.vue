<script setup>
import { ref, computed, onMounted } from 'vue'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-vue-next'
import JerseyImage from '../../components/JerseyImage.vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import ProductFormModal from '../../components/ProductFormModal.vue'
import { productService } from '../../services/productService'
import { toastStore } from '../../stores/toastStore'
import { formatBaht } from '../../utils/format'

const items = ref([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const modal = ref({ open: false, product: null })
const saving = ref(false)
const serverError = ref('')
const busyId = ref(null)

const filtered = computed(() => {
  const s = search.value.trim().toLowerCase()
  return s ? items.value.filter((p) => `${p.name} ${p.teamName}`.toLowerCase().includes(s)) : items.value
})

async function load() {
  loading.value = true
  error.value = ''
  try { items.value = (await productService.list({ pageSize: 1000, includeInactive: true })).items } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)

function openForm(product = null) { serverError.value = ''; modal.value = { open: true, product } }
function closeForm() { if (!saving.value) modal.value.open = false }

async function save(data) {
  saving.value = true
  serverError.value = ''
  try {
    if (modal.value.product) {
      await productService.update(modal.value.product.id, data)
      toastStore.success('บันทึกการแก้ไขสินค้าแล้ว')
    } else {
      await productService.create(data)
      toastStore.success('เพิ่มสินค้าใหม่แล้ว')
    }
    modal.value.open = false
    await load()
  } catch (e) { serverError.value = e.message } finally { saving.value = false }
}

async function toggle(p) {
  busyId.value = p.id
  try {
    await productService.update(p.id, { ...p, isActive: !p.isActive })
    toastStore.success(p.isActive ? 'ปิดการขายสินค้าแล้ว' : 'เปิดขายสินค้าแล้ว')
    await load()
  } catch (e) { toastStore.error(e.message) } finally { busyId.value = null }
}

async function remove(p) {
  if (!window.confirm(`ลบ "${p.name}" ?\nหากสินค้าเคยถูกซื้อแล้ว ระบบจะปิดการขายแทนการลบ เพื่อเก็บประวัติการซื้อไว้`)) return
  busyId.value = p.id
  try {
    const r = await productService.remove(p.id)
    if (r?.deactivated) toastStore.info('สินค้านี้มีประวัติการซื้อ จึงปิดการขายแทนการลบ')
    else toastStore.success('ลบสินค้าแล้ว')
    await load()
  } catch (e) { toastStore.error(e.message) } finally { busyId.value = null }
}
</script>

<template>
  <div>
    <div class="page-head row row-between">
      <div><h1>จัดการสินค้า</h1><p>เพิ่ม แก้ไข ปิดการขาย หรือลบสินค้า</p></div>
      <button class="btn btn-primary" @click="openForm()"><Plus :size="18" /> เพิ่มสินค้า</button>
    </div>
    <div class="field bar"><label class="sr-only" for="ap-search">ค้นหาสินค้า</label><input id="ap-search" v-model="search" class="input" type="search" placeholder="ค้นหาชื่อเสื้อหรือทีม" /></div>

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="error" error title="โหลดสินค้าไม่สำเร็จ" :text="error"><button class="btn btn-primary" @click="load">ลองอีกครั้ง</button></EmptyState>
    <EmptyState v-else-if="!filtered.length" title="ไม่พบสินค้า" text="ลองค้นหาด้วยคำอื่น หรือเพิ่มสินค้าใหม่"><button class="btn btn-primary" @click="openForm()">เพิ่มสินค้า</button></EmptyState>
    <div v-else class="table-wrap">
      <table class="table">
        <thead><tr><th>สินค้า</th><th>หมวดหมู่</th><th class="num">ราคา</th><th class="num">สต็อก</th><th>สถานะ</th><th class="num">จัดการ</th></tr></thead>
        <tbody>
          <tr v-for="p in filtered" :key="p.id">
            <td><div class="prod"><div class="thumb"><JerseyImage :item="p" /></div><div><strong>{{ p.name }}</strong><div class="muted">{{ p.teamName }} · {{ p.season }}</div></div></div></td>
            <td>{{ p.category }}</td>
            <td class="num">{{ formatBaht(p.price) }}</td>
            <td class="num"><span :class="p.stock < 1 ? 'badge badge-danger' : ''">{{ p.stock < 1 ? 'หมด' : p.stock }}</span></td>
            <td><span class="badge" :class="p.isActive ? 'badge-success' : 'badge-muted'">{{ p.isActive ? 'เปิดขาย' : 'ปิดขาย' }}</span></td>
            <td class="num">
              <div class="acts">
                <button class="btn btn-outline btn-sm" :disabled="busyId === p.id" @click="openForm(p)"><Pencil :size="14" /> แก้ไข</button>
                <button class="btn btn-ghost btn-sm" :disabled="busyId === p.id" @click="toggle(p)"><component :is="p.isActive ? EyeOff : Eye" :size="14" /> {{ p.isActive ? 'ปิดขาย' : 'เปิดขาย' }}</button>
                <button class="btn btn-danger btn-sm" :disabled="busyId === p.id" @click="remove(p)"><Trash2 :size="14" /> ลบ</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ProductFormModal v-if="modal.open" :product="modal.product" :saving="saving" :server-error="serverError" @save="save" @close="closeForm" />
  </div>
</template>

<style scoped>
.bar { max-width: 360px; }
.prod { display: flex; align-items: center; gap: 12px; min-width: 240px; }
.thumb { width: 48px; height: 48px; background: var(--pink-light); border-radius: 10px; padding: 4px; flex: none; }
.thumb img { width: 100%; height: 100%; object-fit: contain; }
.acts { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
</style>
