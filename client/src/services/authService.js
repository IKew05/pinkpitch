import api from './api'

// Response ที่คาดหวังจาก Backend: login/register => { user, token }, me/updateMe => user
export const authService = {
  async register(payload) { return (await api.post('/auth/register', payload)).data },
  async login(payload) { return (await api.post('/auth/login', payload)).data },
  async me() { return (await api.get('/auth/me')).data },
  async updateMe(payload) { return (await api.put('/auth/me', payload)).data },
}
