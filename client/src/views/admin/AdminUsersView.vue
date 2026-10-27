<script setup>
import { ref, onMounted } from 'vue'
import LoadingSpinner from '../../components/LoadingSpinner.vue'
import EmptyState from '../../components/EmptyState.vue'
import { adminService } from '../../services/adminService'
import { formatBaht, formatDate } from '../../utils/format'

const users = ref([])
const loading = ref(true)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try { users.value = await adminService.users() } catch (e) { error.value = e.message } finally { loading.value = false }
}
onMounted(load)
</script>

<template>
  <div>
    <div class="page-head"><h1>สมาชิก</h1><p>รายชื่อสมาชิกและยอดการซื้อ</p></div>
    <LoadingSpinner v-if="loading" />
    <EmptyState v-else-if="error" error title="โหลดรายชื่อสมาชิกไม่สำเร็จ" :text="error"><button class="btn btn-primary" @click="load">ลองอีกครั้ง</button></EmptyState>
    <EmptyState v-else-if="!users.length" title="ยังไม่มีสมาชิก" />
    <div v-else class="table-wrap">
      <table class="table">
        <thead><tr><th>ชื่อ</th><th>อีเมล</th><th>สิทธิ์</th><th>สมัครเมื่อ</th><th class="num">รายการซื้อ</th><th class="num">ยอดซื้อรวม</th><th></th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td><strong>{{ u.fullName }}</strong></td>
            <td>{{ u.email }}</td>
            <td><span class="badge" :class="u.role === 'admin' ? 'badge-navy' : 'badge-pink'">{{ u.role === 'admin' ? 'Admin' : 'Customer' }}</span></td>
            <td>{{ u.createdAt ? formatDate(u.createdAt) : '-' }}</td>
            <td class="num">{{ u.transactionCount ?? 0 }}</td>
            <td class="num">{{ formatBaht(u.totalSpent ?? 0) }}</td>
            <td class="num"><RouterLink :to="`/admin/users/${u.id}`" class="btn btn-outline btn-sm">ดูประวัติการซื้อ</RouterLink></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
