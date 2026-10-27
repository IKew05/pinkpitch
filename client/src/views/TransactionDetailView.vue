<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import JerseyImage from '../components/JerseyImage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import { transactionService } from '../services/transactionService'
import { authStore } from '../stores/authStore'
import { formatBaht, formatDate, statusLabel, statusClass } from '../utils/format'

const route = useRoute()
const txn = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { txn.value = await transactionService.get(route.params.id) } catch (e) { error.value = e.message } finally { loading.value = false }
}
watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <div class="page container narrow">
    <RouterLink :to="authStore.isAdmin && txn && txn.userId !== authStore.user.id ? `/admin/users/${txn.userId}` : '/transactions'" class="link-back"><ArrowLeft :size="18" /> กลับไปรายการสั่งซื้อ</RouterLink>
    <LoadingSpinner v-if="loading" label="กำลังโหลดรายละเอียด..." />
    <EmptyState v-else-if="error" error title="ไม่พบรายการสั่งซื้อ" :text="error"><RouterLink to="/transactions" class="btn btn-primary">กลับไปรายการสั่งซื้อ</RouterLink></EmptyState>
    <div v-else-if="txn" class="card">
      <div class="row row-between">
        <h1>{{ txn.orderNumber ?? txn.id }}</h1>
        <span class="badge" :class="statusClass(txn.status)">{{ statusLabel(txn.status) }}</span>
      </div>
      <p class="muted">สั่งซื้อเมื่อ {{ formatDate(txn.createdAt) }}<template v-if="txn.customerName"> · โดย {{ txn.customerName }}</template></p>
      <p v-if="txn.isDemo" class="alert alert-info">รายการนี้เป็นข้อมูลทดสอบ ไม่ใช่การซื้อขายจริง</p>

      <div class="table-wrap">
        <table class="table">
          <thead><tr><th>สินค้า</th><th>ไซซ์</th><th class="num">ราคา/ตัว</th><th class="num">จำนวน</th><th class="num">รวม</th></tr></thead>
          <tbody>
            <tr v-for="(i, idx) in txn.items" :key="idx">
              <td><div class="prod"><div class="thumb-box"><JerseyImage :item="i" /></div><div><strong>{{ i.name }}</strong><div class="muted">{{ i.teamName }}</div></div></div></td>
              <td>{{ i.size }}</td>
              <td class="num">{{ formatBaht(i.unitPrice) }}</td>
              <td class="num">{{ i.quantity }}</td>
              <td class="num"><strong>{{ formatBaht(i.unitPrice * i.quantity) }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="total"><span>ยอดรวมทั้งหมด</span><span>{{ formatBaht(txn.totalAmount) }}</span></div>
    </div>
  </div>
</template>

<style scoped>
.narrow { max-width: 900px; }
h1 { font-size: 1.6rem; margin: 0; }
.prod { display: flex; align-items: center; gap: 12px; min-width: 220px; }
.thumb-box { width: 48px; height: 48px; background: var(--pink-light); border-radius: 10px; padding: 4px; flex: none; }
.thumb-box img { width: 100%; height: 100%; object-fit: contain; }
.total { display: flex; justify-content: space-between; margin-top: 18px; font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--rose-deep); }
</style>
