import fs from 'node:fs/promises'
import { query, withTransaction } from './database.js'

const readSql = (file) => fs.readFile(new URL(`../../database/${file}`, import.meta.url), 'utf8')

// เลขล็อกกันไม่ให้หลายโปรเซสสร้างตารางพร้อมกัน
const INIT_LOCK_ID = 7_310_001

/**
 * เตรียมฐานข้อมูล PostgreSQL (เช่น ที่เปิดดูใน pgAdmin) ให้พร้อมใช้งาน
 *  1) สร้างตาราง users / products / transactions / transaction_items ถ้ายังไม่มี (CREATE ... IF NOT EXISTS ไม่ลบข้อมูลเดิม)
 *  2) ถ้าตาราง products ว่างเปล่า จะเพิ่มสินค้าเริ่มต้นจาก database/seed.sql ให้ 1 ครั้ง (ปิดได้ด้วย seed: false)
 * รันซ้ำได้อย่างปลอดภัย ข้อมูลทั้งหมดถูกบันทึกในฐานข้อมูลจริง ไม่ใช่ข้อมูลจำลอง
 */
export async function initDatabase({ seed = true } = {}) {
  const schemaSql = await readSql('schema.sql')
  await withTransaction(async (client) => {
    await client.query('SELECT pg_advisory_xact_lock($1)', [INIT_LOCK_ID])
    await client.query(schemaSql)
  })

  let seededProducts = 0
  if (seed) {
    const { rows } = await query('SELECT COUNT(*)::int AS n FROM products')
    if (rows[0].n === 0) {
      await query(await readSql('seed.sql'))
      const after = await query('SELECT COUNT(*)::int AS n FROM products')
      seededProducts = after.rows[0].n
    }
  }
  return { seededProducts }
}

// สรุปปลายทางฐานข้อมูลสำหรับแสดงใน log (ไม่แสดงรหัสผ่าน) เพื่อเทียบกับที่เปิดใน pgAdmin
export function describeDatabaseTarget(databaseUrl) {
  try {
    const u = new URL(databaseUrl)
    return `${u.hostname}:${u.port || 5432}/${decodeURIComponent(u.pathname.replace(/^\//, ''))} (user: ${decodeURIComponent(u.username)})`
  } catch {
    return '(อ่าน DATABASE_URL ไม่ได้)'
  }
}
