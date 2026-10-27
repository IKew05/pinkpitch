import { Router } from 'express'
import * as c from '../controllers/productController.js'
import { authenticate, optionalAuthenticate } from '../middleware/authenticate.js'
import { authorize } from '../middleware/authorize.js'
import { validate } from '../middleware/validate.js'
import { idParams } from '../validators/common.js'
import { createProductSchema, updateProductSchema, listProductsQuery } from '../validators/productValidators.js'

const router = Router()
router.get('/', optionalAuthenticate, validate(listProductsQuery, 'query'), c.list)
router.get('/:id', optionalAuthenticate, validate(idParams, 'params'), c.getOne)
router.post('/', authenticate, authorize('admin'), validate(createProductSchema), c.create)
router.put('/:id', authenticate, authorize('admin'), validate(idParams, 'params'), validate(updateProductSchema), c.update)
router.delete('/:id', authenticate, authorize('admin'), validate(idParams, 'params'), c.remove)
export default router
