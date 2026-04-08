<script setup lang="ts">
import type { Product } from "~/types";
import { isValidImageUrl, productFallbackImage } from "~/utils/images";

const props = defineProps<{ product: Product }>();
const cart = useCartStore();
const added = ref(false);
const categoryLabel = computed(() => {
  if (props.product.category === "candies") return "конфеты";
  if (props.product.category === "baranochki") return "бараночки";
  if (props.product.category === "cupcakes") return "капкейки";
  return props.product.category;
});
const imageSrc = computed(() =>
  isValidImageUrl(props.product.image_url) ? props.product.image_url : productFallbackImage(props.product.category, props.product.id)
);
const safeImageSrc = ref("");

watch(
  imageSrc,
  (value) => {
    safeImageSrc.value = value;
  },
  { immediate: true }
);

function addToCart() {
  cart.add(props.product);
  added.value = true;
  if (process.client) {
    window.dispatchEvent(new Event("cart:add"));
    if (navigator.vibrate) navigator.vibrate(20);
  }
  setTimeout(() => {
    added.value = false;
  }, 900);
}
</script>

<template>
  <article class="product-card" data-testid="product-card">
    <NuxtLink class="product-card__media" :to="`/product/${props.product.id}`">
      <img :src="safeImageSrc" :alt="props.product.name" loading="lazy" @error="safeImageSrc = productFallbackImage(props.product.category, props.product.id)" />
      <span class="product-card__category">{{ categoryLabel }}</span>
    </NuxtLink>

    <div class="product-card__body">
      <h3>{{ props.product.name }}</h3>
      <p>{{ props.product.description }}</p>
      <div class="product-card__meta">
        <span>{{ props.product.weight }}</span>
        <strong>{{ props.product.price }} &#8381;</strong>
      </div>
    </div>

    <button
      class="btn btn-add"
      role="button"
      aria-label="Add to cart"
      data-testid="add-to-cart-btn"
      :class="{ 'btn-add--done': added }"
      @click="addToCart"
    >
      <span v-if="added">✓ Добавлено</span>
      <span v-else>В корзину</span>
    </button>
  </article>
</template>
