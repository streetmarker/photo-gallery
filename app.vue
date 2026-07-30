<script setup>
import 'primeicons/primeicons.css'
import './style/design-system.css'

useSeoMeta({
  title: 'M21Photos — Portfolio Fotograficzne | Michał Jaroń',
  description: 'Oficjalne portfolio fotograficzne Michała Jaronia. Fotografia edytorialska, krajobrazowa, portretowa, uliczna i motoryzacyjna.',
  ogTitle: 'M21Photos — Portfolio Fotograficzne Michał Jaroń',
  ogDescription: 'Kolekcja wyselekcjonowanych kadrów krajobrazowych, portretowych, ulicznych i motoryzacyjnych.',
  ogImage: '/logo.webp',
  ogType: 'website',
  keywords: 'fotografia, portfolio, Michał Jaroń, zdjęcia, m21photos, krajobrazy, portrety, fotografia uliczna',
  robots: 'index, follow'
})
</script>

<template>
  <div class="app-root">
    <Navbar />
    <NuxtPage />
    <CommentBox />
    <SocialFooter />
    <ScrollToTop />
  </div>
</template>

<style>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-page, #08080C);
  color: var(--text-primary, #F3F3F6);
}
</style>