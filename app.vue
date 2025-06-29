<script setup>
import 'primeicons/primeicons.css'
useSeoMeta({
  title: 'M21Photos Portfolio MJ',
  description: 'Zapraszam do zapoznania się z moim portfolio fotograficznym',
  ogTitle: 'Portfolio fotograficzne Michał Jaroń',
  ogDescription: 'Fotografia krajobrazowa, portretowa, uliczna',
  ogImage: '../public/logo.webp',
  ogType: 'website',
  keywords: 'fotografia, portfolio, Michał Jaroń, zdjęcia, sesje, m21photos',
  robots: 'index, follow'
})
</script>

<template>
  <div :style="{ backgroundColor: (255, 253, 250) }" class="dynamic-background">
  </div>
  <div>
    <Navbar />
    <NuxtPage />
    <CommentBox />
    <SocialFooter />
  </div>
</template>
<script>

export default {
  data() {
    return {
    };
  },
};
</script>

<style scoped>
.dynamic-background {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100%;
  position: fixed;
  z-index: -1;
  left: 0px;
  opacity: 80%;
}
</style>