<template>
  <footer class="editorial-footer" role="contentinfo">
    <div class="footer-container">
      <!-- Section 1: Brand Info -->
      <div class="footer-col footer-col--brand">
        <div class="footer-brand">
          <img src="/logo.webp" alt="M21Photos logo" class="footer-logo" />
          <div class="footer-brand-title">M21Photos</div>
        </div>
        <p class="footer-bio">
          Portfolio autorskiej fotografii edytorialskiej, krajobrazowej, portretowej oraz miejskiej. 
          Uchwycone chwile i historie opowiedziane światłem.
        </p>
      </div>

      <!-- Section 2: Quick Navigation -->
      <div class="footer-col">
        <h3 class="footer-heading">Galerie</h3>
        <ul class="footer-links">
          <li>
            <a href="#" @click.prevent="store.setCategory('all')">Wszystkie zdjęcia</a>
          </li>
          <li>
            <a href="#" @click.prevent="store.setCategory('nature')">Natura & Krajobraz</a>
          </li>
          <li>
            <a href="#" @click.prevent="store.setCategory('people')">Portrety & Ludzie</a>
          </li>
          <li>
            <a href="#" @click.prevent="store.setCategory('buildings')">Ulica & Architektura</a>
          </li>
          <li>
            <a href="#" @click.prevent="store.setCategory('cars')">Motoryzacja</a>
          </li>
        </ul>
      </div>

      <!-- Section 3: Contact & Socials -->
      <div class="footer-col">
        <h3 class="footer-heading">Social Media</h3>
        <!-- <p class="footer-email-wrap">
          <a href="mailto:kontakt@m21photos.com" class="footer-email" aria-label="Wyślij e-mail do Michał Jaroń">
            <i class="pi pi-envelope" aria-hidden="true" />
            <span>kontakt@m21photos.com</span>
          </a>
        </p> -->

        <div class="social-icons">
          <a
            v-for="(link, index) in socialLinks"
            :key="index"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="link.name"
            :title="link.name"
            class="social-icon-btn"
          >
            <i :class="link.iconClass" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Copyright Divider -->
    <div class="footer-bottom">
      <div class="footer-bottom-container">
        <span>© {{ currentYear }} M21Photos — Michał Jaroń. Wszelkie prawa zastrzeżone.</span>
        <span class="footer-tagline">Zapromuj swoją historię obrazem</span>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from 'vue'
import { photoStore } from '../stores/photos'
import '@fortawesome/fontawesome-free/css/all.css'

const store = photoStore()
const currentYear = computed(() => new Date().getFullYear())

const socialLinks = [
  { name: 'Instagram', url: 'https://www.instagram.com/just.mike99/', iconClass: 'fab fa-instagram' },
//  { name: '500px / Unsplash', url: 'https://unsplash.com', iconClass: 'fas fa-camera-retro' },
//  { name: 'Behance Portfolio', url: 'https://behance.net', iconClass: 'fab fa-behance' },
// { name: 'Napisz e-mail', url: 'mailto:kontakt@m21photos.com', iconClass: 'fas fa-envelope' }
]
</script>

<style scoped>
.editorial-footer {
  background-color: var(--bg-surface, #121218);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 60px 24px 100px 24px; /* Explicit safe bottom padding so ScrollToTop FAB never overlaps content */
  color: var(--text-secondary, #A0A0B2);
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--color-brand, #8B5CF6);
}

.footer-brand-title {
  font-family: var(--font-serif, Georgia, serif);
  font-size: 1.35rem;
  font-weight: 700;
  color: #FFFFFF;
}

.footer-bio {
  font-size: 0.9375rem;
  line-height: 1.6;
  max-width: 42ch;
  color: var(--text-secondary, #A0A0B2);
}

.footer-heading {
  font-family: var(--font-mono, monospace);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--color-brand, #8B5CF6);
  margin-bottom: 4px;
}

.footer-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-links a {
  color: var(--text-secondary, #A0A0B2);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--color-brand, #8B5CF6);
}

.footer-email-wrap {
  margin-bottom: 8px;
}

.footer-email {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary, #F3F3F6);
  text-decoration: none;
  font-size: 0.9375rem;
  transition: color 0.2s ease;
}

.footer-email:hover {
  color: var(--color-brand, #8B5CF6);
}

.social-icons {
  display: flex;
  gap: 12px;
}

.social-icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-primary, #F3F3F6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.25s ease;
}

.social-icon-btn:hover {
  background: var(--color-brand, #8B5CF6);
  border-color: var(--color-brand, #8B5CF6);
  color: #FFFFFF;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

/* Bottom Bar */
.footer-bottom {
  max-width: 1280px;
  margin: 40px auto 0 auto;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.footer-bottom-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono, monospace);
  font-size: 0.8125rem;
  color: var(--text-muted, #6E6E82);
}

.footer-tagline {
  color: var(--text-secondary, #A0A0B2);
}

@media (max-width: 800px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-bottom-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>