import * as admin from '../services/adminService.js'
import { asyncHandler } from '../utils/AppError.js'
import { ok } from '../utils/response.js'

export const users = asyncHandler(async (req, res) => ok(res, await admin.listUsers(), 'ดึงรายชื่อสมาชิกสำเร็จ'))
export const userTransactions = asyncHandler(async (req, res) =>
  ok(res, await admin.getUserTransactions(Number(req.params.userId)), 'ดึงประวัติการซื้อของสมาชิกสำเร็จ'))
export const transactions = asyncHandler(async (req, res) =>
  ok(res, await admin.listAllTransactions(req.validatedQuery), 'ดึงรายการสั่งซื้อทั้งหมดสำเร็จ'))
export const dashboard = asyncHandler(async (req, res) => ok(res, await admin.getDashboard(), 'ดึงข้อมูลสรุปสำเร็จ'))
