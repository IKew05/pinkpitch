import * as products from '../services/productService.js'
import { asyncHandler } from '../utils/AppError.js'
import { ok, created } from '../utils/response.js'

const isAdmin = (req) => req.user?.role === 'admin'

export const list = asyncHandler(async (req, res) => {
  const q = req.validatedQuery
  // includeInactive ใช้ได้เฉพาะ Admin เท่านั้น ผู้ใช้ทั่วไปจะเห็นเฉพาะสินค้าที่เปิดขาย
  const includeInactive = q.includeInactive === 'true' && isAdmin(req)
  ok(res, await products.listProducts(q, { includeInactive }), 'ดึงรายการสินค้าสำเร็จ')
})

export const getOne = asyncHandler(async (req, res) => {
  ok(res, await products.getProduct(Number(req.params.id), { includeInactive: isAdmin(req) }), 'ดึงข้อมูลสินค้าสำเร็จ')
})

export const create = asyncHandler(async (req, res) => {
  created(res, await products.createProduct(req.body), 'เพิ่มสินค้าสำเร็จ')
})

export const update = asyncHandler(async (req, res) => {
  ok(res, await products.updateProduct(Number(req.params.id), req.body), 'แก้ไขสินค้าสำเร็จ')
})

export const remove = asyncHandler(async (req, res) => {
  const result = await products.removeProduct(Number(req.params.id))
  ok(res, result, result.deleted ? 'ลบสินค้าสำเร็จ' : 'สินค้านี้มีประวัติการซื้อ จึงปิดการขายแทนการลบ')
})
