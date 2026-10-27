<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { adminService } from '../../services/adminService'
import { formatBaht, formatDate, statusLabel, statusClass } from '../../utils/format'

const route = useRoute()
const data = ref(null)
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { data.value = await adminService.userTransactions(route.params.userId) } catch (e) { error.value = e.message } finally { loading.value = false }
}
watch(() => route.params.userId, load, { immediate: true })
</script>

<template>
  <div>
    <RouterLink to="/admin/users" class="link-back"><ArrowLeft :size="18" /> กลับไปรายชื่อสมาชิก</RouterLink>
    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="error" error title="โหลดข้อมูลไม่สำเร็จ" :text="error"><button class="btn btn-primary" @click="load">ลองอีกครั้ง</button></EmptyState>
    <template v-else-if="data">
      <div class="page-head"><h1>{{ data.user.fullName }}</h1><p>{{ data.user.email }}</p></div>
      <EmptyState v-if="!data.transactions.length" title="สมาชิกคนนี้ยังไม่มีประวัติการซื้อ" />
      <div v-else class="table-wrap">
        <table class="table">
          <thead><tr><th>หมายเลข</th><th>วันที่</th><th class="num">ชิ้น</th><th class="num">ยอดรวม</th><th>สถานะ</th><th></th></tr></thead>
          <tbody>
            <tr v-for="t in data.transactions" :key="t.id">
              <td><strong>{{ t.orderNumber ?? t.id }}</strong></td>
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
