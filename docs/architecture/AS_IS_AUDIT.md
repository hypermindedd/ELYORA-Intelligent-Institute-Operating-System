# EI-OS | As-is audit

**تاریخ ثبت** ۸ نوامبر ۲۰۲۶. **دامنه** ریپازیتوری خصوصی [EI-OS](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System)، شاخهٔ پیش‌فرض `main` در [ac8401b](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/commit/ac8401b3c9ccab8e5cf0a52aea5ed00d4628f541). تاریخچه، شاخه‌ها، فهرست کامل فایل‌ها، فایل‌های منتخب و خروجی CI از GitHub خوانده شدند. این Snapshot از بررسی ایستای کد و شواهد ثبت‌شده استفاده می‌کند.

| وضعیت | معیار |
| --- | --- |
| IMPLEMENTED | کد مربوط به دامنهٔ مشخص در شاخه و SHA ذکرشده دیده شده است. |
| VERIFIED | شاهد اجرای واقعی آزمون برای همان دامنه و SHA ثبت شده است. هرجا محدود به offline یا browser preview است، همان دامنه ذکر می‌شود. |
| PLANNED | نیازمندی یا طرح قابل ردیابی است و برای اجرای عملیاتی آن شاهد در این Snapshot دیده نشده است. |
| BLOCKED / NEEDS REVIEW | پیش‌نیاز، مرجع یا شاهد مشخص غایب است. وضعیت اتصال و استقرار جداگانه گزارش می‌شود. |

## وضعیت کد

| حوزه | وضعیت و شاهد | مرز یا کار باز |
| --- | --- | --- |
| پشته و بسته‌بندی | IMPLEMENTED. `package.json` شامل npm، JavaScript ESM، Node.js 22+ و آزمون داخلی Node است. سرور HTTP پیش‌نمایش در `apps/web/server.mjs` و فرانت در `apps/web/{index.html,app.mjs,styles.css}`. | سرور فعلی پیش‌نمایش GET-only است. سرویس عملیاتی احراز هویت یا BFF چندمستأجری در این سرور وجود ندارد. |
| سه محصول | IMPLEMENTED در سطح پیش‌نمایش چهار فضا و ماژول‌های دامنهٔ آفلاین. پوشه‌های سه محصول زیر `apps/` در Snapshot شاخهٔ اصلی README دارند. | فرایند عملیاتی متصل هر سه محصول PLANNED است. PR ماژولار به‌صورت جداگانه بررسی شود. |
| هویت و مجوز | IMPLEMENTED در سطح توابع خالص `src/domain/policy.mjs` برای نقش، tenant، assignment و هویت دانشجو. HTTP preview هدرهای CSP و امنیتی دارد. | Clerk عملیاتی، اعتبارسنجی نشست سرور، عضویت پایدار و مدل کامل delegation در کد بررسی‌شده تأیید نشدند. [A3](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/4) |
| قرارداد و Storage | IMPLEMENTED در سطح ۶ فایل JSON Schema، بررسی ساختاری و توابع دامنه. در درخت شاخهٔ اصلی تعریف OpenAPI، مهاجرت DB، datastore یا outbox اجرایی دیده نشد. | قراردادهای Institute در وضعیت پیشنهادی‌اند. اعتبارسنجی نمونه‌ها، سازگاری نسخه‌ها و رخدادهای durable در A2/A3. [A2](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/3) |
| Scope و اتصال ELYORA | IMPLEMENTED در سطح scope/فعالیت آفلاین و adapter بسته. `src/adapters/elyora-port.mjs` خطای `BLOCKED_NOT_CONNECTED` تولید می‌کند. | قرارداد رسمی، محیط و شاهد سازگاری اتصال لازم‌اند. [A5](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/6) |
| مدرس و رسانه | IMPLEMENTED در سطح کنترل صلاحیت آفلاین با رضایت، شواهد، منع خودارزیابی، تصمیم انسانی و انقضا، و مدل اتاق در `src/domain/`. | Live Conversational Assessment، رسانه، سیاست نگهداری Voice/Transcript و پروندهٔ تولیدی PLANNED. [A6](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/7) |
| هوش و حریم خصوصی | IMPLEMENTED در سطح نمونهٔ پیشنهاد، تخصیص اقدام و اندازه‌گیری، projection محدود به خود دانشجو و تجمیع مدیریتی با سرکوب گروه کوچک. `src/domain/intelligence.mjs` و `src/domain/projections.mjs`. | چرخهٔ پایدار BUILD-24، شواهد، مسئول، رخدادها، مداخلات، Privacy audit و KPI عملیاتی PLANNED. [A7](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/8) |
| زبان‌ها | IMPLEMENTED در سطح ۹ زبان رابط و ۱۱ برنامهٔ آموزشی موقت در `apps/web/messages/` و `packages/language-catalog/catalog.v1.json`. | ۸ زبان عرضه، توان زبانی و رسانه‌ای و معیار آموزشی هر زبان NEEDS REVIEW. [I20](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/12) |
| BUILD-23 / BUILD-24 | BUILD-23 در [سند مادر](../governance/MASTER_PROJECT_INSTRUCTION.md) Baseline محافظت‌شده است و BUILD-24 در حال کار توصیف شده است. | کد، tag، artifact و regression قابل انتساب به Baseline رسمی در بررسی جاری تأیید نشد. وضعیت Baseline را با CI این ریپو یکی نکنید. [A0](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/1) |

## شواهد اجرای آزمون و استقرار

- **OFFLINE VERIFIED روی `main` در `ac8401b`.** لاگ job در [offline core 42389783765](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42389783765) نشان داد `npm run check` با ۴۴ آزمون موفق، صفر شکست، ۶ بررسی ساختاری schema و بررسی registry اجرا شد. `npm run demo` موفق بود و اتصال ELYORA طبق طراحی بسته ماند. بررسی ساختار schema معادل اعتبارسنجی کامل قرارداد نیست.
- **BROWSER PREVIEW VERIFIED روی شاخهٔ ویژگی در `5c28bed`.** [اجرای Chromium 42389595308](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42389595308) موفق بود و مرحلهٔ screenshot artifact اجرا شد. [PR ادغام‌شدهٔ #13](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/pull/13) این تغییر را به Snapshot اصلی پیوند می‌دهد. تأیید بصری انسانی جداست.
- **PQE advisory.** [اجرای 42389784317](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42389784317) موفق است، اما `fail-on: never` فعال بود و اسکن وابستگی Node، Semgrep، API و UI در لاگ SKIPPED بودند. امنیت متصل یا مجوز انتشار نتیجه‌گیری نمی‌شود.
- **شاخهٔ مستقل.** [PR باز #14](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/pull/14) در `62f677e` نخستین handoff آفلاین را پیشنهاد می‌کند. [CI آفلاین](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/actions/runs/42421266732) در شاخهٔ آن موفق بود. این شاخه وضعیت شاخهٔ اصلی را تغییر نمی‌دهد.
- **استقرار و حفاظت.** وضعیت connected staging، connected production و load test تأیید نشد. خواندن فهرست deployment از مسیر بررسی‌شده ممکن نبود. GitHub شاخه‌ها را با `protected: false` فهرست کرد و endpoint جزئیات حفاظت 403 داد. الزام پروژه برای محافظت از Baseline طبق سند مادر برقرار است.

## وابستگی و معیار سه گام بعدی

1. **A0/A1، تثبیت مرجع.** دریافت SHA و آزمون BUILD-23/24، مرجع دقیق قوانین و تعیین تکلیف ADR-EI-001 تا 006 و 007 پیشنهادی PR #14. پذیرش زمانی است که هر ادعا به شاهد ثابت متصل یا صریحاً باز علامت‌گذاری شود. [A0](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/1) · [A1](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/2)
2. **A2/A3، قرارداد و اجرای سمت سرور.** پس از تثبیت مالک‌ها، قراردادهای نسخه‌دار و اعتبارسنجی payload، context معتبر سرور، persistence و outbox با retry ایمن. پذیرش با آزمون‌های tenant و scope متقاطع، revoke، expiry، duplicate delivery، projection و reconnect. [A2](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/3) · [A3](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/4)
3. **A4/A5، مسیر متصل باریک.** پس از گام دوم و دریافت قرارداد رسمی ELYORA، اجرای فرمان مدرس تا نمای مجاز دانشجو و بازگشت شاهد آموزشی. پذیرش با آزمون staging مجاز، ثبت audit و بررسی privacy بدون تغییر مستقیم state آموزشی. [A4](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/5) · [A5](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/issues/6)
