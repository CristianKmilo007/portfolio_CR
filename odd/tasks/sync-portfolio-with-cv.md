# Sync portfolio with updated CV

## Objective
Bring the portfolio in line with the updated CV (Oct 2026) so recruiters see the same story in both.

## Problem
The portfolio predates the new CV: Luntriqa is missing, Shepwashi/Eranpay roles and dates disagree, Labreicis is attributed to Shepwashi, skills lack Redis/Prisma/AWS/CI, the hero has no DevOps word, the company counter says 3, and the bundled CV PDFs are old. The English and Chinese locales also mistranslate company names (e.g. "Shepwashi" -> "Shoe wash").

## Scope
- Experience timeline (`src/features/experience/hooks/useExperience.tsx`)
- Hero words, about text and counters (`src/features/home/Home.tsx`, `src/features/home/hooks/useHome.ts`)
- Skills list and backend services copy (`src/features/skills/hooks/useSkills.tsx`)
- Labreicis project description (`src/features/projects/data.ts`)
- Locales es/en/zh (`public/locales/*/translation.json`)
- CV PDFs (`public/CV_Cristian_Rojas.pdf`, `public/CV_Cristian_Rojas_EN.pdf`)

Personal projects appear only as timeline cards; project gallery cards wait until screenshots and public links exist.

## Constraints
- CV is the source of truth.
- Translations written by hand (the google-translate script mistranslates proper nouns).
- Stay on the current branch (user choice). No commit or push without user approval.
- TDD: off (no test runner configured). Checks: `npm run build`, `npm run lint`, visual check in browser.

## Tasks
- [x] T1 Update experience timeline: add Luntriqa, fix Shepwashi/Eranpay/Freelance roles, dates and bullets — route: delegated writer (2+ non-trivial files)
- [x] T2 Update hero words (add Backend, DevOps), about text and companies counter — route: delegated writer
- [x] T3 Add Redis, Prisma, AWS, GitHub Actions, Vitest to skills; refresh backend services copy — route: delegated writer
- [x] T4 Fix Labreicis description and mistranslated proper nouns in en/zh — route: delegated writer
- [x] T5 Replace CV PDFs with the updated versions — route: inline
- [x] T6 Verify build, lint and pages in the browser — route: inline
- [x] T7 Add Rapidex, Mercadex and OpenSeat as "project" cards in the experience timeline (no images or links, user request) — route: inline (mechanical, already understood)

## Acceptance criteria
- Every role, date and bullet in the timeline matches the CV.
- No changed Spanish key is missing from en or zh.
- Build and lint pass (or pre-existing failures are documented).
- Experience, home and skills pages render without overlapping cards.

## Progress
- Exploration done. Feature document created.
- T1-T4 done by one delegated writer. Evidence: `npm run build` passes before and after (vite 7, ~33-38 s); `npm run lint` fails before and after with a pre-existing config error (`TypeError: Nested 'extends' is not allowed` in eslint.config.js), so it is not a usable check; locale script confirms all 82 `t("...")` literals and data.ts descriptions exist in es/en/zh (0 missing); es/en/zh proper nouns fixed (Shepwashi, Eranpay, Labreicis, TodoServy, TodoDomi, Distripharmacias del Llano, Banco Bolivariano). 14 keys removed, 18 added per locale.
- Open risk: the longer about paragraph measured 337 px tall at 360x667 (about 270 px after the 0.8 scale), overlapping the first counter card by roughly 37 px on 667 px-tall phones; fine at 812 px. Backend services list grew to 7 bullets and the backend skills grid to 17 items (scrollable grid, no fixed count). Needs visual check in T6.

- T5 done: public CV PDFs replaced with C:/Users/HOME/Documents/CRISTIAN/CV Cristian ES|EN.pdf (content checked, same as the CV reviewed).
- T6 done in browser (localhost:5173): home hero/about/counters render; the counter cards overlapping the about text at 800x600 also happens on the live site, so it is pre-existing animation behavior, not a regression. Experience: 9 cards, ~570 px apart, card height 325 px, no overlap; Luntriqa card checked visually. Skills at 1366x768: backend list shows AWS, GitHub Actions, Redis, Prisma, Vitest and 7 service bullets without overflow. en/zh proper nouns verified.
- T7 done: new `project` type with a code icon in TimelineCard; 12 events re-spaced and SVG_HEIGHT raised to 7500/10000 (mobile/desktop). `npm run build` passes. Browser: all 12 cards reveal at 1024 px and 375x812, min vertical gap 126 px on mobile, no overlap. 9 keys added to es/en/zh.

## Next step
User decides on commit. Project gallery cards for the personal projects wait until they are public.
