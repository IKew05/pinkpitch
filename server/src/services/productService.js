import { query } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import { toProduct } from '../utils/mappers.js'

// จำนวนที่ขายได้จริงจากประวัติการซื้อ (ไม่นับรายการที่ยกเลิก) ใช้จัดอันดับสินค้ายอดนิยม
const SELECT_PRODUCT = `
  SELECT p.*, COALESCE((
    SELECT SUM(ti.quantity) FROM transaction_items ti
    JOIN transactions t ON t.id = ti.transaction_id
    WHERE ti.product_id = p.id AND t.status <> 'cancelled'
  ), 0)::int AS sold
  FROM products p`

const escapeLike = (s) => s.replace(/[\\%_]/g, (c) => `\\${c}`)

export async function listProducts(q, { includeInactive } = {}) {
  const where = []
  const params = []
  const add = (sql, value) => { params.push(value); where.push(sql.replace('?', `$${params.length}`)) }

  if (!includeInactive) where.push('p.is_active = TRUE')
  if (q.search) {
    params.push(`%${escapeLike(q.search)}%`)
    where.push(`(p.name ILIKE $${params.length} ESCAPE '\\' OR p.team_name ILIKE $${params.length} ESCAPE '\\')`)
  }
  if (q.team) add('p.team_name = ?', q.team)
  if (q.category) add('p.category = ?', q.category)
  if (q.size) add('p.sizes @> ?::jsonb', JSON.stringify([q.size]))
  if (q.minPrice !== undefined) add('p.price >= ?', q.minPrice)
  if (q.maxPrice !== undefined) add('p.price <= ?', q.maxPrice)

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const order = q.sort === 'price_asc' ? 'p.price ASC, p.id ASC' : q.sort === 'price_desc' ? 'p.price DESC, p.id ASC' : 'p.id ASC'

  const total = (await query(`SELECT COUNT(*) AS n FROM products p ${whereSql}`, params)).rows[0].n
  const { rows } = await query(
    `${SELECT_PRODUCT} ${whereSql} ORDER BY ${order} LIMIT ${q.limit} OFFSET ${(q.page - 1) * q.limit}`,
    params,
  )
  return { items: rows.map(toProduct), total, page: q.page, pageSize: q.limit }
}

export async function getProduct(id, { includeInactive } = {}) {
  const { rows } = await query(`${SELECT_PRODUCT} WHERE p.id = $1`, [id])
  if (!rows[0] || (!rows[0].is_active && !includeInactive)) throw new AppError(404, 'ไม่พบสินค้าที่ต้องการ')
  return toProduct(rows[0])
}

const COLUMN = {
  name: 'name', teamName: 'team_name', season: 'season', category: 'category', description: 'description',
  price: 'price', sizes: 'sizes', color: 'color', stock: 'stock', imageUrl: 'image_url',
  isActive: 'is_active', featured: 'featured', kit: 'kit',
}
const JSON_COLS = new Set(['sizes', 'kit'])
const normalize = (key, v) => {
  if (key === 'imageUrl') return v ? v : null
  if (JSON_COLS.has(COLUMN[key])) return v === undefined || v === null ? null : JSON.stringify(v)
  return v
}

export async function createProduct(data) {
  const keys = Object.keys(COLUMN).filter((k) => data[k] !== undefined)
  const cols = keys.map((k) => COLUMN[k])
  const vals = keys.map((k) => normalize(k, data[k]))
  const ph = keys.map((k, i) => (JSON_COLS.has(COLUMN[k]) ? `$${i + 1}::jsonb` : `$${i + 1}`))
  try {
    const { rows } = await query(`INSERT INTO products (${cols.join(', ')}) VALUES (${ph.join(', ')}) RETURNING id`, vals)
    return getProduct(rows[0].id, { includeInactive: true })
  } catch (err) {
    if (err.code === '23505') throw new AppError(409, 'มีสินค้านี้ในฤดูกาลเดียวกันอยู่แล้ว', { name: 'ชื่อสินค้านี้ซ้ำในฤดูกาลเดียวกัน' })
    throw err
  }
}

export async function updateProduct(id, data) {
  const keys = Object.keys(COLUMN).filter((k) => data[k] !== undefined)
  const sets = keys.map((k, i) => `${COLUMN[k]} = $${i + 1}${JSON_COLS.has(COLUMN[k]) ? '::jsonb' : ''}`)
  const vals = keys.map((k) => normalize(k, data[k]))
  try {
    const { rowCount } = await query(`UPDATE products SET ${sets.join(', ')} WHERE id = $${keys.length + 1}`, [...vals, id])
    if (!rowCount) throw new AppError(404, 'ไม่พบสินค้าที่ต้องการ')
  } catch (err) {
    if (err.code === '23505') throw new AppError(409, 'มีสินค้านี้ในฤดูกาลเดียวกันอยู่แล้ว', { name: 'ชื่อสินค้านี้ซ้ำในฤดูกาลเดียวกัน' })
    throw err
  }
  return getProduct(id, { includeInactive: true })
}

// ถ้าสินค้าเคยถูกซื้อแล้ว จะปิดการขาย (is_active = false) แทนการลบ เพื่อไม่ให้ประวัติการซื้อเสียหาย
export async function removeProduct(id) {
  const found = await query('SELECT 1 FROM products WHERE id = $1', [id])
  if (!found.rowCount) throw new AppError(404, 'ไม่พบสินค้าที่ต้องการ')
  const used = await query('SELECT 1 FROM transaction_items WHERE product_id = $1 LIMIT 1', [id])
  if (used.rowCount) {
    await query('UPDATE products SET is_active = FALSE WHERE id = $1', [id])
    return { deleted: false, deactivated: true }
  }
  await query('DELETE FROM products WHERE id = $1', [id])
  return { deleted: true, deactivated: false }
}
