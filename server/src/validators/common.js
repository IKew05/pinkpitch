import { z } from 'zod'

// แปลงสตริงว่างจาก Query String ให้เป็น undefined
export const emptyToUndef = (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v)

export const idParams = z.object({
  id: z.string().regex(/^\d{1,9}$/, 'รหัสไม่ถูกต้อง'),
})
export const userIdParams = z.object({
  userId: z.string().regex(/^\d{1,9}$/, 'รหัสสมาชิกไม่ถูกต้อง'),
})
