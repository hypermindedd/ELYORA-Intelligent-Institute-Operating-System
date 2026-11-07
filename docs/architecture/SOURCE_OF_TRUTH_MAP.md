# EI-OS | Source-of-truth map

این نگاشت از سند مادر و رجیستری موجود استخراج شده است. ستون مرجع یا نویسنده، مالکیت دامنه را مشخص می‌کند. وضعیت اجرایی هر ردیف در [As-is audit](AS_IS_AUDIT.md) و [Engine registry](ENGINE_REGISTRY.md) ثبت شده است. موارد پیشنهادی باید از مسیر ADR تصویب شوند.

| دامنه | مرجع و نویسندهٔ معتبر | خواننده و مرز قرارداد | مبنای مالکیت |
| --- | --- | --- | --- |
| Learning، Assessment، Mastery، Progression، Adaptive Learning و Protected Educational State | ELYORA Core خارج از EI-OS. تغییر فقط از مسیر قرارداد رسمی ELYORA | نمای محدود Teacher، Student یا Institute از مسیر adapter. EI-OS مالک یا نویسندهٔ وضعیت آموزشی نمی‌شود. | سند مادر §§۱، ۴.۱، ۵، ۱۸ |
| Tenant، Organization، Membership، Enrollment، Assignment، Class، Session، Attendance | Institute. تغییر از مسیر فرمان مجاز سرور و دامنهٔ مالک | BFF/نمای همان tenant، workspace و resource. حضور در اتاق یا check-in منبع Attendance نیست. | §§۴.۲، ۷–۱۰، ۱۷؛ [مالکیت دامنه](DOMAIN_OWNERSHIP.md) |
| Branch، Program و Delegation | Institute. مدل و lifecycle جزئیات در Control Plane نیازمند قرارداد و تصویب‌اند | دسترسی محدود به actor، tenant، role، resource و Scope. delegation مجوز عمومی ایجاد نمی‌کند. | §۴.۲ و [منبع اجرا و پوستر ۱۵/۲۰](../governance/SOURCE_REGISTER.md) |
| Scope و Focus آموزشی | استاد مسئول تصمیم آموزشی است. Institute سمت سرور assignment، authorization، زمان و اعتبار directive را کنترل و ثبت می‌کند. ELYORA در محدودهٔ مجاز اجرا می‌کند. | دانشجو نمای مجاز خودش را مصرف می‌کند. مرورگر یا Student قادر به افزایش scope نیست. | §§۶–۸؛ [ADR-EI-002 پیشنهادی](../adr/ADR-EI-002.md) |
| Planning، Teaching Adaptation، Reflection، Coaching Context | Teacher Leader و فضای خصوصی مدرس | دسترسی مدرس، یا فیلد مشتق مشخص تحت قرارداد مجاز. یادداشت، صدای خام و Coaching خصوصی برای مدیریت عمومی ارسال نمی‌شوند. | §§۴.۳، ۱۴–۱۶؛ [ADR-EI-005 پیشنهادی](../adr/ADR-EI-005.md) |
| Student Experience و نماهای شخصی | Guided Student صاحب تجربه و projection خودش است. حقیقت آموزشی در Core می‌ماند. | فقط دانشجو و مصرف‌کنندگان صریحاً مجاز. `Done` منبع Mastery نیست. | §§۲.۲، ۴.۴، ۱۶–۱۷ |
| Health، Risk، Trend، Recommendation و Outcome Measurement | Intelligence Layer برای دادهٔ مشتق؛ نویسندهٔ هر نتیجهٔ مشتق طبق قرارداد دامنه | نماهای نقش‌محور. Risk از Learning State جداست؛ مشاهده به‌تنهایی Mastery یا Teacher Capability را تغییر نمی‌دهد. | §§۴.۵، ۱۷، ۲۱–۲۹ |
| Intervention Lifecycle | Institute مالک تخصیص، اقدام و lifecycle است. Intelligence پیشنهاد و اندازه‌گیری مشتق تولید می‌کند. | مسئول مجاز، audit اقدام و نتیجهٔ اندازه‌گیری در رکوردهای متمایز. | §§۴.۲، ۲۷–۲۹ |
| Identity و Authorization | Clerk طبق سند مادر مرجع هویت/Authentication است. Institute سمت سرور مرجع مجوز tenant/workspace/resource/scope است. | هر ورود، Deep Link و reconnect مجوز فعلی را دوباره بررسی می‌کند. browser، notification و realtime اختیار ایجاد نمی‌کنند. | §§۷–۱۳ |
| Event، Projection و Realtime | رکورد معتبر در اختیار دامنهٔ مالک است؛ رویداد پایدار، سابقهٔ مجاز همان دامنه است. Projection بازساختنی و Realtime برای همگام‌سازی/ابطال نماست. | دادهٔ کمینه، cursor پایدار و validation سمت سرور. مسیر reconnect حق دسترسی تازه نمی‌دهد. | §§۱۱–۱۴، ۳۰–۳۳ |
| Teacher Qualification حرفه‌ای | مالکیت پیشنهادی Institute برای eligibility و رأی انسانی؛ مرز رسمی با Assessment آموزشی Core باز است. | reviewer مستقل، consent و حداقل شواهد. فضای محرمانه و نمای مدیریتی از هم جدا می‌مانند. | [ADR-EI-003 پیشنهادی](../adr/ADR-EI-003.md) |
| خانواده، رسانه و Value Network | مالک و قرارداد برای دسترسی خانواده، نگهداری رسانه و جریان‌های مالی نیازمند تصمیم ثبت‌شده‌اند. | هیچ entitlement یا مجوز مالی/خانواده از پوسترها استخراج نمی‌شود. | [پروپوزال و مسائل باز](../strategy/STRATEGIC_PROPOSAL.md) |

برای هر تغییر، یک نویسندهٔ معتبر، contract و نسخه، tenant و resource، مجوز فرمان، طبقهٔ حریم خصوصی، رویداد و projection مجاز، و شاهد regression را در ADR یا قرارداد ثبت کنید. [سند مادر، §§۴۱ و ۴۵](../governance/MASTER_PROJECT_INSTRUCTION.md)
