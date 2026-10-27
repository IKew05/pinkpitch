// รันไฟล์ .sql กับฐานข้อมูลใน DATABASE_URL โดยไม่ต้องติดตั้ง psql  เช่น: node scripts/runSql.js database/schema.sql
import fs from 'node:fs'
import path from 'node:path'
import { pool, closePool } from '../src/config/database.js'

const file = process.argv[2]
if (!file) { console.error('ระบุไฟล์ SQL ที่ต้องการรัน'); process.exit(1) }
const full = path.resolve(file)

try {
  const sql = fs.readFileSync(full, 'utf8')
  await pool.query(sql)
  console.log(`✅ รัน ${path.relative(process.cwd(), full)} สำเร็จ`)
} catch (err) {
  console.error(`❌ รัน ${file} ไม่สำเร็จ: ${err.message}`)
  process.exitCode = 1
} finally {
  await closePool()
}
