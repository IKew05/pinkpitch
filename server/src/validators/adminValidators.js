import { z } from 'zod'
import { emptyToUndef } from './common.js'

export const adminTransactionsQuery = z.object({
  limit: z.preprocess(emptyToUndef, z.coerce.number().int().min(1, 'limit ต้องอยู่ระหว่าง 1 ถึง 500').max(500, 'limit ต้องอยู่ระหว่าง 1 ถึง 500').default(100)),
  status: z.preprocess(emptyToUndef, z.enum(['pending', 'paid', 'shipped', 'completed', 'cancelled'], { errorMap: () => ({ message: 'สถานะไม่ถูกต้อง' }) }).optional()),
})
