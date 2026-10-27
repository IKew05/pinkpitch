import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { api, pool, closePool, resetDb, createAdmin, register, login, auth } from './helpers.js'

let admin, customer
before(async () => {
  await resetDb()
  admin = await createAdmin()
  await register('cust@example.com')
  customer = await login('cust@example.com')
})
after(closePool)

test('อ่านสินค้าได้จาก PostgreSQL (ตรงกับข้อมูลในตาราง)', async () => {
  const res = await api().get('/api/products?limit=100')
  assert.equal(res.status, 200)
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products WHERE is_active')
  assert.equal(res.body.data.total, rows[0].n)
  assert.equal(res.body.data.total, 12)
  // เปลี่ยนข้อมูลใน DB โดยตรง แล้ว API ต้องสะท้อนค่าใหม่ (พิสูจน์ว่าไม่ได้อ่านจาก Mock)
  await pool.query(`UPDATE products SET price = 1234 WHERE id = 1`)
  const one = await api().get('/api/products/1')
  assert.equal(one.body.data.price, 1234)
  await pool.query(`UPDATE products SET price = 2490 WHERE id = 1`)
})

test('ค้นหา กรอง เรียงราคา และแบ่งหน้า', async () => {
  const s = await api().get('/api/products?search=madrid')
  assert.equal(s.body.data.total, 1)
  const like = await api().get('/api/products?search=%25')
  assert.equal(like.body.data.total, 0) // % ถูก escape ไม่ใช่ wildcard
  const cat = await api().get('/api/products?category=Premier%20League&sort=price_asc&limit=100')
  const prices = cat.body.data.items.map((p) => p.price)
  assert.deepEqual(prices, [...prices].sort((a, b) => a - b))
  const range = await api().get('/api/products?minPrice=2500&limit=100')
  assert.ok(range.body.data.items.length > 0 && range.body.data.items.every((p) => p.price >= 2500))
  const sz = await api().get('/api/products?size=XXL&team=Arsenal')
  assert.equal(sz.body.data.total, 1)
  const p1 = await api().get('/api/products?limit=5&page=1')
  const p3 = await api().get('/api/products?limit=5&page=3')
  assert.equal(p1.body.data.items.length, 5)
  assert.equal(p3.body.data.items.length, 2)
  const empty = await api().get('/api/products?search=&team=&minPrice=&sort=')
  assert.equal(empty.body.data.total, 12)
  assert.equal((await api().get('/api/products?minPrice=500&maxPrice=100')).status, 422)
})

test('GET /products/:id: พบ 200, ไม่พบ 404, id ผิดรูปแบบไม่ทำให้ระบบล่ม', async () => {
  assert.equal((await api().get('/api/products/1')).status, 200)
  assert.equal((await api().get('/api/products/99999')).status, 404)
  assert.equal((await api().get('/api/products/abc')).status, 422)
  assert.equal((await api().get('/api/products/1;DROP TABLE users')).status, 422)
})

const newProduct = { name: 'Test Jersey', teamName: 'Test FC', season: '2026', category: 'Other', description: 'd', price: 999.5, sizes: ['M', 'L'], color: 'Pink', stock: 5 }

test('เพิ่ม/แก้ไขสินค้าได้เฉพาะ Admin', async () => {
  assert.equal((await api().post('/api/products').send(newProduct)).status, 401)
  assert.equal((await api().post('/api/products').set(auth(customer.token)).send(newProduct)).status, 403)
  assert.equal((await api().put('/api/products/1').set(auth(customer.token)).send({ price: 1 })).status, 403)
  assert.equal((await api().delete('/api/products/1').set(auth(customer.token))).status, 403)

  const created = await api().post('/api/products').set(auth(admin.token)).send(newProduct)
  assert.equal(created.status, 201)
  const id = created.body.data.id
  const { rows } = await pool.query('SELECT name, price, stock FROM products WHERE id = $1', [id])
  assert.equal(rows[0].name, 'Test Jersey')

  const upd = await api().put(`/api/products/${id}`).set(auth(admin.token)).send({ price: 1100, stock: 9, isActive: false })
  assert.equal(upd.status, 200)
  assert.equal(upd.body.data.price, 1100)
  const row = (await pool.query('SELECT price, stock, is_active FROM products WHERE id = $1', [id])).rows[0]
  assert.deepEqual([row.price, row.stock, row.is_active], [1100, 9, false])

  // สินค้าที่ปิดขาย: ผู้ใช้ทั่วไปไม่เห็น, Admin เห็น
  assert.equal((await api().get(`/api/products/${id}`)).status, 404)
  assert.equal((await api().get(`/api/products/${id}`).set(auth(admin.token))).status, 200)
  const listPublic = await api().get('/api/products?includeInactive=true&limit=100').set(auth(customer.token))
  assert.equal(listPublic.body.data.total, 12)
  const listAdmin = await api().get('/api/products?includeInactive=true&limit=100').set(auth(admin.token))
  assert.equal(listAdmin.body.data.total, 13)
})

test('Validation สินค้า: ราคา/สต็อกติดลบ และชื่อซ้ำในฤดูกาลเดียวกัน', async () => {
  const neg = await api().post('/api/products').set(auth(admin.token)).send({ ...newProduct, name: 'Neg', price: -1, stock: -5 })
  assert.equal(neg.status, 422)
  assert.ok(neg.body.errors.price && neg.body.errors.stock)
  const noSizes = await api().post('/api/products').set(auth(admin.token)).send({ ...newProduct, name: 'NoSize', sizes: [] })
  assert.equal(noSizes.status, 422)
  const dup = await api().post('/api/products').set(auth(admin.token)).send(newProduct)
  assert.equal(dup.status, 409)
  await assert.rejects(pool.query('UPDATE products SET stock = -1 WHERE id = 1'), (e) => e.code === '23514')
})

test('DELETE: ไม่เคยถูกซื้อ = ลบจริง, เคยถูกซื้อ = ปิดการขายและประวัติยังอยู่', async () => {
  const c = await api().post('/api/products').set(auth(admin.token)).send({ ...newProduct, name: 'To Delete' })
  const del = await api().delete(`/api/products/${c.body.data.id}`).set(auth(admin.token))
  assert.equal(del.body.data.deleted, true)
  assert.equal((await pool.query('SELECT 1 FROM products WHERE id = $1', [c.body.data.id])).rowCount, 0)

  const buy = await api().post('/api/transactions').set(auth(customer.token)).send({ items: [{ productId: 3, size: 'M', quantity: 1 }] })
  assert.equal(buy.status, 201)
  const del2 = await api().delete('/api/products/3').set(auth(admin.token))
  assert.equal(del2.status, 200)
  assert.equal(del2.body.data.deactivated, true)
  const p = (await pool.query('SELECT is_active FROM products WHERE id = 3')).rows[0]
  assert.equal(p.is_active, false)
  const detail = await api().get(`/api/transactions/${buy.body.data.id}`).set(auth(customer.token))
  assert.equal(detail.body.data.items[0].name, 'Manchester United Home Jersey')
  assert.equal((await api().delete('/api/products/99999').set(auth(admin.token))).status, 404)
})
