import api from './api'

// create รับ { items: [{ productId, size, quantity }] } — ราคาและยอดรวมต้องให้ Backend คำนวณเอง
export const transactionService = {
  async create(payload) { return (await api.post('/transactions', payload)).data },
  async list() { return (await api.get('/transactions')).data },
  async get(id) { return (await api.get(`/transactions/${id}`)).data },
  async updateStatus(id, status) { return (await api.patch(`/transactions/${id}/status`, { status })).data },
}
