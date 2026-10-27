<script setup>
import EmptyState from '../components/EmptyState.vue'
</script>

<template>
  <div class="page container">
    <EmptyState title="ไม่พบหน้าที่คุณต้องการ" text="ลิงก์อาจไม่ถูกต้องหรือหน้านี้ถูกย้ายไปแล้ว">
      <RouterLink to="/" class="btn btn-primary">กลับหน้าแรก</RouterLink>
      <RouterLink to="/products" class="btn btn-outline">ดูสินค้าทั้งหมด</RouterLink>
    </EmptyState>
  </div>
</template>
