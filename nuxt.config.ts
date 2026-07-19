import remarkMark from "./lib/remark/remark-mark-highlight";
import remarkSupersub from "remark-supersub";
import remarkBlogWikiLinks from "./lib/wiki-links/remark-wiki-links";

const remarkMarkPluginPath = new URL(
  "./lib/remark/remark-mark-highlight.ts",
  import.meta.url,
).pathname.replace(/^\/([A-Za-z]:)/, "$1");

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
    // Keep the development content database stable across Windows reloads.
    experimental: { sqliteConnector: "better-sqlite3" },
    build: {
      markdown: {
        toc: { depth: 3, searchDepth: 3 },
        remarkPlugins: {
          "remark-gfm": { options: { singleTilde: false } },
          "remark-supersub": { instance: remarkSupersub },
          [remarkMarkPluginPath]: { instance: remarkMark },
          "@flowershow/remark-wiki-link": { instance: remarkBlogWikiLinks },
        },
      },
    },
  },
  fonts: {
    providers: { google: false, googleicons: false },
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      ignore: ["/admin/import", "/notes"],
    },
  },
  typescript: { typeCheck: true },
  future: { compatibilityVersion: 4 },
});
