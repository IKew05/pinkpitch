import { test } from 'node:test'
import assert from 'node:assert/strict'
import { api, pool } from './helpers.js'

test('Health: ตอบ 200 เมื่อฐานข้อมูลปกติ และ 503 (ไม่เปิดเผยรายละเอียดภายใน) เมื่อฐานข้อมูลใช้งานไม่ได้', async () => {
  const ok = await api().get('/api/health')
  assert.equal(ok.status, 200)
  assert.equal(ok.body.data.database, 'up')

  await pool.end() // จำลองฐานข้อมูลล่ม: การคิวรีหลังจากนี้จะล้มเหลว
  const down = await api().get('/api/health')
  assert.equal(down.status, 503)
  assert.equal(down.body.success, false)
  assert.equal(down.body.data.database, 'down')
  assert.ok(!JSON.stringify(down.body).toLowerCase().includes('pool'))

  // endpoint ที่ต้องใช้ DB: ต้องตอบ 500 แบบทั่วไป ไม่ส่ง stack trace/ข้อความภายใน
  const products = await api().get('/api/products')
  assert.equal(products.status, 500)
  assert.equal(products.body.success, false)
  assert.ok(!JSON.stringify(products.body).toLowerCase().includes('pool'))
  assert.equal(products.body.stack, undefined)
})
