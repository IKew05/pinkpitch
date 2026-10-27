import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'
import * as c from '../controllers/authController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema, updateMeSchema } from '../validators/authValidators.js'

// จำกัดจำนวนครั้งสมัคร/เข้าสู่ระบบต่อ IP เพื่อลดการเดารหัสผ่าน (ปิดในโหมดทดสอบอัตโนมัติ)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.isTest,
  handler: (req, res) => res.status(429).json({ success: false, message: 'ส่งคำขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่' }),
})

const router = Router()
router.post('/register', authLimiter, validate(registerSchema), c.register)
router.post('/login', authLimiter, validate(loginSchema), c.login)
router.get('/me', authenticate, c.me)
router.put('/me', authenticate, validate(updateMeSchema), c.updateMe)
export default router
