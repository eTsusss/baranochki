<script setup lang="ts">
import { decodeJwtPayload } from "../utils/jwt";

definePageMeta({ middleware: "auth" });
const config = useRuntimeConfig();
const auth = useAuthStore();
const authHeaders = computed(() => ({ Authorization: `Bearer ${auth.token}` }));
const { data: orders, refresh } = await useFetch(`${config.public.apiBase}/orders/me`, {
  server: false,
  headers: authHeaders
});
const { data: products } = await useFetch(`${config.public.apiBase}/products`);

const user = computed(() => decodeJwtPayload(auth.token || "") || {});
const expandedOrderId = ref<number | null>(null);

const productsMap = computed(() => {
  const map = new Map<number, { name: string; weight: string }>();
  for (const p of products.value || []) {
    map.set(Number(p.id), { name: p.name, weight: p.weight });
  }
  return map;
});

function toggleOrderDetails(orderId: number) {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId;
}

function itemName(productId: number) {
  return productsMap.value.get(Number(productId))?.name || `Товар #${productId}`;
}

function itemWeight(productId: number) {
  return productsMap.value.get(Number(productId))?.weight || "";
}

function logout() {
  logoutRedirectHome();
}

watch(
  () => auth.token,
  async (token) => {
    if (token) {
      await refresh();
    }
  },
  { immediate: true }
);

useHead({
  title: "Личный кабинет - Конфетки - бараночки",
  meta: [
    { name: "description", content: "История заказов пользователя" },
    { name: "keywords", content: "заказы, кабинет" },
    { property: "og:title", content: "Личный кабинет" },
    { property: "og:image", content: "https://confetibaranochki.ru/images/candy.jpg" },
    { property: "og:type", content: "profile" },
    { name: "twitter:card", content: "summary" }
  ]
});
</script>

<template>
  <main class="container page">
    <section class="card">
      <div class="section-head">
        <h1>Личный кабинет</h1>
        <div class="action-row">
          <button type="button" class="btn btn-secondary" @click="() => refresh()">Обновить</button>
          <button type="button" class="btn btn-danger" @click="logout">Выйти</button>
        </div>
      </div>

      <div class="profile-user-box">
        <p><b>Пользователь:</b> {{ user.sub || "Гость" }}</p>
        <p><b>Роль:</b> {{ user.role || "user" }}</p>
      </div>

      <ul class="list" v-if="orders?.length">
        <li
          v-for="o in orders || []"
          :key="o.id"
          class="list-item list-item--order"
          @click="toggleOrderDetails(o.id)"
        >
          <div class="order-head">
            <strong>Заказ #{{ o.id }}</strong>
            <p>Статус: {{ o.status }}</p>
          </div>
          <div class="order-total-wrap">
            <strong>{{ o.total }} ₽</strong>
            <span class="meta-small">{{ expandedOrderId === o.id ? "Скрыть состав" : "Показать состав" }}</span>
          </div>
          <div v-if="expandedOrderId === o.id" class="order-details">
            <p class="meta-small"><b>Получатель:</b> {{ o.customer_name }}</p>
            <p class="meta-small"><b>Телефон:</b> {{ o.phone }}</p>
            <p class="meta-small"><b>Адрес:</b> {{ o.address }}</p>
            <ul class="order-items">
              <li v-for="(item, idx) in o.items || []" :key="`${o.id}-${idx}`" class="order-item">
                <span>{{ itemName(item.product_id) }} <small v-if="itemWeight(item.product_id)">({{ itemWeight(item.product_id) }})</small></span>
                <span>{{ item.quantity }} x {{ item.price }} ₽</span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
      <div v-else class="profile-empty">
        <p><b>Заказов пока нет</b></p>
        <p>Когда вы оформите первый заказ, он появится здесь с номером, статусом и суммой.</p>
        <NuxtLink class="btn" to="/catalog">Перейти в каталог</NuxtLink>
      </div>
    </section>
  </main>
</template>
