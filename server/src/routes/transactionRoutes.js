import { Router } from 'express'
import * as c from '../controllers/transactionController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { idParams } from '../validators/common.js'
import { createTransactionSchema, updateTransactionStatusSchema } from '../validators/transactionValidators.js'

const router = Router()
router.use(authenticate)
router.post('/', validate(createTransactionSchema), c.create)
router.get('/', c.list)
router.get('/:id', validate(idParams, 'params'), c.getOne)
router.patch('/:id/status', validate(idParams, 'params'), validate(updateTransactionStatusSchema), c.updateStatus)
router.put('/:id/status', validate(idParams, 'params'), validate(updateTransactionStatusSchema), c.updateStatus)

export default router
