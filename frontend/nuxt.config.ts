export default defineNuxtConfig({
  ssr: true,
  css: ["~/assets/styles/main.scss"],
  modules: ["@pinia/nuxt"],
  vite: {
    build: {
      cssMinify: true
    }
  },
  nitro: {
    compressPublicAssets: true
  },
  routeRules: {
    "/_nuxt/**": {
      headers: {
        "cache-control": "public, max-age=31536000, immutable"
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBase: (() => {
        const raw = process.env.NUXT_PUBLIC_API_BASE || "http://localhost:8000/api";
        const t = String(raw).trim().replace(/\/+$/, "");
        return t || "http://localhost:8000/api";
      })()
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
