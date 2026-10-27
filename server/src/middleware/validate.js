import { AppError } from '../utils/AppError.js'

// ตรวจข้อมูลด้วย Zod: validate(schema, 'body' | 'query' | 'params')
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {})
  if (!result.success) {
    const errors = {}
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_'
      if (!errors[key]) errors[key] = issue.message
    }
    return next(new AppError(422, 'ข้อมูลที่ส่งมาไม่ถูกต้อง', errors))
  }
  if (source === 'query') req.validatedQuery = result.data
  else req[source] = result.data
  next()
}
