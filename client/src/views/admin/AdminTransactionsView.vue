<script setup>
import { ref, watch, onMounted } from 'vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { adminService } from '../../services/adminService'
import { STATUS_LABELS, formatBaht, formatDate, statusLabel, statusClass } from '../../utils/format'

const items = ref([])
const status = ref('')
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { items.value = await adminService.transactions(status.value ? { status: status.value } : {}) } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)
watch(status, load)
</script>

<template>
  <div>
    <div class="page-head"><h1>รายการสั่งซื้อทั้งหมด</h1><p>รายการของทุกสมาชิก เรียงจากใหม่ไปเก่า</p></div>
    <div class="field bar">
      <label for="at-status">สถานะ</label>
      <select id="at-status" v-model="status" class="select">
        <option value="">ทั้งหมด</option>
        <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>
    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="error" error title="โหลดข้อมูลไม่สำเร็จ" :text="error"><button class="btn btn-primary" @click="load">ลองอีกครั้ง</button></EmptyState>
    <EmptyState v-else-if="!items.length" title="ไม่พบรายการสั่งซื้อ" text="ยังไม่มีรายการ หรือไม่มีรายการที่ตรงกับสถานะที่เลือก" />
    <div v-else class="table-wrap">
      <table class="table">
        <thead><tr><th>หมายเลข</th><th>สมาชิก</th><th>วันที่</th><th class="num">ชิ้น</th><th class="num">ยอดรวม</th><th>สถานะ</th><th></th></tr></thead>
        <tbody>
          <tr v-for="t in items" :key="t.id">
            <td><strong>{{ t.orderNumber ?? t.id }}</strong></td>
            <td><RouterLink :to="`/admin/users/${t.userId}`">{{ t.customerName || `สมาชิก #${t.userId}` }}</RouterLink></td>
            <td>{{ formatDate(t.createdAt) }}</td>
            <td class="num">{{ t.itemCount }}</td>
            <td class="num"><strong>{{ formatBaht(t.totalAmount) }}</strong></td>
            <td><span class="badge" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span></td>
            <td class="num"><RouterLink :to="`/transactions/${t.id}`" class="btn btn-outline btn-sm">รายละเอียด</RouterLink></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bar { max-width: 260px; }
</style>
