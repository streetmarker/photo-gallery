<template>
  <div class="gallery-wrapper">
    <!-- Subtle Grain texture overlay -->
    <div class="grain-overlay" aria-hidden="true" />

    <!-- ── Hero Editorial Header ─────────────────────────────── -->
    <header class="hero-section">
      <h1 class="hero-title">
        Zdjęcia z chwil,<br />
        kiedy miałem przy sobie aparat
      </h1>
      <p class="hero-subtitle">
        Wyselekcjonowane kadry krajobrazowe, portretowe, uliczne i motoryzacyjne.
      </p>
    </header>

    <!-- ── Discreet Photo Count ──────────────────────────────── -->
    <div v-if="!loading && !error && currentImages.length > 0" class="discreet-count-bar">
      <span class="discreet-count-text">{{ currentImages.length }} zdjęć</span>
    </div>

    <!-- ── Loading Skeleton State ────────────────────────────── -->
    <div v-if="loading" class="skeleton-grid" aria-label="Ładowanie zdjęć...">
      <div class="masonry-col">
        <div v-for="n in 3" :key="'sk-left-' + n" class="skeleton-item skeleton-box" :style="{ height: n % 2 === 0 ? '340px' : '240px' }" />
      </div>
      <div class="masonry-col masonry-col--offset">
        <div v-for="n in 3" :key="'sk-right-' + n" class="skeleton-item skeleton-box" :style="{ height: n % 2 === 0 ? '260px' : '360px' }" />
      </div>
    </div>

    <!-- ── Error State ───────────────────────────────────────── -->
    <div v-else-if="error" class="error-state" role="alert">
      <i class="pi pi-exclamation-triangle error-icon" aria-hidden="true" />
      <p>Nie udało się załadować zdjęć galerii.</p>
      <button type="button" class="btn btn-secondary" @click="loadImages(store.category)">
        <i class="pi pi-refresh" /> Spróbuj ponownie
      </button>
    </div>

    <!-- ── True Masonry Grid ─────────────────────────────────── -->
    <main v-else-if="currentImages.length > 0" class="masonry-grid" role="main">
      <!-- Left Column -->
      <div class="masonry-col">
        <figure
          v-for="(img, idx) in leftCol"
          :key="img.thumbnailImageSrc"
          class="photo-card"
          tabindex="0"
          role="button"
          :aria-label="`Otwórz zdjęcie: ${img.title}`"
          @click="openLightbox(img.id)"
          @keydown.enter="openLightbox(img.id)"
          @keydown.space.prevent="openLightbox(img.id)"
        >
          <div v-if="!loadedImages.has(img.thumbnailImageSrc)" class="card-skeleton skeleton-box" />

          <img
            :src="img.thumbnailImageSrc"
            :alt="img.alt"
            class="photo-img"
            :class="{ 'photo-img--loaded': loadedImages.has(img.thumbnailImageSrc) }"
            loading="lazy"
            decoding="async"
            @load="onImageLoad(img.thumbnailImageSrc)"
          />

          <!-- Metadata Hover / Long-press Overlay -->
          <figcaption class="card-overlay">
            <span class="card-category-badge">{{ img.category }}</span>
            <span class="card-title">{{ img.title }}</span>
          </figcaption>
        </figure>
      </div>

      <!-- Right Column (Offset downward for editorial masonry rhythm) -->
      <div class="masonry-col masonry-col--offset">
        <figure
          v-for="(img, idx) in rightCol"
          :key="img.thumbnailImageSrc"
          class="photo-card"
          tabindex="0"
          role="button"
          :aria-label="`Otwórz zdjęcie: ${img.title}`"
          @click="openLightbox(img.id)"
          @keydown.enter="openLightbox(img.id)"
          @keydown.space.prevent="openLightbox(img.id)"
        >
          <div v-if="!loadedImages.has(img.thumbnailImageSrc)" class="card-skeleton skeleton-box" />

          <img
            :src="img.thumbnailImageSrc"
            :alt="img.alt"
            class="photo-img"
            :class="{ 'photo-img--loaded': loadedImages.has(img.thumbnailImageSrc) }"
            loading="lazy"
            decoding="async"
            @load="onImageLoad(img.thumbnailImageSrc)"
          />

          <!-- Metadata Hover Overlay -->
          <figcaption class="card-overlay">
            <span class="card-category-badge">{{ img.category }}</span>
            <span class="card-title">{{ img.title }}</span>
          </figcaption>
        </figure>
      </div>
    </main>

    <!-- Empty Category State -->
    <div v-else class="empty-state">
      <p>Brak zdjęć w tej kategorii.</p>
      <button type="button" class="btn btn-primary" @click="resetCategory">Pokaż wszystkie zdjęcia</button>
    </div>

    <!-- ── LIGHTBOX MODAL ────────────────────────────────────── -->
    <Transition name="lightbox-fade">
      <div
        v-if="lightbox.open"
        class="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Przeglądarka zdjęć w pełnym rozmiarze"
        tabindex="-1"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <!-- Full Screen High-Contrast Backdrop -->
        <div class="lightbox-backdrop" @click="closeLightbox" />

        <!-- Lightbox Header Controls -->
        <div class="lightbox-header">
          <div class="lightbox-counter">
            <i class="pi pi-images" aria-hidden="true" />
            <span>{{ lightbox.currentIndex + 1 }} / {{ currentImages.length }}</span>
          </div>

          <button
            type="button"
            class="lightbox-close-btn"
            aria-label="Zamknij podgląd (Escape)"
            @click="closeLightbox"
          >
            <i class="pi pi-times" aria-hidden="true" />
          </button>
        </div>

        <!-- Main Lightbox Image Container -->
        <div class="lightbox-stage">
          <!-- Left Prev Arrow Button -->
          <button
            type="button"
            class="lightbox-nav-btn lightbox-nav-btn--prev"
            aria-label="Poprzednie zdjęcie (Strzałka w lewo)"
            :disabled="currentImages.length <= 1"
            @click="prevImage"
          >
            <i class="pi pi-chevron-left" aria-hidden="true" />
          </button>

          <!-- Current Image Wrapper & Spinner Loader -->
          <div class="lightbox-image-wrapper">
            <!-- Transition Loader Overlay -->
            <Transition name="loader-fade">
              <div v-if="isLightboxLoading" class="lightbox-loader-overlay" aria-label="Ładowanie zdjęcia...">
                <div class="lightbox-spinner" />
              </div>
            </Transition>

            <img
              :key="currentLightboxImage?.itemImageSrc"
              :src="currentLightboxImage?.itemImageSrc"
              :alt="currentLightboxImage?.alt"
              class="lightbox-img"
              :class="{ 'lightbox-img--loading': isLightboxLoading }"
              @load="onLightboxImageLoad"
            />
          </div>

          <!-- Right Next Arrow Button -->
          <button
            type="button"
            class="lightbox-nav-btn lightbox-nav-btn--next"
            aria-label="Następne zdjęcie (Strzałka w prawo)"
            :disabled="currentImages.length <= 1"
            @click="nextImage"
          >
            <i class="pi pi-chevron-right" aria-hidden="true" />
          </button>
        </div>

        <!-- Lightbox Bottom Caption Bar (Without framing metadata) -->
        <div class="lightbox-footer">
          <div class="lightbox-caption">
            <span class="lightbox-category-tag">{{ currentLightboxImage?.category }}</span>
            <h2 class="lightbox-title">{{ currentLightboxImage?.title }}</h2>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { photoStore } from '../stores/photos'
import { getStorageImgsNew, db } from '../firebaseInitializer'
import { collection, addDoc } from 'firebase/firestore'

const store = photoStore()
const config = useRuntimeConfig()

// State
const currentImages = ref([])
const loading = ref(true)
const error = ref(false)
const loadedImages = ref(new Set())

// Lightbox state
const lightbox = ref({
  open: false,
  currentIndex: 0
})
const isLightboxLoading = ref(true)

function onImageLoad(src) {
  loadedImages.value.add(src)
}

function onLightboxImageLoad() {
  isLightboxLoading.value = false
}

// Current image in Lightbox
const currentLightboxImage = computed(() => {
  if (!currentImages.value.length || lightbox.value.currentIndex < 0) return null
  return currentImages.value[lightbox.value.currentIndex] || null
})

// Dynamic 2-column masonry split with balanced aspect ratios
const PORTRAIT_WEIGHT = 1.4
const LANDSCAPE_WEIGHT = 0.75

const columns = computed(() => {
  const left = []
  const right = []
  let leftH = 0
  let rightH = 0

  for (const img of currentImages.value) {
    const weight = img.isHorizontal ? LANDSCAPE_WEIGHT : PORTRAIT_WEIGHT
    if (leftH <= rightH) {
      left.push(img)
      leftH += weight
    } else {
      right.push(img)
      rightH += weight
    }
  }

  return { leftCol: left, rightCol: right }
})

const leftCol = computed(() => columns.value.leftCol)
const rightCol = computed(() => columns.value.rightCol)

// Data fetching
async function loadImages(category) {
  loading.value = true
  error.value = false
  currentImages.value = []

  try {
    const res = await getStorageImgsNew(category)
    if (res && res.images) {
      currentImages.value = res.images
      if (res.counts) {
        store.setCounts(res.counts)
      }
    }
  } catch (e) {
    console.error('[PhotosGrid] Error loading images:', e)
    error.value = true
  } finally {
    loading.value = false
  }
}

function resetCategory() {
  store.setCategory('all')
}

// Watch category changes from Pinia store
watch(
  () => store.category,
  (newCat) => {
    loadImages(newCat)
  }
)

// Watch lightbox image index changes to trigger loading spinner
watch(
  () => lightbox.value.currentIndex,
  () => {
    if (lightbox.value.open) {
      isLightboxLoading.value = true
    }
  }
)

// Lightbox Methods
function openLightbox(id) {
  const index = currentImages.value.findIndex(img => img.id === id)
  if (index !== -1) {
    isLightboxLoading.value = true
    lightbox.value.currentIndex = index
    lightbox.value.open = true
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
  }
}

function closeModal() {
  closeLightbox()
}

function closeLightbox() {
  lightbox.value.open = false
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
}

function nextImage() {
  if (!currentImages.value.length) return
  isLightboxLoading.value = true
  lightbox.value.currentIndex = (lightbox.value.currentIndex + 1) % currentImages.value.length
}

function prevImage() {
  if (!currentImages.value.length) return
  isLightboxLoading.value = true
  lightbox.value.currentIndex =
    (lightbox.value.currentIndex - 1 + currentImages.value.length) % currentImages.value.length
}

// Touch swipe gesture detection for mobile lightbox
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e) {
  if (e.touches && e.touches.length > 0) {
    touchStartX = e.touches[0].clientX
    touchStartY = e.touches[0].clientY
  }
}

function onTouchEnd(e) {
  if (!lightbox.value.open || !e.changedTouches || e.changedTouches.length === 0) return
  const deltaX = e.changedTouches[0].clientX - touchStartX
  const deltaY = e.changedTouches[0].clientY - touchStartY

  // Ensure horizontal swipe is dominant
  if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
    if (deltaX < 0) {
      nextImage()
    } else {
      prevImage()
    }
  }
}

// Keyboard shortcuts for Lightbox
function handleKeydown(e) {
  if (!lightbox.value.open) return
  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  }
}

// Visitor logging
async function logVisit() {
  if (process.env.NODE_ENV !== 'production') return
  try {
    const res = await fetch('https://api.ipify.org?format=json')
    const { ip } = await res.json()
    const myIp = config.public?.VUE_APP_MY_IP
    if (ip === myIp) return
    await addDoc(collection(db, 'entries'), {
      date: new Date(),
      userAgent: navigator.userAgent ?? null,
      IP: ip,
    })
  } catch { /* non-critical */ }
}

onMounted(() => {
  loadImages(store.category || 'all')
  window.addEventListener('keydown', handleKeydown)
  logVisit()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped>
.gallery-wrapper {
  position: relative;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px 60px 24px;
}

/* Background Texture */
.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: var(--z-background, 1);
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
}

/* Hero Section */
.hero-section {
  padding: 40px 0 24px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.hero-title {
  font-family: var(--font-serif, Georgia, serif);
  font-weight: 400;
  font-style: italic;
  font-size: clamp(2rem, 4.5vw, 3.75rem);
  line-height: 1.15;
  color: #FFFFFF;
  max-width: 22ch;
}

.hero-subtitle {
  color: var(--text-secondary, #A0A0B2);
  font-size: 1.05rem;
  max-width: 55ch;
}

/* Discreet Photo Count Bar */
.discreet-count-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.discreet-count-text {
  font-family: var(--font-mono, monospace);
  font-size: 0.8125rem;
  color: var(--text-muted, #6E6E82);
  letter-spacing: 0.08em;
  text-transform: lowercase;
}

/* Skeleton & Error State */
.skeleton-grid, .masonry-grid {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.masonry-col {
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
  min-width: 0;
}

.masonry-col--offset {
  margin-top: 40px;
}

.skeleton-item {
  width: 100%;
  border-radius: 16px;
}

.error-state, .empty-state {
  text-align: center;
  padding: 60px 24px;
  background: var(--bg-surface, #121218);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--text-secondary);
}

.error-icon {
  font-size: 2rem;
  color: #EF4444;
}

/* Photo Cards */
.photo-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-surface, #121218);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  outline: none;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
}

.photo-card:hover, .photo-card:focus-visible {
  transform: translateY(-4px) scale(1.015);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(139, 92, 246, 0.25);
}

.card-skeleton {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  z-index: 1;
}

.photo-img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.5s ease, filter 0.5s ease;
  filter: brightness(0.95);
}

.photo-img--loaded {
  opacity: 1;
}

.photo-card:hover .photo-img {
  filter: brightness(1.05);
}

/* Overlay Metadata */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(8, 8, 12, 0.9) 0%, rgba(8, 8, 12, 0.3) 50%, transparent 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.35s ease;
  z-index: 2;
}

.photo-card:hover .card-overlay,
.photo-card:focus-visible .card-overlay {
  opacity: 1;
}

.card-category-badge {
  align-self: flex-start;
  font-family: var(--font-mono, monospace);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #FFFFFF;
  background: var(--color-brand, #8B5CF6);
  padding: 3px 10px;
  border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.card-title {
  color: #FFFFFF;
  font-weight: 600;
  font-size: 0.9375rem;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.8);
}

/* ── LIGHTBOX MODAL STYLES ───────────────────────────────── */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal, 1000);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--bg-overlay, rgba(8, 8, 12, 0.96));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  overflow: hidden;
  user-select: none;
}

.lightbox-backdrop {
  position: absolute;
  inset: 0;
}

.lightbox-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
}

.lightbox-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, monospace);
  font-size: 0.875rem;
  color: var(--text-brand, #A78BFA);
  background: rgba(139, 92, 246, 0.15);
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding: 6px 14px;
  border-radius: 9999px;
}

.lightbox-close-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lightbox-close-btn:hover {
  background: var(--color-brand, #8B5CF6);
  border-color: var(--color-brand, #8B5CF6);
  transform: scale(1.08);
}

.lightbox-stage {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  min-height: 0;
}

.lightbox-nav-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(20, 20, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #FFFFFF;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s ease;
  flex-shrink: 0;
}

.lightbox-nav-btn:hover:not(:disabled) {
  background: var(--color-brand, #8B5CF6);
  border-color: var(--color-brand, #8B5CF6);
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
  transform: scale(1.1);
}

.lightbox-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.lightbox-image-wrapper {
  position: relative;
  max-width: min(85vw, 1200px);
  max-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 12px;
}

/* Lightbox Image Loading Spinner & Dark Overlay */
.lightbox-loader-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  background: rgba(8, 8, 12, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(139, 92, 246, 0.2);
  border-top-color: var(--color-brand, #8B5CF6);
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
  box-shadow: 0 0 16px rgba(139, 92, 246, 0.3);
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

.lightbox-img {
  max-width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.9);
  transition: opacity 0.3s ease;
}

.lightbox-img--loading {
  opacity: 0.3;
}

.lightbox-footer {
  position: relative;
  z-index: 2;
  padding: 18px 28px;
  background: rgba(12, 12, 18, 0.9);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lightbox-caption {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lightbox-category-tag {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-brand, #8B5CF6);
  background: rgba(139, 92, 246, 0.12);
  padding: 3px 10px;
  border-radius: 9999px;
}

.lightbox-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #FFFFFF;
}

/* Lightbox Animations */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}

.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .masonry-col--offset {
    margin-top: 0;
  }

  .lightbox-stage {
    padding: 0 8px;
  }

  .lightbox-nav-btn {
    width: 44px;
    height: 44px;
    font-size: 1.1rem;
  }

  .lightbox-footer {
    padding: 14px 20px;
  }
}
</style>