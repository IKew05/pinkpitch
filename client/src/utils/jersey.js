// สร้างภาพเสื้อฟุตบอลแบบ SVG สำหรับใช้เป็นภาพสำรอง เมื่อไม่มีรูปจริงหรือรูปโหลดไม่ได้
const BODY = 'M60 22 22 52l18 40 20-12v120c0 7 5 12 12 12h56c7 0 12-5 12-12V80l20 12 18-40-38-30c-8 14-20 20-40 20S68 36 60 22z'

export function initials(name = '') {
  const w = String(name).trim().split(/\s+/).filter(Boolean)
  if (!w.length) return 'PP'
  return (w.length === 1 ? w[0].slice(0, 3) : w.slice(0, 3).map((x) => x[0]).join('')).toUpperCase()
}

const luminance = (hex) => {
  const n = parseInt(String(hex).replace('#', ''), 16)
  return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
}

export function jerseyDataUri(kit = {}, teamName = '') {
  const primary = kit.primary || '#FF4F9A'
  const secondary = kit.secondary || '#FFFFFF'
  const pattern = kit.pattern || 'plain'
  const label = kit.label || initials(teamName)
  let overlay = ''
  if (pattern === 'stripes') {
    for (let x = 52; x < 150; x += 24) overlay += `<rect x="${x}" y="0" width="12" height="230" fill="${secondary}"/>`
  } else if (pattern === 'band') {
    overlay = `<rect x="88" y="0" width="24" height="230" fill="${secondary}"/>`
  } else if (pattern === 'sleeves') {
    overlay = `<rect x="0" y="0" width="200" height="230" fill="${secondary}"/><rect x="58" y="0" width="84" height="230" fill="${primary}"/>`
  }
  const textColor = luminance(primary) > 0.62 ? '#20243A' : '#FFFFFF'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
<ellipse cx="100" cy="228" rx="62" ry="6" fill="#20243A" opacity=".12"/>
<defs><clipPath id="s"><path d="${BODY}"/></clipPath></defs>
<g clip-path="url(#s)"><rect width="200" height="230" fill="${primary}"/>${overlay}
<path d="M60 22c8 14 20 20 40 20s32-6 40-20" fill="none" stroke="${secondary}" stroke-width="7"/>
<rect x="22" y="76" width="36" height="6" fill="${secondary}" opacity=".9" transform="rotate(-25 40 79)"/>
<rect x="142" y="76" width="36" height="6" fill="${secondary}" opacity=".9" transform="rotate(25 160 79)"/></g>
<path d="${BODY}" fill="none" stroke="#20243A" stroke-opacity=".28" stroke-width="2" stroke-linejoin="round"/>
<text x="100" y="118" text-anchor="middle" font-family="Kanit,Arial,sans-serif" font-weight="700" font-size="26" fill="${textColor}">${label}</text>
<circle cx="100" cy="140" r="5" fill="${textColor}" opacity=".85"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
