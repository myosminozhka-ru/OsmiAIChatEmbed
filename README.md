<!-- markdownlint-disable MD030 -->

# Osmi AI Chat Embed

JavaScript-библиотека для встраивания чат-бота Osmi AI на сайт. Виджет реализован на [Solid.js](https://www.solidjs.com/) и поставляется вместе с прокси-сервером, который скрывает API-ключ и UUID chatflow от браузера.

## Возможности

- **Виджет (popup)** — плавающая кнопка с окном чата
- **Полноэкранный режим** — чат на всю страницу через `<chatbot-full>`
- **Прокси-сервер** — безопасная прокси-прослойка между сайтом и бэкендом Osmi AI
- **Контроль доменов** — whitelist разрешённых origin для каждого chatflow
- **Кастомизация** — темы, CSS, стартовые подсказки, disclaimer и др.
- **Docker** — готовый образ для деплоя

## Требования

- Node.js 20+
- Yarn
- Рабочий инстанс Osmi AI с API-ключом

## Быстрый старт

### 1. Установка

```bash
yarn install
yarn build
```

### 2. Настройка окружения

```bash
cp .env.example .env
```

Заполните обязательные переменные в `.env`:

```bash
# URL бэкенда Osmi AI (без завершающего слэша)
API_HOST=https://your-chatbot-instance.ru

# API-ключ из настроек бэкенда (только на сервере, не в браузере)
CHATBOT_API_KEY=your-api-key

# Маппинг chatflow: ИДЕНТИФИКАТОР=UUID,РАЗРЕШЁННЫЙ_ORIGIN_1,...
agent1=20db97c6-64c9-4411-bab4-7d6202171600,https://example.com
support=1c28f529-a70f-5001-9bc5-4f4c5d03d8c0,https://app.example.com
```

**Формат chatflow-записей:**

| Часть           | Описание                                                           |
| --------------- | ------------------------------------------------------------------ |
| `ИДЕНТИФИКАТОР` | Произвольное имя (например, `agent1`, `support`); регистр не важен |
| `UUID`          | UUID chatflow в бэкенде                                            |
| `ORIGIN`        | Полный origin сайта: `https://host[:port]`                         |

**Важно:**

- Wildcard (`*`) в доменах запрещён
- В `chatflowid` на сайте указывается **идентификатор** из `.env`, а не UUID
- Добавьте в whitelist URL прокси-сервера, если `web.js` загружается с него (например, `https://your-proxy.example.com`)
- В режиме разработки (`NODE_ENV=development`) автоматически разрешается `http://localhost:5678`

### 3. Запуск прокси-сервера

```bash
yarn start
# Локально: http://localhost:3001
```

При старте сервер выводит в консоль готовые embed-скрипты для popup и fullpage режимов.

Альтернатива — сборка и запуск одной командой:

```bash
yarn preview
```

### 4. Встраивание на сайт

После запуска прокси используйте скрипт из консоли или шаблон ниже.

**Popup (виджет):**

```html
<script type="module">
  import Chatbot from 'https://your-proxy.example.ru/web.js';
  Chatbot.init({
    chatflowid: 'agent1',
    apiHost: 'https://your-proxy.example.com',
  });
</script>
```

**Full page (на всю страницу):**

```html
<body style="margin: 0">
  <chatbot-full></chatbot-full>
  <script type="module">
    import Chatbot from 'https://your-proxy.example.ru/web.js';
    Chatbot.initFull({
      chatflowid: 'agent1',
      apiHost: 'https://your-proxy.example.ru',
    });
  </script>
</body>
```

Для полноэкранного режима не задавайте `height` и `width` в `theme.chatWindow`.

## Разработка

### Локальная разработка виджета

1. Настройте `.env` (см. выше)
2. Запустите прокси в одном терминале:

```bash
yarn start
```

3. Запустите dev-сервер в другом терминале:

```bash
yarn dev
# Тестовая страница: http://localhost:5678
```

Dev-сервер собирает `dist/web.js` с hot reload и открывает `public/index.html`.

Папка `public/` и файл `public/index.html` — **опциональны**; это только демо-страница для локального тестирования. Её можно удалить без влияния на embed-библиотеку.

Пример конфигурации в `public/index.html`:

```html
<script type="module">
  import Chatbot from './web.js';
  Chatbot.init({
    chatflowid: 'agent1',
    apiHost: 'http://localhost:3001',
  });
</script>
```

Для fullpage-теста:

```html
<chatbot-full></chatbot-full>
<script type="module">
  import Chatbot from './web.js';
  Chatbot.initFull({
    chatflowid: 'agent1',
    apiHost: 'http://localhost:3001',
  });
</script>
```

### Сборка

```bash
yarn build
```

Артефакты: `dist/web.js` (ES module) и `dist/web.umd.js` (UMD).

### Линтинг и форматирование

```bash
yarn lint
yarn lint-fix
yarn format
```

## Прокси-сервер

Прокси (`server.js`) — рекомендуемый способ подключения в production.

**Что делает:**

- Скрывает `API_HOST`, UUID chatflow и API-ключ от клиента
- Проверяет origin запросов по whitelist из `.env`
- Проксирует API: prediction, streaming, config, файлы, вложения
- Отдаёт `web.js` только с разрешённых доменов

**Схема:**

```text
Сайт (браузер)  →  Прокси (server.js)  →  Osmi AI
```

**Переменные окружения:**

| Переменная             | Обязательная | Описание                                |
| ---------------------- | ------------ | --------------------------------------- |
| `API_HOST`             | да           | URL бэкенда Osmi AI                     |
| `CHATBOT_API_KEY`      | да           | API-ключ бэкенда                        |
| `agent1`, `support`, … | да (≥1)      | Маппинг chatflow                        |
| `PORT`                 | нет          | Порт (по умолчанию `3001`)              |
| `HOST`                 | нет          | Адрес привязки (по умолчанию `0.0.0.0`) |
| `BASE_URL`             | нет          | Базовый URL для embed-скриптов в логах  |
| `NODE_ENV`             | нет          | `development` или `production`          |

Сервер не запустится без `API_HOST`, `CHATBOT_API_KEY` и хотя бы одной валидной chatflow-записи.

## Docker

```bash
docker compose up --build
```

Контейнер слушает порт `3001`, переменные берутся из `.env`. В `docker-compose.yml` задано `NODE_ENV=production`.

Или вручную:

```bash
docker build -t osmi-ai-testchat .
docker run -p 3001:3001 --env-file .env osmi-ai-testchat
```

## Встраивание через CDN (без прокси)

Если прокси не используется, можно подключить библиотеку напрямую. В этом случае `apiHost` и `chatflowid` (UUID) будут видны в браузере:

```html
<script type="module">
  import Chatbot from 'https://cdn.jsdelivr.net/npm/osmi-ai-embed/dist/web.js';
  Chatbot.init({
    chatflowid: '<uuid-chatflow>',
    apiHost: 'https://your-chatbot-instance.com',
  });
</script>
```

Для production рекомендуется прокси-сервер.

## Настройка виджета

Параметры передаются в `Chatbot.init()` / `Chatbot.initFull()`:

```html
<script type="module">
  import Chatbot from 'https://your-proxy.example.ru/web.js';
  Chatbot.init({
    chatflowid: 'agent1',
    apiHost: 'https://your-proxy.example.ru',
    chatflowConfig: {
      // дополнительные параметры chatflow
    },
    observersConfig: {
      observeUserInput: (userInput) => console.log({ userInput }),
      observeMessages: (messages) => console.log({ messages }),
      observeLoading: (loading) => console.log({ loading }),
    },
    theme: {
      button: {
        backgroundColor: '#3B81F6',
        right: 20,
        bottom: 20,
        size: 48,
        dragAndDrop: true,
        iconColor: 'white',
        autoWindowOpen: {
          autoOpen: true,
          openDelay: 2,
          autoOpenOnMobile: false,
        },
      },
      tooltip: {
        showTooltip: true,
        tooltipMessage: 'Привет! 👋',
      },
      disclaimer: {
        title: 'Дисклеймер',
        message: 'Продолжая, вы соглашаетесь с <a target="_blank" href="https://example.com/terms">условиями</a>',
        buttonText: 'Начать чат',
      },
      chatWindow: {
        title: 'Чат-бот',
        welcomeMessage: 'Здравствуйте! Чем могу помочь?',
        height: 700,
        width: 400,
        starterPrompts: ['Что вы умеете?', 'Как с вами связаться?'],
        clearChatOnReload: false,
        renderHTML: true,
        botMessage: {
          backgroundColor: '#f7f8ff',
          showAvatar: true,
        },
        userMessage: {
          backgroundColor: '#3B81F6',
          textColor: '#ffffff',
        },
        textInput: {
          placeholder: 'Введите сообщение',
          maxChars: 500,
          autoFocus: true,
        },
        footer: {
          text: 'Powered by',
          company: 'Company',
          companyLink: 'https://example.com',
        },
      },
      customCSS: '',
    },
  });
</script>
```

### API

| Метод                     | Описание                   |
| ------------------------- | -------------------------- |
| `Chatbot.init(props)`     | Виджет с плавающей кнопкой |
| `Chatbot.initFull(props)` | Полноэкранный чат          |
| `Chatbot.destroy()`       | Удалить виджет со страницы |

## Деплой в облако

- Задайте переменные окружения на платформе (Heroku, Railway, Fly.io и т.д.)
- Убедитесь, что `NODE_ENV=production`
- Добавьте URL прокси и все сайты-embedder'ы в whitelist каждого chatflow
- Совместимо с Nixpacks для автоматической конфигурации деплоя

## Лицензия

Исходный код является собственностью компании ООО «ОСМИ-ИТ»
