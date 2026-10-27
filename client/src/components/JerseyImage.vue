<script setup>
import { computed, ref, watch } from 'vue'
import { jerseyDataUri } from '../utils/jersey'

// รับ item ที่มี imageUrl, kit, teamName, name — ถ้าไม่มีรูปหรือรูปโหลดไม่ได้ จะใช้ภาพเสื้อสำรองแทน
const props = defineProps({ item: { type: Object, required: true } })
const failed = ref(false)
watch(() => props.item.imageUrl, () => { failed.value = false })

const fallback = computed(() => jerseyDataUri(props.item.kit, props.item.teamName))
const src = computed(() => (!props.item.imageUrl || failed.value ? fallback.value : props.item.imageUrl))
</script>

<template>
  <img :src="src" :alt="item.name" loading="lazy" @error="failed = true" />
</template>
