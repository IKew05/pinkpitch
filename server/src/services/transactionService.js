import { query, withTransaction } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import { toTransaction } from '../utils/mappers.js'

const SELECT_TXN = `
  SELECT t.*, u.full_name AS customer_name,
    (SELECT COALESCE(SUM(quantity), 0)::int FROM transaction_items WHERE transaction_id = t.id) AS item_count
  FROM transactions t JOIN users u ON u.id = t.user_id`

async function fetchDetail(runner, id) {
  const txn = (await runner.query(`${SELECT_TXN} WHERE t.id = $1`, [id])).rows[0]
  if (!txn) return null
  const items = (await runner.query('SELECT * FROM transaction_items WHERE transaction_id = $1 ORDER BY id', [id])).rows
  return toTransaction(txn, items)
}

export async function createTransaction(userId, requestedItems) {
  // รวมจำนวนต่อสินค้า (กรณีซื้อสินค้าเดียวกันหลายไซซ์) เพื่อตรวจสต็อกรวม
  const qtyByProduct = new Map()
  for (const it of requestedItems) qtyByProduct.set(it.productId, (qtyByProduct.get(it.productId) || 0) + it.quantity)
  const productIds = [...qtyByProduct.keys()].sort((a, b) => a - b)

  return withTransaction(async (client) => {
    // ล็อกแถวสินค้าตามลำดับ id (ป้องกัน deadlock) แล้วอ่านราคาและสต็อก "จากฐานข้อมูล"
    const { rows } = await client.query('SELECT * FROM products WHERE id = ANY($1::int[]) ORDER BY id FOR UPDATE', [productIds])
    const products = new Map(rows.map((p) => [p.id, p]))

    for (const id of productIds) {
      const p = products.get(id)
      if (!p || !p.is_active) throw new AppError(409, `สินค้ารหัส ${id} ไม่พร้อมจำหน่ายแล้ว`)
      if (p.stock < qtyByProduct.get(id)) {
        throw new AppError(409, p.stock === 0 ? `${p.name} หมดแล้ว` : `${p.name} มีสินค้าไม่เพียงพอ (เหลือ ${p.stock} ตัว)`)
      }
    }
    const lines = requestedItems.map((it) => {
      const p = products.get(it.productId)
      if (!p.sizes.includes(it.size)) throw new AppError(422, `ไซซ์ ${it.size} ไม่มีจำหน่ายสำหรับ ${p.name}`)
      const unitCents = Math.round(p.price * 100)
      return { p, size: it.size, quantity: it.quantity, unitPrice: unitCents / 100, subtotal: (unitCents * it.quantity) / 100 }
    })
    const total = lines.reduce((s, l) => s + Math.round(l.subtotal * 100), 0) / 100

    const txn = (await client.query(
      `INSERT INTO transactions (user_id, total_amount, status) VALUES ($1, $2, 'pending') RETURNING id`, [userId, total],
    )).rows[0]

    for (const l of lines) {
      await client.query(
        `INSERT INTO transaction_items (transaction_id, product_id, product_name, team_name, season, image_url, kit, size, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9, $10, $11)`,
        [txn.id, l.p.id, l.p.name, l.p.team_name, l.p.season, l.p.image_url, l.p.kit ? JSON.stringify(l.p.kit) : null, l.size, l.quantity, l.unitPrice, l.subtotal],
      )
    }
    // ตัดสต็อกแบบมีเงื่อนไข stock >= จำนวน (ชั้นป้องกันเพิ่มเติมนอกเหนือจาก row lock และ CHECK stock >= 0)
    for (const id of productIds) {
      const r = await client.query('UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1', [qtyByProduct.get(id), id])
      if (r.rowCount !== 1) throw new AppError(409, 'สต็อกสินค้าไม่เพียงพอ กรุณาลองใหม่อีกครั้ง')
    }
    return fetchDetail(client, txn.id)
  })
}

export async function listTransactionsForUser(userId) {
  const { rows } = await query(`${SELECT_TXN} WHERE t.user_id = $1 ORDER BY t.created_at DESC, t.id DESC`, [userId])
  return rows.map((r) => toTransaction(r))
}

// สมาชิกทั่วไปเห็นเฉพาะรายการของตนเอง Admin เห็นได้ทุกรายการ (ถ้าไม่มีสิทธิ์ตอบ 404 เพื่อไม่เปิดเผยว่ามีรายการนี้อยู่)
export async function getTransactionForUser(id, user) {
  const detail = await fetchDetail({ query }, id)
  if (!detail || (detail.userId !== user.id && user.role !== 'admin')) throw new AppError(404, 'ไม่พบรายการสั่งซื้อ')
  return detail
}
