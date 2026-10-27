<script setup>
import { Loader2 } from 'lucide-vue-next'
defineProps({ label: { type: String, default: 'กำลังโหลด...' } })
</script>

<template>
  <div class="loading" role="status">
    <Loader2 :size="32" class="spin" />
    <span>{{ label }}</span>
  </div>
</template>

<style scoped>
.loading { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 64px 0; color: var(--rose-deep); font-weight: 600; }
</style>
