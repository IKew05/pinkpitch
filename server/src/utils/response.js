export const ok = (res, data, message = 'ดำเนินการสำเร็จ', status = 200) =>
  res.status(status).json({ success: true, message, data })
export const created = (res, data, message = 'สร้างข้อมูลสำเร็จ') => ok(res, data, message, 201)
