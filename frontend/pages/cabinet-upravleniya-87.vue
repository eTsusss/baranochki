<script setup lang="ts">
import { isValidImageUrl, productFallbackImage } from "../utils/images";
import { decodeJwtPayload } from "../utils/jwt";
import type { FetchError } from "ofetch";

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

const { data: products, refresh: refreshProducts } = await useFetch<Product[]>(`${config.public.apiBase}/products`);
const { data: orders, refresh: refreshOrders } = await useFetch(`${config.public.apiBase}/orders`, {
  server: false,
  headers: authHeaders
});
const { data: users, refresh: refreshUsers } = await useFetch(`${config.public.apiBase}/admin/users`, {
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
  const status = (err as FetchError)?.statusCode || (err as FetchError)?.response?.status;
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

async function addProduct() {
  info.value = "";
  error.value = "";
  try {
    await $fetch(`${config.public.apiBase}/products`, {
      method: "POST",
      headers: authHeaders.value,
      body: createForm
    });
    resetCreateForm();
    await refreshProducts();
    info.value = "Товар добавлен";
  } catch (err) {
    if (await handleAuthError(err)) return;
    error.value = "Не удалось добавить товар";
  }
}

async function updateProduct() {
  if (!editForm.id) return;
  info.value = "";
  error.value = "";
  try {
    await $fetch(`${config.public.apiBase}/products/${editForm.id}`, {
      method: "PUT",
      headers: authHeaders.value,
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
    error.value = "Не удалось обновить товар";
  }
}

async function deleteProduct(productId: number) {
  if (!confirm("Удалить товар?")) return;
  info.value = "";
  error.value = "";
  try {
    await $fetch(`${config.public.apiBase}/products/${productId}`, {
      method: "DELETE",
      headers: authHeaders.value
    });
    if (editForm.id === productId) cancelEdit();
    await refreshProducts();
    info.value = "Товар удалён";
  } catch (err) {
    if (await handleAuthError(err)) return;
    error.value = "Не удалось удалить товар";
  }
}

async function setStatus(orderId: number, status: string) {
  try {
    await $fetch(`${config.public.apiBase}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: authHeaders.value,
      body: { status }
    });
    await refreshOrders();
  } catch (err) {
    if (await handleAuthError(err)) return;
    error.value = "Не удалось обновить статус заказа";
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
        <button type="button" class="btn btn-secondary" @click="logoutRedirectHome">Выйти</button>
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
      <button class="btn" @click="addProduct">Добавить</button>
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
            <button class="btn btn-secondary" @click="setStatus(o.id, 'готовится')">Готовится</button>
            <button class="btn" @click="setStatus(o.id, 'доставлен')">Доставлен</button>
          </div>
        </li>
      </ul>
    </section>

    <section class="card">
      <h2>Пользователи</h2>
      <button class="btn" @click="refreshUsers">Обновить</button>
      <ul class="list mt-8">
        <li v-for="u in users || []" :key="u.id" class="list-item">{{ u.email }} - {{ u.role }}</li>
      </ul>
    </section>
  </main>
</template>
