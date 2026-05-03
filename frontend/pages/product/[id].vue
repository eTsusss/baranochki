<script setup lang="ts">
import type { Product } from "~/types";
import { isValidImageUrl, productFallbackImage } from "~/utils/images";

const route = useRoute();
const config = useRuntimeConfig();
const cart = useCartStore();

const { data: products } = await useFetch<Product[]>(`${config.public.apiBase}/products`);
const product = computed(() => (products.value || []).find((p) => p.id === Number(route.params.id)));
const quantity = ref(1);
const relatedOffset = ref(0);

const gallery = computed(() => {
  if (!product.value) return [];
  const base = isValidImageUrl(product.value.image_url)
    ? product.value.image_url
    : productFallbackImage(product.value.category, product.value.id);
  return [
    base,
    productFallbackImage(product.value.category, product.value.id + 10),
    productFallbackImage(product.value.category, product.value.id + 20)
  ];
});
const activeImage = ref(0);

const related = computed(() => {
  if (!product.value) return [];
  return (products.value || []).filter((p) => p.id !== product.value?.id).slice(0, 8);
});

const relatedTrack = computed(() => {
  if (related.value.length <= 3) return related.value;
  const start = relatedOffset.value;
  return [...related.value.slice(start, start + 3), ...related.value.slice(0, Math.max(0, start + 3 - related.value.length))];
});

function addToCart() {
  if (!product.value) return;
  for (let i = 0; i < quantity.value; i++) cart.add(product.value);
  if (process.client) window.dispatchEvent(new Event("cart:add"));
}

function nextRelated() {
  if (related.value.length <= 3) return;
  relatedOffset.value = (relatedOffset.value + 1) % related.value.length;
}

function prevRelated() {
  if (related.value.length <= 3) return;
  relatedOffset.value = (relatedOffset.value - 1 + related.value.length) % related.value.length;
}

function imageFallback(event: Event, seedOffset = 0) {
  if (!product.value) return;
  const target = event.target as HTMLImageElement | null;
  if (!target) return;
  target.src = productFallbackImage(product.value.category, product.value.id + seedOffset);
}

useHead({
  title: computed(() => (product.value ? `${product.value.name} | Конфетки - бараночки` : "Товар | Конфетки - бараночки")),
  meta: [
    { name: "description", content: "Страница товара интернет-магазина" },
    { name: "keywords", content: "товар, десерты, конфеты, капкейки" },
    { property: "og:type", content: "product" },
    { name: "twitter:card", content: "summary_large_image" }
  ]
});
</script>

<template>
  <main class="container page" v-if="product">
    <section class="card product-page" data-reveal>
      <div class="product-page__left">
        <div class="product-page__image-wrap">
          <img class="product-page__image" :src="gallery[activeImage]" :alt="product.name" loading="lazy" @error="imageFallback($event, 100 + activeImage)" />
        </div>
        <div class="product-gallery">
          <button
            v-for="(img, idx) in gallery"
            :key="img"
            class="product-gallery__thumb"
            :class="{ 'product-gallery__thumb--active': idx === activeImage }"
            @click="activeImage = idx"
          >
            <img :src="img" alt="Миниатюра" loading="lazy" @error="imageFallback($event, 200 + idx)" />
          </button>
        </div>
      </div>
      <div class="product-page__content">
        <p class="product-page__category">{{ product.category }}</p>
        <h1>{{ product.name }}</h1>
        <p>{{ product.description }}</p>
        <p><b>Вес:</b> {{ product.weight }}</p>
        <p class="product-page__price">{{ product.price }} ₽</p>

        <div class="qty-controls">
          <button class="btn btn-secondary" @click="quantity = Math.max(1, quantity - 1)">-</button>
          <input v-model.number="quantity" class="qty-input" type="number" min="1" />
          <button class="btn btn-secondary" @click="quantity += 1">+</button>
        </div>

        <button class="btn" @click="addToCart">Добавить в корзину</button>
      </div>
    </section>

    <section class="card" data-reveal>
      <div class="section-head">
        <h2>С этим также покупают</h2>
        <div class="action-row">
          <button class="btn btn-secondary" @click="prevRelated">Назад</button>
          <button class="btn btn-secondary" @click="nextRelated">Вперёд</button>
        </div>
      </div>
      <div class="products-grid products-grid--related">
        <ProductCard v-for="item in relatedTrack" :key="`rel-${item.id}`" :product="item" />
      </div>
    </section>
  </main>
  <main class="container page" v-else>
    <section class="card">
      <h1>Товар не найден</h1>
      <NuxtLink to="/catalog">Вернуться в каталог</NuxtLink>
    </section>
  </main>
</template>
