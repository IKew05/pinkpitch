<script setup>
import { ref } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true },
  label: { type: String, required: true },
  error: { type: String, default: '' },
  autocomplete: { type: String, default: 'current-password' },
  hint: { type: String, default: '' },
})
defineEmits(['update:modelValue'])
const visible = ref(false)
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}</label>
    <div class="pw">
      <input :id="id" class="input" :class="{ 'is-invalid': error }" :type="visible ? 'text' : 'password'" :value="modelValue" :autocomplete="autocomplete" :aria-invalid="!!error" @input="$emit('update:modelValue', $event.target.value)" />
      <button type="button" class="pw-toggle" :aria-label="visible ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'" @click="visible = !visible">
        <component :is="visible ? EyeOff : Eye" :size="18" />
      </button>
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
    <p v-else-if="hint" class="hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.pw { position: relative; }
.pw .input { padding-right: 46px; }
.pw-toggle { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 34px; height: 34px; border: 0; background: none; border-radius: 50%; cursor: pointer; color: var(--muted); display: grid; place-items: center; }
.pw-toggle:hover { background: var(--pink-soft); color: var(--ink); }
</style>
