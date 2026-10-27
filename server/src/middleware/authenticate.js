import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { query } from '../config/database.js'
import { AppError, asyncHandler } from '../utils/AppError.js'

const bearer = (req) => {
  const h = req.headers.authorization || ''
  return h.startsWith('Bearer ') ? h.slice(7).trim() : null
}

async function loadUser(token) {
  const payload = jwt.verify(token, env.jwtSecret, { algorithms: ['HS256'] })
  // ดึงสิทธิ์ล่าสุดจากฐานข้อมูลทุกครั้ง (ไม่เชื่อ role ที่อยู่ใน Token)
  const { rows } = await query('SELECT id, full_name, email, role, created_at, updated_at FROM users WHERE id = $1', [Number(payload.sub)])
  return rows[0] || null
}

export const signToken = (user) =>
  jwt.sign({ sub: String(user.id) }, env.jwtSecret, { algorithm: 'HS256', expiresIn: env.jwtExpiresIn })

// บังคับต้อง Login
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = bearer(req)
  if (!token) throw new AppError(401, 'กรุณาเข้าสู่ระบบก่อนใช้งาน')
  let user
  try {
    user = await loadUser(token)
  } catch {
    throw new AppError(401, 'เซสชันหมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่')
  }
  if (!user) throw new AppError(401, 'ไม่พบบัญชีผู้ใช้นี้แล้ว')
  req.user = user
  next()
})

// ไม่บังคับ Login: ถ้ามี Token ที่ถูกต้องจะใส่ req.user ให้ ถ้าไม่มีหรือไม่ถูกต้องจะถือเป็นผู้เยี่ยมชม
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = bearer(req)
  if (token) {
    try { req.user = (await loadUser(token)) || undefined } catch { /* ถือเป็นผู้เยี่ยมชม */ }
  }
  next()
})
