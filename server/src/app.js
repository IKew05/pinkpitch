import fs from 'node:fs'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'
import { env } from './config/env.js'
import { query } from './config/database.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import transactionRoutes from './routes/transactionRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

export function createApp() {
  const app = express()
  app.disable('x-powered-by')

  // Swagger UI ต้องใช้ inline script จึงปิด CSP เฉพาะเส้นทางเอกสารนี้ (ส่วนอื่นใช้ Helmet ปกติ)
  const openapi = YAML.parse(fs.readFileSync(new URL('./docs/openapi.yaml', import.meta.url), 'utf8'))
  app.use('/api-docs', helmet({ contentSecurityPolicy: false }), swaggerUi.serve, swaggerUi.setup(openapi, { customSiteTitle: 'PinkPitch API Docs' }))

  app.use(helmet())
  // อนุญาตเฉพาะ Origin ของ Frontend ที่ตั้งไว้ใน CLIENT_URL
  app.use(cors({ origin: env.clientUrls }))
  app.use(express.json({ limit: '5mb' }))

  app.get('/api/health', async (req, res) => {
    try {
      await query('SELECT 1')
      res.json({
        success: true,
        message: 'ระบบทำงานปกติ (เชื่อมต่อ pgAdmin / PostgreSQL สำเร็จ)',
        data: {
          status: 'ok',
          database: 'connected (PostgreSQL / pgAdmin)',
          uptimeSeconds: Math.round(process.uptime()),
        },
      })
    } catch (err) {
      res.status(503).json({
        success: false,
        message: 'ยังไม่ได้เชื่อมต่อฐานข้อมูล กรุณาตรวจสอบว่าเปิด pgAdmin / PostgreSQL แล้ว',
        data: { status: 'degraded', database: 'disconnected', error: err.message },
      })
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/products', productRoutes)
  app.use('/api/transactions', transactionRoutes)
  app.use('/api/admin', adminRoutes)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
