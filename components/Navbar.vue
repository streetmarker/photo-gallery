<template>
  <header class="navbar-header">
    <div class="navbar-container">
      <!-- Brand / Logo Section -->
      <a href="#" class="brand" aria-label="Strona główna M21Photos" @click.prevent="selectCategory('all')">
        <div class="logo-wrapper">
          <img src="/logo.webp" alt="M21Photos logo" class="logo-img" />
          <div class="logo-glow" />
        </div>
        <div class="brand-text">
          <span class="brand-title">M21Photos</span>
          <span class="brand-subtitle">Michał Jaroń Photography</span>
        </div>
      </a>

      <!-- Categories Selector & Dropdown -->
      <div class="categories-wrapper">
        <!-- Categories Trigger Button -->
        <button
          type="button"
          class="btn btn-primary categories-btn"
          :class="{ 'categories-btn--active': isMenuOpen }"
          :aria-expanded="isMenuOpen"
          aria-haspopup="true"
          aria-controls="categories-dropdown"
          aria-label="Otwórz menu kategorii"
          @click="toggleMenu"
        >
          <i class="pi pi-filter" aria-hidden="true" />
          <span>Kategorie</span>
          <span v-if="activeCategoryCount > 0" class="badge-count">{{ activeCategoryCount }}</span>
          <i :class="['pi', isMenuOpen ? 'pi-chevron-up' : 'pi-chevron-down']" aria-hidden="true" />
        </button>

        <!-- Tap-Outside Backdrop -->
        <Transition name="fade">
          <div
            v-if="isMenuOpen"
            class="dropdown-backdrop"
            aria-hidden="true"
            @click="closeMenu"
          />
        </Transition>

        <!-- Dropdown Menu Panel -->
        <Transition name="dropdown-slide">
          <div
            v-if="isMenuOpen"
            id="categories-dropdown"
            class="dropdown-panel"
            role="menu"
            aria-label="Kategorie galerii"
            @keydown.esc="closeMenu"
          >
            <!-- Dropdown Header -->
            <div class="dropdown-header">
              <span class="dropdown-title">Filtruj Galerie</span>
              <button
                type="button"
                class="dropdown-close-btn"
                aria-label="Zamknij menu kategorii"
                @click="closeMenu"
              >
                <i class="pi pi-times" aria-hidden="true" />
              </button>
            </div>

            <!-- Categories List -->
            <ul class="dropdown-list" role="none">
              <li
                v-for="cat in categoryList"
                :key="cat.id"
                role="none"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="dropdown-item"
                  :class="{ 'dropdown-item--active': store.category === cat.id }"
                  @click="selectCategory(cat.id)"
                >
                  <span class="item-icon">
                    <i :class="cat.icon" aria-hidden="true" />
                  </span>

                  <span class="item-label">{{ cat.label }}</span>

                  <span class="item-count">{{ store.counts[cat.id] ?? 0 }}</span>

                  <span v-if="store.category === cat.id" class="item-checkmark">
                    <i class="pi pi-check" aria-hidden="true" />
                  </span>
                </button>
              </li>
            </ul>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { photoStore } from '../stores/photos'

const store = photoStore()
const isMenuOpen = ref(false)

const categoryList = computed(() => [
  { id: 'all', label: 'Wszystkie zdjęcia', icon: 'pi pi-th-large' },
  { id: 'nature', label: 'Natura & Krajobraz', icon: 'pi pi-image' },
  { id: 'people', label: 'Portrety & Ludzie', icon: 'pi pi-user' },
  { id: 'buildings', label: 'Ulica & Architektura', icon: 'pi pi-building' },
  { id: 'cars', label: 'Motoryzacja', icon: 'pi pi-car' }
])

const activeCategoryCount = computed(() => {
  return store.counts[store.category] ?? store.counts['all'] ?? 0
})

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}

function closeMenu() {
  isMenuOpen.value = false
}

function selectCategory(id) {
  store.setCategory(id)
  closeMenu()
}

function handleKeydown(e) {
  if (e.key === 'Escape' && isMenuOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Navbar Header Outer Wrapper */
.navbar-header {
  position: sticky;
  top: 0;
  z-index: var(--z-navbar, 100);
  background-color: rgba(18, 18, 24, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
  width: 100%;
}

/* Navbar Inner Container aligned pixel-perfectly with content grid */
.navbar-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 14px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  box-sizing: border-box;
}

/* Brand styling */
.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: var(--text-primary, #F3F3F6);
}

.logo-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid rgba(139, 92, 246, 0.4);
  flex-shrink: 0;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  box-shadow: inset 0 0 8px rgba(139, 92, 246, 0.3);
  pointer-events: none;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-serif, Georgia, serif);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: #FFFFFF;
  line-height: 1.2;
}

.brand-subtitle {
  font-family: var(--font-mono, monospace);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-brand, #8B5CF6);
  line-height: 1.2;
}

/* Categories Trigger Button */
.categories-wrapper {
  position: relative;
}

.categories-btn {
  gap: 10px;
  padding: 8px 18px;
  font-size: 0.9375rem;
}

.categories-btn--active {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.6);
}

.badge-count {
  background: rgba(255, 255, 255, 0.25);
  color: #FFFFFF;
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
}

/* Backdrop */
.dropdown-backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--z-backdrop, 490);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
}

/* Dropdown Panel */
.dropdown-panel {
  position: absolute;
  right: 0;
  top: calc(100% + 10px);
  z-index: var(--z-dropdown, 500);
  width: 310px;
  background: #14141E;
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(139, 92, 246, 0.15);
  padding: 12px;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 12px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 8px;
}

.dropdown-title {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-muted, #6E6E82);
}

.dropdown-close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary, #A0A0B2);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.dropdown-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--text-primary, #F3F3F6);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(139, 92, 246, 0.12);
  color: #FFFFFF;
}

.dropdown-item--active {
  background: rgba(139, 92, 246, 0.22);
  border-color: rgba(139, 92, 246, 0.5);
  color: #FFFFFF;
  font-weight: 600;
}

.item-icon {
  color: var(--color-brand, #8B5CF6);
  font-size: 1.1rem;
}

.item-label {
  flex: 1;
}

.item-count {
  font-family: var(--font-mono, monospace);
  font-size: 0.8125rem;
  color: var(--text-muted, #6E6E82);
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 9999px;
}

.dropdown-item--active .item-count {
  color: var(--text-brand, #A78BFA);
  background: rgba(139, 92, 246, 0.2);
}

.item-checkmark {
  color: var(--color-brand, #8B5CF6);
  font-size: 0.9rem;
}

/* Animations */
.dropdown-slide-enter-active,
.dropdown-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-slide-enter-from,
.dropdown-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.96);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Responsiveness */
@media (max-width: 600px) {
  .navbar-container {
    padding: 12px 16px;
  }

  .brand-subtitle {
    display: none;
  }

  .dropdown-panel {
    right: 0;
    width: calc(100vw - 32px);
    max-width: 340px;
  }
}
</style>