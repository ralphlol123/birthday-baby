// nuxt.config.ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  /* ──────────────────────────────────────────
     1.  Tell Nuxt this is a purely-static site
     2.  Point every asset request to /birthday-baby/
  ──────────────────────────────────────────── */
  ssr: false,
  app: {
    baseURL: '/birthday-baby/',   // ← repo name, leading & trailing “/”
  },
  nitro: {
    preset: 'static',             // Nuxt 3.11+ (older ⇒ target: 'static')
  },

  /* your existing options … */
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: { configPath: './tailwind.config.ts' },
})
