<script setup>
import { Minus, Plus, Trash2 } from 'lucide-vue-next'
import JerseyImage from './JerseyImage.vue'
import { cartStore } from '../stores/cartStore'
import { toastStore } from '../stores/toastStore'
import { formatBaht } from '../utils/format'

const props = defineProps({ item: { type: Object, required: true } })

function change(q) {
  cartStore.setQuantity(props.item.productId, props.item.size, q)
}
function remove() {
  cartStore.remove(props.item.productId, props.item.size)
  toastStore.info('นำสินค้าออกจากตะกร้าแล้ว')
}
</script>

<template>
  <div class="ci">
    <RouterLink :to="`/products/${item.productId}`" class="ci-img"><JerseyImage :item="item" /></RouterLink>
    <div class="ci-info">
      <RouterLink :to="`/products/${item.productId}`" class="ci-name">{{ item.name }}</RouterLink>
      <div class="muted">{{ item.teamName }} · {{ item.season }} · ไซซ์ <strong>{{ item.size }}</strong></div>
      <div class="muted">{{ formatBaht(item.price) }} / ตัว</div>
    </div>
    <div class="qty" role="group" :aria-label="`จำนวน ${item.name}`">
      <button class="btn btn-outline icon-btn" aria-label="ลดจำนวน" :disabled="item.quantity <= 1" @click="change(item.quantity - 1)"><Minus :size="16" /></button>
      <input class="input qty-input" type="number" min="1" :max="item.stock" :value="item.quantity" aria-label="จำนวน" @change="change($event.target.value); $event.target.value = item.quantity" />
      <button class="btn btn-outline icon-btn" aria-label="เพิ่มจำนวน" :disabled="item.quantity >= item.stock" @click="change(item.quantity + 1)"><Plus :size="16" /></button>
    </div>
    <div class="ci-total">{{ formatBaht(item.price * item.quantity) }}</div>
    <button class="btn btn-danger icon-btn" aria-label="ลบสินค้า" @click="remove"><Trash2 :size="18" /></button>
  </div>
</template>

<style scoped>
.ci { display: grid; grid-template-columns: 84px 1fr auto 110px 40px; gap: 16px; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--line); }
.ci:last-child { border-bottom: 0; }
.ci-img { background: var(--pink-light); border-radius: var(--r-md); padding: 8px; aspect-ratio: 1; }
.ci-img img { width: 100%; height: 100%; object-fit: contain; }
.ci-info { display: grid; gap: 2px; font-size: .92rem; }
.ci-name { font-family: var(--font-display); font-weight: 500; color: var(--ink); font-size: 1.05rem; }
.qty { display: flex; align-items: center; gap: 6px; }
.qty .icon-btn { width: 34px; height: 34px; }
.qty-input { width: 58px; text-align: center; padding: 6px; }
.ci-total { text-align: right; font-weight: 700; font-family: var(--font-display); }
@media (max-width: 720px) {
  .ci { grid-template-columns: 72px 1fr 40px; }
  .qty { grid-column: 2; }
  .ci-total { grid-column: 2; text-align: left; }
  .ci > .btn-danger { grid-row: 1; grid-column: 3; }
}
</style>
