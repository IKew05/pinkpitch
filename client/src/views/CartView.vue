<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft, ShoppingCart } from 'lucide-vue-next'
import CartItem from '../components/CartItem.vue'
import EmptyState from '../components/EmptyState.vue'
import { cartStore } from '../stores/cartStore'
import { formatBaht } from '../utils/format'

const router = useRouter()
const checkout = () => router.push('/checkout')
</script>

<template>
  <div class="page container">
    <div class="page-head"><h1>ตะกร้าสินค้า</h1><p v-if="cartStore.items.length">{{ cartStore.count }} ชิ้นในตะกร้า</p></div>

    <EmptyState v-if="!cartStore.items.length" title="ตะกร้าของคุณยังว่างอยู่" text="เลือกเสื้อทีมที่ชอบแล้วเพิ่มลงตะกร้าได้เลย">
      <RouterLink to="/products" class="btn btn-primary"><ShoppingCart :size="18" /> เริ่มเลือกสินค้า</RouterLink>
    </EmptyState>

    <div v-else class="cart-layout">
      <div class="card list">
        <CartItem v-for="i in cartStore.items" :key="`${i.productId}-${i.size}`" :item="i" />
      </div>
      <aside class="card summary">
        <h2>สรุปคำสั่งซื้อ</h2>
        <div class="line"><span>ราคาสินค้า ({{ cartStore.count }} ชิ้น)</span><span>{{ formatBaht(cartStore.total) }}</span></div>
        <div class="line"><span>ค่าจัดส่ง</span><span>ฟรี</span></div>
        <div class="line total"><span>ยอดรวม</span><span>{{ formatBaht(cartStore.total) }}</span></div>
        <button class="btn btn-primary btn-block" @click="checkout">Checkout</button>
        <RouterLink to="/products" class="btn btn-outline btn-block"><ArrowLeft :size="16" /> Continue Shopping</RouterLink>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 24px; align-items: start; }
.list { padding: 8px 24px; }
.summary { display: grid; gap: 12px; position: sticky; top: calc(var(--nav-h) + 16px); }
.summary h2 { margin: 0 0 4px; }
.line { display: flex; justify-content: space-between; gap: 12px; }
.total { font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; border-top: 1px solid var(--line); padding-top: 14px; margin-top: 4px; color: var(--rose-deep); }
@media (max-width: 900px) { .cart-layout { grid-template-columns: 1fr; } .summary { position: static; } }
</style>
