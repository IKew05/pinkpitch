import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { api, closePool, resetDb, createAdmin, register, login, auth } from './helpers.js'

let admin, alice, bob
before(async () => {
  await resetDb()
  admin = await createAdmin()
  await register('alice@example.com'); await register('bob@example.com')
  alice = await login('alice@example.com'); bob = await login('bob@example.com')
  await api().post('/api/transactions').set(auth(alice.token)).send({ items: [{ productId: 1, size: 'M', quantity: 2 }] })
})
after(closePool)

test('Customer และผู้ไม่ได้ Login เข้า Admin API ไม่ได้', async () => {
  for (const path of ['/api/admin/users', `/api/admin/users/${alice.user.id}/transactions`, '/api/admin/dashboard']) {
    assert.equal((await api().get(path)).status, 401, path)
    assert.equal((await api().get(path).set(auth(alice.token))).status, 403, path)
  }
})

test('Admin ดูรายชื่อสมาชิกและประวัติการซื้อของสมาชิกได้', async () => {
  const users = await api().get('/api/admin/users').set(auth(admin.token))
  assert.equal(users.status, 200)
  assert.equal(users.body.data.length, 3)
  assert.ok(users.body.data.every((u) => u.password_hash === undefined && u.passwordHash === undefined))
  const a = users.body.data.find((u) => u.email === 'alice@example.com')
  assert.equal(a.transactionCount, 1)
  assert.equal(a.totalSpent, 4980)
  const hist = await api().get(`/api/admin/users/${alice.user.id}/transactions`).set(auth(admin.token))
  assert.equal(hist.status, 200)
  assert.equal(hist.body.data.transactions.length, 1)
  assert.equal(hist.body.data.user.email, 'alice@example.com')
  assert.equal((await api().get('/api/admin/users/99999/transactions').set(auth(admin.token))).status, 404)
})

test('Dashboard อ่านตัวเลขจริงจาก PostgreSQL', async () => {
  const res = await api().get('/api/admin/dashboard').set(auth(admin.token))
  assert.equal(res.status, 200)
  const d = res.body.data
  assert.equal(d.productCount, 12)
  assert.equal(d.userCount, 3)
  assert.equal(d.customerCount, 2)
  assert.equal(d.transactionCount, 1)
  assert.equal(d.totalOrderValue, 4980)
  assert.equal(d.recentTransactions.length, 1)
  assert.equal(d.recentTransactions[0].customerName, 'Test User')
})

test('Token ของผู้ใช้ที่ถูกลบออกจากระบบแล้วใช้ไม่ได้ และ role อ่านจาก DB ล่าสุด', async () => {
  const { pool } = await import('./helpers.js')
  await pool.query(`UPDATE users SET role = 'customer' WHERE email = 'admin@test.io'`)
  assert.equal((await api().get('/api/admin/dashboard').set(auth(admin.token))).status, 403)
  await pool.query(`UPDATE users SET role = 'admin' WHERE email = 'admin@test.io'`)
  assert.equal((await api().get('/api/admin/dashboard').set(auth(admin.token))).status, 200)
})

test('ความปลอดภัยทั่วไป: health, 404, JSON เสีย, ไม่เปิดเผยข้อมูลภายใน', async () => {
  const h = await api().get('/api/health')
  assert.equal(h.status, 200)
  assert.equal(h.body.data.database, 'up')
  assert.equal((await api().get('/api/nope')).status, 404)
  const bad = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json')
  assert.equal(bad.status, 400)
  assert.equal(bad.body.success, false)
  assert.ok(!JSON.stringify(bad.body).includes('SyntaxError'))
  assert.equal(h.headers['x-powered-by'], undefined)
  assert.ok(h.headers['x-content-type-options'])
  const sqli = await api().post('/api/auth/login').send({ email: "' OR 1=1 --", password: 'x' })
  assert.ok([401, 422].includes(sqli.status))
  const docs = await api().get('/api-docs/')
  assert.equal(docs.status, 200)
})

test('GET /admin/transactions: Admin เห็นรายการของทุกสมาชิก, Customer ถูกปฏิเสธ, กรองสถานะได้', async () => {
  await api().post('/api/transactions').set(auth(bob.token)).send({ items: [{ productId: 2, size: 'M', quantity: 1 }] })
  assert.equal((await api().get('/api/admin/transactions')).status, 401)
  assert.equal((await api().get('/api/admin/transactions').set(auth(alice.token))).status, 403)
  const res = await api().get('/api/admin/transactions').set(auth(admin.token))
  assert.equal(res.status, 200)
  const names = new Set(res.body.data.map((t) => t.customerName))
  assert.equal(res.body.data.length, 2)
  assert.equal(names.size, 1) // ทั้งสองรายการสร้างด้วยชื่อ 'Test User' เหมือนกัน แต่ userId ต่างกัน
  assert.equal(new Set(res.body.data.map((t) => t.userId)).size, 2)
  assert.equal((await api().get('/api/admin/transactions?status=cancelled').set(auth(admin.token))).body.data.length, 0)
  assert.equal((await api().get('/api/admin/transactions?status=bogus').set(auth(admin.token))).status, 422)
  assert.equal((await api().get('/api/admin/transactions?limit=1').set(auth(admin.token))).body.data.length, 1)
})
