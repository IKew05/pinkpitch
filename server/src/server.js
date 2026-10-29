import { env } from './config/env.js'
import { checkConnection, closePool } from './config/database.js'
import { createApp } from './app.js'
import { initDatabase, describeDatabaseTarget } from './config/initDb.js'

async function main() {
  const target = describeDatabaseTarget(env.databaseUrl)
  try {
    await checkConnection()
    console.log(`✅ เชื่อมต่อฐานข้อมูลสำเร็จ: ${target}`)
    if (env.autoInitDb) {
      const { seededProducts } = await initDatabase({ seed: env.autoSeed })
      console.log('✅ ตารางพร้อมใช้งาน (users, products, transactions, transaction_items)')
      if (seededProducts) console.log(`✅ ฐานข้อมูลยังไม่มีสินค้า จึงเพิ่มสินค้าเริ่มต้น ${seededProducts} รายการ`)
    }
  } catch (err) {
    console.error(`❌ เชื่อมต่อ/เตรียมฐานข้อมูลไม่สำเร็จ (${target}): ${err.message}`)
    console.error('   ตรวจ DATABASE_URL ใน server/.env ให้ตรงกับเซิร์ฟเวอร์/ฐานข้อมูลที่เปิดใน pgAdmin')
  }

  const server = createApp().listen(env.port)
  console.log(`🚀 PinkPitch API: http://localhost:${env.port}/api  |  เอกสาร: http://localhost:${env.port}/api-docs`)

  let closing = false
  const shutdown = (signal) => {
    if (closing) return
    closing = true
    server.close(async () => {
      await closePool().catch(() => {})
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main()
