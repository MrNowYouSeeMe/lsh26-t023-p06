# Third-Party Material and AI Disclosure

List material frameworks, libraries, starters, templates, UI kits, fonts, icons and assets used in this repository.

| Name | Version or source URL | Licence | Used for |
|---|---|---|---|
| react | ^19.2.8 | MIT | Core UI component framework |
| react-dom | ^19.2.8 | MIT | React DOM renderer |
| vite | ^7.3.6 | MIT | Fast frontend build tool and dev server |
| @vitejs/plugin-react | ^5.2.0 | MIT | React Fast Refresh Vite plugin |
| typescript | ~6.0.2 | Apache-2.0 | Type checking and language support |
| oxlint | ^1.79.0 | MIT / Apache-2.0 | High-performance Rust-based linter |
| @types/react | ^19.2.18 | MIT | React TypeScript type definitions |
| @types/react-dom | ^19.2.4 | MIT | React DOM TypeScript type definitions |
| @types/node | ^24.13.3 | MIT | Node.js environment type definitions |
| Outfit Font | Google Fonts | SIL OFL 1.1 | Primary heading and display typography |
| Plus Jakarta Sans Font | Google Fonts | SIL OFL 1.1 | Body text and UI data typography |
| fixtures.json | LofiStack Hackathon 2026 | Event Material | Official P06 test fixtures |

## AI tools

List each AI tool in `evaluation-manifest.json`, what it was used for and how the output was verified. Write `None` if no AI tool was used.

- **Antigravity IDE (Gemini 2.5 Pro)**: Used for architecture review, boilerplate scaffolding, automated browser testing, oxlint linting remediation, calculation edge-case test generation, and responsive CSS styling. All outputs were verified via automated unit test execution (`node --test`), automated static linting (`oxlint`), build compilation (`tsc -b && vite build`), and live browser interaction testing.

## Original-work statement

Everything not declared in this file or `EVENT.md` was created by the registered team during the event window.
