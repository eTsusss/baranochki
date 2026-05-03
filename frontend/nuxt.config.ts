export default defineNuxtConfig({
  ssr: true,
  experimental: {
    appManifest: false
  },
  css: ["~/assets/styles/main.scss"],
  modules: ["./modules/fix-nitro-public-assets", "@pinia/nuxt"],
  vite: {
    build: {
      cssMinify: true
    }
  },
  nitro: {
    compressPublicAssets: false
  },
  routeRules: {
    "/_nuxt/**": {
      headers: {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  },
  runtimeConfig: {
    /** Приватный override прокси (не в клиентском бандле). */
    apiUpstream: process.env.NUXT_API_UPSTREAM || "",
    public: {
      /** Префикс на этом же хосте — Nitro проксирует на apiUpstream/apiBase (без CORS). */
      apiPrefix: "/api/be",
      /** Публичный URL API; на этапе сборки подставляется из env Render. */
      apiBase: process.env.NUXT_PUBLIC_API_BASE || ""
    }
  },
  app: {
    head: {
      title: "Конфетки - бараночки",
      meta: [
        { name: "description", content: "Интернет-магазин кондитерских изделий" },
        { name: "keywords", content: "конфеты, бараночки, капкейки" },
        { property: "og:title", content: "Конфетки - бараночки" },
        { property: "og:image", content: "https://confetibaranochki.ru/images/candy.jpg" },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" }
      ]
    }
  }
})
