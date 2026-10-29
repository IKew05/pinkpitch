import pg from 'pg'
import { env } from './env.js'

// NUMERIC -> number (ราคา/ยอดรวมมีทศนิยมไม่เกิน 2 ตำแหน่ง ปลอดภัยสำหรับ JS number)
pg.types.setTypeParser(1700, (v) => (v === null ? null : Number(v)))
// COUNT/SUM ที่เป็น BIGINT -> number
pg.types.setTypeParser(20, (v) => (v === null ? null : Number(v)))

export const pool = new pg.Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

pool.on('error', (err) => {
  console.error('[db] pgAdmin/PostgreSQL error:', err.message)
})

export const query = (text, params) => pool.query(text, params)

// ใช้สำหรับงานที่ต้อง BEGIN/COMMIT/ROLLBACK หลายคำสั่งต่อเนื่อง
export async function withTransaction(fn) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    try { await client.query('ROLLBACK') } catch { /* ignore */ }
    throw err
  } finally {
    client.release()
  }
}

export async function checkConnection() {
  const client = await pool.connect()
  try {
    await client.query('SELECT 1')
    return true
  } finally {
    client.release()
  }
}

export const closePool = () => pool.end()
