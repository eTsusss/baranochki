<script setup lang="ts">
import { decodeJwtPayload } from "../utils/jwt";

const cart = useCartStore();
const auth = useAuthStore();
const route = useRoute();
const mobileOpen = ref(false);
const cartShake = ref(false);
const user = computed(() => decodeJwtPayload(auth.token || "") || {});
const profileLabel = computed(() => {
  const login = String(user.value?.sub || "").trim();
  if (!login) return "Кабинет";
  const beforeAt = login.includes("@") ? login.split("@")[0] : login;
  return beforeAt || "Кабинет";
});
const links = computed(() => [
  { to: "/catalog", label: "Каталог" },
  { to: "/cart", label: "Корзина" },
  { to: "/profile", label: auth.token ? profileLabel.value : "Кабинет" }
]);

function toggleMenu() {
  mobileOpen.value = !mobileOpen.value;
}

function closeMenu() {
  mobileOpen.value = false;
}

function runCartShake() {
  cartShake.value = false;
  requestAnimationFrame(() => {
    cartShake.value = true;
    setTimeout(() => {
      cartShake.value = false;
    }, 500);
  });
}

watch(
  () => route.path,
  () => closeMenu()
);

onMounted(() => {
  if (process.client) {
    window.addEventListener("cart:add", runCartShake as EventListener);
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    window.removeEventListener("cart:add", runCartShake as EventListener);
  }
});
</script>

<template>
  <header class="site-header-wrap">
    <div class="container site-header">
      <NuxtLink to="/" class="brand">
        <span class="brand__logo">CB</span>
        <span>
          <strong>Конфетки - бараночки</strong>
          <small>Кондитерская лавка</small>
        </span>
      </NuxtLink>

      <button class="burger" :aria-expanded="mobileOpen" aria-label="Открыть меню" @click="toggleMenu">
        <span />
        <span />
        <span />
      </button>

      <nav class="site-nav" :class="{ 'site-nav--open': mobileOpen }" aria-label="Main navigation">
        <NuxtLink
          v-for="item in links"
          :key="item.to"
          :to="item.to"
          class="site-nav__link"
          :data-cy="item.to === '/cart' ? 'cart-icon' : null"
          :class="{ 'site-nav__link--active': route.path === item.to, 'site-nav__link--cart-shake': item.to === '/cart' && cartShake }"
        >
          {{ item.label }}
          <span v-if="item.to === '/cart' && cart.count" class="site-nav__badge">{{ cart.count }}</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
