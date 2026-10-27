<script setup>
import { ref, computed } from 'vue'
import { ShoppingBag } from 'lucide-vue-next'
import JerseyImage from './JerseyImage.vue'
import { cartStore } from '../stores/cartStore'
import { toastStore } from '../stores/toastStore'
import { formatBaht } from '../utils/format'

const props = defineProps({ product: { type: Object, required: true } })
const size = ref(props.product.sizes.includes('M') ? 'M' : props.product.sizes[0])
const soldOut = computed(() => props.product.stock < 1)
const lowStock = computed(() => props.product.stock > 0 && props.product.stock <= 10)

function addToCart() {
  const r = cartStore.add(props.product, size.value, 1)
  r.ok ? toastStore.success(`เพิ่ม ${props.product.teamName} ไซซ์ ${size.value} ลงตะกร้าแล้ว`) : toastStore.error(r.message)
}
</script>

<template>
  <article class="pcard" :class="{ 'is-soldout': soldOut }">
    <RouterLink :to="`/products/${product.id}`" class="pcard-img" :aria-label="`ดูรายละเอียด ${product.name}`">
      <JerseyImage :item="product" />
      <span class="badge badge-navy cat">{{ product.category }}</span>
      <span v-if="soldOut" class="badge badge-danger flag">สินค้าหมด</span>
      <span v-else-if="lowStock" class="badge badge-warn flag">เหลือ {{ product.stock }} ตัว</span>
    </RouterLink>
    <div class="pcard-body">
      <div class="meta muted">{{ product.teamName }} · {{ product.season }}</div>
      <h3 class="name">{{ product.name }}</h3>
      <div class="price">{{ formatBaht(product.price) }}</div>
      <div class="chip-row sizes" role="group" aria-label="เลือกไซซ์">
        <button v-for="s in product.sizes" :key="s" type="button" class="chip" :class="{ 'is-active': size === s }" :disabled="soldOut" @click="size = s">{{ s }}</button>
      </div>
      <div class="btns">
        <RouterLink :to="`/products/${product.id}`" class="btn btn-outline btn-sm">View Details</RouterLink>
        <button class="btn btn-primary btn-sm" :disabled="soldOut" @click="addToCart"><ShoppingBag :size="16" /> Add to Cart</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.pcard { background: #fff; border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; display: flex; flex-direction: column; transition: box-shadow .2s, transform .2s; }
.pcard:hover { box-shadow: var(--shadow-md); transform: translateY(-3px); }
.pcard-img { position: relative; display: block; background: linear-gradient(180deg, var(--pink-soft), var(--pink-light)); aspect-ratio: 1 / 1; padding: 22px; }
.pcard-img img { width: 100%; height: 100%; object-fit: contain; }
.is-soldout .pcard-img img { filter: grayscale(.85); opacity: .7; }
.cat { position: absolute; top: 12px; left: 12px; }
.flag { position: absolute; top: 12px; right: 12px; }
.pcard-body { padding: 16px 18px 18px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.meta { font-size: .85rem; }
.name { margin: 0; font-size: 1.05rem; }
.price { font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; color: var(--rose-deep); }
.sizes .chip { min-width: 38px; padding: 4px 9px; font-size: .8rem; }
.btns { display: flex; gap: 8px; margin-top: auto; padding-top: 6px; flex-wrap: wrap; }
.btns .btn { flex: 1; white-space: nowrap; }
</style>
