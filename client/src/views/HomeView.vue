<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, ShieldCheck } from 'lucide-vue-next'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import { productService } from '../services/productService'
import { formatBaht } from '../utils/format'

const products = ref([])
const loading = ref(true)
const current = ref(0)
const transitioning = ref(false)
const direction = ref('next')
let timer = null

async function load() {
  loading.value = true
  try {
    const res = await productService.list({ pageSize: 1000 })
    // Only show items that have images
    products.value = (res.items || []).filter(p => p.imageUrl)
  } catch {
    /* fallback empty */
  } finally {
    loading.value = false
  }
}
onMounted(load)

const item = computed(() => products.value[current.value] || null)

function go(idx) {
  if (transitioning.value || products.value.length < 2) return
  direction.value = idx > current.value ? 'next' : 'prev'
  transitioning.value = true
  setTimeout(() => {
    current.value = idx
    setTimeout(() => {
      transitioning.value = false
    }, 60)
  }, 450)
}

function next() {
  const len = products.value.length
  if (!len) return
  go((current.value + 1) % len)
}

function prev() {
  const len = products.value.length
  if (!len) return
  go((current.value - 1 + len) % len)
}

function startAuto() {
  clearInterval(timer)
  timer = setInterval(next, 4500)
}

function stopAuto() {
  clearInterval(timer)
}

watch(loading, (v) => {
  if (!v && products.value.length) startAuto()
})
onBeforeUnmount(stopAuto)

function manualNav(fn) {
  stopAuto()
  fn()
  startAuto()
}
</script>

<template>
  <div class="billboard" @mouseenter="stopAuto" @mouseleave="startAuto">
    <LoadingSpinner v-if="loading" label="กำลังเตรียมป้ายโฆษณาเสื้อทีม..." />

    <template v-else-if="item">
      <!-- Ambient Pastel Pink Glows -->
      <div class="glow-bg" />
      <div class="accent-spot light-spot-1" />
      <div class="accent-spot light-spot-2" />

      <!-- Floating Sparkles / Particles -->
      <div class="particles" aria-hidden="true">
        <span
          v-for="i in 18"
          :key="i"
          class="particle"
          :style="{
            left: `${(i * 19) % 98}%`,
            top: `${(i * 23) % 94}%`,
            animationDelay: `${(i * 0.45) % 6}s`,
            animationDuration: `${7 + (i % 5)}s`,
            width: `${4 + (i % 5)}px`,
            height: `${4 + (i % 5)}px`
          }"
        />
      </div>

      <!-- Main Stage Billboard Layout -->
      <div class="stage">
        <!-- Team Information Column -->
        <div class="info" :class="{ 'is-out': transitioning }">
          <div class="badge-row">
            <span class="league-badge">
              <Sparkles :size="13" class="badge-icon" />
              {{ item.category }} · {{ item.season }}
            </span>
            <span v-if="item.stock > 0" class="authentic-badge">
              <ShieldCheck :size="13" /> Authentic 100%
            </span>
          </div>

          <h1 class="team-name">{{ item.teamName }}</h1>
          <p class="jersey-name">{{ item.name }}</p>

          <div class="price-wrap">
            <span class="price-label">ราคาพิเศษ</span>
            <div class="price-tag">{{ formatBaht(item.price) }}</div>
          </div>

          <p class="desc">{{ item.description }}</p>

          <div class="cta-row">
            <RouterLink :to="`/products/${item.id}`" class="btn-shop">
              <span>สั่งซื้อเสื้อทีมนี้</span>
              <ArrowRight :size="18" />
            </RouterLink>
            <RouterLink to="/products" class="btn-all">
              ดูเสื้อทีมทั้งหมด ({{ products.length }})
            </RouterLink>
          </div>

          <!-- Counter indicator -->
          <div class="counter-indicator">
            <span class="current-num">{{ String(current + 1).padStart(2, '0') }}</span>
            <span class="slash">/</span>
            <span class="total-num">{{ String(products.length).padStart(2, '0') }}</span>
            <span class="club-title">· {{ item.teamName }} Official Kit</span>
          </div>
        </div>

        <!-- Jersey Showcase Column -->
        <div class="showcase">
          <!-- Soft luxury podium glow effect -->
          <div class="pedestal-shadow" />
          <div class="halo halo-inner" />
          <div class="halo halo-outer" />

          <!-- Floating Jersey Image with rotation animation -->
          <div class="jersey-wrap" :class="{ 'is-out': transitioning, [direction]: true }">
            <img :src="item.imageUrl" :alt="item.name" class="jersey-img" />
          </div>
        </div>
      </div>

      <!-- Bottom Navigation Controls -->
      <div class="nav-controls">
        <button class="nav-btn prev-btn" aria-label="เสื้อทีมก่อนหน้า" @click="manualNav(prev)">
          <ChevronLeft :size="22" />
        </button>

        <div class="dots-wrapper">
          <div class="dots">
            <button
              v-for="(p, i) in products"
              :key="p.id"
              class="dot"
              :class="{ active: i === current }"
              :title="p.teamName"
              :aria-label="`เลือกเสื้อทีม ${p.teamName}`"
              @click="manualNav(() => go(i))"
            >
              <span class="dot-fill" />
            </button>
          </div>
        </div>

        <button class="nav-btn next-btn" aria-label="เสื้อทีมถัดไป" @click="manualNav(next)">
          <ChevronRight :size="22" />
        </button>
      </div>

      <!-- Progress bar auto rotation indicator -->
      <div class="progress-track">
        <div class="progress-bar" :key="current" />
      </div>

      <!-- Bottom luxury running ticker -->
      <div class="bottom-strip">
        <div class="ticker-track">
          <span class="strip-item" v-for="n in 8" :key="n">
            ✦ PINKPITCH OFFICIAL LUXURY COLLECTION ✦ 100% AUTHENTIC QUALITY ✦ {{ item.teamName?.toUpperCase() }} ✦
          </span>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ── Main Billboard Container: Pastel Pink Luxury Theme ── */
.billboard {
  position: relative;
  min-height: calc(100vh - var(--nav-h));
  overflow: hidden;
  background: linear-gradient(145deg, #FFF6FA 0%, #FFE9F2 45%, #FFF0F6 100%);
  display: flex;
  flex-direction: column;
  color: var(--ink);
  user-select: none;
}

/* ── Ambient Pastel Pink Glows ── */
.glow-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 72% 40%, rgba(255, 79, 154, 0.16) 0%, rgba(255, 225, 236, 0.45) 38%, transparent 70%),
    radial-gradient(circle at 18% 30%, rgba(232, 62, 140, 0.10) 0%, rgba(255, 245, 248, 0.3) 50%, transparent 75%);
  pointer-events: none;
  z-index: 1;
}

.accent-spot {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 1;
}

.light-spot-1 {
  width: 500px;
  height: 500px;
  background: rgba(255, 142, 188, 0.22);
  top: 10%;
  right: 5%;
}

.light-spot-2 {
  width: 400px;
  height: 400px;
  background: rgba(255, 214, 231, 0.6);
  bottom: 12%;
  left: 8%;
}

/* ── Floating Sparkles / Particles ── */
.particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255, 79, 154, 0.35), rgba(255, 255, 255, 0.8));
  box-shadow: 0 0 10px rgba(255, 79, 154, 0.3);
  animation: float-sparkle linear infinite;
}

@keyframes float-sparkle {
  0% {
    transform: translateY(0) scale(0.8);
    opacity: 0;
  }
  20% {
    opacity: 0.85;
  }
  80% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-80px) scale(1.2);
    opacity: 0;
  }
}

/* ── Stage Layout ── */
.stage {
  position: relative;
  z-index: 2;
  flex: 1;
  display: grid;
  grid-template-columns: 1.05fr 1.15fr;
  align-items: center;
  max-width: 1240px;
  width: 100%;
  margin: 0 auto;
  padding: 40px 32px 24px;
  gap: 40px;
}

/* ── Info Column ── */
.info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.45s ease;
}

.info.is-out {
  transform: translateY(24px);
  opacity: 0;
}

.badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.league-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--rose) 0%, var(--pink) 100%);
  color: #fff;
  font-family: var(--font-display);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 6px 16px;
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(232, 62, 140, 0.25);
}

.badge-icon {
  color: #FFE1EC;
}

.authentic-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--line);
  color: var(--rose-deep);
  font-size: 0.76rem;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 999px;
}

.team-name {
  font-family: var(--font-display);
  font-size: clamp(2.4rem, 4.8vw, 4.2rem);
  font-weight: 800;
  line-height: 1.08;
  margin: 0 0 10px;
  color: var(--navy);
  letter-spacing: -0.5px;
  text-shadow: 0 2px 14px rgba(232, 62, 140, 0.08);
}

.jersey-name {
  font-size: 1.25rem;
  font-weight: 500;
  color: #666B85;
  margin: 0 0 16px;
  letter-spacing: 0.2px;
}

.price-wrap {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 16px;
}

.price-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.price-tag {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--rose-deep);
  letter-spacing: -0.5px;
  text-shadow: 0 4px 18px rgba(232, 62, 140, 0.15);
}

.desc {
  font-size: 0.98rem;
  color: #555A75;
  line-height: 1.65;
  max-width: 460px;
  margin: 0 0 28px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.cta-row {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 24px;
}

.btn-shop {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--rose) 0%, var(--pink) 100%);
  color: #fff !important;
  font-family: var(--font-display);
  font-weight: 700;
  padding: 13px 30px;
  border-radius: 999px;
  text-decoration: none !important;
  font-size: 1rem;
  transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.3, 1), box-shadow 0.2s;
  box-shadow: 0 8px 24px rgba(232, 62, 140, 0.32);
}

.btn-shop:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 12px 30px rgba(232, 62, 140, 0.45);
}

.btn-all {
  display: inline-flex;
  align-items: center;
  color: var(--navy) !important;
  font-family: var(--font-display);
  font-weight: 600;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.85);
  border: 1.5px solid var(--line);
  border-radius: 999px;
  text-decoration: none !important;
  font-size: 0.95rem;
  backdrop-filter: blur(8px);
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
}

.btn-all:hover {
  border-color: var(--pink);
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(232, 62, 140, 0.12);
}

.counter-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-display);
  font-size: 0.85rem;
  color: var(--muted);
  font-weight: 600;
}

.current-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--rose-deep);
}

.slash {
  opacity: 0.4;
}

.club-title {
  color: var(--muted);
  font-weight: 500;
  margin-left: 4px;
}

/* ── Jersey Showcase Column ── */
.showcase {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 440px;
}

/* Podium shadow & halo glow */
.pedestal-shadow {
  position: absolute;
  width: 320px;
  height: 60px;
  background: radial-gradient(ellipse at center, rgba(232, 62, 140, 0.22) 0%, rgba(255, 79, 154, 0.08) 50%, transparent 80%);
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 50%;
  filter: blur(14px);
  z-index: 1;
}

.halo {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 79, 154, 0.25);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 225, 236, 0.2) 60%, transparent 80%);
}

.halo-inner {
  width: 400px;
  height: 400px;
  animation: spin-halo 24s linear infinite;
  box-shadow: 0 0 50px rgba(255, 79, 154, 0.12);
}

.halo-outer {
  width: 490px;
  height: 490px;
  border-style: dashed;
  border-color: rgba(232, 62, 140, 0.18);
  animation: spin-halo 36s linear infinite reverse;
}

@keyframes spin-halo {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

/* Jersey Wrap & Animated Transitions */
.jersey-wrap {
  position: relative;
  z-index: 2;
  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.3, 1), opacity 0.45s ease;
}

.jersey-wrap.is-out.next {
  transform: translateX(70px) scale(0.88) rotate(5deg);
  opacity: 0;
}

.jersey-wrap.is-out.prev {
  transform: translateX(-70px) scale(0.88) rotate(-5deg);
  opacity: 0;
}

.jersey-img {
  width: min(440px, 80vw);
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 20px 34px rgba(232, 62, 140, 0.18)) drop-shadow(0 4px 10px rgba(32, 36, 58, 0.08));
  animation: gentle-float 5.5s ease-in-out infinite;
  border-radius: 18px;
}

@keyframes gentle-float {
  0%, 100% {
    transform: translateY(0) rotate(-1.5deg);
  }
  50% {
    transform: translateY(-15px) rotate(1.2deg);
  }
}

/* ── Navigation Controls ── */
.nav-controls {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 32px 14px;
}

.nav-btn {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1.5px solid var(--line);
  background: rgba(255, 255, 255, 0.9);
  color: var(--navy);
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 12px rgba(232, 62, 140, 0.08);
}

.nav-btn:hover {
  background: #fff;
  border-color: var(--pink);
  color: var(--rose-deep);
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(232, 62, 140, 0.2);
}

.dots-wrapper {
  max-width: 420px;
  overflow: hidden;
  padding: 6px 2px;
}

.dots {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  padding: 2px;
}

.dots::-webkit-scrollbar {
  display: none;
}

.dot {
  width: 10px;
  height: 10px;
  min-width: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(232, 62, 140, 0.2);
  cursor: pointer;
  padding: 0;
  transition: background 0.3s, transform 0.3s, width 0.3s;
}

.dot:hover {
  background: rgba(232, 62, 140, 0.45);
}

.dot.active {
  width: 32px;
  border-radius: 5px;
  background: linear-gradient(90deg, var(--rose), var(--pink));
  box-shadow: 0 2px 8px rgba(232, 62, 140, 0.3);
}

/* ── Progress Bar ── */
.progress-track {
  position: relative;
  z-index: 3;
  height: 3px;
  background: rgba(232, 62, 140, 0.1);
  margin: 0;
  width: 100%;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--rose), var(--pink));
  animation: progress-fill 4.5s linear forwards;
}

@keyframes progress-fill {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

/* ── Bottom Luxury Running Ticker ── */
.bottom-strip {
  position: relative;
  z-index: 3;
  overflow: hidden;
  white-space: nowrap;
  padding: 12px 0;
  font-family: var(--font-display);
  font-size: 0.72rem;
  letter-spacing: 3px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--rose-deep);
  opacity: 0.6;
  background: rgba(255, 255, 255, 0.65);
  border-top: 1px solid var(--line);
  backdrop-filter: blur(6px);
}

.ticker-track {
  display: inline-block;
  animation: marquee 35s linear infinite;
}

.strip-item {
  display: inline-block;
  margin-right: 20px;
}

@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .stage {
    grid-template-columns: 1fr;
    text-align: center;
    padding: 30px 20px 16px;
    gap: 20px;
  }
  .showcase {
    order: -1;
    min-height: 320px;
  }
  .jersey-img {
    width: min(300px, 70vw);
  }
  .halo-inner {
    width: 290px;
    height: 290px;
  }
  .halo-outer {
    width: 350px;
    height: 350px;
  }
  .pedestal-shadow {
    width: 240px;
  }
  .info {
    align-items: center;
  }
  .desc {
    text-align: center;
  }
  .badge-row {
    justify-content: center;
  }
  .cta-row {
    justify-content: center;
  }
  .price-wrap {
    justify-content: center;
  }
  .team-name {
    font-size: clamp(2rem, 7vw, 3rem);
  }
  .price-tag {
    font-size: 1.8rem;
  }
  .counter-indicator {
    justify-content: center;
  }
}
</style>
