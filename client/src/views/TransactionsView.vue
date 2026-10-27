<script setup>
import { ref, onMounted } from 'vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import { transactionService } from '../services/transactionService'
import { formatBaht, formatDate, statusLabel, statusClass } from '../utils/format'

const items = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { items.value = await transactionService.list() } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <div class="page container">
    <div class="page-head"><h1>รายการสั่งซื้อของฉัน</h1><p>ประวัติการซื้อของคุณทั้งหมด</p></div>
    <LoadingSpinner v-if="loading" label="กำลังโหลดประวัติการซื้อ..." />
    <EmptyState v-else-if="error" error title="โหลดข้อมูลไม่สำเร็จ" :text="error"><button class="btn btn-primary" @click="load">ลองอีกครั้ง</button></EmptyState>
    <EmptyState v-else-if="!items.length" title="ยังไม่มีประวัติการสั่งซื้อ" text="เมื่อคุณสั่งซื้อสินค้า รายการจะแสดงที่นี่">
      <RouterLink to="/products" class="btn btn-primary">เริ่มเลือกสินค้า</RouterLink>
    </EmptyState>
    <div v-else class="table-wrap">
      <table class="table">
        <thead><tr><th>หมายเลขรายการ</th><th>วันที่ซื้อ</th><th class="num">จำนวนรายการ</th><th class="num">ยอดรวม</th><th>สถานะ</th><th></th></tr></thead>
        <tbody>
          <tr v-for="t in items" :key="t.id">
            <td><strong>{{ t.orderNumber ?? t.id }}</strong></td>
            <td>{{ formatDate(t.createdAt) }}</td>
            <td class="num">{{ t.itemCount }} ชิ้น</td>
            <td class="num"><strong>{{ formatBaht(t.totalAmount) }}</strong></td>
            <td><span class="badge" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span></td>
            <td class="num"><RouterLink :to="`/transactions/${t.id}`" class="btn btn-outline btn-sm">View Details</RouterLink></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
