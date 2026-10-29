import { env } from '../config/env.js'

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: 'ไม่พบ API ที่ร้องขอ' })

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  // ข้อผิดพลาดที่เรา throw เอง
  if (err.expose && err.status) {
    return res.status(err.status).json({ success: false, message: err.message, ...(err.errors ? { errors: err.errors } : {}) })
  }
  // JSON body เสีย หรือใหญ่เกินไป
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'รูปแบบ JSON ไม่ถูกต้อง' })
  if (err.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'ข้อมูลที่ส่งมามีขนาดใหญ่เกินไป' })
  // PostgreSQL: connection error (เช่น ยังไม่ได้เปิด PostgreSQL / pgAdmin)
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === '57P01' || err.code === '28P01' || err.message?.includes('ECONNREFUSED') || err.message?.includes('Connection terminated')) {
    return res.status(503).json({
      success: false,
      message: 'ไม่สามารถเชื่อมต่อกับฐานข้อมูลภายนอก (PostgreSQL / pgAdmin) ได้ กรุณาตรวจสอบว่าเปิด PostgreSQL / pgAdmin แล้ว',
    })
  }

  // PostgreSQL: unique / check / foreign key / invalid input
  if (err.code === '23505') return res.status(409).json({ success: false, message: 'ข้อมูลนี้มีอยู่ในระบบแล้ว' })
  if (err.code === '23514' || err.code === '23503' || err.code === '22P02' || err.code === '22003') {
    return res.status(422).json({ success: false, message: 'ข้อมูลไม่ถูกต้องหรือขัดกับเงื่อนไขของระบบ' })
  }

  // ข้อผิดพลาดที่ไม่คาดคิด: บันทึกใน Log ฝั่งเซิร์ฟเวอร์ แต่ไม่ส่งรายละเอียดกลับไปยัง Client
  console.error(`[error] ${req.method} ${req.originalUrl}:`, env.isProd ? err.message : err)
  res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง' })
}
