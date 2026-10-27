import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { api, pool, closePool, resetDb, register, login, auth } from './helpers.js'

before(resetDb)
after(closePool)

test('สมัครสมาชิกแล้วมีข้อมูลอยู่ใน PostgreSQL และ Password ถูก hash', async () => {
  const res = await register('Alice@Example.com', 'Password123', 'Alice')
  assert.equal(res.status, 201)
  assert.equal(res.body.data.user.role, 'customer')
  assert.ok(res.body.data.token)
  assert.equal(res.body.data.user.password_hash, undefined)
  assert.equal(res.body.data.user.passwordHash, undefined)

  const { rows } = await pool.query(`SELECT email, password_hash, role FROM users WHERE email = 'alice@example.com'`)
  assert.equal(rows.length, 1)
  assert.notEqual(rows[0].password_hash, 'Password123')
  assert.match(rows[0].password_hash, /^\$2[aby]\$/)
})

test('สมัครด้วย Email ซ้ำไม่ได้ (409) แม้ตัวพิมพ์เล็ก/ใหญ่ต่างกัน', async () => {
  const res = await register('ALICE@example.com')
  assert.equal(res.status, 409)
  assert.ok(res.body.errors.email)
  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM users WHERE LOWER(email) = 'alice@example.com'`)
  assert.equal(rows[0].n, 1)
})

test('Database Constraint ป้องกัน Email ซ้ำแม้ข้ามชั้น API', async () => {
  await assert.rejects(
    pool.query(`INSERT INTO users (full_name, email, password_hash) VALUES ('x', 'ALICE@EXAMPLE.COM', 'h')`),
    (e) => e.code === '23505',
  )
})

test('Validation: ข้อมูลไม่ถูกต้องได้ 422 พร้อมข้อความรายฟิลด์', async () => {
  const res = await api().post('/api/auth/register').send({ fullName: 'A', email: 'bad', password: '123' })
  assert.equal(res.status, 422)
  assert.ok(res.body.errors.fullName && res.body.errors.email && res.body.errors.password)
})

test('ส่ง role มาตอนสมัครไม่ได้ทำให้เป็น admin', async () => {
  const res = await api().post('/api/auth/register').send({ fullName: 'Mallory', email: 'mallory@example.com', password: 'Password123', role: 'admin' })
  assert.equal(res.status, 201)
  assert.equal(res.body.data.user.role, 'customer')
  const { rows } = await pool.query(`SELECT role FROM users WHERE email = 'mallory@example.com'`)
  assert.equal(rows[0].role, 'customer')
})

test('Login ด้วยข้อมูลถูกต้องได้ และ Password ผิดไม่ได้', async () => {
  const good = await api().post('/api/auth/login').send({ email: 'alice@example.com', password: 'Password123' })
  assert.equal(good.status, 200)
  assert.ok(good.body.data.token)
  const bad = await api().post('/api/auth/login').send({ email: 'alice@example.com', password: 'WrongPassword1' })
  assert.equal(bad.status, 401)
  const unknown = await api().post('/api/auth/login').send({ email: 'nobody@example.com', password: 'Password123' })
  assert.equal(unknown.status, 401)
  assert.equal(unknown.body.message, bad.body.message)
})

test('GET /auth/me ต้องมี Token และ Token ปลอมใช้ไม่ได้', async () => {
  assert.equal((await api().get('/api/auth/me')).status, 401)
  assert.equal((await api().get('/api/auth/me').set(auth('fake.token.value'))).status, 401)
  const { token } = await login('alice@example.com')
  const me = await api().get('/api/auth/me').set(auth(token))
  assert.equal(me.status, 200)
  assert.equal(me.body.data.email, 'alice@example.com')
  assert.equal(me.body.data.password_hash, undefined)
})

test('PUT /auth/me แก้ชื่อ/อีเมลได้ แก้ role ไม่ได้ และอีเมลซ้ำถูกปฏิเสธ', async () => {
  const { token } = await login('alice@example.com')
  const res = await api().put('/api/auth/me').set(auth(token)).send({ fullName: 'Alice Updated', email: 'alice@example.com', role: 'admin' })
  assert.equal(res.status, 200)
  assert.equal(res.body.data.fullName, 'Alice Updated')
  assert.equal(res.body.data.role, 'customer')
  const dup = await api().put('/api/auth/me').set(auth(token)).send({ fullName: 'Alice', email: 'mallory@example.com' })
  assert.equal(dup.status, 409)
  const { rows } = await pool.query(`SELECT full_name, role FROM users WHERE email = 'alice@example.com'`)
  assert.equal(rows[0].full_name, 'Alice Updated')
  assert.equal(rows[0].role, 'customer')
})
