export default defineNuxtConfig({
  compatibilityDate: '2026-07-01',
  devtools: { enabled: true },
  modules: ['@nuxt/content', '@nuxt/ui', '@vueuse/nuxt', 'motion-v/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: { htmlAttrs: { lang: 'zh-CN' } }
  },
  content: {
    experimental: { sqliteConnector: 'native' },
    build: { markdown: { toc: { depth: 3, searchDepth: 3 } } }
  },
  fonts: {
    providers: { google: false, googleicons: false }
  },
  nitro: { prerender: { crawlLinks: true } },
  typescript: { typeCheck: true },
  future: { compatibilityVersion: 4 }
})
