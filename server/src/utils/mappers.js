// แปลงแถวจากฐานข้อมูล (snake_case) เป็นรูปแบบที่ Frontend ใช้ (camelCase)
export const toUser = (r) => ({
  id: r.id, fullName: r.full_name, email: r.email, role: r.role,
  avatarUrl: r.avatar_url || '',
  createdAt: r.created_at, updatedAt: r.updated_at,
})

export const toProduct = (r) => ({
  id: r.id, name: r.name, teamName: r.team_name, season: r.season, category: r.category,
  description: r.description, price: r.price, sizes: r.sizes, color: r.color, stock: r.stock,
  imageUrl: r.image_url || '', isActive: r.is_active, featured: r.featured, kit: r.kit || undefined,
  sold: r.sold ?? 0, createdAt: r.created_at, updatedAt: r.updated_at,
})

const pad = (n) => String(n).padStart(6, '0')
export const orderNumber = (id, createdAt) =>
  `PP-${new Date(createdAt).toISOString().slice(0, 10).replace(/-/g, '')}-${pad(id)}`

export const toTransactionItem = (r) => ({
  id: r.id, productId: r.product_id, name: r.product_name, teamName: r.team_name, season: r.season,
  imageUrl: r.image_url || '', kit: r.kit || undefined, size: r.size, quantity: r.quantity,
  unitPrice: r.unit_price, subtotal: r.subtotal,
})

export const toTransaction = (r, items) => ({
  id: r.id,
  orderNumber: orderNumber(r.id, r.created_at),
  userId: r.user_id,
  customerName: r.customer_name,
  status: r.status,
  totalAmount: r.total_amount,
  itemCount: r.item_count ?? (items ? items.reduce((s, i) => s + i.quantity, 0) : 0),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  ...(items ? { items: items.map(toTransactionItem) } : {}),
})
