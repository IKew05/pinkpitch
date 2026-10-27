import { Router } from 'express'
import * as c from '../controllers/transactionController.js'
import { authenticate } from '../middleware/authenticate.js'
import { validate } from '../middleware/validate.js'
import { idParams } from '../validators/common.js'
import { createTransactionSchema } from '../validators/transactionValidators.js'

const router = Router()
router.use(authenticate)
router.post('/', validate(createTransactionSchema), c.create)
router.get('/', c.list)
router.get('/:id', validate(idParams, 'params'), c.getOne)
export default router
