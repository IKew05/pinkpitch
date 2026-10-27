<script setup>
import { ref, computed, onMounted } from 'vue'
import { Shirt, Users, Receipt, Banknote } from 'lucide-vue-next'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { adminService } from '../../services/adminService'
import { formatBaht, formatDate, statusLabel, statusClass } from '../../utils/format'

const data = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    data.value = await adminService.dashboard()
  } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)

const stats = computed(() => {
  const d = data.value
  if (!d) return []
  return [
    { label: 'สินค้าทั้งหมด', value: d.productCount, hint: `เปิดขาย ${d.activeProductCount} · หมดสต็อก ${d.outOfStockCount}`, icon: Shirt },
    { label: 'สมาชิก', value: d.userCount, hint: `ลูกค้า ${d.customerCount} คน`, icon: Users },
    { label: 'Transaction', value: d.transactionCount, hint: 'รายการสั่งซื้อทั้งหมด', icon: Receipt },
    { label: 'มูลค่าคำสั่งซื้อรวม', value: formatBaht(d.totalOrderValue), hint: 'ไม่รวมรายการที่ยกเลิก', icon: Banknote },
  ]
})
const recent = computed(() => data.value?.recentTransactions ?? [])
</script>

<template>
  <div>
    <div class="page-head"><h1>ภาพรวมร้านค้า</h1><p>สรุปสินค้า สมาชิก และรายการซื้อล่าสุด</p></div>
    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="error" error title="โหลดข้อมูลไม่สำเร็จ" :text="error"><button class="btn btn-primary" @click="load">ลองอีกครั้ง</button></EmptyState>
    <template v-else>
      <div class="stats">
        <div v-for="s in stats" :key="s.label" class="card stat">
          <component :is="s.icon" :size="24" class="ico" />
          <div><div class="muted">{{ s.label }}</div><div class="val">{{ s.value }}</div><small class="muted">{{ s.hint }}</small></div>
        </div>
      </div>
      <div class="section-head sh"><h2>รายการซื้อล่าสุด</h2><RouterLink to="/admin/transactions" class="btn btn-outline btn-sm">ดูทั้งหมด</RouterLink></div>
      <EmptyState v-if="!recent.length" title="ยังไม่มีรายการซื้อ" text="เมื่อมีลูกค้าสั่งซื้อ รายการจะแสดงที่นี่" />
      <div v-else class="table-wrap">
        <table class="table">
          <thead><tr><th>หมายเลข</th><th>สมาชิก</th><th>วันที่</th><th class="num">ชิ้น</th><th class="num">ยอดรวม</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            <tr v-for="t in recent" :key="t.id">
              <td><strong>{{ t.orderNumber ?? t.id }}</strong></td>
              <td>{{ t.customerName || `สมาชิก #${t.userId}` }}</td>
              <td>{{ formatDate(t.createdAt) }}</td>
              <td class="num">{{ t.itemCount }}</td>
              <td class="num"><strong>{{ formatBaht(t.totalAmount) }}</strong></td>
              <td><span class="badge" :class="statusClass(t.status)">{{ statusLabel(t.status) }}</span></td>
              <td class="num"><RouterLink :to="`/transactions/${t.id}`" class="btn btn-outline btn-sm">รายละเอียด</RouterLink></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.stat { display: flex; gap: 14px; align-items: center; padding: 20px; }
.ico { color: var(--rose); background: var(--pink-soft); padding: 12px; box-sizing: content-box; border-radius: 14px; }
.val { font-family: var(--font-display); font-size: 1.7rem; font-weight: 600; line-height: 1.2; }
.sh { margin-top: 36px; }
</style>
