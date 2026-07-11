# Интеграция в WordPress

Статическая версия подготовлена как основа для темы WordPress. В проекте нет CDN-зависимостей: стили, скрипты и шрифт Inter находятся локально в `assets/libs`.

## Рекомендуемая структура темы

```text
expert-service/
├── assets/
│   ├── css/site.css
│   ├── js/main.js
│   ├── img/
│   └── libs/
│       ├── inter/
│       ├── swiper/
│       └── fancybox/
├── inc/
│   ├── enqueue.php
│   ├── post-types.php
│   ├── taxonomies.php
│   └── acf.php
├── template-parts/
│   ├── header/site-header.php
│   ├── navigation/mega-menu.php
│   ├── navigation/mobile-menu.php
│   ├── footer/site-footer.php
│   ├── forms/lead-modal.php
│   ├── cards/service-card.php
│   ├── cards/case-card.php
│   ├── cards/review-card.php
│   ├── cards/video-card.php
│   └── sections/
├── front-page.php
├── archive-service.php
├── taxonomy-service_category.php
├── single-service.php
├── archive-case.php
├── archive-review.php
├── archive-video.php
├── page-faq.php
├── page-policy.php
├── 404.php
├── header.php
├── footer.php
├── functions.php
└── style.css
```

## Локальное подключение ресурсов

Зафиксированные версии:

- Inter — `5.2.8`;
- Swiper — `11.2.10`;
- Fancybox — `5.0.36`.

Пример `inc/enqueue.php`:

```php
<?php

add_action('wp_enqueue_scripts', function (): void {
    $theme_uri = get_template_directory_uri();
    $theme_dir = get_template_directory();

    wp_enqueue_style(
        'expert-inter',
        $theme_uri . '/assets/libs/inter/inter.css',
        [],
        '5.2.8'
    );

    wp_enqueue_style(
        'expert-swiper',
        $theme_uri . '/assets/libs/swiper/swiper-bundle.min.css',
        [],
        '11.2.10'
    );

    wp_enqueue_style(
        'expert-fancybox',
        $theme_uri . '/assets/libs/fancybox/fancybox.css',
        [],
        '5.0.36'
    );

    wp_enqueue_style(
        'expert-site',
        $theme_uri . '/assets/css/site.css',
        ['expert-inter', 'expert-swiper', 'expert-fancybox'],
        (string) filemtime($theme_dir . '/assets/css/site.css')
    );

    wp_enqueue_script(
        'expert-swiper',
        $theme_uri . '/assets/libs/swiper/swiper-bundle.min.js',
        [],
        '11.2.10',
        true
    );

    wp_enqueue_script(
        'expert-fancybox',
        $theme_uri . '/assets/libs/fancybox/fancybox.umd.js',
        [],
        '5.0.36',
        true
    );

    wp_enqueue_script(
        'expert-main',
        $theme_uri . '/assets/js/main.js',
        ['expert-swiper', 'expert-fancybox'],
        (string) filemtime($theme_dir . '/assets/js/main.js'),
        true
    );
});
```

После переноса Swiper и Fancybox можно подключать условно только на страницах, где они используются. На первом этапе безопаснее сохранить единый порядок, как в статической версии.

## Типы записей и таксономии

Рекомендуемые CPT:

- `service` — услуги;
- `case` — выполненные объекты;
- `review` — отзывы;
- `video` — видеоматериалы.

Таксономия:

- `service_category` — категории услуг.

Категорийные страницы должны выводить только связанные услуги без дополнительного списка тегов.

## Шаблон услуги

В `single-service.php` оставить:

- хлебные крошки;
- первый экран;
- состав услуги;
- цены или пакеты;
- кейсы;
- сравнение «до/после»;
- FAQ;
- форму расчёта;
- похожие услуги.

Секции «7 этапов — от первого касания до сдачи объекта» и «6 причин доверить нам объект» удалены со страниц отдельных услуг и не должны возвращаться в `single-service.php`.

## ACF-поля

Для услуги:

```text
service_eyebrow
service_title
service_description
service_image
service_price_from
service_price_unit
service_features
service_packages
service_cases
service_before_image
service_after_image
service_faq
service_related
```

Для кейса:

```text
case_title
case_type
case_area
case_duration
case_image
case_description
case_gallery
```

Для видео:

```text
video_title
video_preview
video_url
video_description
video_object
```

Для отзыва:

```text
review_name
review_date
review_text
review_service
```

## Главная и архивы

- На главной выводить последние 6 видео.
- На `archive-video.php` выводить все видео сеткой.
- На главной отзывы выводить через Swiper.
- На `archive-review.php` использовать сетку и стандартную пагинацию WordPress.
- Каталог услуг формировать через `WP_Query` и `service_category`.
- Фильтр каталога должен работать с реальными ID или slug категорий.

## Формы и Contact Form 7

Для передачи источника нужны только:

```text
[hidden lead_source]
[hidden lead_page_url]
```

Пример CF7:

```text
[text* your-name placeholder "Имя"]
[tel* your-phone placeholder "Телефон"]
[select object_type "Тип объекта" "Квартира" "Дом" "Коммерческое помещение" "Балкон / остекление" "Другое"]
[select contact_way "Способ связи" "Телефон" "WhatsApp" "Telegram"]
[textarea message placeholder "Комментарий"]
[file files limit:20mb filetypes:jpg|jpeg|png|webp|pdf|doc|docx|xls|xlsx]
[acceptance policy] Отправляя заявку, Вы принимаете и соглашаетесь с Политикой конфиденциальности [/acceptance]
[hidden lead_source]
[hidden lead_page_url]
[submit "Отправить"]
```

`lead_source` — короткое понятное значение: `Получить смету`, `Офисы`, `Магазины` или `Кейс: Производственный объект 1 250 м²`.

`lead_page_url` заполняется текущим URL.

## Меню

```php
register_nav_menus([
    'header_menu' => 'Меню в шапке',
    'footer_menu' => 'Меню в подвале',
]);
```

Состав меню:

- Услуги;
- Видео;
- Кейсы;
- Отзывы;
- FAQ.

Мегаменю можно собрать через отдельный `template-part`, ACF Options Page или `Walker_Nav_Menu`.

## Проверки перед публикацией

1. Заменить тестовые контакты.
2. Добавить реальные фото, видео, цены, сроки, отзывы и кейсы.
3. Настроить CF7, SMTP, Flamingo или CRM.
4. Проверить лицензионные условия Fancyapps для рабочего проекта.
5. Пересохранить постоянные ссылки.
6. Проверить title, description, canonical, Open Graph и Schema.org.
7. Настроить sitemap.xml и robots.txt.
8. Проверить формы, модальные окна, Swiper, Fancybox и мобильную CTA-панель.
9. Протестировать Core Web Vitals после загрузки реального контента.
