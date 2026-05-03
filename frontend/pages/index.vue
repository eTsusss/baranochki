<script setup lang="ts">
import type { Product } from "~/types";
import { isValidImageUrl, productFallbackImage } from "~/utils/images";

const config = useRuntimeConfig();
const { data: products, pending } = await useFetch<Product[]>(`${config.public.apiBase}/products`);
const topProducts = computed(() => (products.value || []).slice(0, 8));

const heroSlides = [
  {
    title: "Сладкие моменты с Конфетки - бараночки",
    text: "Ручная работа, тепло и любовь в каждом десерте.",
    image: "/images/hero-1.svg"
  },
  {
    title: "Домашний вкус без компромиссов",
    text: "Натуральный состав, свежие ингредиенты и мягкая доставка.",
    image: "/images/hero-2.svg"
  },
  {
    title: "Выбирайте любимые сладости",
    text: "Конфеты, бараночки и капкейки для уютных вечеров.",
    image: "/images/hero-3.svg"
  }
];

const reviews = [
  { name: "Анна", city: "Москва", text: "Беру наборы каждую неделю. Очень свежо и вкусно.", stars: 5 },
  { name: "Никита", city: "Казань", text: "Сервис быстрый, капкейки приехали идеальные.", stars: 5 },
  { name: "Марина", city: "Пермь", text: "Отличные подарочные наборы, красиво оформлены.", stars: 5 }
];

const processSlides = [
  { title: "Подбираем ингредиенты", text: "Свежие сливки, шоколад и орехи от проверенных поставщиков." },
  { title: "Готовим вручную", text: "Каждая партия делается малыми объёмами для стабильного качества." },
  { title: "Бережно упаковываем", text: "Надёжная упаковка и быстрая доставка без потери вкуса." }
];

const hero = ref(0);
const review = ref(0);
const process = ref(0);
const popularSliderRef = ref<HTMLElement | null>(null);
let heroTimer: ReturnType<typeof setInterval> | null = null;
let reviewTimer: ReturnType<typeof setInterval> | null = null;
let processTimer: ReturnType<typeof setInterval> | null = null;
let popularTimer: ReturnType<typeof setInterval> | null = null;
const sliderHovered = ref(false);
const popularTrack = computed(() => [...topProducts.value, ...topProducts.value]);
const storyImage = productFallbackImage("candies", 901);
const instaImages = [
  productFallbackImage("candies", 1001),
  productFallbackImage("baranochki", 1002),
  productFallbackImage("cupcakes", 1003),
  productFallbackImage("candies", 1004),
  productFallbackImage("baranochki", 1005),
  productFallbackImage("cupcakes", 1006)
];

function nextHero() {
  hero.value = (hero.value + 1) % heroSlides.length;
}

function nextReview() {
  review.value = (review.value + 1) % reviews.length;
}

function nextProcess() {
  process.value = (process.value + 1) % processSlides.length;
}

function nextPopular() {
  const slider = popularSliderRef.value;
  if (!slider || sliderHovered.value) return;
  const card = slider.querySelector(".product-card--compact") as HTMLElement | null;
  const step = (card?.offsetWidth || 260) + 12;
  slider.scrollBy({ left: step, behavior: "smooth" });
  if (slider.scrollLeft > slider.scrollWidth / 2) {
    slider.scrollLeft = 0;
  }
}

function scrollToCatalog() {
  const target = document.getElementById("home-catalog");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function imageFor(p: Product) {
  return isValidImageUrl(p.image_url) ? p.image_url : productFallbackImage(p.category, p.id);
}

function fallbackFor(event: Event, category: string, id: number) {
  const target = event.target as HTMLImageElement | null;
  if (!target) return;
  target.src = productFallbackImage(category, id);
}

onMounted(() => {
  heroTimer = setInterval(nextHero, 5200);
  reviewTimer = setInterval(nextReview, 4800);
  processTimer = setInterval(nextProcess, 5000);
  popularTimer = setInterval(nextPopular, 2600);
});

onBeforeUnmount(() => {
  if (heroTimer) clearInterval(heroTimer);
  if (reviewTimer) clearInterval(reviewTimer);
  if (processTimer) clearInterval(processTimer);
  if (popularTimer) clearInterval(popularTimer);
});

useHead({
  title: "Конфетки - бараночки - главная",
  meta: [
    { name: "description", content: "Современная кондитерская: конфеты, бараночки, капкейки" },
    { name: "keywords", content: "кондитерская, конфеты, бараночки, капкейки" },
    { property: "og:title", content: "Конфетки - бараночки" },
    { property: "og:image", content: "https://confetibaranochki.ru/images/candy.jpg" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" }
  ]
});
</script>

<template>
  <main class="container page-home">
    <section class="hero-soul" data-reveal>
      <article class="hero-soul__slide" :style="{ backgroundImage: `url(${heroSlides[hero].image})` }">
        <div class="hero-soul__particles" aria-hidden="true">
          <span v-for="n in 9" :key="n" />
        </div>
        <div class="hero-soul__overlay">
          <p class="hero-soul__kicker">Пекарня-кондитерская</p>
          <h1>{{ heroSlides[hero].title }}</h1>
          <p>{{ heroSlides[hero].text }}</p>
          <button class="btn hero-soul__cta" @click="scrollToCatalog">Выбрать сладость</button>
        </div>
      </article>
    </section>

    <section class="feature-grid" data-reveal>
      <article class="feature-card">
        <h3>Быстрая доставка</h3>
        <p>По городу привозим в этот же день.</p>
      </article>
      <article class="feature-card">
        <h3>Натуральный состав</h3>
        <p>Только качественные ингредиенты и ручная работа.</p>
      </article>
      <article class="feature-card">
        <h3>Лёгкая скидка постоянным</h3>
        <p>Бонусы и акции для постоянных покупателей.</p>
      </article>
    </section>

    <section id="home-catalog" class="card" data-reveal>
      <div class="section-head">
        <h2>Популярное</h2>
        <NuxtLink to="/catalog">Весь каталог</NuxtLink>
      </div>

      <div v-if="pending" class="products-grid">
        <article v-for="n in 4" :key="n" class="skeleton-card" />
      </div>

      <div v-else class="popular-slider" ref="popularSliderRef" @mouseenter="sliderHovered = true" @mouseleave="sliderHovered = false">
        <article v-for="(p, idx) in popularTrack" :key="`popular-${p.id}-${idx}`" class="product-card product-card--compact">
          <div class="product-card__media">
            <img :src="imageFor(p)" :alt="p.name" loading="lazy" @error="fallbackFor($event, p.category, p.id)" />
          </div>
          <div class="product-card__body">
            <h3>{{ p.name }}</h3>
            <p>{{ p.description }}</p>
            <div class="product-card__meta"><strong>{{ p.price }} ₽</strong></div>
          </div>
        </article>
      </div>
    </section>

    <section class="story-grid" data-reveal>
      <article class="card story-block">
        <h2>Мы готовим с душой</h2>
        <transition name="fade-simple" mode="out-in">
          <div :key="processSlides[process].title">
            <h3>{{ processSlides[process].title }}</h3>
            <p>{{ processSlides[process].text }}</p>
          </div>
        </transition>
      </article>
      <article class="card story-photo">
        <img :src="storyImage" alt="Процесс приготовления" loading="lazy" @error="fallbackFor($event, 'candies', 901)" />
      </article>
    </section>

    <section class="card" data-reveal>
      <h2>Отзывы гостей</h2>
      <transition name="fade-simple" mode="out-in">
        <article :key="reviews[review].name" class="review-slide">
          <p class="review-stars">★★★★★</p>
          <p class="review-text">{{ reviews[review].text }}</p>
          <p class="review-author">{{ reviews[review].name }}, {{ reviews[review].city }}</p>
        </article>
      </transition>
    </section>

    <section class="card" data-reveal>
      <h2>Наша лента</h2>
      <div class="insta-grid">
        <img
          v-for="(img, idx) in instaImages"
          :key="idx"
          :src="img"
          alt="Фото десерта"
          loading="lazy"
          @error="fallbackFor($event, 'candies', 2000 + idx)"
        />
      </div>
    </section>
  </main>
</template>
