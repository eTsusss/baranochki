<script setup lang="ts">
import { joinApiBase } from "~/utils/api-url";
import { decodeJwtPayload } from "../utils/jwt";

const config = useRuntimeConfig();
const auth = useAuthStore();
const mode = ref<"login" | "register">("login");
const email = ref("admin@example.com");
const password = ref("admin");
const error = ref("");
const loading = ref(false);

function formatLoginError(e: unknown): string {
  const err = e as {
    statusCode?: number
    message?: string
    data?: { detail?: unknown }
  };
  const detail = err.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0] && typeof (detail[0] as { msg?: string }).msg === "string") {
    return (detail[0] as { msg: string }).msg;
  }
  if (err.statusCode === 502 || err.statusCode === 503) {
    return "API недоступен. На хостинге задайте NUXT_PUBLIC_API_BASE (URL бэкенда с /api).";
  }
  if (err.message && /fetch failed|ECONNREFUSED|NetworkError/i.test(err.message)) {
    return "Нет связи с API. Проверьте NUXT_PUBLIC_API_BASE в настройках сервиса.";
  }
  return "Неверный логин или пароль";
}

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    const res = await $fetch<{ access_token: string }>(joinApiBase(config.public.apiPrefix, "auth", mode.value), {
      method: "POST",
      body: { email: email.value, password: password.value }
    });
    auth.setToken(res.access_token);
    if (!auth.token) {
      error.value = "Токен отклонён. Проверьте время на устройстве или обратитесь к администратору.";
      return;
    }
    const role = decodeJwtPayload(res.access_token)?.role;
    await navigateTo(role === "admin" ? "/cabinet-upravleniya-87" : "/profile", { replace: true });
  } catch (e) {
    error.value = formatLoginError(e);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="container login-page">
    <section class="card login-card">
      <h1>Вход / Регистрация</h1>
      <p>Введите данные учётной записи для входа в личный кабинет.</p>

      <div class="form-stack">
        <select v-model="mode">
          <option value="login">Вход</option>
          <option value="register">Регистрация</option>
        </select>
        <input v-model="email" placeholder="Email" />
        <input v-model="password" type="password" placeholder="Пароль" />
        <button type="button" class="btn" :disabled="loading" @click="submit">
          {{ loading ? "…" : "Продолжить" }}
        </button>
      </div>
      <p class="err-text" v-if="error">{{ error }}</p>
    </section>
  </main>
</template>
