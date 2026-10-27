import { AppError } from '../utils/AppError.js'

// ใช้หลัง authenticate เสมอ เช่น authorize('admin')
export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError(401, 'กรุณาเข้าสู่ระบบก่อนใช้งาน'))
  if (!roles.includes(req.user.role)) return next(new AppError(403, 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้'))
  next()
}
