n

# PinkPitch – Football Jersey Store

ระบบร้านค้าออนไลน์จำหน่ายเสื้อฟุตบอล ธีมสีชมพู
**Frontend:** Vue 3 + Vite + Vue Router + Axios · **Backend:** Node.js + Express · **ฐานข้อมูล:** PostgreSQL · **ยืนยันตัวตน:** JWT + bcrypt · **เอกสาร API:** OpenAPI / Swagger UI

```text
pinkpitch/
├── client/                  Frontend (Vue 3 + Vite)  → http://localhost:5173
│   ├── src/                 components, layouts, views, router, services (Axios + mock), stores, mocks, utils
│   ├── .env.example
│   └── package.json
├── server/                  Backend (Express + PostgreSQL)  → http://localhost:3000
│   ├── src/                 config, controllers, middleware, routes, services, validators, utils, docs/openapi.yaml
│   ├── database/            schema.sql (สร้างตาราง + avatar_url), seed.sql (สินค้าเริ่มต้นทั้งหมด 34 รายการ)
│   ├── scripts/             runSql, createAdmin, createDemoUser, resetDb
│   ├── tests/               Automated tests (PostgreSQL จริง)
│   ├── .env.example
│   └── package.json
└── package.json             สคริปต์ลัดจาก root
```

**ข้อมูลทุกอย่างผ่าน REST API** Frontend ไม่เชื่อมต่อ PostgreSQL โดยตรง

| URL                              | ใช้ทำอะไร                                    |
| -------------------------------- | ----------------------------------------------------- |
| http://localhost:5173            | เว็บไซต์ (Frontend)                           |
| http://localhost:3000/api        | API Base URL                                          |
| http://localhost:3000/api-docs   | Swagger UI                                            |
| http://localhost:3000/api/health | ตรวจสอบสถานะ Backend + ฐานข้อมูล |

---

## 1) สิ่งที่ต้องติดตั้ง

| โปรแกรม               | เวอร์ชัน                      | ลิงก์                           |
| ---------------------------- | ------------------------------------- | ------------------------------------ |
| Node.js (มาพร้อม npm) | 18 ขึ้นไป (แนะนำ 20 LTS)   | https://nodejs.org                   |
| PostgreSQL                   | 12 ขึ้นไป (ทดสอบกับ 16) | https://www.postgresql.org/download/ |

ตรวจสอบ: `node -v`, `npm -v`, `psql --version` — ระหว่างติดตั้ง PostgreSQL ให้จดรหัสผ่านของผู้ใช้ `postgres`
Dependencies อื่นติดตั้งอัตโนมัติด้วย `npm install` (Backend: express, pg, jsonwebtoken, bcryptjs, zod, helmet, cors, express-rate-limit, swagger-ui-express, dotenv · Frontend: vue, vue-router, axios, lucide-vue-next, vite)

## 2) สร้างฐานข้อมูล

```bash
psql -U postgres -c "CREATE DATABASE pinkpitch;"
```

(หรือสร้างผ่าน pgAdmin ชื่อ `pinkpitch`)

## 3) ตั้งค่า Backend

```bash
cd server
cp .env.example .env        # Windows: copy .env.example .env
```

แก้ `server/.env`:

| ตัวแปร                                        | คำอธิบาย                                                                                                                                                                                                       |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                    | `postgresql://postgres:รหัสผ่านของคุณ@localhost:5432/pinkpitch` (อักขระพิเศษในรหัสผ่านต้อง URL-encode)                                                                        |
| `JWT_SECRET`                                      | **ต้องเปลี่ยน** สร้างด้วย `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` (ถ้ายังเป็นค่าตัวอย่าง Backend ไม่ยอมเริ่มทำงาน) |
| `CLIENT_URL`                                      | Origin ของ Frontend ที่อนุญาต CORS (ค่าเริ่มต้น `http://localhost:5173`)                                                                                                                      |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | บัญชี Admin ที่จะสร้างในขั้นตอนถัดไป (รหัสผ่านอย่างน้อย 10 ตัวอักษร)                                                                                             |

## 4) ติดตั้ง Dependencies, สร้างตาราง, ใส่ข้อมูลเริ่มต้น, สร้าง Admin

```bash
npm install
npm run db:schema     # สร้างตาราง users, products, transactions, transaction_items (รันซ้ำได้ ไม่ลบข้อมูล)
npm run db:seed       # เพิ่มสินค้าเริ่มต้น 12 รายการ (รันซ้ำได้ ไม่สร้างซ้ำ)
npm run db:admin      # สร้างบัญชี Admin จาก ADMIN_* ใน .env (hash รหัสผ่านก่อนบันทึก)
npm run db:demo       # (ไม่บังคับ) สร้างลูกค้าตัวอย่าง demo@pinkpitch.test / Demo@12345 สำหรับสาธิต
```

- `db:schema` + `db:seed` รวมกันได้ด้วย `npm run db:setup` (ทั้งหมดรันผ่าน Node ไม่ต้องมี `psql`)
- `db:admin`: ถ้ามีอีเมลนี้อยู่แล้วจะไม่แก้ไข ใช้ `npm run db:admin -- --reset-password` เพื่อตั้งรหัสผ่านใหม่
- `db:demo` ไม่ทำงานเมื่อ `NODE_ENV=production`
- **รีเซ็ตฐานข้อมูล (ข้อมูลทั้งหมดหายถาวร):** `npm run db:reset -- --yes` แล้วรัน `npm run db:admin` ใหม่ (ถ้าไม่ใส่ `--yes` จะแสดงคำเตือนและไม่ทำอะไร)

## 5) เปิด Backend

```bash
npm run dev           # โหมดพัฒนา (รีสตาร์ตอัตโนมัติ)   หรือ   npm start
```

ควรเห็น `✅ เชื่อมต่อฐานข้อมูลสำเร็จ` และ `🚀 PinkPitch API: http://localhost:3000/api`

ตรวจสอบ Health Check:

```bash
curl http://localhost:3000/api/health
# {"success":true,"message":"ระบบทำงานปกติ","data":{"status":"ok","database":"up",...}}
```

## 6) ตั้งค่าและเปิด Frontend (Terminal ใหม่)

```bash
cd client
cp .env.example .env        # Windows: copy .env.example .env
npm install
npm run dev
```

`client/.env` ต้องเป็น:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_API=false
```

เปิดเว็บที่ **http://localhost:5173** (หลังแก้ `.env` ต้องรัน `npm run dev` ใหม่ ถ้า Vite เปลี่ยนพอร์ต ให้แก้ `CLIENT_URL` ใน `server/.env` ให้ตรงและรีสตาร์ต Backend)

### คำสั่งลัดจาก root

```bash
npm run install:all   # ติดตั้ง Dependencies ทั้ง server และ client
npm run db:setup      # = db:schema + db:seed
npm run db:admin      # สร้าง Admin
npm run dev:server    # เปิด Backend   (Terminal 1)
npm run dev:client    # เปิด Frontend  (Terminal 2)
npm run build         # build Frontend
npm test              # รันเทสต์ Backend (ต้องตั้ง TEST_DATABASE_URL ดูหัวข้อ 9)
```

(ไม่มีคำสั่งเปิด 2 ส่วนพร้อมกันในหน้าต่างเดียว เพื่อไม่ต้องเพิ่ม Dependency ให้เปิดแยก 2 Terminal)

---

## 7) ทดลองใช้งาน

| บทบาท                   | อีเมล                                  | รหัสผ่าน                                    |
| ---------------------------- | ------------------------------------------- | --------------------------------------------------- |
| Admin                        | ค่า `ADMIN_EMAIL` ใน `server/.env` | ค่า `ADMIN_PASSWORD` ใน `server/.env`      |
| ลูกค้าตัวอย่าง | `demo@pinkpitch.test`                     | `Demo@12345` (หลังรัน `npm run db:demo`) |

หรือสมัครสมาชิกใหม่ที่หน้า `/register` (จะเป็น `customer` เสมอ)

## 8) ทดสอบ API และตรวจข้อมูลใน PostgreSQL

```bash
BASE=http://localhost:3000/api
curl "$BASE/products?search=arsenal"                                   # สินค้าจาก PostgreSQL
curl -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d '{"fullName":"Test User","email":"test@example.com","password":"Password123"}'
```

หรือทดลองผ่าน Swagger UI ที่ `/api-docs` (กด Authorize แล้วใส่ Token ที่ได้จาก login)

ตรวจในฐานข้อมูล:

```bash
psql -U postgres -d pinkpitch -c "SELECT id, name, price, stock FROM products ORDER BY id;"
psql -U postgres -d pinkpitch -c "SELECT id, full_name, email, role, LEFT(password_hash,7) AS hash FROM users;"
psql -U postgres -d pinkpitch -c "SELECT * FROM transactions; SELECT * FROM transaction_items;"
```

- **พิสูจน์ว่าสินค้ามาจาก SQL:** `UPDATE products SET price = 1999 WHERE id = 1;` แล้วรีเฟรชหน้า Products ราคาเปลี่ยนทันที
- **พิสูจน์ว่าสมาชิกถูกบันทึก:** สมัครสมาชิกแล้วรัน `SELECT` ตารางข้างบน `hash` จะขึ้นต้นด้วย `$2a$`/`$2b$` (bcrypt) และข้อมูลยังอยู่หลังรีสตาร์ต Backend

## 9) การทดสอบอัตโนมัติ

### Backend (33 ข้อ ใช้ PostgreSQL จริง)

ใช้ฐานข้อมูลแยกต่างหาก — **ชุดทดสอบจะ `DROP` และสร้างตารางใหม่ในฐานข้อมูลนั้น** โค้ดปฏิเสธถ้าชื่อฐานข้อมูลไม่มีคำว่า `test` และปฏิเสธการรันถ้าไม่ตั้ง `TEST_DATABASE_URL`

```bash
psql -U postgres -c "CREATE DATABASE pinkpitch_test;"
cd server
# macOS / Linux
TEST_DATABASE_URL=postgresql://postgres:รหัสผ่าน@localhost:5432/pinkpitch_test JWT_SECRET=any-long-test-secret-0123456789abcdef npm test
# Windows PowerShell
$env:TEST_DATABASE_URL="postgresql://postgres:รหัสผ่าน@localhost:5432/pinkpitch_test"; $env:JWT_SECRET="any-long-test-secret-0123456789abcdef"; npm test
```

ครอบคลุม: สมัคร/อีเมลซ้ำ/hash, Login, สิทธิ์ Admin-Customer, CRUD สินค้า, ค้นหา/กรอง/แบ่งหน้า, ซื้อสินค้า, สต็อกลด/ไม่ติดลบ, ซื้อพร้อมกัน, Rollback เมื่อสต็อกไม่พอ, แยกประวัติการซื้อรายสมาชิก, Dashboard, Health (ฐานข้อมูลล่ม → 503), รีสตาร์ตเซิร์ฟเวอร์จริงแล้วข้อมูลยังอยู่ และ **ตรวจว่าทุก Endpoint ในโค้ดมีใน OpenAPI และในทางกลับกัน**

## 10) โหมดสาธิต (Mock) — ไม่ต้องมี Backend

ตั้ง `VITE_USE_MOCK_API=true` ใน `client/.env` แล้วรัน `npm run dev` ใหม่ จะมีแถบ "โหมดสาธิต" ด้านบน ข้อมูลอยู่ใน `localStorage` ของเบราว์เซอร์ **ไม่ได้บันทึกลง PostgreSQL** (บัญชีทดลองในโหมดนี้: `admin@pinkpitch.test` / `admin1234`, `demo@pinkpitch.test` / `demo1234`)
เมื่อตั้งเป็น `false` ระบบไม่ใช้ข้อมูลจำลองเลย แม้เรียก API ไม่ได้ก็จะแสดง Error State ไม่สลับไปแสดงข้อมูลจำลอง

## 11) ปัญหาที่พบบ่อย

| อาการ                                                                            | วิธีแก้                                                                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend แจ้ง "เชื่อมต่อฐานข้อมูล PostgreSQL ไม่สำเร็จ" | เปิดบริการ PostgreSQL, ตรวจรหัสผ่านใน `DATABASE_URL`, ตรวจว่าสร้างฐานข้อมูล `pinkpitch` แล้ว |
| Backend แจ้ง "JWT_SECRET ยังเป็นค่าตัวอย่าง"                    | แก้ `JWT_SECRET` ใน `server/.env` ตามหัวข้อ 3                                                                                   |
| `db:admin` แจ้ง "ยังไม่มีตาราง"                                    | รัน `npm run db:schema` ก่อน                                                                                                             |
| `db:admin` แจ้งค่ายังเป็นตัวอย่าง/รหัสผ่านสั้น    | แก้ `ADMIN_EMAIL` / `ADMIN_PASSWORD` (อย่างน้อย 10 ตัว)                                                                        |
| เว็บขึ้น "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"   | เปิด Backend, ตรวจ `/api/health`, ตรวจ `VITE_API_BASE_URL` และรัน `npm run dev` ของ Frontend ใหม่                  |
| Console แจ้ง CORS error                                                           | ให้ `CLIENT_URL` ใน `server/.env` ตรงกับ URL ของเว็บ แล้วรีสตาร์ต Backend                                       |
| พอร์ต 3000/5173 ถูกใช้งาน                                               | ปิดโปรแกรมที่ใช้พอร์ต หรือเปลี่ยน `PORT` (และ `VITE_API_BASE_URL`)                                         |
| เห็นแถบ "โหมดสาธิต"                                                   | `VITE_USE_MOCK_API` ยังเป็น `true` — เปลี่ยนเป็น `false` แล้วรัน Frontend ใหม่                                |
| ชุดทดสอบไม่ยอมรัน                                                    | ตั้ง `TEST_DATABASE_URL` ให้ชี้ฐานข้อมูลทดสอบที่ชื่อมีคำว่า `test`                                      |
| ต้องการเริ่มข้อมูลใหม่ทั้งหมด                            | `npm run db:reset -- --yes` แล้ว `npm run db:admin`                                                                                       |

## เอกสารเพิ่มเติม

- [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) — เอกสาร API ทุก Endpoint พร้อมตัวอย่าง curl (และ Swagger UI ที่ `/api-docs`)
- [`docs/USER_MANUAL_TH.md`](docs/USER_MANUAL_TH.md) — คู่มือการใช้งานภาษาไทยสำหรับพิมพ์ส่งอาจารย์
- [`docs/PRESENTATION_PLAN_TH.md`](docs/PRESENTATION_PLAN_TH.md) — แผนนำเสนอ 30 นาที แบ่งหน้าที่ 3–4 คน และคำถาม-คำตอบ

## ข้อจำกัดที่ควรทราบ

- **ไม่มีระบบชำระเงินจริง** การสั่งซื้อสร้างรายการและตัดสต็อก สถานะเริ่มต้น `pending` (รอชำระเงิน) และยังไม่มี API เปลี่ยนสถานะ
- สต็อกเป็นรายสินค้า ไม่แยกตามไซซ์ · ตะกร้าเก็บใน `localStorage` ของเบราว์เซอร์
- JWT เก็บใน `localStorage` เหมาะกับงานเรียนรู้ หากใช้งานจริงควรใช้ HttpOnly Cookie + HTTPS
- ยังไม่มีรีเซ็ตรหัสผ่าน ยืนยันอีเมล อัปโหลดรูปสินค้า หรือเครื่องมือ Migration
- `limit` ของ `GET /products` สูงสุด 1000 (หน้าแรกและหน้า Admin ดึงสินค้าทั้งหมดในครั้งเดียว)
- ยังไม่ได้ทดสอบกับ PostgreSQL บน Cloud ที่บังคับ SSL (อาจต้องเพิ่ม `?sslmode=require` ใน `DATABASE_URL`)
