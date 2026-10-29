// สร้างตาราง (ถ้ายังไม่มี) และเพิ่มสินค้าเริ่มต้น (ถ้า products ว่าง)   รัน: npm run db:init
import { env } from '../src/config/env.js'
import { closePool } from '../src/config/database.js'
import { initDatabase, describeDatabaseTarget } from '../src/config/initDb.js'

try {
  console.log(`ฐานข้อมูล: ${describeDatabaseTarget(env.databaseUrl)}`)
  const { seededProducts } = await initDatabase()
  console.log('✅ ตารางพร้อมใช้งาน: users, products, transactions, transaction_items')
  if (seededProducts) console.log(`✅ เพิ่มสินค้าเริ่มต้น ${seededProducts} รายการ`)
} catch (err) {
  console.error(`❌ เตรียมฐานข้อมูลไม่สำเร็จ: ${err.message}`)
  process.exitCode = 1
} finally {
  await closePool()
}
