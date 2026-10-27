import { Router } from 'express'
import * as c from '../controllers/adminController.js'
import { authenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { userIdParams } from '../validators/common.js'
import { adminTransactionsQuery } from '../validators/adminValidators.js'

const router = Router()
router.use(authenticate, authorize('admin'))
router.get('/users', c.users)
router.get('/users/:userId/transactions', validate(userIdParams, 'params'), c.userTransactions)
router.get('/transactions', validate(adminTransactionsQuery, 'query'), c.transactions)
router.get('/dashboard', c.dashboard)
export default router
