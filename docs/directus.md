# Directus CMS

Проект уже умеет работать без CMS: если `DIRECTUS_URL` не задан или Directus недоступен, используются локальные товары и настройки из `data/catalog.ts`.

Полезные официальные разделы: [Directus Docs](https://directus.io/docs), [Items API](https://directus.io/docs/api/items), [Files Upload](https://directus.io/docs/guides/files/upload).

## Переменные окружения

Добавь в Vercel Project Settings -> Environment Variables:

```env
DIRECTUS_URL=https://your-directus.example.com
DIRECTUS_STATIC_TOKEN=directus_static_token

RESEND_API_KEY=re_xxxxxxxxx
ORDER_FROM=iRoom <orders@your-domain.ru>
ORDER_RECIPIENT=kerim.aslanovich@gmail.com
```

`ORDER_RECIPIENT` нужен как запасной адрес. Основной адрес для заказов можно менять в Directus в `site_settings.order_recipient_email`; он читается только серверным API `/api/order` и не попадает во фронтенд.

## Коллекции

### site_settings

Одна запись с базовыми настройками сайта.

| Поле | Тип | Для чего |
| --- | --- | --- |
| `site_name` | string | Название сайта |
| `title` | string | SEO title |
| `description` | text | SEO description |
| `keywords` | string/text | SEO keywords |
| `favicon` | file | Иконка сайта |
| `logo` | file | Логотип |
| `phone` | string | Телефон в шапке/футере |
| `email` | string | Публичный email в шапке/футере |
| `telegram` | string | Telegram |
| `promo_ticker` | text | Текст бегущей строки |
| `promo_code` | string | Промокод на странице успеха и в письме |
| `footer_work_hours` | string | Время работы в футере |
| `footer_copyright` | string | Копирайт в футере |
| `order_recipient_email` | string | Скрытый email получателя заказов |

### promo_banner

Одна запись для черного акционного баннера.

| Поле | Тип | Для чего |
| --- | --- | --- |
| `eyebrow` | string | Подпись над основным текстом |
| `text` | text | Основной текст слева |
| `title_svg` | file | SVG-заголовок `(акция)` |
| `button_label` | string | Текст кнопки |
| `button_href` | string | Якорь или ссылка кнопки |
| `button_caption` | text | Подпись над кнопкой |
| `image` | file | Центральное изображение iPhone |

### product_sections

Секции лендинга. Порядок задается полем `sort`.

| Поле | Тип | Для чего |
| --- | --- | --- |
| `sort` | integer | Ранжирование секций |
| `slug` | string | ID секции и якорь, например `iphone-17-pro` |
| `category` | string | Техническая категория |
| `title` | string | Заголовок секции |
| `nav_title` | string | Название в меню |
| `cover` или `video_cover` | file | Видеообложка секции |

Количество товаров у секции считается автоматически по связанным товарам.

### products

Товары. Порядок задается полем `sort`.

| Поле | Тип | Для чего |
| --- | --- | --- |
| `sort` | integer | Ранжирование товара |
| `slug` | string | Уникальный ID товара |
| `section` | many-to-one -> `product_sections` | Секция товара |
| `title` или `name` | string | Название карточки |
| `short_description` | string | Короткая подпись в карточке |
| `model` | string | Модель для заголовка модалки |
| `color_name` | string | Название цвета |
| `color_hex` | string | Цвет пиктограммы |
| `memory` | string | Память, например `512 ГБ` |
| `image` или `main_image` | file | Основное изображение |
| `description_image` | file | Картинка в блоке описания |
| `details_description` | text | Текст описания |
| `base_price` | integer | Цена без скидки |
| `sale_price` или `price` | integer | Акционная цена |
| `specs` или `characteristics` | json/relation | Характеристики: `label` и `value` |

Если `section` не настроен, можно временно использовать строковое поле `category`, совпадающее со `slug` секции.

## Права доступа

Для быстрого старта проще создать Static Token в Directus и добавить его в `DIRECTUS_STATIC_TOKEN`. Тогда коллекции можно оставить закрытыми для публичного API.

Если решишь открыть публичное чтение без токена, не открывай поле `order_recipient_email`: оно должно оставаться приватным.

## Обновление на Vercel

После изменения переменных окружения обязательно сделай Redeploy. После обычных правок кода достаточно:

```sh
git add .
git commit -m "Update Directus CMS integration"
git push
```

Vercel сам соберет новый билд из ветки `main`.
