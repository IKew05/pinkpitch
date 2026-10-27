// dev.js — รัน server + client พร้อมกัน ไม่ต้องติดตั้ง dependency เพิ่ม
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isWin = process.platform === 'win32'
const colors = { server: '\x1b[36m', client: '\x1b[35m', reset: '\x1b[0m' }

function start(name, cwd) {
  const color = colors[name] || ''

  // บน Windows ใช้ cmd /c npm run dev เพื่อหลีกเลี่ยง EINVAL และ shell deprecation warning
  const [cmd, args] = isWin
    ? ['cmd', ['/c', 'npm', 'run', 'dev']]
    : ['npm', ['run', 'dev']]

  const proc = spawn(cmd, args, { cwd, stdio: ['inherit', 'pipe', 'pipe'] })

  proc.stdout.on('data', (data) => {
    String(data).split('\n').filter(Boolean).forEach((line) => {
      process.stdout.write(`${color}[${name}]${colors.reset} ${line}\n`)
    })
  })
  proc.stderr.on('data', (data) => {
    String(data).split('\n').filter(Boolean).forEach((line) => {
      process.stderr.write(`${color}[${name}]${colors.reset} ${line}\n`)
    })
  })
  proc.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      process.stderr.write(`${color}[${name}]${colors.reset} exited with code ${code}\n`)
    }
  })
  return proc
}

console.log('\x1b[32m✅ PinkPitch Dev\x1b[0m — กำลังเริ่มต้น server + client...')
console.log('   \x1b[36m[server]\x1b[0m → http://localhost:3000/api')
console.log('   \x1b[35m[client]\x1b[0m → http://localhost:5173')
console.log('   กด Ctrl+C เพื่อหยุดทั้งคู่\n')

const server = start('server', path.join(__dirname, 'server'))
const client = start('client', path.join(__dirname, 'client'))

function shutdown() {
  server.kill()
  client.kill()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
