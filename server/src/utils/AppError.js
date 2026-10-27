export class AppError extends Error {
  constructor(status, message, errors) {
    super(message)
    this.status = status
    this.errors = errors // { field: 'ข้อความ' } สำหรับ Validation
    this.expose = true
  }
}
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
