<script setup lang="ts">
import { joinApiBase } from "~/utils/api-url";
import { decodeJwtPayload } from "../utils/jwt";

const cart = useCartStore();
const auth = useAuthStore();
const config = useRuntimeConfig();
const form = reactive({ customer_name: "", phone: "", address: "" });
const checkoutState = reactive({
  deliveryType: "courier",
  paymentMethod: "card",
  callBeforeDelivery: false,
  comment: "",
  agree: false
});
const msg = ref("");
const err = ref("");
const promo = ref("");
const promoStatus = ref<"" | "ok" | "bad">("");
const loading = ref(false);
const showThanks = ref(false);

const discount = computed(() => (promoStatus.value === "ok" ? Math.round(cart.total * 0.1) : 0));
const totalWithDiscount = computed(() => Math.max(0, cart.total - discount.value));
const user = computed(() => decodeJwtPayload(auth.token || "") || {});

watch(
  () => auth.token,
  () => {
    if (!form.customer_name) {
      const login = String(user.value?.sub || "").trim();
      if (login) {
        form.customer_name = login.includes("@") ? login.split("@")[0] : login;
      }
    }
  },
  { immediate: true }
);

function applyPromo() {
  promoStatus.value = promo.value.trim().toUpperCase() === "SWEET10" ? "ok" : "bad";
}

async function submitOrder() {
  err.value = "";
  msg.value = "";

  if (!auth.token) {
    err.value = "Войдите в аккаунт перед оформлением";
    return;
  }

  if (!cart.items.length) {
    err.value = "Корзина пуста";
    return;
  }
  if (!checkoutState.agree) {
    err.value = "Подтвердите согласие с условиями оформления";
    return;
  }

  loading.value = true;
  const items = cart.items.map((i) => ({ product_id: i.product.id, quantity: i.quantity }));

  try {
    await $fetch(joinApiBase(config.public.apiPrefix, "orders"), {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` },
      body: { ...form, items }
    });
    msg.value = "Заказ успешно оформлен";
    cart.clear();
    showThanks.value = true;
    setTimeout(() => {
      showThanks.value = false;
    }, 2300);
  } catch {
    err.value = "Не удалось оформить заказ. Проверьте данные и повторите попытку.";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <main class="container page cart-layout">
    <section class="card">
      <div class="order-steps">
        <span class="step step--active">1. Корзина</span>
        <span class="step">2. Данные</span>
        <span class="step">3. Оплата</span>
        <span class="step">4. Готово</span>
      </div>
      <h1>Корзина</h1>
      <ul class="list" v-if="cart.items.length">
        <li v-for="item in cart.items" :key="item.product.id" class="list-item">
          <div>
            <strong>{{ item.product.name }}</strong>
            <p>{{ item.quantity }} x {{ item.product.price }} ₽</p>
          </div>
          <div class="qty-controls">
            <button class="btn btn-secondary" @click="cart.decrease(item.product.id)">-</button>
            <input
              class="qty-input"
              type="number"
              min="1"
              :value="item.quantity"
              @input="cart.setQuantity(item.product.id, Number(($event.target as HTMLInputElement).value))"
            />
            <button class="btn btn-secondary" @click="cart.increase(item.product.id)">+</button>
            <button class="btn btn-danger" aria-label="Удалить товар" @click="cart.remove(item.product.id)">Удалить</button>
          </div>
        </li>
      </ul>
      <p v-else>В вашей корзине пока нет товаров.</p>
      <div class="promo-row">
        <input v-model="promo" placeholder="Промокод (например, SWEET10)" />
        <button class="btn btn-secondary" @click="applyPromo">Применить</button>
      </div>
      <p v-if="promoStatus === 'ok'" class="ok-text">Промокод активирован: -{{ discount }} ₽</p>
      <p v-if="promoStatus === 'bad'" class="err-text">Неверный промокод</p>
      <h3>Итого: {{ totalWithDiscount }} ₽</h3>
    </section>

    <section class="card">
      <h2>Оформление заказа</h2>
      <div class="checkout-block">
        <h3>Получатель</h3>
        <p class="meta-small" v-if="auth.token">Оформляете как: <b>{{ user.sub || "пользователь" }}</b></p>
      </div>
      <div class="form-stack">
        <input v-model="form.customer_name" placeholder="Имя" />
        <input v-model="form.phone" placeholder="Телефон" />
        <input v-model="form.address" placeholder="Адрес доставки" />

        <div class="checkout-block">
          <h3>Способ доставки</h3>
          <label class="check-row">
            <input v-model="checkoutState.deliveryType" type="radio" value="courier" />
            <span>Курьером сегодня (90 мин)</span>
          </label>
          <label class="check-row">
            <input v-model="checkoutState.deliveryType" type="radio" value="pickup" />
            <span>Самовывоз из магазина</span>
          </label>
        </div>

        <div class="checkout-block">
          <h3>Оплата</h3>
          <label class="check-row">
            <input v-model="checkoutState.paymentMethod" type="radio" value="card" />
            <span>Картой онлайн</span>
          </label>
          <label class="check-row">
            <input v-model="checkoutState.paymentMethod" type="radio" value="cash" />
            <span>Наличными при получении</span>
          </label>
          <label class="check-row">
            <input v-model="checkoutState.callBeforeDelivery" type="checkbox" />
            <span>Позвонить перед доставкой</span>
          </label>
          <textarea v-model="checkoutState.comment" rows="3" placeholder="Комментарий к заказу (подъезд, код домофона, пожелания)" />
        </div>

        <label class="check-row">
          <input v-model="checkoutState.agree" type="checkbox" />
          <span>Подтверждаю корректность данных и согласие с условиями доставки</span>
        </label>

        <button class="btn" role="button" data-testid="checkout-btn" :disabled="loading" @click="submitOrder">
          <span v-if="loading" class="btn-loader" />
          <span v-else>Оформить</span>
        </button>
      </div>
      <p class="ok-text" v-if="msg">{{ msg }}</p>
      <p class="err-text" v-if="err">{{ err }}</p>
    </section>

    <transition name="fade-simple">
      <div v-if="showThanks" class="thankyou-modal">
        <div class="thankyou-modal__card">
          <h3>Спасибо!</h3>
          <p>Мы уже печём для вас.</p>
        </div>
      </div>
    </transition>
  </main>
</template>
