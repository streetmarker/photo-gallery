// https://nuxt.com/docs/api/configuration/nuxt-config
import Aura from '@primevue/themes/aura';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      VUE_APP_MY_IP: process.env.VUE_APP_MY_IP,
      firebaseConfig: {
        apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
        authDomain: process.env.VUE_APP_APP_DOMAIN,
        projectId: process.env.VUE_APP_PROJECT_ID,
        storageBucket: process.env.VUE_APP_STORAGE_BUCKET,
        messagingSenderId: process.env.VUE_APP_SENDER_ID,
        appId: process.env.VUE_APP_APP_ID,
        measurementId: process.env.VUE_APP_MEASUREMENT_ID,
      },
    }
  },
  modules: [
    '@primevue/nuxt-module',
    '@pinia/nuxt'
  ],
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false || 'none',
        }
      }
    },
    components: {
      prefix: "Prime",
      exclude: ['Editor', 'Chart', 'Form', 'FormField']
      // exclude: ['Editor', 'Chart', 'Form', 'FormField', 'Badge', 'Button', 'TextArea', 'FloatLabel', 'Card']
    }
  },
  // plugins: [
  //   { src: '~/pluigns/firebaseInitializer.js', mode: 'client' } // Upewnij się, że ładuje się tylko po stronie klienta
  // ]
})