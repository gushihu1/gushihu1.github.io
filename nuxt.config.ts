import { remarkMark } from "remark-mark-highlight";
import remarkSupersub from "remark-supersub";

export default defineNuxtConfig({
  compatibilityDate: "2026-07-01",
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxt/ui", "@vueuse/nuxt", "motion-v/nuxt"],
  css: ["~/assets/css/main.css", "~/assets/css/content-theme.css"],
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: { htmlAttrs: { lang: "zh-CN" } },
  },
  content: {
    experimental: { sqliteConnector: "native" },
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        remarkPlugins: {
          "remark-gfm": { options: { singleTilde: false } },
          "remark-supersub": { instance: remarkSupersub },
          "remark-mark-highlight": { instance: remarkMark },
        },
      },
    },
  },
  fonts: {
    providers: { google: false, googleicons: false },
  },
  nitro: { prerender: { crawlLinks: true, ignore: ["/admin/import"] } },
  typescript: { typeCheck: true },
  future: { compatibilityVersion: 4 },
});
