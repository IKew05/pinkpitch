<script setup>
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, CreditCard, Truck, CheckCircle2, Clock, Loader2, PackageCheck } from 'lucide-vue-next'
import JerseyImage from '../components/JerseyImage.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import { transactionService } from '../services/transactionService'
import { authStore } from '../stores/authStore'
import { toastStore } from '../stores/toastStore'
import { formatBaht, formatDate, statusLabel, statusClass } from '../utils/format'

const route = useRoute()
const txn = ref(null)
const loading = ref(true)
const updating = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    txn.value = await transactionService.get(route.params.id)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function changeStatus(newStatus) {
  if (!txn.value || updating.value) return
  if (txn.value.status === newStatus) return
  updating.value = true
  try {
    const updated = await transactionService.updateStatus(txn.value.id, newStatus)
    txn.value = updated
    toastStore.success(`อัปเดตสถานะเป็น "${statusLabel(newStatus)}" เรียบร้อยแล้ว`)
  } catch (e) {
    toastStore.error(e.message || 'ไม่สามารถอัปเดตสถานะได้')
  } finally {
    updating.value = false
  }
}

const statusStep = computed(() => {
  const s = txn.value?.status
  if (s === 'pending') return 1
  if (s === 'paid') return 2
  if (s === 'shipped') return 3
  if (s === 'completed') return 4
  return 0
})

watch(() => route.params.id, load, { immediate: true })
</script>

<template>
  <div class="page container narrow">
    <RouterLink :to="authStore.isAdmin && txn && txn.userId !== authStore.user?.id ? `/admin/users/${txn.userId}` : '/transactions'" class="link-back">
      <ArrowLeft :size="18" /> กลับไปรายการสั่งซื้อ
    </RouterLink>

    <LoadingSpinner v-if="loading" label="กำลังโหลดรายละเอียด..." />
    <EmptyState v-else-if="error" error title="ไม่พบรายการสั่งซื้อ" :text="error">
      <RouterLink to="/transactions" class="btn btn-primary">กลับไปรายการสั่งซื้อ</RouterLink>
    </EmptyState>

    <div v-else-if="txn" class="space-y">
      <!-- การ์ดติดตามและจัดการสถานะคำสั่งซื้อ -->
      <div class="card status-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">สถานะรายการสั่งซื้อ</h2>
            <p v-if="authStore.isAdmin" class="panel-desc">
              โหมดผู้ดูแลระบบ: สามารถคลิกปุ่มด้านล่างเพื่ออัปเดตสถานะคำสั่งซื้อได้
            </p>
            <p v-else class="panel-desc">
              ติดตามขั้นตอนและสถานะการจัดส่งสินค้าของคุณ
            </p>
          </div>
          <span class="badge" :class="statusClass(txn.status)">{{ statusLabel(txn.status) }}</span>
        </div>

        <!-- แถบแสดงขั้นตอนความคืบหน้า (Progress Stepper ให้ลูกค้าดูสถานะได้ชัดเจน) -->
        <div class="stepper">
          <div class="step" :class="{ active: statusStep >= 1, current: txn.status === 'pending' }">
            <div class="step-circle"><Clock :size="16" /></div>
            <span class="step-label">รอชำระเงิน</span>
          </div>
          <div class="step-line" :class="{ filled: statusStep >= 2 }"></div>
          <div class="step" :class="{ active: statusStep >= 2, current: txn.status === 'paid' }">
            <div class="step-circle"><CreditCard :size="16" /></div>
            <span class="step-label">ชำระเงินเสร็จ</span>
          </div>
          <div class="step-line" :class="{ filled: statusStep >= 3 }"></div>
          <div class="step" :class="{ active: statusStep >= 3, current: txn.status === 'shipped' }">
            <div class="step-circle"><Truck :size="16" /></div>
            <span class="step-label">กำลังจัดส่ง</span>
          </div>
          <div class="step-line" :class="{ filled: statusStep >= 4 }"></div>
          <div class="step" :class="{ active: statusStep >= 4, current: txn.status === 'completed' }">
            <div class="step-circle"><PackageCheck :size="16" /></div>
            <span class="step-label">จัดส่งสำเร็จ</span>
          </div>
        </div>

        <!-- กรณีลูกค้า: กดได้ถึงแค่ "ชำระเงินเสร็จเรียบร้อย" และดูสถานะเมื่อถึงกำลังจัดส่งหรือจัดส่งสำเร็จแล้ว -->
        <div v-if="!authStore.isAdmin" class="customer-status-section">
          <!-- กรณีสถานะยังรอชำระเงิน: แสดงปุ่มให้ลูกค้ากดชำระเงินเสร็จเรียบร้อย -->
          <div v-if="txn.status === 'pending'" class="customer-action-box">
            <div class="action-text">
              <strong>คำสั่งซื้อพร้อมชำระเงิน</strong>
              <p>เมื่อคุณดำเนินการชำระเงินเรียบร้อยแล้ว กรุณากดปุ่มเพื่อแจ้งยืนยันกับทางร้าน</p>
            </div>
            <button
              type="button"
              class="btn btn-primary btn-customer-pay"
              :disabled="updating"
              @click="changeStatus('paid')"
            >
              <Loader2 v-if="updating" :size="18" class="spin" />
              <CreditCard v-else :size="18" />
              <span>กดชำระเงินเสร็จเรียบร้อย</span>
            </button>
          </div>

          <!-- กรณีสถานะชำระเงินเสร็จเรียบร้อยแล้ว: แสดงข้อความแจ้งเตือนสถานะ -->
          <div v-else-if="txn.status === 'paid'" class="status-info-card info-paid">
            <div class="info-icon"><CreditCard :size="24" /></div>
            <div class="info-content">
              <h4>ชำระเงินเสร็จเรียบร้อยแล้ว</h4>
              <p>ทางร้านได้รับข้อมูลการชำระเงินของคุณแล้ว กำลังเตรียมบรรจุสินค้าและรอการจัดส่ง</p>
            </div>
          </div>

          <!-- กรณีสถานะกำลังจัดส่ง: ลูกค้าดูสถานะได้ชัดเจน -->
          <div v-else-if="txn.status === 'shipped'" class="status-info-card info-shipped">
            <div class="info-icon"><Truck :size="24" /></div>
            <div class="info-content">
              <h4>สินค้าอยู่ระหว่าง กำลังจัดส่ง</h4>
              <p>พัสดุของคุณถูกส่งมอบให้แก่ขนส่งเรียบร้อยแล้ว อยู่ระหว่างการนำส่งถึงคุณ กรุณารอรับการติดต่อจากพนักงานนำส่ง</p>
            </div>
          </div>

          <!-- กรณีสถานะจัดส่งสำเร็จแล้ว: ลูกค้าดูสถานะได้ชัดเจน -->
          <div v-else-if="txn.status === 'completed'" class="status-info-card info-completed">
            <div class="info-icon"><CheckCircle2 :size="24" /></div>
            <div class="info-content">
              <h4>พัสดุ จัดส่งสำเร็จ แล้ว</h4>
              <p>สินค้าจัดส่งถึงมือคุณเรียบร้อยแล้ว ขอบคุณที่ไว้วางใจและเลือกซื้อสินค้ากับ PinkPitch!</p>
            </div>
          </div>
        </div>

        <!-- กรณีแอดมิน: มีปุ่มให้กดเปลี่ยนสถานะได้ครบทั้ง 3 ปุ่ม -->
        <div v-else class="admin-controls">
          <p class="admin-label">แผงควบคุมแอดมิน: เปลี่ยนสถานะคำสั่งซื้อ</p>
          <div class="action-buttons">
            <button
              type="button"
              class="btn status-btn btn-paid"
              :class="{ active: txn.status === 'paid' }"
              :disabled="updating"
              @click="changeStatus('paid')"
            >
              <Loader2 v-if="updating && txn.status !== 'paid'" :size="18" class="spin" />
              <CreditCard v-else :size="18" />
              <span>ชำระเงินเสร็จเรียบร้อย</span>
              <span v-if="txn.status === 'paid'" class="current-tag">สถานะปัจจุบัน</span>
            </button>

            <button
              type="button"
              class="btn status-btn btn-shipped"
              :class="{ active: txn.status === 'shipped' }"
              :disabled="updating"
              @click="changeStatus('shipped')"
            >
              <Loader2 v-if="updating && txn.status !== 'shipped'" :size="18" class="spin" />
              <Truck v-else :size="18" />
              <span>กำลังจัดส่ง</span>
              <span v-if="txn.status === 'shipped'" class="current-tag">สถานะปัจจุบัน</span>
            </button>

            <button
              type="button"
              class="btn status-btn btn-completed"
              :class="{ active: txn.status === 'completed' }"
              :disabled="updating"
              @click="changeStatus('completed')"
            >
              <Loader2 v-if="updating && txn.status !== 'completed'" :size="18" class="spin" />
              <CheckCircle2 v-else :size="18" />
              <span>จัดส่งสำเร็จ</span>
              <span v-if="txn.status === 'completed'" class="current-tag">สถานะปัจจุบัน</span>
            </button>
          </div>
        </div>
      </div>

      <!-- รายละเอียดคำสั่งซื้อ -->
      <div class="card">
        <div class="row row-between header-row">
          <h1>{{ txn.orderNumber ?? txn.id }}</h1>
          <span class="badge" :class="statusClass(txn.status)">{{ statusLabel(txn.status) }}</span>
        </div>
        <p class="muted">
          สั่งซื้อเมื่อ {{ formatDate(txn.createdAt) }}
          <template v-if="txn.customerName"> · โดย {{ txn.customerName }}</template>
        </p>
        <p v-if="txn.isDemo" class="alert alert-info">รายการนี้เป็นข้อมูลทดสอบ ไม่ใช่การซื้อขายจริง</p>

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>ไซซ์</th>
                <th class="num">ราคา/ตัว</th>
                <th class="num">จำนวน</th>
                <th class="num">รวม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(i, idx) in txn.items" :key="idx">
                <td>
                  <div class="prod">
                    <div class="thumb-box"><JerseyImage :item="i" /></div>
                    <div>
                      <strong>{{ i.name }}</strong>
                      <div class="muted">{{ i.teamName }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ i.size }}</td>
                <td class="num">{{ formatBaht(i.unitPrice) }}</td>
                <td class="num">{{ i.quantity }}</td>
                <td class="num"><strong>{{ formatBaht(i.unitPrice * i.quantity) }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="total">
          <span>ยอดรวมทั้งหมด</span>
          <span>{{ formatBaht(txn.totalAmount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.narrow { max-width: 900px; }
.space-y { display: flex; flex-direction: column; gap: 20px; }
h1 { font-size: 1.6rem; margin: 0; }
.header-row { align-items: center; }

/* Status Panel */
.status-panel {
  background: linear-gradient(135deg, #ffffff 0%, var(--pink-light) 100%);
  border: 1px solid var(--pink-subtle);
  border-radius: 16px;
  padding: 24px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}
.panel-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--text);
}
.panel-desc {
  font-size: 0.9rem;
  color: var(--muted);
  margin: 0;
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 24px;
  padding: 0 10px;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  position: relative;
  z-index: 1;
}
.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 2px solid var(--line);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
}
.step-label {
  font-size: 0.8rem;
  color: var(--muted);
  font-weight: 500;
  white-space: nowrap;
}
.step.active .step-circle {
  background: var(--rose-deep);
  border-color: var(--rose-deep);
  color: #fff;
  box-shadow: 0 4px 10px rgba(224, 30, 90, 0.25);
}
.step.active .step-label {
  color: var(--text);
  font-weight: 600;
}
.step.current .step-circle {
  transform: scale(1.1);
  box-shadow: 0 0 0 4px rgba(224, 30, 90, 0.15);
}
.step-line {
  flex: 1;
  height: 3px;
  background: var(--line);
  margin: 0 8px -20px;
  transition: background 0.3s ease;
}
.step-line.filled {
  background: var(--rose-deep);
}

/* Customer Action & Info Cards */
.customer-action-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #ffffff;
  border-radius: 12px;
  border: 1.5px solid var(--pink-subtle);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
@media (max-width: 640px) {
  .customer-action-box { flex-direction: column; align-items: stretch; text-align: center; }
}
.action-text strong {
  display: block;
  font-size: 1rem;
  color: var(--text);
  margin-bottom: 2px;
}
.action-text p {
  margin: 0;
  font-size: 0.88rem;
  color: var(--muted);
}
.btn-customer-pay {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-weight: 600;
  white-space: nowrap;
  background: linear-gradient(135deg, #f02d7d 0%, #d41764 100%);
  box-shadow: 0 4px 14px rgba(212, 23, 100, 0.3);
}
.btn-customer-pay:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(212, 23, 100, 0.4);
}

.status-info-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid transparent;
}
.status-info-card h4 {
  margin: 0 0 4px;
  font-size: 1rem;
  font-weight: 700;
}
.status-info-card p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}
.info-icon {
  flex: none;
  padding-top: 2px;
}

.info-paid {
  background: #fdf2f8;
  border-color: #fbcfe8;
  color: #9d174d;
}
.info-paid .info-icon { color: #db2777; }

.info-shipped {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
}
.info-shipped .info-icon { color: #0284c7; }

.info-completed {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #15803d;
}
.info-completed .info-icon { color: #16a34a; }

/* Admin Controls */
.admin-controls {
  margin-top: 10px;
}
.admin-label {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--muted);
  margin: 0 0 10px;
}
.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
@media (max-width: 640px) {
  .action-buttons { grid-template-columns: 1fr; }
  .stepper { font-size: 0.75rem; }
}

.status-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 0.92rem;
  font-weight: 600;
  border: 1.5px solid var(--line);
  background: #ffffff;
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.status-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.status-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-paid:hover:not(:disabled) {
  border-color: var(--rose-deep);
  color: var(--rose-deep);
  background: rgba(224, 30, 90, 0.05);
}
.btn-paid.active {
  background: linear-gradient(135deg, #f02d7d 0%, #d41764 100%);
  border-color: #d41764;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(212, 23, 100, 0.35);
}

.btn-shipped:hover:not(:disabled) {
  border-color: #0284c7;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.05);
}
.btn-shipped.active {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  border-color: #0369a1;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
}

.btn-completed:hover:not(:disabled) {
  border-color: #16a34a;
  color: #16a34a;
  background: rgba(22, 163, 74, 0.05);
}
.btn-completed.active {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border-color: #15803d;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35);
}

.current-tag {
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  padding: 2px 7px;
  margin-left: 4px;
}

/* Product table details */
.prod { display: flex; align-items: center; gap: 12px; min-width: 220px; }
.thumb-box { width: 48px; height: 48px; background: var(--pink-light); border-radius: 10px; padding: 4px; flex: none; }
.thumb-box img { width: 100%; height: 100%; object-fit: contain; }
.total { display: flex; justify-content: space-between; margin-top: 18px; font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--rose-deep); }
</style>
