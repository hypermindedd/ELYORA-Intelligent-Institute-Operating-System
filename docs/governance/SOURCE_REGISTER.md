# EI-OS | Source register

این فهرست منشأ، اعتبار و وضعیت دسترسی را از هم جدا می‌کند. ارجاع به یک منبع به‌معنای تصویب یا پیاده‌سازی محتوای آن نیست.

## منابع قوانین، تصمیم‌ها و اجرا

| ID | منبع و مسیر ردیابی | اعتبار و وضعیت |
| --- | --- | --- |
| G01 | 02T Work project mirror، `sources/instrunction.txt` → [MASTER_PROJECT_INSTRUCTION.md](MASTER_PROJECT_INSTRUCTION.md) | متن رسمی، ثبت بایت‌به‌بایت. بخش‌های ۰ تا ۵۲. وضعیت BUILD در متن گزارش تاریخی منبع است. |
| G02 | شش فایل `sources/text*.txt` در mirror همین پروژه | قطعات متنی مرتبط با سند مادر. نسخه‌های کمکی در Work، با اثر انگشت پایین. |
| G03 | گفت‌وگوی [بازنویسی قوانین پروژه](chatgpt-conversation://6aefaa24-5728-83eb-b749-55b8e0483ab0)، پیام `5f64376c-56b6-4919-94df-9b99fa8f13fa` | ممیزی ۱۹۳ بندی به‌عنوان منبع مشتق معرفی شده است. متن پاسخ و انتساب گروهی در گفت‌وگو وجود دارد؛ فایل کامل شماره‌گذاری‌شدهٔ مستقل در mirror در دسترس نبود. **SOURCE UNAVAILABLE** برای آن فایل. |
| G04 | پیوست مالک در Work، `Pasted text.txt`، شناسهٔ `98212f32-2433-49fa-b696-517e485fc405`، SHA-256 `297dced085e40604b303f3d710c5819b52ef765029eeb3e72faca0e882fd4a11` | Master Execution Prompt. دستور اجرایی و الزامات برای بررسی. موارد تازه‌ای که قرارداد/ADR می‌خواهند وضعیت پیشنهادی دارند. |
| G05 | [ADR-EI-001](../adr/ADR-EI-001.md)، [002](../adr/ADR-EI-002.md)، [003](../adr/ADR-EI-003.md)، [004](../adr/ADR-EI-004.md)، [005](../adr/ADR-EI-005.md)، [006](../adr/ADR-EI-006.md) | پیشنهادی و منتظر تأیید. به‌ترتیب ساختار ماژولار، scope، صلاحیت مدرس، اتاق‌ها، تفکیک حریم خصوصی و adapter. ADR-EI-007 در [PR باز #14](https://github.com/hypermindedd/ELYORA-Intelligent-Institute-Operating-System/pull/14) است. |
| G06 | [As-is audit](../architecture/AS_IS_AUDIT.md)، [رجیستری](../architecture/ENGINE_REGISTRY.md)، [وضعیت انتشار](../releases/STATUS.md) | کد و آزمون‌ها در SHAهای ذکرشده. BUILD-23/24 تاریخی، قرارداد متصل Core و شواهد محیط متصل همچنان تأییدنشده. |
| G07 | تاریخچهٔ کامل همهٔ چت‌ها و منشأ ریز هر بند ۱۹۳گانه | **SOURCE UNAVAILABLE** برای موارد خارج از mirror و گفت‌وگوی مستندشده. پوشش کامل ادعا نمی‌شود. |
| A | ارسال ۱۵ تصویر اولیه در گفت‌وگوی G03 و ارسال مجدد در Work | مرجع راهبردی و بصری تاریخی. فایل‌ها در Work تطبیق داده شدند. |
| B | ارسال ۲۰ پوستر شماره‌دار ELYORA Strategic Proposal در ادامهٔ همان چت Work | مرجع راهبردی و بصری. فایل‌ها در Work تطبیق داده شدند. |

## اثر انگشت منابع متنی موجود در mirror

| فایل | SHA-256 |
| --- | --- |
| `sources/instrunction.txt` | `e9e1e72b394122732a02965b62789453cf6f70340f960fb4127373b4d95cd488` |
| `sources/text 2.txt` | `b040f1bafe24b102c9e44f92dbca619c4fb9c04eecabdbe61394bf9a70547d80` |
| `sources/text 3.txt` | `1d5cf7ff2d2e77b0bf7bf70281137971e068cbcedc6b460bf58eefb554f5b941` |
| `sources/text 4.txt` | `659d6580a0b3b2170f4fdba8b0abdb0995e1a4cee4dfd1255dc7843ac5c6b712` |
| `sources/text 5.txt` | `fad25b8525943cfc80449037a1e26c7555cc4f76720ab56ba8360d51cc188085` |
| `sources/text 6.txt` | `3446ac1b0670c64bb1524070d180a4906bccdb0aa67ad3372c87825a8ba25e59` |
| `sources/text.txt` | `ab62a4a89bba3c26dd31f24a7621f109fbd0e2063d864a3183006a6f910009d7` |

## فهرست ۳۵ تصویر

همهٔ ردیف‌ها پس از بازبینی بصری و تطبیق SHA-256 ثبت شده‌اند. مسیر فایل‌ها نسبت به ریشهٔ فضای Work همین پروژه، `ELYORA — Initial Strategic Proposal & Visual Reference/originals/<نام اصلی>` است. فایل‌های JPEG در این تحویل شش‌فایلی در Work باقی مانده‌اند. پیش‌شمارهٔ A یا B مجموعهٔ منبع را مشخص می‌کند. شمارهٔ چاپی خالی با «—» ثبت شده است.

| شناسه | شمارهٔ چاپی | عنوان یا موضوع | نام اصلی | SHA-256 |
| --- | --- | --- | --- | --- |
| A01 | — | جلد پروپوزال راهبردی همکاری | `photo_1405-08-17 02.33.08.jpeg` | `c6f3a37b363dc007bd520d50ebdb33778ba8b5700471a616ddf1beb6ba95b797` |
| A02 | 1/9 | چشم‌انداز و جمع‌بندی اجرایی | `photo_1405-08-17 02.33.05.jpeg` | `41cb3a7c0131cf2880d0a61973b404f6f35282ad2c0cab2ac6285bfdb42f5414` |
| A03 | — | استاد در مرکز | `photo_1405-08-17 02.33.03.jpeg` | `e1930e31352dc94622907ff0149968f4c247fc80a4605024453d4cd42d30a739` |
| A04 | 3/9 | رابط صوتی برای استاد | `photo_1405-08-17 02.33.00.jpeg` | `89670d96e3f5740a443d78a2337743629a7c623b4b524fcc9768bea6e5ac3356` |
| A05 | 4/9 | تداوم یادگیری دانشجو در کلاس و خانه | `photo_1405-08-17 02.32.57.jpeg` | `3f70e99e8051d446bf9ce79e646f43378f1bcec3cb2f9275b09d4cb2f87aca36` |
| A06 | 5/9 | مدیریت مؤسسه با دید کامل و حفظ حریم خصوصی | `photo_1405-08-17 02.32.55.jpeg` | `7b52217d972e2ad050901182558a914136e0afce83cd7b08c80a9254bc3864a7` |
| A07 | 6/9 | مقایسهٔ مؤسسه بدون و مجهز به ELYORA | `photo_1405-08-17 02.32.52.jpeg` | `e9497e4519dfabf4c35b2ae21bb2c5ca188d07e9469939819a70cb716839f195` |
| A08 | 7/9 | افزایش درآمد، ماندگاری و جذب خانواده‌ها | `photo_1405-08-17 02.32.50.jpeg` | `4f35dca4b2085d302f59f073883dbf10f35f3b9ac8ac66821a28efe30599c7de` |
| A09 | 8/9 | مدل همکاری و قرارداد پیشنهادی | `photo_1405-08-17 02.32.48.jpeg` | `95d6c6835923ba4d250017d3ab784b17eca7ecd6322cc7c5a096879199890665` |
| A10 | 9/9 | نقشهٔ اجرا، طرح‌ها و مزیت اولین بودن | `photo_1405-08-17 02.32.46.jpeg` | `13f687c4d17f775e91d88b276d5c888c363feea804467a96ec31c8b966f5a1a6` |
| A11 | 10/13 | توانمندسازی استاد تا سطح نیتیو | `photo_1405-08-17 02.32.43.jpeg` | `4db759d4ea1eaec493a8040b9bbc2cb22f1f4be7d6172e9c1336cff5d08456d9` |
| A12 | 11/13 | گزارش هوشمند دانشجو برای استاد | `photo_1405-08-17 02.32.41.jpeg` | `e06528d7a70d7a025a6e39b1dedef6d7c1281d005c71b5ed41aef4d940d56cd8` |
| A13 | 12/13 | گزارش رشد استاد برای مؤسسه | `photo_1405-08-17 02.32.39.jpeg` | `c63ba6c4161e5744fba88e26f323c3bc13fba5921c765b9c25905199fd0647a7` |
| A14 | 13/13 | مقایسه، پیشرفت و مسیر رشد استادان | `photo_1405-08-17 02.32.36.jpeg` | `c115f5610c54c2cb0def8cddf493bf621265744d9a67dc02fad1b86879186b30` |
| A15 | — | چارت ارتباطی و سازمانی اکوسیستم ELYORA | `photo_1405-08-17 02.32.34.jpeg` | `e35dcbf2eaf765e770a2cc040fecfd7f80a8b1ffd6de015ae92fd9c31c55ac17` |
| B01 | 01/20 | الیورا، فراتر از یک پلتفرم آموزشی | `photo_1405-08-17 02.32.26.jpeg` | `a5a769d063a085cafb9b214606788c83efb3e23df9ae3d00916669babdc313bf` |
| B02 | 02/20 | مقایسهٔ اجرایی پلتفرم متداول و ELYORA | `photo_1405-08-17 02.32.23.jpeg` | `d5437701d3e06d351afc2c51f50154c02366a4813e936a8868d648841a83fdc5` |
| B03 | 03/20 | از پلتفرم آموزشی تا اکوسیستم رشد | `photo_1405-08-17 02.32.20.jpeg` | `701b6c67167f60bb3bec67403ae804c28c1ac5bffdfff8f2ef04869f35a4ca88` |
| B04 | 04/20 | رشد واقعی دانشجو با ELYORA | `photo_1405-08-17 02.32.11.jpeg` | `7708e444395defbc96e8c9e4b6cddc59f59369e6a5f5eda6a68e27e5baca124c` |
| B05 | 05/20 | Teacher Leader و نقش استاد در هدایت یادگیری | `photo_1405-08-17 02.32.17.jpeg` | `9d6a7ab32b7991bc4b42be3be901b5afa79ce599e66a03db98f0324b739d4275` |
| B06 | 06/20 | هوش رشد مدرس، از ارزیابی تا کوچینگ و ارتقا | `photo_1405-08-17 02.32.14.jpeg` | `4a07af5ee9247a06a93bbbbea738a55cddf95de41ef6b7896c7f4e6d49b94fab` |
| B07 | 07/20 | هوش مدیریتی مؤسسه، گزارشات و آنالیزهای عمیق | `photo_1405-08-17 02.32.08.jpeg` | `bee41dd2290e46b7a19bc9bf32966fa4d424a2be6286ff6802e5d00bfe3a4975` |
| B08 | 08/20 | Retention Operating System | `photo_1405-08-17 02.31.42.jpeg` | `de1fae1da9c84ee5ff1c62b45383e75c431a97e964918d25af43be5f10223114` |
| B09 | 09/20 | ELYORA Value Network | `photo_1405-08-17 02.32.00.jpeg` | `9025f1529ec2324ab18befcdc5ff3f786fc8739faa66acdf93149206f0cb9ed6` |
| B10 | 10/20 | سه پلن ELYORA برای سه سطح رشد مؤسسه | `photo_1405-08-17 02.32.05.jpeg` | `db27999dc7425c3c50f2faac11e4d850e781fdc23f2dc318e2016e12fbe39947` |
| B11 | 11/20 | امنیت، حریم خصوصی و حاکمیت داده | `photo_1405-08-17 02.32.02.jpeg` | `67943381c6aba022cd3d911af59bcd99e34b8c9337709a15ab48c5e495e496fb` |
| B12 | 12/20 | حریم خصوصی مدرس و معماری اعتماد | `photo_1405-08-17 02.31.57.jpeg` | `3c54d4c50bcf02bed2880931c5c4254ec945b94e16269b6be830e191bee47860` |
| B13 | 13/20 | Teacher-led Learning Scope | `photo_1405-08-17 02.31.45.jpeg` | `b9ef1258fdca6eede35e2f71415eed95ac35579a3ab15fe9a24331cc8524c199` |
| B14 | 14/20 | Teacher Assessment | `photo_1405-08-17 02.31.54.jpeg` | `00ebf9b114099b5ae932eb3d03c6ffa2a49c2c87976fa115360b0b300ecf3cfb` |
| B15 | 15/20 | Institute Control Plane | `photo_1405-08-17 02.31.51.jpeg` | `7d8d1d061e224f0fb163aaabe63cb5a4b2350c938031b0301174ca8b5861cf09` |
| B16 | 16/20 | یکپارچگی سه محصول و Shared Governed Runtime | `photo_1405-08-17 02.31.39.jpeg` | `48c936dcb1ff2b6277519d3ecf51d23a62fb6d6011de06a4fa45c09a840dbf4d` |
| B17 | 17/20 | Business Intelligence و پیوند کیفیت با رشد اقتصادی | `photo_1405-08-17 02.31.48.jpeg` | `78f941b8007b3abf27b4ac51fb39de0488461da203a45cbd2b9ff7809d22bea7` |
| B18 | 18/20 | Active Institute Advisor | `photo_1405-08-17 02.31.36.jpeg` | `36f0eb661e8f1b56a2b92b1ffcaab28d97f1eaf124204fdf4951691cc6768cf3` |
| B19 | 19/20 | دو مسیر استقرار، جایگزینی کامل یا اتصال | `photo_1405-08-17 02.31.29.jpeg` | `6a9266b153e7b8951981ccfeba6f55b01b0760785a31e12f54d9420e2214b0a1` |
| B20 | 20/20 | جمع‌بندی ELYORA برای ساخت مؤسسهٔ آینده | `photo_1405-08-17 02.31.33.jpeg` | `9398abf67ec3fee841c3b2382b957c3fcb2d3df7db4694b83c85a8fe0939910d` |

[چکیدهٔ راهبردی](../strategy/STRATEGIC_PROPOSAL.md) · [نگاشت مرجع حقیقت](../architecture/SOURCE_OF_TRUTH_MAP.md)
