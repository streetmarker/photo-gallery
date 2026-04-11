<template>
  <!-- Grain overlay — texture layer over entire page -->
  <div class="grain" aria-hidden="true" />

  <!-- ── Hero ─────────────────────────────────────────── -->
  <header class="hero">
    <h1 class="hero__title">
      Photos from times<br />
      I took my camera<br />
      with me
    </h1>
    <p class="hero__sig">— MJ</p>
  </header>

  <!-- ── Loading state ────────────────────────────────── -->
  <div v-if="loading" class="status">
    <div class="loader" />
  </div>

  <!-- ── Error state ───────────────────────────────────── -->
  <div v-else-if="error" class="status status--error">
    Failed to load images.
  </div>

  <!-- ── Masonry grid ──────────────────────────────────── -->
  <main v-else class="masonry" role="main">
    <!-- Left column -->
    <div class="masonry__col">
      <template v-for="(img, i) in leftCol" :key="img.thumbnailImageSrc">
        <figure
          class="masonry__item"
          :class="{ 'masonry__item--landscape': img.isHorizontal }"
          :style="{ '--i': i }"
          @click="openModal(img)"
        >
          <img
            :src="img.thumbnailImageSrc"
            :alt="img.alt"
            class="masonry__img"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </template>
    </div>

    <!-- Right column — offset downward for asymmetry -->
    <div class="masonry__col masonry__col--offset">
      <template v-for="(img, i) in rightCol" :key="img.thumbnailImageSrc">
        <figure
          class="masonry__item"
          :class="{ 'masonry__item--landscape': img.isHorizontal }"
          :style="{ '--i': i }"
          @click="openModal(img)"
        >
          <img
            :src="img.thumbnailImageSrc"
            :alt="img.alt"
            class="masonry__img"
            loading="lazy"
            decoding="async"
          />
        </figure>
      </template>
    </div>
  </main>

  <!-- ── Modal ────────────────────────────────────────── -->
  <Transition name="modal">
    <div
      v-if="modal.open"
      class="modal"
      role="dialog"
      aria-modal="true"
      @click.self="closeModal"
      @keydown.esc="closeModal"
    >
      <button class="modal__close" aria-label="Close" @click="closeModal">✕</button>
      <img
        :src="modal.src"
        :alt="modal.alt"
        class="modal__img"
      />
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getStorageImgsNew, db } from '../firebaseInitializer'
import { collection, addDoc } from 'firebase/firestore'

// ── Store / config ────────────────────────────────────────
const store = photoStore()
const config = useRuntimeConfig()

// ── State ─────────────────────────────────────────────────
const images  = ref([])   // all images for current category
const loading = ref(true)
const error   = ref(false)

const modal = ref({ open: false, src: '', alt: '' })

// ── Masonry split ─────────────────────────────────────────
// Distribute images into two columns tracking running height.
// Portrait = 1.4 units, landscape = 0.6. Each image goes to
// whichever column is currently shorter — balances both columns.
const PORTRAIT_WEIGHT  = 1.4
const LANDSCAPE_WEIGHT = 0.6

const columns = computed(() => {
  const left  = []
  const right = []
  let leftH   = 0
  let rightH  = 0

  for (const img of images.value) {
    const w = img.isHorizontal ? LANDSCAPE_WEIGHT : PORTRAIT_WEIGHT
    if (leftH <= rightH) {
      left.push(img)
      leftH += w
    } else {
      right.push(img)
      rightH += w
    }
  }

  return { leftCol: left, rightCol: right }
})

const leftCol  = computed(() => columns.value.leftCol)
const rightCol = computed(() => columns.value.rightCol)

// ── Data loading ──────────────────────────────────────────
async function loadImages(category) {
  loading.value = true
  error.value   = false
  images.value  = []

  try {
    images.value = await getStorageImgsNew(category)
  } catch (e) {
    console.error('[NewPhotoGrid] Failed to load images:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

// ── Category watch ────────────────────────────────────────
watch(
  () => store.category,
  (newCat, oldCat) => {
    if (newCat && newCat !== oldCat) loadImages(newCat)
  }
)

// ── Modal ─────────────────────────────────────────────────
function openModal(img) {
  modal.value = { open: true, src: img.itemImageSrc, alt: img.alt }
}
function closeModal() {
  modal.value.open = false
}

// ── Visitor log (fire-and-forget) ─────────────────────────
async function logVisit() {
  if (process.env.NODE_ENV !== 'production') return
  try {
    const res  = await fetch('https://api.ipify.org?format=json')
    const { ip } = await res.json()
    const myIp = config.public.VUE_APP_MY_IP
    if (ip === myIp) return
    await addDoc(collection(db, 'entries'), {
      date:      new Date(),
      userAgent: navigator.userAgent ?? null,
      IP:        ip,
    })
  } catch { /* non-critical */ }
}

// ── Mount ─────────────────────────────────────────────────
onMounted(() => {
  loadImages('nature')
  logVisit()
})
</script>

<style scoped>
/* ── External ──────────────────────────────────────────── */
@import '../style/loader.css';

/* ── Google Fonts ──────────────────────────────────────── */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@300;400&display=swap');

/* ── Design tokens ─────────────────────────────────────── */
:root {
  --bg:          #0e0e0e;
  --surface:     #161616;
  --text:        #e8e2d9;
  --muted:       #5a5650;
  --accent:      #c9a96e;
  --gap:         clamp(10px, 1.8vw, 22px);
  --pad-x:       clamp(16px, 5vw, 72px);
  --col-w:       calc((100% - var(--gap)) / 2);
  --radius:      2px;
  --trans-img:   transform 0.6s cubic-bezier(0.16, 1, 0.3, 1),
                 filter    0.6s ease,
                 opacity   0.5s ease;
}

/* ── Base ──────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Grain ─────────────────────────────────────────────── */
.grain {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 100;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 180px 180px;
}

/* ── Hero ──────────────────────────────────────────────── */
.hero {
  padding: clamp(52px, 10vw, 120px) var(--pad-x) clamp(40px, 6vw, 80px);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 400;
  font-style: italic;
  font-size: clamp(32px, 6.5vw, 72px);
  line-height: 1.12;
  letter-spacing: -0.025em;
  color: var(--text);
  max-width: 14ch;
}

.hero__sig {
  font-family: 'DM Mono', 'Courier New', monospace;
  font-weight: 300;
  font-size: clamp(11px, 1.2vw, 14px);
  letter-spacing: 0.22em;
  color: var(--accent);
  text-transform: uppercase;
}

/* ── Status (loading / error) ──────────────────────────── */
.status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 80px var(--pad-x);
  color: var(--muted);
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.1em;
}
.status--error { color: #c0392b; }

/* ── Masonry grid ──────────────────────────────────────── */
.masonry {
  display: flex;
  gap: var(--gap);
  padding: 0 var(--pad-x) clamp(60px, 10vw, 140px);
  align-items: flex-start;
}

.masonry__col {
    display: flex;
    flex-direction: column;
    gap: var(--gap);
    flex: 1;
    min-width: 0;
    padding: 7px;
}

/* Right column pushed down — creates the asymmetric masonry feel */
.masonry__col--offset {
  margin-top: clamp(40px, 8vw, 100px);
}

/* ── Masonry item ──────────────────────────────────────── */
.masonry__item {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius);
  cursor: pointer;
  padding-bottom: 7px;

  /* staggered fade-up on load */
  animation: fadeUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: calc(var(--i, 0) * 80ms);
}

/* Landscape images get extra breathing room above and below */
.masonry__item--landscape {
  margin-top: clamp(16px, 3vw, 40px);
  margin-bottom: clamp(16px, 3vw, 40px);
}

/* ── Image ─────────────────────────────────────────────── */
.masonry__img {
  display: block;
  width: 100%;
  height: auto;
  transition: var(--trans-img);
  filter: brightness(0.92) saturate(0.9);
  transform-origin: center center;
}

.masonry__item:hover .masonry__img {
  transform: scale(1.03);
  filter: brightness(1.0) saturate(1.05);
}

/* thin accent line on hover — slides in from left */
.masonry__item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--accent);
  transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}
.masonry__item:hover::after {
  width: 100%;
}

/* ── Modal ─────────────────────────────────────────────── */
.modal {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(6, 6, 6, 0.94);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: zoom-out;
}

.modal__img {
  max-width: min(92vw, 1400px);
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--radius);
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
  cursor: default;
}

.modal__close {
  position: absolute;
  top: 24px;
  right: 28px;
  background: none;
  border: 1px solid var(--muted);
  color: var(--text);
  font-size: 14px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.modal__close:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* ── Modal transition ──────────────────────────────────── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

/* ── Animations ────────────────────────────────────────── */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* ── Responsive ────────────────────────────────────────── */

/* Narrow mobile: tighter padding, no column offset */
@media (max-width: 480px) {
  .masonry {
    /* padding-left: 12px;
    padding-right: 12px; */
  }

  .masonry__col--offset {
    margin-top: clamp(24px, 6vw, 50px);
  }
}
</style>