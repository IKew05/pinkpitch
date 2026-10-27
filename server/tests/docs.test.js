// ตรวจว่าเอกสาร OpenAPI ตรงกับโค้ดจริง: ทุก Route ในโค้ดมีเอกสาร และทุก Operation ในเอกสารมี Route จริง
import { test, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import YAML from 'yaml'
import { app, api, closePool } from './helpers.js'

after(closePool)

const openapi = YAML.parse(fs.readFileSync(new URL('../src/docs/openapi.yaml', import.meta.url), 'utf8'))

// รวบรวม Route ทั้งหมดจาก Express (ไล่ Router ซ้อนกัน)
function collectRoutes(stack, prefix = '') {
  const out = []
  for (const layer of stack) {
    if (layer.route) {
      for (const method of Object.keys(layer.route.methods)) out.push(`${method.toUpperCase()} ${prefix}${layer.route.path}`)
    } else if (layer.name === 'router' && layer.handle.stack) {
      const mount = layer.regexp.source
        .replace('^\\/', '/').replace('\\/?(?=\\/|$)', '').replace(/\\\//g, '/').replace(/\$$/, '')
      out.push(...collectRoutes(layer.handle.stack, prefix + (mount === '/' ? '' : mount)))
    }
  }
  return out
}

const normalize = (p) => p.replace(/:([A-Za-z]+)/g, '{$1}').replace(/\/$/, '') || '/'
const codeRoutes = collectRoutes(app._router.stack)
  .map((r) => { const [m, p] = r.split(' '); return `${m} ${normalize(p)}` })
  .filter((r) => r.split(' ')[1].startsWith('/api/') && !r.includes('/api-docs'))
const docRoutes = Object.entries(openapi.paths).flatMap(([p, ops]) =>
  Object.keys(ops).filter((k) => ['get', 'post', 'put', 'delete', 'patch'].includes(k)).map((m) => `${m.toUpperCase()} /api${p}`))

test('พบ Route ในโค้ดและในเอกสาร', () => {
  assert.ok(codeRoutes.length >= 17, `code routes: ${codeRoutes.length}`)
  assert.ok(docRoutes.length >= 17, `doc routes: ${docRoutes.length}`)
})

test('ทุก Endpoint ในโค้ดมีอธิบายใน OpenAPI', () => {
  const missing = codeRoutes.filter((r) => !docRoutes.includes(r))
  assert.deepEqual(missing, [], `ไม่มีเอกสาร: ${missing.join(', ')}`)
})

test('ทุก Endpoint ใน OpenAPI มีอยู่จริงในโค้ด', () => {
  const extra = docRoutes.filter((r) => !codeRoutes.includes(r))
  assert.deepEqual(extra, [], `ไม่มีในโค้ด: ${extra.join(', ')}`)
})

test('Swagger UI และ openapi.yaml ใช้งานได้', async () => {
  assert.equal((await api().get('/api-docs/')).status, 200)
  assert.equal(openapi.openapi.startsWith('3.'), true)
})
