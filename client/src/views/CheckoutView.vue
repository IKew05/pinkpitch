<script setup>
import { ref } from 'vue'
import { CheckCircle2, Loader2, CreditCard } from 'lucide-vue-next'
import JerseyImage from '../components/JerseyImage.vue'
import EmptyState from '../components/EmptyState.vue'
import { cartStore } from '../stores/cartStore'
import { authStore } from '../stores/authStore'
import { toastStore } from '../stores/toastStore'
import { transactionService } from '../services/transactionService'
import { formatBaht, formatDate, statusLabel, statusClass } from '../utils/format'

const submitting = ref(false)
const paying = ref(false)
const error = ref('')
const result = ref(null)

async function confirmOrder() {
  if (submitting.value) return
  error.value = ''
  if (!authStore.isLoggedIn) { error.value = 'กรุณาเข้าสู่ระบบก่อนยืนยันการสั่งซื้อ'; return }
  submitting.value = true
  try {
    const txn = await transactionService.create({
      items: cartStore.items.map((i) => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
    })
    result.value = txn
    cartStore.clear() // ล้างตะกร้าเฉพาะเมื่อได้รับการยืนยันว่าสั่งซื้อสำเร็จ
    toastStore.success('สั่งซื้อสำเร็จ')
  } catch (e) {
    error.value = e.message
    toastStore.error('สั่งซื้อไม่สำเร็จ')
  } finally {
    submitting.value = false
  }
}

async function markAsPaid() {
  if (!result.value || paying.value) return
  paying.value = true
  try {
    const updated = await transactionService.updateStatus(result.value.id, 'paid')
    result.value = updated
    toastStore.success('อัปเดตสถานะเป็น "ชำระเงินเสร็จเรียบร้อย" แล้ว')
  } catch (e) {
    toastStore.error(e.message || 'ไม่สามารถอัปเดตสถานะได้')
  } finally {
    paying.value = false
  }
}
</script>

<template>
  <div class="page container narrow">
    <!-- ผลลัพธ์เมื่อสั่งซื้อสำเร็จ -->
    <div v-if="result" class="card done">
      <CheckCircle2 :size="56" class="ok" />
      <h1>สั่งซื้อสำเร็จ</h1>
      <p v-if="result.status === 'pending'" class="alert alert-info">
        ระบบบันทึกรายการสั่งซื้อของคุณแล้ว (สถานะ: รอชำระเงิน) สามารถกดปุ่มด้านล่างเพื่อยืนยันการชำระเงิน
      </p>
      <p v-else class="alert alert-success">
        ชำระเงินเสร็จเรียบร้อยแล้ว ร้านค้ากำลังเตรียมสินค้าสำหรับการจัดส่ง
      </p>
      <div class="meta">
        <div><span class="muted">หมายเลขรายการ</span><strong>{{ result.orderNumber ?? result.id }}</strong></div>
        <div><span class="muted">สถานะ</span><span class="badge" :class="statusClass(result.status)">{{ statusLabel(result.status) }}</span></div>
        <div><span class="muted">วันที่</span><strong>{{ formatDate(result.createdAt) }}</strong></div>
        <div><span class="muted">ยอดรวม</span><strong>{{ formatBaht(result.totalAmount) }}</strong></div>
      </div>
      <div class="row done-btns">
        <button
          v-if="result.status === 'pending'"
          type="button"
          class="btn btn-primary btn-pay-now"
          :disabled="paying"
          @click="markAsPaid"
        >
          <Loader2 v-if="paying" :size="18" class="spin" />
          <CreditCard v-else :size="18" />
          <span>{{ paying ? 'กำลังดำเนินการ...' : 'กดชำระเงินเสร็จเรียบร้อย' }}</span>
        </button>
        <RouterLink :to="`/transactions/${result.id}`" class="btn" :class="result.status === 'pending' ? 'btn-outline' : 'btn-primary'">
          ดูรายละเอียดและจัดการสถานะ
        </RouterLink>
        <RouterLink to="/products" class="btn btn-outline">เลือกซื้อสินค้าต่อ</RouterLink>
      </div>
    </div>

    <EmptyState v-else-if="!cartStore.items.length" title="ไม่มีสินค้าในตะกร้า" text="เพิ่มสินค้าลงตะกร้าก่อนทำการชำระเงิน">
      <RouterLink to="/products" class="btn btn-primary">ไปเลือกสินค้า</RouterLink>
    </EmptyState>

    <template v-else>
      <div class="page-head"><h1>ยืนยันการสั่งซื้อ</h1><p>ตรวจสอบรายการก่อนกดยืนยัน</p></div>
      <div class="alert alert-info">การยืนยันจะสร้างรายการสั่งซื้อและตัดสต็อกในระบบ โดยยังไม่มีการชำระเงินจริง</div>
      <div v-if="error" class="alert alert-error" role="alert">{{ error }}</div>

      <div class="card">
        <div v-for="i in cartStore.items" :key="`${i.productId}-${i.size}`" class="row-item">
          <div class="img"><JerseyImage :item="i" /></div>
          <div class="grow"><strong>{{ i.name }}</strong><div class="muted">{{ i.teamName }} · ไซซ์ {{ i.size }} · {{ formatBaht(i.price) }} × {{ i.quantity }}</div></div>
          <strong>{{ formatBaht(i.price * i.quantity) }}</strong>
        </div>
        <div class="total"><span>ยอดรวมทั้งหมด</span><span>{{ formatBaht(cartStore.total) }}</span></div>
        <p class="muted small">ผู้สั่งซื้อ: {{ authStore.user?.fullName }} ({{ authStore.user?.email }})</p>
        <div class="row">
          <button class="btn btn-primary" :disabled="submitting" @click="confirmOrder"><Loader2 v-if="submitting" :size="18" class="spin" /> {{ submitting ? 'กำลังดำเนินการ...' : 'ยืนยันการสั่งซื้อ' }}</button>
          <RouterLink to="/cart" class="btn btn-ghost" :class="{ disabled: submitting }">กลับไปแก้ไขตะกร้า</RouterLink>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.narrow { max-width: 780px; }
.row-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.img { width: 60px; height: 60px; background: var(--pink-light); border-radius: 12px; padding: 5px; flex: none; }
.img img { width: 100%; height: 100%; object-fit: contain; }
.grow { flex: 1; min-width: 0; }
.total { display: flex; justify-content: space-between; font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; padding: 18px 0 6px; color: var(--rose-deep); }
.small { font-size: .88rem; margin: 6px 0 16px; }
.done { text-align: center; }
.ok { color: var(--success); }
.meta { display: grid; gap: 10px; text-align: left; max-width: 420px; margin: 16px auto 24px; }
.meta div { display: flex; justify-content: space-between; gap: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--line); align-items: center; }
.done-btns { justify-content: center; flex-wrap: wrap; gap: 10px; }
.disabled { pointer-events: none; opacity: .5; }
.btn-pay-now {
  background: linear-gradient(135deg, #f02d7d 0%, #d41764 100%);
  border-color: #d41764;
  box-shadow: 0 4px 14px rgba(212, 23, 100, 0.3);
}
.btn-pay-now:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(212, 23, 100, 0.4);
}
</style>
