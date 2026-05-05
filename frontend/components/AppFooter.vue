<template>
  <footer class="site-footer">
    <div class="container site-footer__grid">
      <section>
        <h3>Конфетки - бараночки</h3>
        <p>Современная кондитерская с домашним вкусом: конфеты, бараночки, капкейки и подарочные наборы.</p>
      </section>

      <section>
        <h4>Контакты</h4>
        <ul>
          <li>Телефон: +7 (900) 123-45-67</li>
          <li>Email: hello@baranochki.ru</li>
          <li>Адрес: ул. Крупской, 27, Батайск</li>
          <li>
            Telegram:
            <a href="https://t.me/masterim_dly_vas" target="_blank" rel="noopener noreferrer">
              t.me/masterim_dly_vas
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h4>Разделы</h4>
        <ul>
          <li><NuxtLink to="/">Главная</NuxtLink></li>
          <li><NuxtLink to="/catalog">Каталог</NuxtLink></li>
          <li><NuxtLink to="/cart">Корзина</NuxtLink></li>
          <li><NuxtLink to="/profile">Личный кабинет</NuxtLink></li>
        </ul>
      </section>

      <section>
        <h4>Режим работы</h4>
        <ul>
          <li>Пн-Пт: 09:00 - 21:00</li>
          <li>Сб-Вс: 10:00 - 20:00</li>
          <li>Доставка: ежедневно</li>
        </ul>
      </section>
    </div>

    <div class="container site-footer__bottom">
      <small>© {{ new Date().getFullYear() }} Конфетки - бараночки. Все права защищены.</small>
      <small>
        <NuxtLink to="/privacy-policy">Политика обработки персональных данных</NuxtLink>
        ·
        <NuxtLink to="/offer">Публичная оферта</NuxtLink>
      </small>
    </div>
  </footer>
</template>
