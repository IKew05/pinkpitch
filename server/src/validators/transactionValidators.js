import { z } from 'zod'

// รับเฉพาะ productId / size / quantity — ไม่รับราคาหรือยอดรวมจาก Client
export const createTransactionSchema = z.object({
  items: z.array(z.object({
    productId: z.number({ required_error: 'ต้องระบุ productId', invalid_type_error: 'productId ต้องเป็นตัวเลข' }).int().positive('productId ไม่ถูกต้อง'),
    size: z.string({ required_error: 'ต้องระบุไซซ์' }).trim().min(1, 'ต้องระบุไซซ์').max(10),
    quantity: z.number({ required_error: 'ต้องระบุจำนวน', invalid_type_error: 'จำนวนต้องเป็นตัวเลข' }).int('จำนวนต้องเป็นจำนวนเต็ม').min(1, 'จำนวนต้องมากกว่า 0').max(100, 'จำนวนต่อรายการสูงสุด 100'),
  }), { required_error: 'ต้องมีรายการสินค้า', invalid_type_error: 'items ต้องเป็นรายการ' }).min(1, 'ต้องมีสินค้าอย่างน้อย 1 รายการ').max(50, 'สั่งซื้อได้สูงสุด 50 รายการต่อครั้ง'),
})

export const updateTransactionStatusSchema = z.object({
  status: z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled'], {
    required_error: 'ต้องระบุสถานะ',
    invalid_type_error: 'สถานะไม่ถูกต้อง (ต้องเป็น pending, paid, shipped, completed หรือ cancelled)',
  }),
})
