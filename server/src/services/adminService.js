import { query } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import { toUser, toTransaction } from '../utils/mappers.js'

export async function listUsers() {
  const { rows } = await query(`
    SELECT u.id, u.full_name, u.email, u.role, u.created_at, u.updated_at,
      COUNT(t.id)::int AS transaction_count,
      COALESCE(SUM(t.total_amount) FILTER (WHERE t.status <> 'cancelled'), 0) AS total_spent
    FROM users u LEFT JOIN transactions t ON t.user_id = u.id
    GROUP BY u.id ORDER BY u.id`)
  return rows.map((r) => ({ ...toUser(r), transactionCount: r.transaction_count, totalSpent: r.total_spent }))
}

export async function getUserTransactions(userId) {
  const u = await query('SELECT id, full_name, email, role, created_at, updated_at FROM users WHERE id = $1', [userId])
  if (!u.rows[0]) throw new AppError(404, 'ไม่พบสมาชิก')
  const { rows } = await query(`
    SELECT t.*, u.full_name AS customer_name,
      (SELECT COALESCE(SUM(quantity), 0)::int FROM transaction_items WHERE transaction_id = t.id) AS item_count
    FROM transactions t JOIN users u ON u.id = t.user_id
    WHERE t.user_id = $1 ORDER BY t.created_at DESC, t.id DESC`, [userId])
  return { user: toUser(u.rows[0]), transactions: rows.map((r) => toTransaction(r)) }
}

export async function listAllTransactions({ limit, status }) {
  const params = [limit]
  let where = ''
  if (status) { params.push(status); where = 'WHERE t.status = $2' }
  const { rows } = await query(`
    SELECT t.*, u.full_name AS customer_name,
      (SELECT COALESCE(SUM(quantity), 0)::int FROM transaction_items WHERE transaction_id = t.id) AS item_count
    FROM transactions t JOIN users u ON u.id = t.user_id ${where}
    ORDER BY t.created_at DESC, t.id DESC LIMIT $1`, params)
  return rows.map((r) => toTransaction(r))
}

// ข้อมูลสรุปสำหรับ Admin Dashboard อ่านจากฐานข้อมูลจริงทั้งหมด
export async function getDashboard() {
  const stats = (await query(`
    SELECT
      (SELECT COUNT(*) FROM products) AS product_count,
      (SELECT COUNT(*) FROM products WHERE is_active) AS active_product_count,
      (SELECT COUNT(*) FROM products WHERE stock = 0) AS out_of_stock_count,
      (SELECT COUNT(*) FROM users) AS user_count,
      (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customer_count,
      (SELECT COUNT(*) FROM transactions) AS transaction_count,
      (SELECT COALESCE(SUM(total_amount), 0) FROM transactions WHERE status <> 'cancelled') AS total_order_value`)).rows[0]
  const recent = (await query(`
    SELECT t.*, u.full_name AS customer_name,
      (SELECT COALESCE(SUM(quantity), 0)::int FROM transaction_items WHERE transaction_id = t.id) AS item_count
    FROM transactions t JOIN users u ON u.id = t.user_id
    ORDER BY t.created_at DESC, t.id DESC LIMIT 8`)).rows
  return {
    productCount: stats.product_count,
    activeProductCount: stats.active_product_count,
    outOfStockCount: stats.out_of_stock_count,
    userCount: stats.user_count,
    customerCount: stats.customer_count,
    transactionCount: stats.transaction_count,
    totalOrderValue: stats.total_order_value,
    recentTransactions: recent.map((r) => toTransaction(r)),
  }
}
