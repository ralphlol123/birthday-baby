// nuxt.config.ts
// ─────────────────────────────────────────────
// Nuxt 3 static build for GitHub Pages
//   • Uses the built-in “github_pages” Nitro preset
//   • Reads the base path from NUXT_APP_BASE_URL
//     (workflow sets it to “/birthday-baby/”)
//   • Falls back to “/birthday-baby/” when you run
//     `nuxi dev` or `nuxi generate` locally
// ─────────────────────────────────────────────

export default defineNuxtConfig({
  // prerendered SPA (Nitro does the crawling for you)
  nitro: {
    preset: 'github_pages'
  },

  // Runtime base path
  app: {
    // If the env var isn’t present (local dev) we still have a sane default
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/birthday-baby/'
  },

  // ─── your project-specific bits ─────────────────
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: { configPath: './tailwind.config.ts' }
});
