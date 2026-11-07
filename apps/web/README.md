# ELYORA Institute — responsive offline campus preview

## Run
`npm run check` and `npm run web`; visit http://127.0.0.1:4173.
Dependencies: Node 22+. The preview does not need an npm install or cloud credentials. Use `npm run build:campus` to generate the static preview in `dist/`. To publish under an existing website, use `npm run build:campus -- <path>/campus` and serve it at `/campus/`.

## Visible flows
- Campus overview with four warm, original SVG room scenes.
- Teacher, student, live classroom and institute command space concepts, with shared identity and distinctive visual composition.
- Eleven provisional target-language programs. The filter changes the visible catalog cards.
- Nine interface locales, independent of the target-language filter. Persian and Arabic use right-to-left layouts. Persian is the default. Switching locale keeps the selected space and target-language filter.
- Actions that need live services announce that they are unavailable rather than fabricating operations.

## Preview security and limitations
The local server explicitly allows only known static assets, GET health and sanitized public catalog projection. The runtime uses a strict CSP in the local server. The only persisted setting is the selected UI locale in this browser. There are no user credentials, operational roles or live external requests. This is a clickable **visual preview only**. Real backend auth, durable lessons, virtual classrooms, voice and provider integration require A3–A5 and connected test evidence.

## Localization ownership
The locale metadata and target-language catalog live in `packages/language-catalog/catalog.v1.json`. UI messages live in `apps/web/messages/`. Tests require a complete message set for each locale. The offline server and static build consume the same asset manifest and public catalog projection. The four source room illustrations are preserved.


## Local fonts

The Arabic-script Vazirmatn subset comes from `@fontsource-variable/vazirmatn@5.3.0`. Elyora Campus CJK is a renamed WOFF2 subset of [Noto Sans CJK KR Variable](https://github.com/notofonts/noto-cjk/blob/main/Sans/Variable/TTF/NotoSansCJKkr-VF.ttf), Git blob `cb979706f19a35963d69ebe76686de756b17d05d`. It covers the Korean interface and the Simplified Chinese and Japanese catalog autonyms. Check glyph coverage when editing Korean copy or adding catalog autonyms. Both font licenses are in `assets/fonts/`.
