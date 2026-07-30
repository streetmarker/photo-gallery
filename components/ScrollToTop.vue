<template>
  <Transition name="fab-fade">
    <button
      v-show="isVisible"
      type="button"
      class="scroll-to-top-fab"
      aria-label="Przewiń do góry strony"
      @click="scrollToTop"
    >
      <i class="pi pi-arrow-up" aria-hidden="true" />
    </button>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

const checkScroll = () => {
  if (typeof window !== 'undefined') {
    isVisible.value = window.scrollY > 350
  }
}

const scrollToTop = () => {
  if (typeof window !== 'undefined') {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', checkScroll, { passive: true })
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', checkScroll)
  }
})
</script>

<style scoped>
.scroll-to-top-fab {
  position: fixed;
  bottom: clamp(24px, 5vw, 36px);
  right: clamp(24px, 5vw, 36px);
  z-index: var(--z-fab, 800);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--bg-surface-elevated, #1A1A26);
  border: 1px solid rgba(139, 92, 246, 0.4);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(139, 92, 246, 0.2);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.scroll-to-top-fab:hover {
  background: var(--color-brand, #8B5CF6);
  border-color: var(--color-brand, #8B5CF6);
  color: #FFFFFF;
  transform: translateY(-4px) scale(1.08);
  box-shadow: 0 12px 32px rgba(139, 92, 246, 0.5);
}

.scroll-to-top-fab:active {
  transform: translateY(0) scale(1);
}

.scroll-to-top-fab i {
  font-size: 1.25rem;
}

/* Vue Transition */
.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.fab-fade-enter-from,
.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.9);
}

@media (max-width: 480px) {
  .scroll-to-top-fab {
    width: 48px;
    height: 48px;
    bottom: 20px;
    right: 20px;
  }
}
</style>
