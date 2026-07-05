# Структура проекта iRoom

Проект переписан на Next.js App Router. Сайт работает на Vercel, а контент можно подключать через Directus CMS. Если Directus не настроен или недоступен, сайт использует локальные фолбэки из `data/catalog.ts`.

## Быстрый старт

```bash
npm install
npm run dev
```

Локально сайт можно открыть на стандартном Next.js порту или запустить production-сборку:

```bash
npm run build
npm run start -- --port 4173
```

## Основные директории

```text
app/
  layout.tsx              общий layout, CartProvider, SEO metadata из CMS
  page.tsx                главная страница
  checkout/page.tsx       оформление заказа
  success/page.tsx        страница успешного заказа
  privacy/page.tsx        заглушка политики конфиденциальности
  api/order/route.ts      серверная отправка заказа через Resend
  globals.css             все стили проекта

components/
  storefront.tsx          главная витрина, баннер, секции, карточки, модалка товара
  header.tsx              шапка, меню, бегущая строка
  footer.tsx              единый футер
  cart-context.tsx        состояние корзины, localStorage, total/quantity
  cart-drawer.tsx         выезжающая панель корзины
  checkout-page.tsx       форма оформления заказа
  success-page.tsx        страница успеха
  privacy-page.tsx        страница политики

data/
  catalog.ts              локальные товары, секции, типы и фолбэк-контент

lib/
  cms.ts                  Directus-интеграция, нормализация данных, фолбэки

public/assets/
  статичные изображения, SVG, видеообложки

docs/
  directus.md             схема коллекций Directus и ENV
  site-structure.md       этот документ
```

## Маршруты

| URL | Файл | Назначение |
| --- | --- | --- |
| `/` | `app/page.tsx` | Главная витрина |
| `/checkout` | `app/checkout/page.tsx` | Оформление заказа |
| `/success` | `app/success/page.tsx` | Успешный заказ |
| `/privacy` | `app/privacy/page.tsx` | Политика конфиденциальности |
| `/api/order` | `app/api/order/route.ts` | Серверная отправка письма |

## Поток данных

Главный источник данных:

```text
Directus CMS
  ↓
lib/cms.ts / getCmsContent()
  ↓
app/page.tsx, app/checkout/page.tsx, app/success/page.tsx
  ↓
React-компоненты
```

Если `DIRECTUS_URL` не задан или Directus вернул ошибку, `getCmsContent()` возвращает локальные данные из `data/catalog.ts`.

## Directus CMS

Подробная схема коллекций описана в `docs/directus.md`.

Сайт ожидает следующие коллекции:

```text
site_settings
promo_banner
product_sections
products
```

Ключевые поля:

`site_settings`:
- SEO: `title`, `description`, `keywords`, `favicon`
- контакты: `phone`, `email`, `telegram`
- футер: `footer_work_hours`, `footer_copyright`
- бегущая строка: `promo_ticker`
- промокод: `promo_code`
- скрытый email заказов: `order_recipient_email`

`promo_banner`:
- `eyebrow`
- `text`
- `title_svg`
- `button_label`
- `button_href`
- `button_caption`
- `image`

`product_sections`:
- `sort`
- `slug`
- `category`
- `title`
- `nav_title`
- `cover` или `video_cover`

`products`:
- `sort`
- `slug`
- `section`
- `title` или `name`
- `short_description`
- `model`
- `color_name`
- `color_hex`
- `memory`
- `image`
- `description_image`
- `details_description`
- `base_price`
- `sale_price` или `price`
- `specs` / `characteristics`

## Переменные окружения

Для Vercel:

```env
DIRECTUS_URL=https://cms.example.ru
DIRECTUS_STATIC_TOKEN=directus_static_token

RESEND_API_KEY=re_xxxxxxxxx
ORDER_FROM=iRoom <orders@example.ru>
ORDER_RECIPIENT=kerim.aslanovich@gmail.com
```

`ORDER_RECIPIENT` используется как fallback. Основной email можно хранить в Directus в `site_settings.order_recipient_email`. Он читается только на сервере в `/api/order` и не попадает в HTML.

После изменения ENV в Vercel нужен Redeploy.

## Главная страница

Главная собирается в `components/storefront.tsx`.

Состав:

```text
Header
PromoBanner
Category sections
ServiceStrip
Footer
ProductModal
CartDrawer
Mobile CTA
```

Секции товаров приходят из CMS или из `data/catalog.ts`. Количество товаров в заголовке секции считается автоматически:

```tsx
section.products.length
```

Навигация в шапке строится по `sections` и ведет на якори секций:

```text
/#iphone-17-pro
/#airpods
/#accessories
```

## Корзина

Корзина хранится в `localStorage` под ключом:

```text
iroom_cart
```

Логика корзины находится в `components/cart-context.tsx`.

Основные методы:

```text
add(product)
remove(id)
toggle(product)
changeQty(id, delta)
clear()
has(id)
```

Панель корзины находится в `components/cart-drawer.tsx`.

На карточке товара:
- первый клик по `В корзину` добавляет товар;
- кнопка меняется на `Добавлено`;
- повторный клик удаляет товар из корзины;
- при добавлении запускается анимация улетающей картинки в корзину.

## Оформление заказа

Форма находится в `components/checkout-page.tsx`.

Форма отправляется POST-запросом на:

```text
/api/order
```

В hidden-поля передаются:

```text
order_details
order_total
action_promo_code
```

Правый список товаров на checkout берется из корзины. Клик по товару открывает модалку товара в readonly-режиме, без кнопки заказа.

## Отправка письма

Серверный обработчик:

```text
app/api/order/route.ts
```

Порядок:

```text
request.formData()
  ↓
buildOrderText()
  ↓
getOrderRecipientEmail()
  ↓
Resend API
  ↓
redirect /success
```

Если `RESEND_API_KEY` не задан, API вернет ошибку.

## SEO

SEO формируется в:

```text
app/layout.tsx / generateMetadata()
```

Данные берутся из CMS:

```text
settings.title
settings.description
settings.keywords
settings.favicon
```

## Стили

Все стили лежат в:

```text
app/globals.css
```

Важные блоки стилей:

```text
site-header
promo-banner
category-section
product-card
cart-panel
product-modal
checkout-main
site-footer
mobile media queries
```

Если после изменений в CSS на Vercel или локально видны старые стили, нужно пересобрать и перезапустить сервер:

```bash
npm run build
npm run start -- --port 4173
```

## Деплой

Обычный процесс:

```bash
git checkout -b feature-name
git add .
git commit -m "Description"
git push -u origin feature-name
```

Дальше:

1. Создать Pull Request в GitHub.
2. Проверить Preview Deployment в Vercel.
3. После проверки сделать merge в `main`.
4. Vercel автоматически обновит Production.

В Vercel настройки проекта:

```text
Framework Preset: Next.js
Root Directory: пусто
Build Command: npm run build
Output Directory: Next.js default / пусто
Install Command: npm install
```

Важно: `Root Directory` должен быть пустым, не `./`.

## На что обратить внимание следующему разработчику

- Directus сейчас подключен через REST в `lib/cms.ts`, SDK установлен, но напрямую пока не используется.
- Данные CMS нормализуются в формат локальных типов `Product` и `ProductSection`.
- Все публичные настройки можно прокидывать в клиентские компоненты, но приватные поля, например `order_recipient_email`, нельзя отдавать во фронт.
- Если будут добавляться галереи товаров, лучше расширять `Product` и `normalizeProduct()` в `lib/cms.ts`.
- Если появится полноценная таблица характеристик в Directus, ее можно хранить JSON-массивом `{ label, value }[]` или отдельной relation-коллекцией.
- Для файлов Directus используется `/assets/{fileId}` через helper `assetUrl()`.
