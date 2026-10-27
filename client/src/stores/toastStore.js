import { reactive } from 'vue'

let seq = 0
export const toastStore = reactive({
  items: [],
  push(type, message, timeout = 3500) {
    const id = ++seq
    this.items.push({ id, type, message })
    setTimeout(() => this.dismiss(id), timeout)
  },
  success(m) { this.push('success', m) },
  error(m) { this.push('error', m, 5000) },
  info(m) { this.push('info', m) },
  dismiss(id) { this.items = this.items.filter((t) => t.id !== id) },
})
