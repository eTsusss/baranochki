<script setup lang="ts">
import { decodeJwtPayload } from "../utils/jwt";

const config = useRuntimeConfig();
const auth = useAuthStore();
const mode = ref<"login" | "register">("login");
const email = ref("admin@example.com");
const password = ref("admin");
const error = ref("");

async function submit() {
  error.value = "";
  try {
    const res = await $fetch<{ access_token: string }>(`${config.public.apiBase}/auth/${mode.value}`, {
      method: "POST",
      body: { email: email.value, password: password.value }
    });
    auth.setToken(res.access_token);
    const role = decodeJwtPayload(res.access_token)?.role;
    navigateTo(role === "admin" ? "/cabinet-upravleniya-87" : "/profile");
  } catch {
    error.value = "Неверный логин или пароль";
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
        <button class="btn" @click="submit">Продолжить</button>
      </div>
      <p class="err-text" v-if="error">{{ error }}</p>
    </section>
  </main>
</template>
