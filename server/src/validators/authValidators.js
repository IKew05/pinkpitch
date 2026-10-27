import { z } from 'zod'

const fullName = z.string({ required_error: 'กรุณากรอกชื่อ-นามสกุล' }).trim().min(2, 'ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร').max(120, 'ชื่อ-นามสกุลยาวเกินไป')
const email = z.string({ required_error: 'กรุณากรอกอีเมล' }).trim().toLowerCase().max(255, 'อีเมลยาวเกินไป').email('รูปแบบอีเมลไม่ถูกต้อง')

export const registerSchema = z.object({
  fullName,
  email,
  password: z.string({ required_error: 'กรุณากรอกรหัสผ่าน' })
    .min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร')
    // bcrypt ใช้เฉพาะ 72 ไบต์แรก จึงจำกัดไว้เพื่อไม่ให้รหัสผ่านถูกตัดโดยไม่รู้ตัว
    .refine((v) => Buffer.byteLength(v, 'utf8') <= 72, 'รหัสผ่านยาวเกินไป (ไม่เกิน 72 ไบต์)'),
  avatarUrl: z.string().optional().nullable(),
})

export const loginSchema = z.object({
  email: z.string({ required_error: 'กรุณากรอกอีเมล' }).trim().toLowerCase().min(1, 'กรุณากรอกอีเมล').max(255),
  password: z.string({ required_error: 'กรุณากรอกรหัสผ่าน' }).min(1, 'กรุณากรอกรหัสผ่าน').max(200),
})

// อนุญาตให้แก้ไขชื่อ อีเมล และรูปโปรไฟล์
export const updateMeSchema = z.object({
  fullName,
  email,
  avatarUrl: z.string().optional().nullable(),
})
