// สร้างบัญชีลูกค้าตัวอย่างสำหรับสาธิต/ส่งงาน (ไม่ใช่ Admin)  npm run db:demo
// ปฏิเสธการรันเมื่อ NODE_ENV=production เพราะรหัสผ่านถูกเปิดเผยในเอกสาร
import bcrypt from 'bcryptjs'
import { env } from '../src/config/env.js'
import { pool, closePool } from '../src/config/database.js'

const DEMO = { fullName: 'สมหญิง ใจดี', email: 'demo@pinkpitch.test', password: 'Demo@12345' }

if (env.isProd) { console.error('❌ ห้ามสร้างบัญชีสาธิตใน production'); process.exit(1) }

try {
  const exists = await pool.query('SELECT 1 FROM users WHERE LOWER(email) = $1', [DEMO.email])
  if (exists.rowCount) {
    console.log(`ℹ️  มีบัญชีสาธิต ${DEMO.email} อยู่แล้ว ไม่มีการแก้ไข`)
  } else {
    const hash = await bcrypt.hash(DEMO.password, env.bcryptRounds)
    await pool.query(`INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, 'customer')`, [DEMO.fullName, DEMO.email, hash])
    console.log(`✅ สร้างบัญชีสาธิตแล้ว: ${DEMO.email} / ${DEMO.password}`)
  }
} catch (err) {
  console.error(err.code === '42P01' ? '❌ ยังไม่มีตาราง กรุณารัน npm run db:schema ก่อน' : `❌ ${err.message}`)
  process.exitCode = 1
} finally {
  await closePool()
}
