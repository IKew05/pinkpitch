import dotenv from 'dotenv'

dotenv.config()

const PLACEHOLDER_SECRET = 'replace_with_a_long_random_secret'
const isProd = process.env.NODE_ENV === 'production'

// แสดงข้อความตั้งค่าผิดแบบอ่านง่ายแล้วหยุดโปรเซส (ไม่พ่น stack trace) — โหมดทดสอบให้ throw ตามปกติ
function fatal(message) {
  if (process.env.NODE_ENV === 'test') throw new Error(message)
  console.error(`\n❌ ตั้งค่าไม่ถูกต้อง: ${message}\n`)
  process.exit(1)
}

function required(name) {
  const v = process.env[name]
  if (!v || !v.trim()) {
    fatal(`ยังไม่ได้ตั้งค่า ${name} ในไฟล์ server/.env (ดูตัวอย่างใน .env.example)`)
  }
  return v.trim()
}

const jwtSecret = required('JWT_SECRET')
if (jwtSecret === PLACEHOLDER_SECRET) {
  fatal('JWT_SECRET ยังเป็นค่าตัวอย่าง กรุณาสร้างค่าสุ่มยาว ๆ ของคุณเอง เช่น: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"')
}
if (isProd && jwtSecret.length < 32) {
  fatal('JWT_SECRET ต้องยาวอย่างน้อย 32 ตัวอักษรในโหมด production')
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd,
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT) || 3000,
  databaseUrl: required('DATABASE_URL'),
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX) || 30,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
}
