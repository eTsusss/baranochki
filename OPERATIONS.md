# Руководство по эксплуатации и запуску

Документ описывает запуск проекта `Конфеты Бараночки`:
- локально (без Docker),
- локально через Docker Compose,
- публикация в сети (публичный доступ).

## 1) Архитектура и порты

- Frontend (Nuxt 3): `3000`
- Backend (FastAPI): `8000`
- PostgreSQL: `5432`
- Nginx (единая точка входа в Docker): `8080`

Основные URL:
- Локальный фронт: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`
- Docker gateway: `http://localhost:8080`
- Админка: `/cabinet-upravleniya-87`
- Отчет тестов: `/otchet-testov-87`

## 2) Требования

### Для локального запуска
- Node.js 20+
- npm 10+
- Python 3.11+
- PostgreSQL 14+

### Для Docker запуска
- Docker Desktop (или Docker Engine + Compose Plugin)

## 2.1) Быстрый старт без Docker (Windows)

Из корня проекта:
```bat
start-local.bat
```

Что делает скрипт:
- создает `backend/.env` и `frontend/.env` из примеров (если файлов нет),
- поднимает `backend/.venv` (если его нет),
- устанавливает backend зависимости (`pip install -r requirements.txt`),
- устанавливает frontend зависимости (`npm install`, если `node_modules` отсутствует),
- запускает backend (`http://localhost:8000`) и frontend (`http://localhost:3000`) в отдельных окнах.

Остановка: просто закройте два открытых окна терминала (backend/frontend).

## 3) Переменные окружения

### Backend (`backend/.env`)
Создать из `backend/.env.example`:
- `DB_URL` (пример: `postgresql://postgres:postgres@localhost:5432/confeti`)
- `JWT_SECRET` (длинный случайный секрет)

### Frontend (`frontend/.env`)
Создать из `frontend/.env.example`:
- `NUXT_PUBLIC_API_BASE=http://localhost:8000/api`

Для Docker-сети обычно используется сервис backend:
- `NUXT_PUBLIC_API_BASE=http://backend:8000/api`

## 4) Локальный запуск (без Docker)

### 4.1 Поднять PostgreSQL
Создайте БД `confeti` и пользователя (если нужно), затем проверьте `DB_URL`.

### 4.2 Запуск backend
```bash
cd backend
python -m venv .venv
. .venv/Scripts/activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Что проверить:
- `http://localhost:8000/docs` открывается
- в логах нет ошибок подключения к БД

### 4.3 Запуск frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Что проверить:
- `http://localhost:3000` открывается
- каталог загружает товары
- оформление заказа отрабатывает после авторизации

## 5) Локальный запуск через Docker Compose

```bash
cd infra
docker compose up --build
```

Проверка:
- `http://localhost:8080` (Nginx)
- `http://localhost:3000` (frontend)
- `http://localhost:8000/docs` (backend)

Остановка:
```bash
docker compose down
```

С удалением томов БД:
```bash
docker compose down -v
```

## 6) Эксплуатация (ежедневные операции)

### 6.1 Доступ администратора
- Вход: `admin@example.com`
- Пароль: `admin`
- Страница: `/cabinet-upravleniya-87`

### 6.2 Что делает админка
- CRUD товаров
- смена статусов заказов
- просмотр пользователей
- переход к тест-отчету

### 6.3 Резервное копирование БД (пример)
```bash
pg_dump -U postgres -h localhost -d confeti > confeti_backup.sql
```

Восстановление:
```bash
psql -U postgres -h localhost -d confeti < confeti_backup.sql
```

## 7) Публикация в сеть: варианты

## Вариант A (быстро для демонстрации): Cloudflare Tunnel / ngrok

Подходит для защиты проекта и демо без настройки VPS.

1. Поднимите проект локально (`docker compose up --build`).
2. Опубликуйте `http://localhost:8080` через туннель:
   - Cloudflare Tunnel, либо
   - ngrok.
3. Получите публичный HTTPS URL и передайте проверяющему.

Плюсы: быстро, HTTPS из коробки.  
Минусы: временные ссылки/ограничения бесплатных тарифов.

## Вариант B (боевой): VPS + Docker + Nginx + домен + SSL

### 7.1 Подготовить сервер
- Ubuntu 22.04+
- Открыть порты `80` и `443`
- Установить Docker и Docker Compose Plugin

### 7.2 Деплой
1. Скопировать проект на сервер.
2. Настроить `backend/.env` и `frontend/.env` (для frontend API base указывать домен API или путь через nginx).
3. Запустить:
```bash
cd infra
docker compose up -d --build
```

### 7.3 Домен и SSL
- Привязать A-запись домена к IP сервера.
- Настроить Nginx как reverse proxy.
- Выпустить сертификат через Let’s Encrypt (Certbot).

После этого проект доступен по `https://your-domain.tld`.

## 8) Минимальный production checklist

- [ ] `JWT_SECRET` изменен на уникальный и длинный
- [ ] `.env` файлы не попали в git
- [ ] БД доступна только внутренне (не наружу)
- [ ] Есть бэкапы БД
- [ ] HTTPS включен (TLS)
- [ ] Проверены маршруты: `/`, `/catalog`, `/cart`, `/profile`, `/cabinet-upravleniya-87`
- [ ] Прогнаны тесты (`pytest`, `vitest`, `playwright`)

## 9) Диагностика проблем

### Продукты не загружаются на фронте
- проверить `NUXT_PUBLIC_API_BASE` в `frontend/.env`
- проверить доступность backend (`/docs`)

### 401/403 на защищенных страницах
- убедиться, что токен сохранен и корректный
- проверить роль `admin` для админки

### Картинки товара не отображаются
- проверить `image_url` в товаре
- если URL некорректный, интерфейс использует fallback-изображение автоматически

### Ошибки БД
- проверить `DB_URL`
- проверить, что PostgreSQL запущен и доступен

## 10) Команды тестирования

Backend:
```bash
cd backend
pytest
```

Frontend unit:
```bash
cd frontend
npm run test:unit
npm run test:unit:coverage
```

Frontend E2E:
```bash
cd frontend
npm run test:e2e
```

UI отчет:
```bash
cd frontend
npm run test:ui
```
Открыть: `http://localhost:3000/otchet-testov-87`
