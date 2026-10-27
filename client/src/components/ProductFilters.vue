<script setup>
import { Search, RotateCcw } from 'lucide-vue-next'

const props = defineProps({
  filters: { type: Object, required: true },
  teams: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  sizes: { type: Array, default: () => [] },
  priceError: { type: String, default: '' },
})
const emit = defineEmits(['change', 'reset'])
const set = (key, value) => emit('change', { ...props.filters, [key]: value })
</script>

<template>
  <form class="filters card" @submit.prevent>
    <div class="field">
      <label for="f-q">ค้นหา</label>
      <div class="search">
        <Search :size="18" />
        <input id="f-q" class="input" type="search" placeholder="ชื่อเสื้อหรือทีม" :value="filters.q" @input="set('q', $event.target.value)" />
      </div>
    </div>
    <div class="field">
      <label for="f-cat">ลีก / หมวดหมู่</label>
      <select id="f-cat" class="select" :value="filters.category" @change="set('category', $event.target.value)">
        <option value="">ทั้งหมด</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </div>
    <div class="field">
      <label for="f-team">ทีมฟุตบอล</label>
      <select id="f-team" class="select" :value="filters.team" @change="set('team', $event.target.value)">
        <option value="">ทุกทีม</option>
        <option v-for="t in teams" :key="t" :value="t">{{ t }}</option>
      </select>
    </div>
    <div class="field">
      <span class="label">ไซซ์</span>
      <div class="chip-row">
        <button v-for="s in sizes" :key="s" type="button" class="chip" :class="{ 'is-active': filters.size === s }" @click="set('size', filters.size === s ? '' : s)">{{ s }}</button>
      </div>
    </div>
    <div class="field">
      <span class="label">ช่วงราคา (บาท)</span>
      <div class="price-row">
        <input class="input" type="number" min="0" inputmode="numeric" placeholder="ต่ำสุด" aria-label="ราคาต่ำสุด" :value="filters.minPrice" :class="{ 'is-invalid': priceError }" @input="set('minPrice', $event.target.value)" />
        <span>–</span>
        <input class="input" type="number" min="0" inputmode="numeric" placeholder="สูงสุด" aria-label="ราคาสูงสุด" :value="filters.maxPrice" :class="{ 'is-invalid': priceError }" @input="set('maxPrice', $event.target.value)" />
      </div>
      <p v-if="priceError" class="error-text">{{ priceError }}</p>
    </div>
    <div class="field">
      <label for="f-sort">เรียงลำดับ</label>
      <select id="f-sort" class="select" :value="filters.sort" @change="set('sort', $event.target.value)">
        <option value="">แนะนำ</option>
        <option value="price_asc">ราคา: น้อยไปมาก</option>
        <option value="price_desc">ราคา: มากไปน้อย</option>
      </select>
    </div>
    <button type="button" class="btn btn-outline btn-block" @click="emit('reset')"><RotateCcw :size="16" /> ล้างตัวกรอง</button>
  </form>
</template>

<style scoped>
.filters { padding: 20px; }
.search { position: relative; }
.search svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); }
.search .input { padding-left: 38px; }
.price-row { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: center; }
.price-row .input { padding: 9px 10px; }
</style>
