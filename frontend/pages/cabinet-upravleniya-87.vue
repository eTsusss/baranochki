<script setup lang="ts">
import { logoutRedirectHome } from "~/composables/useLogout";
import { isValidImageUrl, productFallbackImage } from "../utils/images";
import { decodeJwtPayload } from "../utils/jwt";
import { fetchHttpStatus, formatFetchDetail } from "../utils/http-error";
import { joinApiBase } from "~/utils/api-url";
import { browserJsonFetch } from "~/utils/browser-fetch";

definePageMeta({ middleware: "auth" });

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  weight: string;
  category: string;
};

const config = useRuntimeConfig();
const auth = useAuthStore();
if (import.meta.client) auth.load();
const authHeaders = computed(() => ({ Authorization: `Bearer ${auth.token}` }));
const isAdmin = computed(() => decodeJwtPayload(auth.token || "")?.role === "admin");

const productsUrl = joinApiBase(config.public.apiPrefix, "products");
const ordersUrl = joinApiBase(config.public.apiPrefix, "orders");
const adminUsersUrl = joinApiBase(config.public.apiPrefix, "admin", "users");

const { data: products, refresh: refreshProducts } = await useFetch<Product[]>(productsUrl);
const { data: orders, refresh: refreshOrders } = await useFetch(ordersUrl, {
  server: false,
  headers: authHeaders
});
const { data: users, refresh: refreshUsers } = await useFetch(adminUsersUrl, {
  server: false,
  headers: authHeaders
});

const createForm = reactive({
  name: "",
  description: "",
  price: 100,
  image_url: "",
  weight: "120 г",
  category: "candies"
});

const editForm = reactive({
  id: 0,
  name: "",
  description: "",
  price: 0,
  image_url: "",
  weight: "",
  category: "candies"
});

const info = ref("");
const error = ref("");
const editSectionRef = ref<HTMLElement | null>(null);
const editNameInputRef = ref<HTMLInputElement | null>(null);

async function handleAuthError(err: unknown): Promise<boolean> {
  const status = fetchHttpStatus(err);
  if (status === 401 || status === 403) {
    auth.logout();
    await navigateTo("/login", { replace: true });
    return true;
  }
  return false;
}

async function toDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function onCreateImageFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  createForm.image_url = await toDataUrl(file);
}

async function onEditImageFile(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  editForm.image_url = await toDataUrl(file);
}

function resetCreateForm() {
  createForm.name = "";
  createForm.description = "";
  createForm.price = 100;
  createForm.image_url = "";
  createForm.weight = "120 г";
  createForm.category = "candies";
}

function previewSrc(url: string, category: string, seed: number) {
  return isValidImageUrl(url) ? url : productFallbackImage(category || "candies", seed);
}

async function startEdit(product: Product) {
  editForm.id = product.id;
  editForm.name = product.name;
  editForm.description = product.description;
  editForm.price = product.price;
  editForm.image_url = product.image_url;
  editForm.weight = product.weight;
  editForm.category = product.category;

  await nextTick();
  editSectionRef.value?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => editNameInputRef.value?.focus(), 120);
}

function cancelEdit() {
  editForm.id = 0;
}

const MAX_IMAGE_PAYLOAD = 950_000;

async function addProduct() {
  info.value = "";
  error.value = "";
  if (!auth.token?.trim()) {
    error.value = "Сессия недействительна — войдите заново.";
    return;
  }
  if (!createForm.name.trim()) {
    error.value = "Укажите название товара.";
    return;
  }
  if (!Number.isFinite(Number(createForm.price))) {
    error.value = "Укажите корректную цену.";
    return;
  }
  if (createForm.image_url.length > MAX_IMAGE_PAYLOAD) {
    error.value = "Слишком большое изображение — вставьте ссылку или выберите файл меньше.";
    return;
  }
  try {
    await browserJsonFetch(productsUrl, {
      method: "POST",
      bearer: auth.token,
      body: { ...createForm }
    });
    resetCreateForm();
    await refreshProducts();
    info.value = "Товар добавлен";
  } catch (err) {
    if (await handleAuthError(err)) return;
    error.value = formatFetchDetail(err) || "Не удалось добавить товар";
  }
}

async function updateProduct() {
  if (!editForm.id) return;
  info.value = "";
  error.value = "";
  if (!auth.token?.trim()) {
    error.value = "Сессия недействительна — войдите заново.";
    return;
  }
  if (!editForm.name.trim()) {
    error.value = "Укажите название товара.";
    return;
  }
  if (editForm.image_url.length > MAX_IMAGE_PAYLOAD) {
    error.value = "Слишком большое изображение.";
    return;
  }
  try {
    await browserJsonFetch(joinApiBase(config.public.apiPrefix, "products", String(editForm.id)), {
      method: "PUT",
      bearer: auth.token,
      body: {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        image_url: editForm.image_url,
        weight: editForm.weight,
        category: editForm.category
      }
    });
    await refreshProducts();
    info.value = "Товар обновлён";
    cancelEdit();
  } catch (err) {
    if (await handleAuthError(err)) return;
    error.value = formatFetchDetail(err) || "Не удалось обновить товар";
  }
}

async function deleteProduct(productId: number) {
  if (!confirm("Удалить товар?")) return;
  info.value = "";
  error.value = "";
  if (!auth.token?.trim()) {
    error.value = "Сессия недействительна — войдите заново.";
    return;
  }
  try {
    await browserJsonFetch(joinApiBase(config.public.apiPrefix, "products", String(productId)), {
      method: "DELETE",
      bearer: auth.token
    });
    if (editForm.id === productId) cancelEdit();
    await refreshProducts();
    info.value = "Товар удалён";
  } catch (err) {
    if (await handleAuthError(err)) return;
    error.value = formatFetchDetail(err) || "Не удалось удалить товар";
  }
}

async function setStatus(orderId: number, status: string) {
  if (!auth.token?.trim()) return;
  try {
    await browserJsonFetch(joinApiBase(config.public.apiPrefix, "orders", String(orderId), "status"), {
      method: "PATCH",
      bearer: auth.token,
      body: { status }
    });
    await refreshOrders();
  } catch (err) {
    if (await handleAuthError(err)) return;
    error.value = formatFetchDetail(err) || "Не удалось обновить статус заказа";
  }
}

function openReport() {
  navigateTo("/otchet-testov-87");
}

watch(
  () => auth.token,
  async (token) => {
    /* На SSR токена нет — иначе immediate срабатывает с token === "" и уводит на /login до гидратации */
    if (import.meta.server) return;
    if (!token) {
      await navigateTo("/login", { replace: true });
      return;
    }
    if (!isAdmin.value) {
      await navigateTo("/", { replace: true });
      return;
    }
    await Promise.all([refreshOrders(), refreshUsers()]);
  },
  { immediate: true }
);
</script>

<template>
  <main class="container page">
    <section class="card">
      <div class="section-head">
        <div>
          <h1>Панель управления</h1>
          <p>Служебный раздел администратора.</p>
        </div>
        <button type="button" class="btn btn-secondary" @click.prevent="logoutRedirectHome">Выйти</button>
      </div>
      <button type="button" class="btn" @click="openReport">Открыть отчёт тестов</button>
      <p v-if="info" class="ok-text">{{ info }}</p>
      <p v-if="error" class="err-text">{{ error }}</p>
    </section>

    <section class="card">
      <h2>Добавить товар</h2>
      <div class="grid-2 admin-edit-grid">
        <input v-model="createForm.name" placeholder="Название" />
        <input v-model.number="createForm.price" type="number" placeholder="Цена" />
        <input v-model="createForm.description" placeholder="Описание" />
        <input v-model="createForm.weight" placeholder="Вес" />
        <input v-model="createForm.image_url" placeholder="Ссылка на изображение" />
        <input type="file" accept="image/*" @change="onCreateImageFile" />
        <select v-model="createForm.category">
          <option value="candies">конфеты</option>
          <option value="baranochki">бараночки</option>
          <option value="cupcakes">капкейки</option>
        </select>
      </div>
      <img
        v-if="createForm.image_url || createForm.category"
        class="admin-image-preview"
        :src="previewSrc(createForm.image_url, createForm.category, 777)"
        alt="Превью"
      />
      <button type="button" class="btn" @click="addProduct">Добавить</button>
    </section>

    <section ref="editSectionRef" class="card" v-if="editForm.id">
      <h2>Редактирование товара #{{ editForm.id }}</h2>
      <div class="grid-2">
        <input ref="editNameInputRef" v-model="editForm.name" placeholder="Название" />
        <input v-model.number="editForm.price" type="number" placeholder="Цена" />
        <input v-model="editForm.description" placeholder="Описание" />
        <input v-model="editForm.weight" placeholder="Вес" />
        <input v-model="editForm.image_url" placeholder="Ссылка на изображение" />
        <input type="file" accept="image/*" @change="onEditImageFile" />
        <select v-model="editForm.category">
          <option value="candies">конфеты</option>
          <option value="baranochki">бараночки</option>
          <option value="cupcakes">капкейки</option>
        </select>
      </div>
      <img
        v-if="editForm.id"
        class="admin-image-preview"
        :src="previewSrc(editForm.image_url, editForm.category, editForm.id || 888)"
        alt="Превью"
      />
      <div class="action-row">
        <button class="btn" type="button" @click="updateProduct">Сохранить</button>
        <button class="btn btn-secondary" type="button" @click="cancelEdit">Отмена</button>
      </div>
    </section>

    <section class="card">
      <h2>Товары</h2>
      <ul class="list">
        <li v-for="p in products || []" :key="p.id" class="list-item">
          <div>
            <b>{{ p.name }}</b> - {{ p.price }} ₽
            <div class="meta-small">{{ p.category }} | {{ p.weight }}</div>
          </div>
          <div class="action-row">
            <button class="btn btn-secondary" type="button" @click="startEdit(p)">Изменить</button>
            <button class="btn btn-danger" type="button" @click="deleteProduct(p.id)">Удалить</button>
          </div>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2>Заказы</h2>
      <ul class="list">
        <li v-for="o in orders || []" :key="o.id" class="list-item">
          <span>#{{ o.id }} - {{ o.status }} - {{ o.total }} ₽</span>
          <div class="action-row">
            <button type="button" class="btn btn-secondary" @click="setStatus(o.id, 'готовится')">Готовится</button>
            <button type="button" class="btn" @click="setStatus(o.id, 'доставлен')">Доставлен</button>
          </div>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2>Пользователи</h2>
      <button type="button" class="btn" @click="() => refreshUsers()">Обновить</button>
      <ul class="list mt-8">
        <li v-for="u in users || []" :key="u.id" class="list-item">{{ u.email }} - {{ u.role }}</li>
      </ul>
    </section>
  </main>
</template>
