import { reactive, watch } from 'vue'
import api from '../services/api'

const KEY = 'pinkpitch_cart_v1'
const load = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY))
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

export const cartStore = reactive({
  items: load(),
  serverAvailable: true,
  get count() { return this.items.reduce((s, i) => s + i.quantity, 0) },
  get total() { return this.items.reduce((s, i) => s + i.quantity * i.price, 0) },

  // ตรวจสอบสินค้าในตะกร้ากับฐานข้อมูลภายนอก (PostgreSQL) จริงทุกครั้ง
  async syncWithDatabase() {
    if (!this.items.length) return
    try {
      const res = await api.get('/products', { params: { limit: 1000 } })
      this.serverAvailable = true
      const activeProducts = new Map((res.data.items || []).map((p) => [p.id, p]))
      
      // กรองสินค้าที่ถูกลบออกจาก PostgreSQL หรือไม่ได้เปิดการขายออกทันที
      this.items = this.items.filter((item) => {
        const prod = activeProducts.get(item.productId)
        if (!prod || !prod.isActive) return false
        item.price = prod.price
        item.stock = prod.stock
        item.name = prod.name
        item.teamName = prod.teamName
        item.imageUrl = prod.imageUrl
        return true
      })
    } catch {
      this.serverAvailable = false
    }
  },

  // เพิ่มสินค้าลงตะกร้า พร้อมตรวจสอบไซซ์และสต็อก คืนค่า { ok, message }
  add(product, size, quantity = 1) {
    const qty = Number(quantity)
    if (!size || !product.sizes.includes(size)) return { ok: false, message: 'กรุณาเลือกไซซ์ก่อนเพิ่มลงตะกร้า' }
    if (!Number.isInteger(qty) || qty < 1) return { ok: false, message: 'จำนวนสินค้าไม่ถูกต้อง' }
    if (product.stock < 1) return { ok: false, message: 'สินค้าหมด' }
    const existing = this.items.find((i) => i.productId === product.id && i.size === size)
    const inCart = existing ? existing.quantity : 0
    if (inCart + qty > product.stock) {
      const left = product.stock - inCart
      return { ok: false, message: left > 0 ? `เพิ่มได้อีกสูงสุด ${left} ตัว (สต็อก ${product.stock} ตัว)` : 'จำนวนในตะกร้าเท่ากับสต็อกที่มีแล้ว' }
    }
    if (existing) {
      existing.quantity += qty
      existing.stock = product.stock
    } else {
      this.items.push({
        productId: product.id, size, quantity: qty, name: product.name, teamName: product.teamName,
        season: product.season, price: product.price, stock: product.stock, imageUrl: product.imageUrl, kit: product.kit,
      })
    }
    return { ok: true, message: 'เพิ่มสินค้าลงตะกร้าแล้ว' }
  },
  setQuantity(productId, size, quantity) {
    const item = this.items.find((i) => i.productId === productId && i.size === size)
    if (!item) return
    const q = Math.floor(Number(quantity))
    if (!Number.isFinite(q)) return
    item.quantity = Math.min(Math.max(q, 1), Math.max(item.stock, 1))
  },
  remove(productId, size) {
    this.items = this.items.filter((i) => !(i.productId === productId && i.size === size))
  },
  clear() { this.items = [] },
})

watch(() => cartStore.items, (v) => {
  try { localStorage.setItem(KEY, JSON.stringify(v)) } catch { /* ignore */ }
}, { deep: true })
