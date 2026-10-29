import * as txns from '../services/transactionService.js'
import { asyncHandler } from '../utils/AppError.js'
import { ok, created } from '../utils/response.js'

export const create = asyncHandler(async (req, res) => {
  created(res, await txns.createTransaction(req.user.id, req.body.items), 'สร้างรายการสั่งซื้อสำเร็จ (ยังไม่มีการชำระเงินจริง)')
})
export const list = asyncHandler(async (req, res) => {
  ok(res, await txns.listTransactionsForUser(req.user.id), 'ดึงรายการสั่งซื้อสำเร็จ')
})
export const getOne = asyncHandler(async (req, res) => {
  ok(res, await txns.getTransactionForUser(Number(req.params.id), req.user), 'ดึงรายละเอียดการสั่งซื้อสำเร็จ')
})
export const updateStatus = asyncHandler(async (req, res) => {
  const updated = await txns.updateTransactionStatus(Number(req.params.id), req.body.status, req.user)
  ok(res, updated, `อัปเดตสถานะเป็น ${req.body.status} สำเร็จ`)
})
