// ทดสอบ "รีสตาร์ต Server แล้วข้อมูลยังอยู่" ด้วยการเปิด/ปิดโปรเซสเซิร์ฟเวอร์จริง 2 ครั้ง
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { resetDb, closePool, pool } from './helpers.js'

const PORT = 3917
const base = `http://localhost:${PORT}/api`
let child

const startServer = () => new Promise((resolve, reject) => {
  child = spawn(process.execPath, ['src/server.js'], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' }, stdio: ['ignore', 'pipe', 'pipe'],
  })
  const timer = setTimeout(() => reject(new Error('server start timeout')), 15000)
  child.stdout.on('data', (d) => { if (String(d).includes('PinkPitch API')) { clearTimeout(timer); resolve() } })
  child.on('exit', (code) => { clearTimeout(timer); reject(new Error(`server exited early: ${code}`)) })
})
const stopServer = () => new Promise((resolve) => { child.removeAllListeners('exit'); child.once('exit', resolve); child.kill('SIGTERM') })
const post = (path, body, token) => fetch(`${base}${path}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body),
}).then(async (r) => ({ status: r.status, body: await r.json() }))

before(resetDb)
after(async () => { if (child && child.exitCode === null) await stopServer(); await closePool() })

test('รีสตาร์ต Server แล้วสมาชิก สินค้า และประวัติการซื้อยังอยู่', async () => {
  await startServer()
  const reg = await post('/auth/register', { fullName: 'Persist User', email: 'persist@example.com', password: 'Password123' })
  assert.equal(reg.status, 201)
  const buy = await post('/transactions', { items: [{ productId: 12, size: 'M', quantity: 1 }] }, reg.body.data.token)
  assert.equal(buy.status, 201)
  const stockAfterBuy = (await pool.query('SELECT stock FROM products WHERE id = 12')).rows[0].stock
  await stopServer()

  await startServer() // เริ่มโปรเซสใหม่ทั้งหมด
  const login = await post('/auth/login', { email: 'persist@example.com', password: 'Password123' })
  assert.equal(login.status, 200)
  const list = await fetch(`${base}/transactions`, { headers: { Authorization: `Bearer ${login.body.data.token}` } }).then((r) => r.json())
  assert.equal(list.data.length, 1)
  const products = await fetch(`${base}/products?limit=100`).then((r) => r.json())
  assert.equal(products.data.total, 12)
  assert.equal(products.data.items.find((p) => p.id === 12).stock, stockAfterBuy)
  await stopServer()
})
