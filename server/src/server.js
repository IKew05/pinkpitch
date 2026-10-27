import { env } from './config/env.js'
import { checkConnection, closePool } from './config/database.js'
import { createApp } from './app.js'

async function main() {
  try {
    await checkConnection()
  } catch (err) {
    console.error('\n❌ เชื่อมต่อฐานข้อมูล PostgreSQL ไม่สำเร็จ')
    console.error(`   สาเหตุ: ${err.code || ''} ${err.message}`.trimEnd())
    console.error('   ตรวจสอบว่า PostgreSQL เปิดอยู่, สร้างฐานข้อมูล pinkpitch แล้ว และ DATABASE_URL ใน server/.env ถูกต้อง\n')
    process.exit(1)
  }

  const server = createApp().listen(env.port, () => {
    console.log(`✅ เชื่อมต่อฐานข้อมูลสำเร็จ`)
    console.log(`🚀 PinkPitch API: http://localhost:${env.port}/api  |  เอกสาร: http://localhost:${env.port}/api-docs`)
  })

  let closing = false
  const shutdown = (signal) => {
    if (closing) return
    closing = true
    console.log(`\n${signal}: กำลังปิดเซิร์ฟเวอร์...`)
    server.close(async () => {
      await closePool().catch(() => {})
      console.log('ปิดการเชื่อมต่อฐานข้อมูลเรียบร้อย')
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10000).unref()
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main()
