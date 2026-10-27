import { z } from 'zod'
import { emptyToUndef } from './common.js'

const imageUrl = z.string().trim().max(2000)
  .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v) || /^\/[^\s]*$/.test(v), 'รูปภาพต้องเป็น URL (https://...) หรือพาธที่ขึ้นต้นด้วย /')

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'สีต้องอยู่ในรูปแบบ #RRGGBB')
const kit = z.object({
  primary: hex.optional(),
  secondary: hex.optional(),
  pattern: z.enum(['plain', 'stripes', 'band', 'sleeves']).optional(),
  label: z.string().trim().max(5).optional(),
}).strict().optional().nullable()

const base = {
  name: z.string({ required_error: 'กรุณากรอกชื่อสินค้า' }).trim().min(1, 'กรุณากรอกชื่อสินค้า').max(200, 'ชื่อสินค้ายาวเกินไป'),
  teamName: z.string({ required_error: 'กรุณากรอกชื่อทีม' }).trim().min(1, 'กรุณากรอกชื่อทีม').max(120),
  season: z.string({ required_error: 'กรุณากรอกฤดูกาล' }).trim().min(1, 'กรุณากรอกฤดูกาล').max(20),
  category: z.string({ required_error: 'กรุณาเลือกหมวดหมู่' }).trim().min(1, 'กรุณาเลือกหมวดหมู่').max(80),
  description: z.string().trim().max(5000).default(''),
  price: z.number({ required_error: 'กรุณากรอกราคา', invalid_type_error: 'ราคาต้องเป็นตัวเลข' }).min(0, 'ราคาต้องไม่ติดลบ').max(9999999, 'ราคาสูงเกินไป')
    .refine((v) => Math.round(v * 100) / 100 === v, 'ราคามีทศนิยมได้ไม่เกิน 2 ตำแหน่ง'),
  sizes: z.array(z.string().trim().min(1).max(10), { required_error: 'กรุณาเลือกไซซ์', invalid_type_error: 'ไซซ์ต้องเป็นรายการ' })
    .min(1, 'เลือกอย่างน้อย 1 ไซซ์').max(12).refine((a) => new Set(a).size === a.length, 'ไซซ์ซ้ำกัน'),
  color: z.string().trim().max(80).default(''),
  stock: z.number({ required_error: 'กรุณากรอกจำนวนสต็อก', invalid_type_error: 'สต็อกต้องเป็นตัวเลข' }).int('สต็อกต้องเป็นจำนวนเต็ม').min(0, 'สต็อกต้องไม่ติดลบ').max(1000000),
  imageUrl: imageUrl.optional().nullable(),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  kit,
}

export const createProductSchema = z.object(base)

// PUT: ส่งเฉพาะฟิลด์ที่ต้องการแก้ไขได้ (ฟิลด์อื่นที่ไม่รู้จัก เช่น id, createdAt จะถูกตัดทิ้ง)
export const updateProductSchema = z.object({
  name: base.name, teamName: base.teamName, season: base.season, category: base.category,
  description: z.string().trim().max(5000), price: base.price, sizes: base.sizes, color: z.string().trim().max(80),
  stock: base.stock, imageUrl: base.imageUrl, isActive: z.boolean(), featured: z.boolean(), kit,
}).partial().refine((o) => Object.keys(o).length > 0, 'ไม่มีข้อมูลที่ต้องการแก้ไข')

const optStr = (max = 200) => z.preprocess(emptyToUndef, z.string().trim().max(max).optional())
const optNum = z.preprocess(emptyToUndef, z.coerce.number({ invalid_type_error: 'ต้องเป็นตัวเลข' }).min(0, 'ต้องไม่ติดลบ').optional())

export const listProductsQuery = z.object({
  search: optStr(100),
  team: optStr(120),
  category: optStr(80),
  size: optStr(10),
  minPrice: optNum,
  maxPrice: optNum,
  sort: z.preprocess(emptyToUndef, z.enum(['price_asc', 'price_desc'], { errorMap: () => ({ message: 'sort ต้องเป็น price_asc หรือ price_desc' }) }).optional()),
  page: z.preprocess(emptyToUndef, z.coerce.number().int().min(1).max(100000).default(1)),
  limit: z.preprocess(emptyToUndef, z.coerce.number().int().min(1, 'limit ต้องอยู่ระหว่าง 1 ถึง 1000').max(1000, 'limit ต้องอยู่ระหว่าง 1 ถึง 1000').default(12)),
  includeInactive: z.preprocess(emptyToUndef, z.enum(['true', 'false']).optional()),
}).refine((q) => q.minPrice === undefined || q.maxPrice === undefined || q.minPrice <= q.maxPrice, {
  message: 'minPrice ต้องไม่มากกว่า maxPrice', path: ['minPrice'],
})
