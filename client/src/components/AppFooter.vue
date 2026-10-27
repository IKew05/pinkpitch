<script setup>
import { Mail, MapPin, Phone } from 'lucide-vue-next'
</script>

<template>
  <footer class="footer">
    <div class="container foot-grid">
      <div>
        <div class="foot-brand">
          <img src="/logo.png" alt="PinkPitch" class="foot-logo" />
          <span>Pink<b>Pitch</b></span>
        </div>
        <p>ร้านเสื้อฟุตบอลออนไลน์ รวมเสื้อสโมสรและทีมชาติ คัดมาให้แฟนบอลที่รักการแต่งตัว</p>
      </div>
      <div>
        <h4>ลิงก์</h4>
        <ul>
          <li><RouterLink to="/products">สินค้าทั้งหมด</RouterLink></li>
          <li><RouterLink to="/cart">ตะกร้าสินค้า</RouterLink></li>
          <li><RouterLink to="/transactions">รายการสั่งซื้อของฉัน</RouterLink></li>
          <li><RouterLink to="/profile">โปรไฟล์</RouterLink></li>
        </ul>
      </div>
      <div>
        <h4>ติดต่อร้าน</h4>
        <ul class="contact">
          <li><MapPin :size="16" /> กรุงเทพมหานคร ประเทศไทย</li>
          <li><Phone :size="16" /> 02-000-0000</li>
          <li><Mail :size="16" /> hello@pinkpitch.test</li>
        </ul>
      </div>
    </div>
    <div class="container copy">© 2026 PinkPitch – Football Jersey Store · เว็บไซต์ตัวอย่างสำหรับการเรียนรู้ ไม่ใช่ร้านค้าจริง</div>
  </footer>
</template>

<style scoped>
.footer { background: var(--navy); color: #d7d9e6; padding: 48px 0 20px; margin-top: 40px; }
.foot-grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 32px; }
.foot-brand { font-family: var(--font-display); font-size: 1.5rem; color: #fff; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
.foot-brand b { color: var(--pink); }
.foot-logo { height: 38px; width: 38px; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(255, 79, 154, 0.45)); }
h4 { color: #fff; margin-bottom: 12px; }
ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.footer a { color: #d7d9e6; }
.contact li { display: flex; gap: 8px; align-items: center; }
.copy { margin-top: 32px; padding-top: 18px; border-top: 1px solid rgba(255,255,255,.14); font-size: .85rem; color: #9ea2bb; }
@media (max-width: 720px) { .foot-grid { grid-template-columns: 1fr; } }
</style>
