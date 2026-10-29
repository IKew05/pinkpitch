import { env } from './config/env.js'
import { checkConnection, closePool } from './config/database.js'
import { createApp } from './app.js'

async function main() {
  try {
    await checkConnection()
  } catch (err) {
    console.error('Database connection error:', err.message)
  }

  const server = createApp().listen(env.port)

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
