# Notes for future WordPress integration

This static version is prepared so it can be transferred to WordPress after layout approval.

## Shared template parts

Recommended structure:

```text
template-parts/
  header/site-header.php
  navigation/mega-menu.php
  navigation/mobile-menu.php
  footer/site-footer.php
  forms/lead-modal.php
  components/service-card.php
  components/video-card.php
  components/review-card.php
  sections/cta-project.php
  sections/steps.php
  sections/trust.php
```

## Lead modal / Contact Form 7

All buttons that open the lead form use one contextual modal and pass context through `data-*` attributes.

Important attributes:

```html
<button
  data-modal="Получить смету"
  data-lead-action="estimate"
  data-lead-title="Получить предварительную смету"
  data-lead-desc="..."
  data-lead-source="Первый экран: Главная"
  data-lead-service="Механизированная штукатурка"
  data-lead-submit="Получить смету">
  Получить смету
</button>
```

Only two hidden fields are used and should be transferred to CF7:

```text
[hidden lead_source]
[hidden lead_page_url]
```

`lead_source` contains a short readable source such as `Получить смету`, `Офисы`, `Магазины` or `Кейс: Производственный объект 1 250 м²`. `lead_page_url` contains the page URL.

Recommended CF7 fields:

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

## CTA logic

- `Получить смету` opens the contextual lead modal and records `lead_source=Получить смету`.
- Buttons such as `Офисы`, `Магазины` and case cards record their own short `lead_source`.
- `Обсудить объект` opens the same modal with the source of the clicked block.
- `Позвонить` is a direct `tel:` link and does not open a modal.

This keeps the UI clean and makes lead sources readable in Flamingo/CRM.
