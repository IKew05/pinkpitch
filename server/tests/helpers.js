// ตัวช่วยสำหรับทดสอบ: ใช้ฐานข้อมูลทดสอบแยกต่างหาก (TEST_DATABASE_URL) ห้ามชี้ไปที่ฐานข้อมูลจริง
process.env.NODE_ENV = 'test'
if (!process.env.TEST_DATABASE_URL) {
  throw new Error('ต้องตั้งค่า TEST_DATABASE_URL ให้ชี้ไปที่ฐานข้อมูลทดสอบ เช่น postgresql://postgres:รหัสผ่าน@localhost:5432/pinkpitch_test (ดู README)')
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-test-secret-test-secret-123456'
process.env.BCRYPT_ROUNDS = '4'

const { default: request } = await import('supertest')
const { createApp } = await import('../src/app.js')
const { pool, closePool } = await import('../src/config/database.js')
const bcrypt = (await import('bcryptjs')).default
const fs = await import('node:fs')

export { request, pool, closePool }
export const app = createApp()
export const api = () => request(app)

const sql = (f) => fs.readFileSync(new URL(`../database/${f}`, import.meta.url), 'utf8')

// ล้างข้อมูลทั้งหมดในฐานข้อมูลทดสอบ แล้วสร้างตาราง + สินค้าเริ่มต้นใหม่
export async function resetDb() {
  if (!/test/i.test(new URL(process.env.DATABASE_URL).pathname)) throw new Error('ปฏิเสธการล้างฐานข้อมูลที่ชื่อไม่มีคำว่า test')
  await pool.query('DROP TABLE IF EXISTS transaction_items, transactions, products, users CASCADE')
  await pool.query(sql('schema.sql'))
  await pool.query(sql('seed.sql'))
}

export async function createAdmin(email = 'admin@test.io', password = 'AdminPass-12345') {
  const hash = await bcrypt.hash(password, 4)
  await pool.query(`INSERT INTO users (full_name, email, password_hash, role) VALUES ('Test Admin', $1, $2, 'admin')`, [email, hash])
  return login(email, password)
}

export async function register(email, password = 'Password123', fullName = 'Test User') {
  const res = await api().post('/api/auth/register').send({ fullName, email, password })
  return res
}

export async function login(email, password = 'Password123') {
  const res = await api().post('/api/auth/login').send({ email, password })
  return res.body.data
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` })
