import axios from 'axios'
import { API_BASE_URL } from '../config'
import { getToken } from '../utils/tokenStorage'

// Axios Instance กลางสำหรับเรียก REST API จริง (ใช้เมื่อ VITE_USE_MOCK_API=false)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// แนบ Authorization Header เมื่อมี Token
api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// แปลง Error จาก Axios ให้เป็นรูปแบบเดียวกันทั้งแอป: { message, status, fieldErrors }
api.interceptors.response.use(
  (res) => {
    // Backend ห่อผลลัพธ์เป็น { success, message, data } — แกะให้ Service ได้ข้อมูลจริงใน res.data
    const body = res.data
    if (body && typeof body === 'object' && body.success === true && 'data' in body) res.data = body.data
    return res
  },
  (err) => {
    const status = err.response?.status
    const data = err.response?.data
    let message = data?.message
    if (!message) {
      if (err.code === 'ECONNABORTED') message = 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'
      else if (!err.response) message = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ'
      else message = 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'
    }
    if (status === 401 && getToken()) window.dispatchEvent(new Event('pinkpitch:unauthorized'))
    const error = new Error(message)
    error.status = status
    error.fieldErrors = data?.errors
    return Promise.reject(error)
  },
)

export default api
