<script setup lang="ts">
const slides = [
  {
    title: "Crafted sweets for cozy evenings",
    text: "Handmade candies, seasonal cupcakes and tea snacks.",
    image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "Weekend gift boxes",
    text: "Pre-packed sets with top products and gift wrapping.",
    image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1400&q=80"
  },
  {
    title: "Fresh batch every morning",
    text: "Small production with quality ingredients and quick delivery.",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1400&q=80"
  }
];

const active = ref(0);
let timer: ReturnType<typeof setInterval> | null = null;

function next() {
  active.value = (active.value + 1) % slides.length;
}

function prev() {
  active.value = active.value === 0 ? slides.length - 1 : active.value - 1;
}

onMounted(() => {
  timer = setInterval(next, 5000);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>

<template>
  <section class="hero">
    <transition name="fade-slide" mode="out-in">
      <article :key="slides[active].title" class="hero__slide" :style="{ backgroundImage: `url(${slides[active].image})` }">
        <div class="hero__overlay">
          <p class="hero__kicker">Premium candy shop</p>
          <h1>{{ slides[active].title }}</h1>
          <p>{{ slides[active].text }}</p>
          <NuxtLink to="/catalog" class="btn">Shop now</NuxtLink>
        </div>
      </article>
    </transition>

    <div class="hero__controls">
      <button class="btn btn-secondary" aria-label="Previous slide" @click="prev">Prev</button>
      <button class="btn btn-secondary" aria-label="Next slide" @click="next">Next</button>
    </div>
  </section>
</template>
