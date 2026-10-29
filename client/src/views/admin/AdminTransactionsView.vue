<script setup>
import { ref, watch, onMounted } from 'vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { adminService } from '../../services/adminService'
import { toastStore } from '../../stores/toastStore'
import { STATUS_LABELS, formatBaht, formatDate, statusLabel, statusClass } from '../../utils/format'

const items = ref([])
const status = ref('')
const loading = ref(true)
const updatingId = ref(null)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await adminService.transactions(status.value ? { status: status.value } : {})
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function quickChangeStatus(item, newStatus) {
  if (item.status === newStatus || updatingId.value) return
  updatingId.value = item.id
  try {
    await adminService.updateTransactionStatus(item.id, newStatus)
    item.status = newStatus
    toastStore.success(`อัปเดตคำสั่งซื้อ #${item.orderNumber ?? item.id} เป็น "${statusLabel(newStatus)}" แล้ว`)
  } catch (e) {
    toastStore.error(e.message || 'ไม่สามารถอัปเดตสถานะได้')
  } finally {
    updatingId.value = null
  }
}

onMounted(load)
watch(status, load)
</script>

<template>
  <div>
    <div class="page-head">
      <h1>รายการสั่งซื้อทั้งหมด</h1>
      <p>รายการของทุกสมาชิก เรียงจากใหม่ไปเก่า สามารถกดเปลี่ยนสถานะได้ทันที</p>
    </div>

    <div class="field bar">
      <label for="at-status">ตัวกรองสถานะ</label>
      <select id="at-status" v-model="status" class="select">
        <option value="">ทั้งหมด</option>
        <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="error" error title="โหลดข้อมูลไม่สำเร็จ" :text="error">
      <button class="btn btn-primary" @click="load">ลองอีกครั้ง</button>
    </EmptyState>
    <EmptyState v-else-if="!items.length" title="ไม่พบรายการสั่งซื้อ" text="ยังไม่มีรายการ หรือไม่มีรายการที่ตรงกับสถานะที่เลือก" />
    <div v-else class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>หมายเลข</th>
            <th>สมาชิก</th>
            <th>วันที่</th>
            <th class="num">ชิ้น</th>
            <th class="num">ยอดรวม</th>
            <th>สถานะ</th>
            <th>เปลี่ยนสถานะด่วน</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in items" :key="t.id">
            <td><strong>{{ t.orderNumber ?? t.id }}</strong></td>
            <td><RouterLink :to="`/admin/users/${t.userId}`">{{ t.customerName || `สมาชิก #${t.userId}` }}</RouterLink></td>
            <td>{{ formatDate(t.createdAt) }}</td>
            <td class="num">{{ t.itemCount }}</td>
            <td class="num"><strong>{{ formatBaht(t.totalAmount) }}</strong></td>
            <td><span class="badge" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span></td>
            <td>
              <div class="quick-status-group">
                <button
                  type="button"
                  class="btn-mini"
                  :class="{ active: t.status === 'paid' }"
                  :disabled="updatingId === t.id"
                  title="ชำระเงินเสร็จเรียบร้อย"
                  @click="quickChangeStatus(t, 'paid')"
                >
                  ชำระเงิน
                </button>
                <button
                  type="button"
                  class="btn-mini"
                  :class="{ active: t.status === 'shipped' }"
                  :disabled="updatingId === t.id"
                  title="กำลังจัดส่ง"
                  @click="quickChangeStatus(t, 'shipped')"
                >
                  กำลังส่ง
                </button>
                <button
                  type="button"
                  class="btn-mini"
                  :class="{ active: t.status === 'completed' }"
                  :disabled="updatingId === t.id"
                  title="จัดส่งสำเร็จ"
                  @click="quickChangeStatus(t, 'completed')"
                >
                  ส่งสำเร็จ
                </button>
              </div>
            </td>
            <td class="num">
              <RouterLink :to="`/transactions/${t.id}`" class="btn btn-outline btn-sm">รายละเอียด</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.bar { max-width: 260px; }

.quick-status-group {
  display: inline-flex;
  gap: 4px;
  background: var(--bg-card);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.btn-mini {
  padding: 4px 8px;
  font-size: 0.76rem;
  font-weight: 600;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-mini:hover:not(:disabled) {
  color: var(--text);
  background: rgba(0, 0, 0, 0.04);
}

.btn-mini.active {
  background: var(--rose-deep);
  color: #ffffff;
  border-color: var(--rose-deep);
  box-shadow: 0 2px 6px rgba(224, 30, 90, 0.25);
}

.btn-mini:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
