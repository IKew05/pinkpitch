import { env } from './config/env.js'
import { checkConnection, closePool } from './config/database.js'
import { createApp } from './app.js'

async function main() {
  try {
    await checkConnection()
    console.log(`✅ เชื่อมต่อฐานข้อมูลภายนอก (PostgreSQL / pgAdmin) สำเร็จ`)
  } catch (err) {
    console.error('\n❌ ไม่สามารถเชื่อมต่อกับฐานข้อมูลภายนอก (PostgreSQL / pgAdmin) ได้')
    console.error(`   สาเหตุ: ${err.message}`)
    console.error('   กรุณาตรวจสอบว่าเปิด PostgreSQL / pgAdmin แล้ว และ DATABASE_URL ใน server/.env ถูกต้อง\n')
  }

  const server = createApp().listen(env.port, () => {
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
