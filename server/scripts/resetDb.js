// รีเซ็ตฐานข้อมูลทั้งหมด: ลบตารางทุกตาราง แล้วสร้างใหม่ + ใส่สินค้าเริ่มต้น
// ⚠️ ข้อมูลสมาชิก รายการซื้อ และสินค้าที่แก้ไขไว้จะหายถาวร
//   npm run db:reset -- --yes
import fs from 'node:fs'
import { env } from '../src/config/env.js'
import { pool, closePool } from '../src/config/database.js'

const dbName = new URL(env.databaseUrl).pathname.replace('/', '')

if (!process.argv.includes('--yes')) {
  console.error(`⚠️  คำสั่งนี้จะลบข้อมูลทั้งหมดในฐานข้อมูล "${dbName}" (users, products, transactions, transaction_items)`)
  console.error('   หากแน่ใจ ให้รันซ้ำพร้อม --yes:  npm run db:reset -- --yes')
  process.exit(1)
}
if (env.isProd) {
  console.error('❌ ปฏิเสธการรีเซ็ตฐานข้อมูลเมื่อ NODE_ENV=production')
  process.exit(1)
}

try {
  await pool.query('DROP TABLE IF EXISTS transaction_items, transactions, products, users CASCADE')
  await pool.query(fs.readFileSync(new URL('../database/schema.sql', import.meta.url), 'utf8'))
  await pool.query(fs.readFileSync(new URL('../database/seed.sql', import.meta.url), 'utf8'))
  console.log(`✅ รีเซ็ตฐานข้อมูล "${dbName}" แล้ว (ตารางใหม่ + สินค้าเริ่มต้น)`)
  console.log('   สร้างบัญชี Admin ใหม่ด้วย: npm run db:admin')
} catch (err) {
  console.error(`❌ รีเซ็ตไม่สำเร็จ: ${err.message}`)
  process.exitCode = 1
} finally {
  await closePool()
}
