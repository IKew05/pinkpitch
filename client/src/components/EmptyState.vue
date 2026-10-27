<script setup>
import { PackageOpen, AlertTriangle } from 'lucide-vue-next'
// ใช้แสดงทั้งสถานะว่าง (empty) และสถานะผิดพลาด (error)
defineProps({
  title: { type: String, required: true },
  text: { type: String, default: '' },
  error: { type: Boolean, default: false },
})
</script>

<template>
  <div class="empty" :class="{ 'is-error': error }">
    <component :is="error ? AlertTriangle : PackageOpen" :size="44" />
    <h3>{{ title }}</h3>
    <p v-if="text">{{ text }}</p>
    <div class="row empty-actions"><slot /></div>
  </div>
</template>

<style scoped>
.empty { text-align: center; padding: 56px 20px; background: #fff; border: 2px dashed var(--line); border-radius: var(--r-lg); color: var(--muted); }
.empty svg { color: var(--pink); }
.empty.is-error svg { color: var(--danger); }
.empty h3 { color: var(--ink); margin: 12px 0 6px; }
.empty p { max-width: 420px; margin: 0 auto 16px; }
.empty-actions { justify-content: center; }
</style>
