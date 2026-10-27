import api from './api'

// list รับ params: q, team, category, size, minPrice, maxPrice, sort, page, pageSize, includeInactive
// Backend ตอบ { success, message, data } โดย api.js แกะ data ให้แล้ว => { items, total, page, pageSize }
const real = {
  // แปลงชื่อ Parameter ให้ตรงกับ Backend (q -> search, pageSize -> limit) และตัดค่าว่างทิ้ง
  async list(params = {}) {
    const { q, pageSize, includeInactive, ...rest } = params
    const query = { ...rest, search: q, limit: pageSize, includeInactive: includeInactive ? 'true' : undefined }
    Object.keys(query).forEach((k) => { if (query[k] === '' || query[k] === undefined || query[k] === null) delete query[k] })
    return (await api.get('/products', { params: query })).data
  },
  async get(id) { return (await api.get(`/products/${id}`)).data },
  async create(payload) { return (await api.post('/products', payload)).data },
  async update(id, payload) { return (await api.put(`/products/${id}`, payload)).data },
  async remove(id) { return (await api.delete(`/products/${id}`)).data },
}

export const productService = {
  ...real,
  // ดึงรายชื่อทีมและหมวดหมู่ทั้งหมดสำหรับตัวกรอง
  async getFilterOptions() {
    const { items } = await real.list({ pageSize: 1000 })
    const uniq = (arr) => [...new Set(arr)].sort((a, b) => a.localeCompare(b))
    return { teams: uniq(items.map((p) => p.teamName)), categories: uniq(items.map((p) => p.category)) }
  },
}
