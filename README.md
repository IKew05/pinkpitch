n

# PinkPitch – Football Jersey Store

ระบบร้านค้าออนไลน์จำหน่ายเสื้อฟุตบอล ธีมสีชมพู
**Frontend:** Vue 3 + Vite + Vue Router + Axios · **Backend:** Node.js + Express · **ฐานข้อมูล:** PostgreSQL · **ยืนยันตัวตน:** JWT + bcrypt · **เอกสาร API:** OpenAPI / Swagger UI

```text
pinkpitch/
├── client/                  Frontend (Vue 3 + Vite)  → http://localhost:5173
│   ├── src/                 components, layouts, views, router, services (Axios), stores, utils
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

## 4) ติดตั้ง Dependencies และสร้าง Admin

```bash
npm install
npm run db:admin      # สร้างบัญชี Admin จาก ADMIN_* ใน .env (hash รหัสผ่านก่อนบันทึก)
npm run db:demo       # (ไม่บังคับ) สร้างลูกค้าตัวอย่าง demo@pinkpitch.test / Demo@12345 สำหรับสาธิต
```

**ตารางและสินค้าเริ่มต้นสร้างให้อัตโนมัติ** เมื่อเปิด Backend (ขั้นตอนที่ 5) โดยใช้ `server/database/schema.sql` (`CREATE ... IF NOT EXISTS` ไม่ลบข้อมูลเดิม) และถ้าตาราง `products` ว่างจะเพิ่มสินค้าเริ่มต้น 34 รายการจาก `server/database/seed.sql` ให้ 1 ครั้ง ข้อมูลทั้งหมดอยู่ใน PostgreSQL จริง เปิดดูใน pgAdmin ได้ทันที

- สร้างตาราง/สินค้าเองโดยไม่เปิดเซิร์ฟเวอร์: `npm run db:init` (หรือ `db:schema` / `db:seed` / `db:setup`) หรือเปิด `schema.sql` แล้ว `seed.sql` ใน pgAdmin → Query Tool → Execute (F5)
- ปิดการสร้างอัตโนมัติ: ตั้ง `AUTO_INIT_DB=false` (ปิดเฉพาะการเพิ่มสินค้า: `AUTO_SEED=false`) ใน `server/.env`
- `db:admin`: ถ้ามีอีเมลนี้อยู่แล้วจะไม่แก้ไข ใช้ `npm run db:admin -- --reset-password` เพื่อตั้งรหัสผ่านใหม่
- `db:demo` ไม่ทำงานเมื่อ `NODE_ENV=production`

### ดูข้อมูลใน pgAdmin

1. เปิด pgAdmin → เชื่อมต่อ Server เดียวกับที่ใช้ใน `DATABASE_URL` (host, port, ฐานข้อมูล, user ต้องตรงกัน — ตอนเปิด Backend จะพิมพ์ปลายทางที่ใช้อยู่ เช่น `localhost:5432/pinkpitch`)
2. `Databases → pinkpitch → Schemas → public → Tables` คลิกขวาที่ตาราง → **View/Edit Data → All Rows** (กด Refresh ถ้าเพิ่งมีข้อมูลใหม่)
3. หรือเปิด Query Tool แล้วรัน:

```sql
SELECT id, full_name, email, role, created_at FROM users ORDER BY id;      -- สมาชิก (password_hash เป็นค่าที่เข้ารหัสแล้ว)
SELECT id, name, price, stock, is_active FROM products ORDER BY id;        -- สินค้าและสต็อก
SELECT id, user_id, total_amount, status, created_at FROM transactions ORDER BY id DESC;   -- คำสั่งซื้อ
SELECT * FROM transaction_items ORDER BY transaction_id, id;               -- รายการสินค้าในแต่ละคำสั่งซื้อ
```

ข้อมูลที่บันทึกลงฐานข้อมูลทุกครั้งที่ใช้งานเว็บ: สมัครสมาชิก/แก้โปรไฟล์ (`users`), เพิ่ม/แก้/ลบสินค้าโดย Admin (`products`), กดยืนยันการสั่งซื้อ (`transactions` + `transaction_items` และสต็อกใน `products` ลดลง) และการเปลี่ยนสถานะคำสั่งซื้อ
ที่เก็บในเบราว์เซอร์ (`localStorage`) มีเพียงตะกร้าที่ยังไม่กดสั่งซื้อ และ Token เข้าสู่ระบบเท่านั้น

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

`client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

เปิดเว็บที่ **http://localhost:5173** (หลังแก้ `.env` ต้องรัน `npm run dev` ใหม่ ถ้า Vite เปลี่ยนพอร์ต ให้แก้ `CLIENT_URL` ใน `server/.env` ให้ตรงและรีสตาร์ต Backend)

### คำสั่งลัดจาก root

```bash
npm run install:all   # ติดตั้ง Dependencies ทั้ง server และ client
npm run db:init       # สร้างตาราง + สินค้าเริ่มต้น (ถ้ายังไม่มี)
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

## 10) ไม่มีโหมดข้อมูลจำลอง (Mock)

เว็บอ่านและบันทึกข้อมูลผ่าน Backend ไปยัง PostgreSQL เท่านั้น ถ้าเรียก API ไม่ได้จะแสดง Error State ไม่สลับไปแสดงข้อมูลจำลอง (ถ้าไฟล์ `client/.env` เดิมของคุณยังมี `VITE_USE_MOCK_API` ลบบรรทัดนั้นทิ้งได้ ไม่มีผลแล้ว)

## 11) ปัญหาที่พบบ่อย

| อาการ                                                                            | วิธีแก้                                                                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend แจ้ง "เชื่อมต่อฐานข้อมูล PostgreSQL ไม่สำเร็จ" | เปิดบริการ PostgreSQL, ตรวจรหัสผ่านใน `DATABASE_URL`, ตรวจว่าสร้างฐานข้อมูล `pinkpitch` แล้ว |
| Backend แจ้ง "JWT_SECRET ยังเป็นค่าตัวอย่าง"                    | แก้ `JWT_SECRET` ใน `server/.env` ตามหัวข้อ 3                                                                                   |
| `db:admin` แจ้ง "ยังไม่มีตาราง"                                    | เปิด Backend 1 ครั้ง หรือรัน `npm run db:init` ก่อน                                                                                                             |
| `db:admin` แจ้งค่ายังเป็นตัวอย่าง/รหัสผ่านสั้น    | แก้ `ADMIN_EMAIL` / `ADMIN_PASSWORD` (อย่างน้อย 10 ตัว)                                                                        |
| เว็บขึ้น "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"   | เปิด Backend, ตรวจ `/api/health`, ตรวจ `VITE_API_BASE_URL` และรัน `npm run dev` ของ Frontend ใหม่                  |
| Console แจ้ง CORS error                                                           | ให้ `CLIENT_URL` ใน `server/.env` ตรงกับ URL ของเว็บ แล้วรีสตาร์ต Backend                                       |
| พอร์ต 3000/5173 ถูกใช้งาน                                               | ปิดโปรแกรมที่ใช้พอร์ต หรือเปลี่ยน `PORT` (และ `VITE_API_BASE_URL`)                                         |
| เปิด pgAdmin แล้วไม่เห็นข้อมูล/ตาราง | ตรวจว่า pgAdmin เชื่อมต่อ Server และฐานข้อมูลเดียวกับ `DATABASE_URL` (ดูบรรทัด `✅ เชื่อมต่อฐานข้อมูลสำเร็จ: host:port/ชื่อฐานข้อมูล` ตอนเปิด Backend) แล้ว Refresh ที่ `Schemas → public → Tables` |
| ชุดทดสอบไม่ยอมรัน                                                    | ตั้ง `TEST_DATABASE_URL` ให้ชี้ฐานข้อมูลทดสอบที่ชื่อมีคำว่า `test`                                      |
| ต้องการเริ่มข้อมูลใหม่ทั้งหมด | ใน pgAdmin คลิกขวาที่ฐานข้อมูล → Delete แล้วสร้างฐานข้อมูลชื่อเดิมใหม่ จากนั้นเปิด Backend (สร้างตาราง + สินค้าให้อัตโนมัติ) แล้วรัน `npm run db:admin` (ข้อมูลเดิมทั้งหมดจะหายถาวร) |

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
