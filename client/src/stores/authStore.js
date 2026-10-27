import { reactive } from 'vue'
import { authService } from '../services/authService'
import { setToken, clearToken, getToken } from '../utils/tokenStorage'

let initPromise = null

export const authStore = reactive({
  user: null,
  ready: false,
  get isLoggedIn() { return !!this.user },
  get isAdmin() { return this.user?.role === 'admin' },

  // กู้คืนเซสชันจาก Token (เรียกครั้งเดียวก่อนเข้าหน้าแรก)
  init() {
    if (!initPromise) {
      initPromise = (async () => {
        if (getToken()) {
          try { this.user = await authService.me() } catch { clearToken(); this.user = null }
        }
        this.ready = true
      })()
    }
    return initPromise
  },
  async login(credentials) {
    const { user, token } = await authService.login(credentials)
    setToken(token)
    this.user = user
    return user
  },
  async register(data) {
    const { user, token } = await authService.register(data)
    setToken(token)
    this.user = user
    return user
  },
  async updateProfile(data) {
    this.user = await authService.updateMe(data)
    return this.user
  },
  logout() {
    clearToken()
    this.user = null
  },
})

// Token หมดอายุหรือไม่ถูกต้อง (ตอบกลับ 401 จาก API จริง)
window.addEventListener('pinkpitch:unauthorized', () => authStore.logout())
