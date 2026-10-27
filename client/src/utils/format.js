const baht = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 })
export const formatBaht = (n) => baht.format(Number(n) || 0)

export const formatDate = (iso) =>
  new Date(iso).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })

export const STATUS_LABELS = {
  pending: 'รอชำระเงิน',
  paid: 'ชำระแล้ว',
  shipped: 'จัดส่งแล้ว',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก',
}
export const statusLabel = (s) => STATUS_LABELS[s] || s
export const statusClass = (s) =>
  ({ completed: 'badge-success', shipped: 'badge-info', paid: 'badge-pink', pending: 'badge-warn', cancelled: 'badge-danger' })[s] || 'badge-muted'
