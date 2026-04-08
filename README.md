# Confeti Baranochki

Инструкция: как запустить проект после скачивания с GitHub.

## 1) Требования

- Windows 10/11 (или Linux/macOS)
- Python 3.11+
- Node.js 18+ и npm
- Git

Проверка версий:

- `python --version`
- `node --version`
- `npm --version`
- `git --version`

## 2) Скачивание проекта

```bash
git clone https://github.com/eTsusss/baranochki.git
cd baranochki
```

## 3) Настройка Backend (FastAPI)

Перейдите в папку backend:

```bash
cd backend
```

Создайте и активируйте виртуальное окружение:

```bash
python -m venv .venv
.venv\Scripts\activate
```

Установите зависимости:

```bash
pip install -r requirements.txt
```

Создайте `.env` (или скопируйте из примера):

```bash
copy .env.example .env
```

Если нужно, отредактируйте `DB_URL` в `.env`.

Запуск backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Проверка:

- API: `http://localhost:8000/health`

## 4) Настройка Frontend (Nuxt 3)

Откройте второй терминал и перейдите в `frontend`:

```bash
cd frontend
```

Установите зависимости:

```bash
npm install
```

Создайте `.env`:

```bash
copy .env.example .env
```

Проверьте, что API указывает на backend:

- `NUXT_PUBLIC_API_BASE=http://localhost:8000/api`

Запуск frontend:

```bash
npm run dev
```

Проверка:

- Сайт: `http://localhost:3000`

## 5) Быстрый запуск через bat-файл (Windows)

В корне проекта есть `start-local.bat`.

Запуск:

```bash
start-local.bat
```

Скрипт поднимает backend и frontend в отдельных окнах.

## 6) Тесты

### Backend

```bash
cd backend
pytest -q
```

### Frontend unit

```bash
cd frontend
npm run test:unit
```

### Frontend e2e

```bash
cd frontend
npm run test:e2e
```

### UI-отчет

```bash
cd frontend
npm run test:ui
```

Отчет формируется в `frontend/public/test-report.json`.

## 7) Типичные проблемы

- **Порт занят**: измените порт запуска (`--port 8001`) и `NUXT_PUBLIC_API_BASE`.
- **Не запускается backend**: убедитесь, что активировано `.venv` и установлены зависимости.
- **Не запускается frontend**: удалите `node_modules` и выполните `npm install` заново.
- **Ошибки авторизации**: очистите localStorage в браузере и войдите снова.

## 8) Полезно перед коммитом

- Не коммитьте `.env`, `.venv`, `node_modules`, `local.db`
- Проверьте тесты:
  - `pytest -q`
  - `npm run test:unit`
  - `npm run test:e2e`
