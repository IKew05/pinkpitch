import api from './api'

export const adminService = {
  async users() { return (await api.get('/admin/users')).data },
  async userTransactions(userId) { return (await api.get(`/admin/users/${userId}/transactions`)).data },
  async transactions(params = {}) { return (await api.get('/admin/transactions', { params })).data },
  async updateTransactionStatus(id, status) { return (await api.patch(`/transactions/${id}/status`, { status })).data },
  async dashboard() { return (await api.get('/admin/dashboard')).data },
}
