<script setup>
import { CheckCircle2, XCircle, Info, X } from 'lucide-vue-next'
import { toastStore } from '../stores/toastStore'
const icons = { success: CheckCircle2, error: XCircle, info: Info }
</script>

<template>
  <div class="toasts" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="t in toastStore.items" :key="t.id" class="toast" :class="`toast-${t.type}`" role="status">
        <component :is="icons[t.type] || Info" :size="20" />
        <span>{{ t.message }}</span>
        <button class="toast-close" aria-label="ปิดการแจ้งเตือน" @click="toastStore.dismiss(t.id)"><X :size="16" /></button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts { position: fixed; top: 16px; right: 16px; z-index: 300; display: grid; gap: 10px; width: min(380px, calc(100vw - 32px)); }
.toast { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: var(--r-md); background: var(--navy); color: #fff; box-shadow: 0 12px 30px rgba(32, 36, 58, .3); border-left: 5px solid var(--pink); }
.toast-success { border-left-color: #3ED598; }
.toast-error { border-left-color: #FF6B88; }
.toast span { flex: 1; font-size: .95rem; }
.toast-close { background: none; border: 0; color: #fff; opacity: .7; cursor: pointer; display: grid; padding: 4px; }
.toast-close:hover { opacity: 1; }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(24px); }
</style>
