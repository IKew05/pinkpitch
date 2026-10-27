// สร้างบัญชี Admin จาก ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD ใน server/.env (รหัสผ่านถูก hash ก่อนบันทึก)
//   npm run db:admin                       สร้างถ้ายังไม่มี (ถ้ามีอีเมลนี้อยู่แล้วจะไม่แก้ไขอะไร)
//   npm run db:admin -- --reset-password   ตั้งรหัสผ่านใหม่และยกระดับเป็น admin ให้อีเมลที่มีอยู่
import bcrypt from 'bcryptjs'
import { env } from '../src/config/env.js'
import { pool, closePool } from '../src/config/database.js'

const PLACEHOLDERS = ['replace_with_a_secure_password', 'admin@example.com']
const name = (process.env.ADMIN_NAME || 'PinkPitch Admin').trim()
const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD || ''
const reset = process.argv.includes('--reset-password')

function fail(msg) { console.error(`❌ ${msg}`); process.exitCode = 1 }

try {
  if (!email || !password) throw new Error('ต้องตั้งค่า ADMIN_EMAIL และ ADMIN_PASSWORD ใน server/.env ก่อน')
  if (PLACEHOLDERS.includes(password) || PLACEHOLDERS.includes(email)) throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD ยังเป็นค่าตัวอย่าง กรุณาเปลี่ยนเป็นค่าของคุณเอง')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('ADMIN_EMAIL รูปแบบไม่ถูกต้อง')
  if (password.length < 10) throw new Error('ADMIN_PASSWORD ต้องมีอย่างน้อย 10 ตัวอักษร')
  if (Buffer.byteLength(password) > 72) throw new Error('ADMIN_PASSWORD ยาวเกิน 72 ไบต์')

  const hash = await bcrypt.hash(password, env.bcryptRounds)
  const existing = await pool.query('SELECT id, role FROM users WHERE LOWER(email) = $1', [email])
  if (!existing.rowCount) {
    await pool.query(`INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, 'admin')`, [name, email, hash])
    console.log(`✅ สร้างบัญชี Admin แล้ว: ${email}`)
  } else if (reset) {
    await pool.query(`UPDATE users SET password_hash = $1, role = 'admin' WHERE id = $2`, [hash, existing.rows[0].id])
    console.log(`✅ ตั้งรหัสผ่านใหม่และกำหนดสิทธิ์ admin ให้ ${email} แล้ว`)
  } else {
    console.log(`ℹ️  มีบัญชี ${email} อยู่แล้ว (role: ${existing.rows[0].role}) ไม่มีการแก้ไข — ใช้ --reset-password หากต้องการตั้งรหัสผ่านใหม่`)
  }
} catch (err) {
  fail(err.code === '42P01' ? 'ยังไม่มีตาราง กรุณารัน npm run db:schema ก่อน' : err.message)
} finally {
  await closePool()
}
