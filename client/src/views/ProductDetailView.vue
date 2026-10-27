<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, ShoppingBag, Minus, Plus } from 'lucide-vue-next'
import JerseyImage from '../components/JerseyImage.vue'
import ProductCard from '../components/ProductCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import { productService } from '../services/productService'
import { cartStore } from '../stores/cartStore'
import { toastStore } from '../stores/toastStore'
import { formatBaht } from '../utils/format'

const route = useRoute()
const product = ref(null)
const related = ref([])
const loading = ref(true)
const error = ref('')
const size = ref('')
const quantity = ref(1)
const errors = ref({ size: '', quantity: '' })

const soldOut = computed(() => !product.value || product.value.stock < 1)
const inCart = computed(() => cartStore.items.filter((i) => i.productId === product.value?.id).reduce((s, i) => s + i.quantity, 0))

async function load() {
  loading.value = true
  error.value = ''
  size.value = ''
  quantity.value = 1
  errors.value = { size: '', quantity: '' }
  try {
    product.value = await productService.get(route.params.id)
    const rel = await productService.list({ category: product.value.category, pageSize: 6 })
    related.value = rel.items.filter((p) => p.id !== product.value.id).slice(0, 4)
  } catch (e) {
    error.value = e.message
    product.value = null
  } finally {
    loading.value = false
  }
}
watch(() => route.params.id, load, { immediate: true })

function setQty(v) {
  const n = Math.floor(Number(v))
  quantity.value = Number.isFinite(n) ? Math.min(Math.max(n, 1), Math.max(product.value.stock, 1)) : 1
  errors.value.quantity = ''
}

function addToCart() {
  errors.value = { size: '', quantity: '' }
  if (!size.value) errors.value.size = 'กรุณาเลือกไซซ์'
  if (!Number.isInteger(quantity.value) || quantity.value < 1 || quantity.value > product.value.stock) {
    errors.value.quantity = `จำนวนต้องอยู่ระหว่าง 1 ถึง ${product.value.stock}`
  }
  if (errors.value.size || errors.value.quantity) return
  const r = cartStore.add(product.value, size.value, quantity.value)
  if (r.ok) {
    toastStore.success('เพิ่มสินค้าลงตะกร้าแล้ว')
  } else {
    errors.value.quantity = r.message
    toastStore.error(r.message)
  }
}
</script>

<template>
  <div class="page container">
    <RouterLink to="/products" class="link-back"><ArrowLeft :size="18" /> กลับไปหน้าสินค้า</RouterLink>

    <LoadingSpinner v-if="loading" label="กำลังโหลดรายละเอียดสินค้า..." />
    <EmptyState v-else-if="error" error title="ไม่พบสินค้า" :text="error"><RouterLink to="/products" class="btn btn-primary">ดูสินค้าทั้งหมด</RouterLink></EmptyState>

    <template v-else-if="product">
      <div class="detail">
        <div class="gallery"><JerseyImage :item="product" /></div>
        <div class="info">
          <div class="row"><span class="badge badge-navy">{{ product.category }}</span><span v-if="soldOut" class="badge badge-danger">สินค้าหมด</span></div>
          <h1>{{ product.name }}</h1>
          <p class="muted">{{ product.teamName }} · ฤดูกาล {{ product.season }}</p>
          <div class="price">{{ formatBaht(product.price) }}</div>
          <p class="desc">{{ product.description }}</p>
          <dl class="specs">
            <div><dt>สี</dt><dd>{{ product.color }}</dd></div>
            <div><dt>สินค้าคงเหลือ</dt><dd>{{ soldOut ? 'หมด' : `${product.stock} ตัว` }}</dd></div>
            <div v-if="inCart"><dt>ในตะกร้าแล้ว</dt><dd>{{ inCart }} ตัว</dd></div>
          </dl>

          <div class="field">
            <span class="label">เลือกไซซ์</span>
            <div class="chip-row" role="group" aria-label="เลือกไซซ์">
              <button v-for="s in product.sizes" :key="s" type="button" class="chip" :class="{ 'is-active': size === s }" :disabled="soldOut" @click="size = s; errors.size = ''">{{ s }}</button>
            </div>
            <p v-if="errors.size" class="error-text">{{ errors.size }}</p>
          </div>

          <div class="field">
            <label for="qty">จำนวน</label>
            <div class="qty">
              <button type="button" class="btn btn-outline icon-btn" aria-label="ลดจำนวน" :disabled="soldOut || quantity <= 1" @click="setQty(quantity - 1)"><Minus :size="16" /></button>
              <input id="qty" class="input qty-input" type="number" min="1" :max="product.stock" :value="quantity" :disabled="soldOut" @change="setQty($event.target.value); $event.target.value = quantity" />
              <button type="button" class="btn btn-outline icon-btn" aria-label="เพิ่มจำนวน" :disabled="soldOut || quantity >= product.stock" @click="setQty(quantity + 1)"><Plus :size="16" /></button>
            </div>
            <p v-if="errors.quantity" class="error-text">{{ errors.quantity }}</p>
          </div>

          <div class="row">
            <button class="btn btn-primary" :disabled="soldOut" @click="addToCart"><ShoppingBag :size="18" /> {{ soldOut ? 'สินค้าหมด' : 'เพิ่มลงตะกร้า' }}</button>
            <RouterLink to="/cart" class="btn btn-outline">ไปที่ตะกร้า</RouterLink>
          </div>
        </div>
      </div>

      <section v-if="related.length" class="section">
        <div class="section-head"><h2>สินค้าที่เกี่ยวข้อง</h2></div>
        <div class="product-grid"><ProductCard v-for="p in related" :key="p.id" :product="p" /></div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.detail { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
.gallery { background: linear-gradient(180deg, var(--pink-soft), #fff); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 40px; aspect-ratio: 1; position: sticky; top: calc(var(--nav-h) + 16px); }
.gallery img { width: 100%; height: 100%; object-fit: contain; }
.info h1 { margin: 12px 0 4px; font-size: clamp(1.7rem, 3vw, 2.3rem); }
.price { font-family: var(--font-display); font-size: 2rem; font-weight: 600; color: var(--rose-deep); margin: 10px 0; }
.desc { max-width: 60ch; }
.specs { display: grid; gap: 8px; margin: 0 0 22px; padding: 14px 16px; background: #fff; border: 1px solid var(--line); border-radius: var(--r-md); }
.specs div { display: flex; justify-content: space-between; gap: 12px; }
.specs dt { color: var(--muted); }
.specs dd { margin: 0; font-weight: 600; }
.qty { display: flex; align-items: center; gap: 8px; }
.qty-input { width: 80px; text-align: center; }
@media (max-width: 860px) {
  .detail { grid-template-columns: 1fr; gap: 24px; }
  .gallery { position: static; padding: 24px; }
}
</style>
