<template>
  <transition name="fade">
    <button
      v-show="isVisible"
      @click="scrollToTop"
      class="scroll-to-top"
      aria-label="Przewiń do góry"
    >
      <i class="pi pi-arrow-up"></i>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

const checkScroll = () => {
  // Pokaż przycisk, gdy użytkownik przewinie stronę o więcej niż 300px
  isVisible.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.scroll-to-top {
  background: var(--p-button-help-background);
  position: fixed;
  bottom: clamp(24px, 6vw, 40px);
  right: clamp(24px, 6vw, 40px);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  color: #e8e2d9; /* Jasny tekst */
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.scroll-to-top:hover {
  background-color: rgba(14, 14, 14, 1);
  border-color: #c9a96e; /* Złoty akcent przy najechaní */
  color: #c9a96e;
  transform: translateY(-4px);
}

.scroll-to-top:active {
  transform: translateY(0);
}

.scroll-to-top i {
  font-size: 1.4rem;
}

/* Animacja pojawiania się i znikania (Vue Transition) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Dostosowanie dla bardzo małych ekranów (Aaccessibility) */
@media (max-width: 480px) {
  .scroll-to-top {
    width: 100px;
    height: 100px;
    bottom: 60px;
    right: 20px;
  }
  .scroll-to-top i {
    font-size: 2.2rem;
  }
}
</style>
