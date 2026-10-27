import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { api, pool, closePool, resetDb, createAdmin, register, login, auth } from './helpers.js'

let admin, alice, bob
const stockOf = async (id) => (await pool.query('SELECT stock FROM products WHERE id = $1', [id])).rows[0].stock
const counts = async () => (await pool.query('SELECT (SELECT COUNT(*)::int FROM transactions) AS t, (SELECT COUNT(*)::int FROM transaction_items) AS i')).rows[0]

before(async () => {
  await resetDb()
  admin = await createAdmin()
  await register('alice@example.com'); await register('bob@example.com')
  alice = await login('alice@example.com'); bob = await login('bob@example.com')
})
after(closePool)

test('ซื้อสินค้าแล้วมี Transaction + Items, ยอดรวมคำนวณจาก DB และสต็อกลดตามจำนวน', async () => {
  const before1 = await stockOf(1), before4 = await stockOf(4)
  const res = await api().post('/api/transactions').set(auth(alice.token)).send({
    items: [{ productId: 1, size: 'L', quantity: 2 }, { productId: 4, size: 'M', quantity: 1 }],
    total: 1, unitPrice: 1, // พยายามส่งราคามาเอง ต้องถูกเพิกเฉย
  })
  assert.equal(res.status, 201)
  const t = res.body.data
  assert.equal(t.status, 'pending')
  assert.equal(t.totalAmount, 2490 * 2 + 2390)
  assert.equal(t.itemCount, 3)
  assert.equal(t.items.length, 2)
  assert.equal(t.items[0].unitPrice, 2490)

  const dbTxn = (await pool.query('SELECT user_id, total_amount, status FROM transactions WHERE id = $1', [t.id])).rows[0]
  assert.equal(dbTxn.total_amount, 7370)
  assert.equal((await pool.query('SELECT COUNT(*)::int AS n FROM transaction_items WHERE transaction_id = $1', [t.id])).rows[0].n, 2)
  assert.equal(await stockOf(1), before1 - 2)
  assert.equal(await stockOf(4), before4 - 1)
})

test('ต้อง Login ก่อนซื้อ และ Validation ของ items', async () => {
  assert.equal((await api().post('/api/transactions').send({ items: [{ productId: 1, size: 'M', quantity: 1 }] })).status, 401)
  const post = (items) => api().post('/api/transactions').set(auth(alice.token)).send({ items })
  assert.equal((await post([])).status, 422)
  assert.equal((await post([{ productId: 1, size: 'M', quantity: 0 }])).status, 422)
  assert.equal((await post([{ productId: 1, size: 'M', quantity: 1.5 }])).status, 422)
  assert.equal((await post([{ productId: 1, size: 'M', quantity: -3 }])).status, 422)
  assert.equal((await post([{ productId: 1, size: 'XS', quantity: 1 }])).status, 422)
  assert.equal((await post([{ productId: 99999, size: 'M', quantity: 1 }])).status, 409)
})

test('สต็อกไม่พอ: ปฏิเสธทั้งรายการ ไม่มีการบันทึกบางส่วน และสต็อกไม่เปลี่ยน', async () => {
  const c0 = await counts(), s2 = await stockOf(2), s5 = await stockOf(5)
  // สินค้าแรกพอ แต่สินค้าที่สองเกินสต็อก
  const res = await api().post('/api/transactions').set(auth(alice.token)).send({
    items: [{ productId: 2, size: 'M', quantity: 1 }, { productId: 5, size: 'M', quantity: s5 + 1 }],
  })
  assert.equal(res.status, 409)
  assert.deepEqual(await counts(), c0)
  assert.equal(await stockOf(2), s2)
  assert.equal(await stockOf(5), s5)
  // สินค้าหมด (Juventus id 10 มีสต็อก 0)
  const soldOut = await api().post('/api/transactions').set(auth(alice.token)).send({ items: [{ productId: 10, size: 'M', quantity: 1 }] })
  assert.equal(soldOut.status, 409)
  assert.deepEqual(await counts(), c0)
})

test('ซื้อสินค้าเดียวกันหลายไซซ์: นับสต็อกรวม', async () => {
  const s = await stockOf(6)
  const res = await api().post('/api/transactions').set(auth(alice.token)).send({
    items: [{ productId: 6, size: 'S', quantity: s }, { productId: 6, size: 'M', quantity: 1 }],
  })
  assert.equal(res.status, 409)
  assert.equal(await stockOf(6), s)
})

test('ซื้อพร้อมกัน: สต็อกไม่ติดลบ และสำเร็จได้ไม่เกินจำนวนสต็อก', async () => {
  await pool.query('UPDATE products SET stock = 3 WHERE id = 8')
  const attempts = await Promise.all(Array.from({ length: 10 }, (_, i) =>
    api().post('/api/transactions').set(auth(i % 2 ? alice.token : bob.token)).send({ items: [{ productId: 8, size: 'M', quantity: 1 }] })))
  const okCount = attempts.filter((r) => r.status === 201).length
  const failCount = attempts.filter((r) => r.status === 409).length
  assert.equal(okCount, 3)
  assert.equal(failCount, 7)
  assert.equal(await stockOf(8), 0)
  const sold = (await pool.query('SELECT COALESCE(SUM(quantity),0)::int AS n FROM transaction_items WHERE product_id = 8')).rows[0].n
  assert.equal(sold, 3)
})

test('สมาชิกเห็นเฉพาะรายการของตนเอง และอ่านของคนอื่นไม่ได้', async () => {
  const b = await api().post('/api/transactions').set(auth(bob.token)).send({ items: [{ productId: 9, size: 'M', quantity: 1 }] })
  assert.equal(b.status, 201)
  const aliceList = await api().get('/api/transactions').set(auth(alice.token))
  assert.ok(aliceList.body.data.length > 0)
  assert.ok(aliceList.body.data.every((t) => t.userId === alice.user.id))
  assert.ok(!aliceList.body.data.some((t) => t.id === b.body.data.id))
  assert.equal((await api().get(`/api/transactions/${b.body.data.id}`).set(auth(alice.token))).status, 404)
  assert.equal((await api().get(`/api/transactions/${b.body.data.id}`).set(auth(bob.token))).status, 200)
  assert.equal((await api().get(`/api/transactions/${b.body.data.id}`).set(auth(admin.token))).status, 200)
  assert.equal((await api().get('/api/transactions')).status, 401)
})

test('ประวัติการซื้อเก็บราคา ณ เวลาที่ซื้อ แม้สินค้าถูกแก้ราคาภายหลัง', async () => {
  const buy = await api().post('/api/transactions').set(auth(bob.token)).send({ items: [{ productId: 11, size: 'M', quantity: 1 }] })
  const paid = buy.body.data.items[0].unitPrice
  await pool.query('UPDATE products SET price = price + 500, name = $1 WHERE id = 11', ['Renamed'])
  const detail = await api().get(`/api/transactions/${buy.body.data.id}`).set(auth(bob.token))
  assert.equal(detail.body.data.items[0].unitPrice, paid)
  assert.equal(detail.body.data.items[0].name, 'Thailand National Team Jersey')
})
