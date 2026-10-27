import * as auth from '../services/authService.js'
import { signToken } from '../middleware/authenticate.js'
import { asyncHandler } from '../utils/AppError.js'
import { ok, created } from '../utils/response.js'

export const register = asyncHandler(async (req, res) => {
  const user = await auth.register(req.body)
  created(res, { user, token: signToken(user) }, 'สมัครสมาชิกสำเร็จ')
})

export const login = asyncHandler(async (req, res) => {
  const user = await auth.verifyCredentials(req.body)
  ok(res, { user, token: signToken(user) }, 'เข้าสู่ระบบสำเร็จ')
})

export const me = (req, res) => ok(res, {
  id: req.user.id, fullName: req.user.full_name, email: req.user.email, role: req.user.role,
  avatarUrl: req.user.avatar_url || '',
  createdAt: req.user.created_at, updatedAt: req.user.updated_at,
}, 'ดึงข้อมูลผู้ใช้สำเร็จ')

export const updateMe = asyncHandler(async (req, res) => {
  ok(res, await auth.updateProfile(req.user.id, req.body), 'บันทึกข้อมูลสำเร็จ')
})
