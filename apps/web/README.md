# ELYORA Institute — responsive offline campus preview

## Run
`npm run check` and `npm run web`; visit http://127.0.0.1:4173.
Dependencies: Node 22+; no third-party npm packages or cloud credentials for this preview.

## Visible flows
- Campus overview with four warm, original SVG room scenes.
- Teacher, student, live classroom and institute command space concepts, with shared identity and distinctive visual composition.
- Language catalog of eight provisional foreign-language programs; select a language to filter, never interpreted as granting educational access.
- Persian RTL/English LTR UI switch, independently of target-language choice.
- Actions that need live services announce that they are unavailable rather than fabricating operations.

## Preview security and limitations
The local server explicitly allows only known static assets, GET health and sanitized public catalog projection. The runtime uses strict CSP, no persistence, no user credentials, no roles, and no live external requests. This is a clickable **visual preview only**. Real backend auth, durable lessons, virtual classrooms, voice and provider integration require A3–A5 and connected test evidence.
