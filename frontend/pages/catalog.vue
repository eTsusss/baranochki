<script setup lang="ts">
import { joinApiBase } from "~/utils/api-url";
import type { Product } from "~/types";

const config = useRuntimeConfig();
const category = ref("");
const maxPrice = ref(1500);
const sort = ref<"popular" | "priceAsc" | "priceDesc">("popular");
const expandedFilters = ref(false);
const visibleCount = ref(8);

const { data: products, pending, refresh } = await useFetch<Product[]>(() => joinApiBase(config.public.apiPrefix, "products"), {
  query: computed(() => (category.value ? { category: category.value } : {}))
});

watch(category, () => {
  visibleCount.value = 8;
  refresh();
});

const filteredProducts = computed(() => {
  const base = (products.value || []).filter((item) => item.price <= maxPrice.value);
  if (sort.value === "priceAsc") return [...base].sort((a, b) => a.price - b.price);
  if (sort.value === "priceDesc") return [...base].sort((a, b) => b.price - a.price);
  return base;
});

const visibleProducts = computed(() => filteredProducts.value.slice(0, visibleCount.value));
const canLoadMore = computed(() => visibleCount.value < filteredProducts.value.length);

function loadMore() {
  visibleCount.value += 8;
}

useHead({
  title: "Каталог - Конфетки - бараночки",
  meta: [
    { name: "description", content: "Каталог сладостей с фильтрацией и сортировкой" },
    { name: "keywords", content: "каталог, конфеты, бараночки, капкейки" },
    { property: "og:title", content: "Каталог - Конфетки - бараночки" },
    { property: "og:image", content: "https://confetibaranochki.ru/images/candy.jpg" },
    { property: "og:type", content: "product.group" },
    { name: "twitter:card", content: "summary" }
  ]
});
</script>

<template>
  <main class="container page">
    <section class="card" data-reveal>
      <div class="section-head">
        <h1>Каталог</h1>
        <span>{{ filteredProducts.length }} товаров</span>
      </div>

      <button class="btn btn-secondary filter-toggle" @click="expandedFilters = !expandedFilters">
        {{ expandedFilters ? "Скрыть фильтры" : "Показать фильтры" }}
      </button>

      <transition name="fade-simple">
        <div v-if="expandedFilters" class="filters">
          <label>
            Категория
            <select v-model="category">
              <option value="">Все</option>
              <option value="candies">Конфеты</option>
              <option value="baranochki">Бараночки</option>
              <option value="cupcakes">Капкейки</option>
            </select>
          </label>

          <label>
            Максимальная цена: {{ maxPrice }} ₽
            <input v-model.number="maxPrice" type="range" min="100" max="1500" step="10" />
          </label>

          <label>
            Сортировка
            <select v-model="sort">
              <option value="popular">По популярности</option>
              <option value="priceAsc">Сначала дешевле</option>
              <option value="priceDesc">Сначала дороже</option>
            </select>
          </label>
        </div>
      </transition>
    </section>

    <section class="products-grid" data-reveal>
      <article v-if="pending" v-for="n in 8" :key="`sk-${n}`" class="skeleton-card" />
      <ProductCard v-else v-for="p in visibleProducts" :key="p.id" :product="p" />
    </section>

    <section v-if="canLoadMore" class="center-row" data-reveal>
      <button class="btn" @click="loadMore">Показать ещё</button>
    </section>
  </main>
</template>
