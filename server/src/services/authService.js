import bcrypt from 'bcryptjs'
import { env } from '../config/env.js'
import { query } from '../config/database.js'
import { AppError } from '../utils/AppError.js'
import { toUser } from '../utils/mappers.js'

const USER_COLS = 'id, full_name, email, role, avatar_url, created_at, updated_at'
const EMAIL_TAKEN = { email: 'อีเมลนี้ถูกใช้งานแล้ว' }

// hash ปลอมไว้เปรียบเทียบเมื่อไม่พบอีเมล เพื่อให้เวลาตอบสนองใกล้เคียงกัน (ลดการเดาว่าอีเมลมีในระบบหรือไม่)
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', env.bcryptRounds)

export async function register({ fullName, email, password, avatarUrl }) {
  const exists = await query('SELECT 1 FROM users WHERE LOWER(email) = $1', [email])
  if (exists.rowCount) throw new AppError(409, 'อีเมลนี้ถูกใช้งานแล้ว', EMAIL_TAKEN)
  const hash = await bcrypt.hash(password, env.bcryptRounds)
  try {
    // role ถูกกำหนดเป็น customer จากฝั่งเซิร์ฟเวอร์เท่านั้น
    const { rows } = await query(
      `INSERT INTO users (full_name, email, password_hash, role, avatar_url) VALUES ($1, $2, $3, 'customer', $4) RETURNING ${USER_COLS}`,
      [fullName, email, hash, avatarUrl || null],
    )
    return toUser(rows[0])
  } catch (err) {
    if (err.code === '23505') throw new AppError(409, 'อีเมลนี้ถูกใช้งานแล้ว', EMAIL_TAKEN)
    throw err
  }
}

export async function verifyCredentials({ email, password }) {
  const { rows } = await query(`SELECT ${USER_COLS}, password_hash FROM users WHERE LOWER(email) = $1`, [email])
  const user = rows[0]
  const valid = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH)
  if (!user || !valid) throw new AppError(401, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง')
  return toUser(user)
}

export async function updateProfile(userId, { fullName, email, avatarUrl }) {
  const taken = await query('SELECT 1 FROM users WHERE LOWER(email) = $1 AND id <> $2', [email, userId])
  if (taken.rowCount) throw new AppError(409, 'อีเมลนี้ถูกใช้งานแล้ว', EMAIL_TAKEN)
  try {
    const { rows } = await query(
      `UPDATE users SET full_name = $1, email = $2, avatar_url = COALESCE($3, avatar_url) WHERE id = $4 RETURNING ${USER_COLS}`,
      [fullName, email, avatarUrl !== undefined ? avatarUrl : null, userId],
    )
    return toUser(rows[0])
  } catch (err) {
    if (err.code === '23505') throw new AppError(409, 'อีเมลนี้ถูกใช้งานแล้ว', EMAIL_TAKEN)
    throw err
  }
}
