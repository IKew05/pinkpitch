<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import ProductCard from '../components/ProductCard.vue'
import ProductFilters from '../components/ProductFilters.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import EmptyState from '../components/EmptyState.vue'
import { productService } from '../services/productService'

const PAGE_SIZE = 8
const SIZES = ['S', 'M', 'L', 'XL', 'XXL']
const route = useRoute()
const blank = () => ({ q: '', team: '', category: '', size: '', minPrice: '', maxPrice: '', sort: '' })
const filters = reactive({ ...blank(), ...pickQuery() })
const page = ref(1)
const items = ref([])
const total = ref(0)
const loading = ref(true)
const error = ref('')
const options = reactive({ teams: [], categories: [] })
const showFilters = ref(false)
let timer = null
let requestId = 0

function pickQuery() {
  const out = {}
  ;['q', 'team', 'category', 'size'].forEach((k) => { if (typeof route.query[k] === 'string') out[k] = route.query[k] })
  return out
}

const priceError = computed(() => {
  const { minPrice, maxPrice } = filters
  if ((minPrice !== '' && Number(minPrice) < 0) || (maxPrice !== '' && Number(maxPrice) < 0)) return 'ราคาต้องไม่ติดลบ'
  if (minPrice !== '' && maxPrice !== '' && Number(minPrice) > Number(maxPrice)) return 'ราคาต่ำสุดต้องไม่มากกว่าราคาสูงสุด'
  return ''
})
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))
const activeCount = computed(() => Object.values(filters).filter((v) => v !== '').length)

async function load() {
  if (priceError.value) return
  const id = ++requestId
  loading.value = true
  error.value = ''
  try {
    const res = await productService.list({ ...filters, page: page.value, pageSize: PAGE_SIZE })
    if (id !== requestId) return
    items.value = res.items
    total.value = res.total
  } catch (e) {
    if (id === requestId) error.value = e.message
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch(filters, () => {
  if (page.value !== 1) { page.value = 1; return }
  clearTimeout(timer)
  timer = setTimeout(load, 250)
})
watch(page, () => { load(); window.scrollTo({ top: 0, behavior: 'smooth' }) })
watch(() => route.query, () => {
  if (route.name !== 'products') return
  Object.assign(filters, blank(), pickQuery())
})

function applyFilters(next) { Object.assign(filters, next) }
function reset() { Object.assign(filters, blank()) }

onMounted(async () => {
  load()
  try { Object.assign(options, await productService.getFilterOptions()) } catch { /* ตัวกรองจะว่างเปล่า */ }
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="page container">
    <div class="page-head">
      <h1>สินค้าทั้งหมด</h1>
      <p v-if="!loading && !error">พบสินค้า {{ total }} รายการ</p>
      <p v-else>&nbsp;</p>
    </div>

    <button class="btn btn-outline filter-toggle" @click="showFilters = !showFilters"><SlidersHorizontal :size="16" /> ตัวกรอง<span v-if="activeCount" class="badge badge-pink">{{ activeCount }}</span></button>

    <div class="layout">
      <aside :class="{ open: showFilters }">
        <ProductFilters :filters="filters" :teams="options.teams" :categories="options.categories" :sizes="SIZES" :price-error="priceError" @change="applyFilters" @reset="reset" />
      </aside>

      <section>
        <LoadingSpinner v-if="loading" label="กำลังค้นหาสินค้า..." />
        <EmptyState v-else-if="error" error title="โหลดสินค้าไม่สำเร็จ" :text="error"><button class="btn btn-primary" @click="load">ลองอีกครั้ง</button></EmptyState>
        <EmptyState v-else-if="!items.length" title="ไม่พบสินค้าที่ตรงกับเงื่อนไข" text="ลองเปลี่ยนคำค้นหา หรือล้างตัวกรองเพื่อดูสินค้าทั้งหมด">
          <button class="btn btn-primary" @click="reset">ล้างตัวกรอง</button>
        </EmptyState>
        <template v-else>
          <div class="product-grid"><ProductCard v-for="p in items" :key="p.id" :product="p" /></div>
          <nav v-if="totalPages > 1" class="pager" aria-label="เปลี่ยนหน้า">
            <button class="btn btn-outline icon-btn" aria-label="หน้าก่อนหน้า" :disabled="page <= 1" @click="page--"><ChevronLeft :size="18" /></button>
            <button v-for="n in totalPages" :key="n" class="btn icon-btn" :class="n === page ? 'btn-dark' : 'btn-ghost'" :aria-current="n === page ? 'page' : undefined" @click="page = n">{{ n }}</button>
            <button class="btn btn-outline icon-btn" aria-label="หน้าถัดไป" :disabled="page >= totalPages" @click="page++"><ChevronRight :size="18" /></button>
          </nav>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.layout { display: grid; grid-template-columns: 280px 1fr; gap: 28px; align-items: start; }
aside { position: sticky; top: calc(var(--nav-h) + 16px); }
.filter-toggle { display: none; margin-bottom: 16px; }
.pager { display: flex; justify-content: center; gap: 6px; margin-top: 32px; flex-wrap: wrap; }
@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  aside { position: static; display: none; }
  aside.open { display: block; }
  .filter-toggle { display: inline-flex; }
}
</style>
