# Add five projects to the portfolio

## Objective
Add five new projects (two animated landing prototypes and three redesigned Luntriqa insurance modules) to the projects section, with description, tech stack and screenshots.

## Problem / Why
The portfolio does not show the owner's 2026 work: the Sony and Qorsu landings and the Luntriqa redesigns of the sales, broker and customer insurance modules.

## Scope
- `src/features/projects/data.ts` (project entries)
- `public/locales/{es,en,zh}/translation.json` (name and description keys)
- `public/projects/<slug>/` (webp screenshots, next phase)

## Constraints
- Descriptions are one or two clauses in Spanish with no trailing "<Company>, <Year>." (user removed that pattern from every project on 2026-11-19).
- en/zh translations are written by hand; proper nouns stay untranslated.
- "HeroUI" is used for NextUI for consistency with the rest of the portfolio.
- Screenshots are converted to webp (quality 80); mobile shots use `isContain: true`.

## Approved content
| Name | Repo | Company/Year |
|---|---|---|
| Luntriqa Ventas | Ecuasuiza/wl-sales-sinester-front | Luntriqa, 2026 |
| Luntriqa Broker | Shepwashi/ecuasuizabrokerdashboard | Luntriqa, 2026 |
| Luntriqa Seguros | Ecuasuiza/insurtech-front-sales-react | Luntriqa, 2026 |
| Qorsu | Qorsu/qorsu-landing | Shepwashi, 2026 |
| Sony WH-1000XM6 | Projects/sony-landing | Personal prototype, 2026 |

## Tasks
- [x] T0 Commit pending Labreicis gallery before starting — route: inline — commit e976165
- [x] T1 Add the five entries (name, description, technologies) to data.ts after Labreicis — route: inline (single mechanical file) — commit f81ea3f
- [x] T2 Add name and description keys to es/en/zh locales — route: inline (mechanical JSON) — commit f81ea3f
- [x] T2b Copy refresh requested by the user: rewrite Luntriqa Ventas/Broker openings, expand TodoDomi/TodoServy/Ecuasuiza Ventas from their screenshots, drop "<Company>, <Year>." from all 15 descriptions in es/en/zh — route: inline (scripted key rename, dry-run reviewed) — commit 8b8427f
- [x] T2c Expand Banco Bolivariano description (was too short after the suffix removal), based on its screenshots — route: inline — commit e9fc496
- [x] T2d Expand Shepwashi description from its screenshots — route: inline — commit 4f760f6
- [ ] T3 Sort screenshots from Pictures/Screenshots per project, convert to webp, wire `slides` and `image` — route: inline, one project at a time as the user assigns screenshot ranges
  - [x] T3a Sony WH-1000XM6: screenshots 2026-11-19 132501..133422 (18: 9 desktop, 9 mobile with isContain), cover img1 — commit e196935 — browser-checked on /projects/all (cover + 1/18)
  - [x] T3b Qorsu: screenshots 2026-11-19 131025..131913 (13: 7 desktop, 6 mobile with isContain), cover img1 — commit 0f4d47e — checked on /projects/all via DOM (cover loaded 1917x942, counter 1/13, all 13 files 200 image/webp)
  - [x] T3f Live links: Sony https://sony-landing-production.up.railway.app/ and Qorsu https://qorsu.com/ (both HTTP 200) — commit 55bbe3f
  - [x] T3c Luntriqa Ventas: screenshots 2026-11-19 125850..130754 with 130045 first (13: 8 desktop, 5 mobile with isContain), cover img1, link https://wlfloorsale.shepwashi.com/ (HTTP 200) — commit 33f27ee — checked on /projects/all via DOM (cover loaded, counter 1/13, link present, 13 files 200 image/webp)
  - [ ] T3d Luntriqa Broker
  - [ ] T3e Luntriqa Seguros

## Acceptance criteria
- Five entries render in the projects slider with translated descriptions in es/en/zh.
- `tsc -b` passes.
- After T3, every entry has a cover image and slides.

## Checks
- TDD: off (source: package.json has no test runner). Functional check: `npx tsc -b`.
- RDD: off (global), no native review.

## Progress
- Content approved by the user on 2026-11-19 (name of project 5 chosen: "Luntriqa Seguros").
- Known gap until T3: the five entries have no image, so their cards render without a picture.
- T1+T2 verified: `npx tsc -b` exit 0; each locale gained exactly 10 keys (5 names, 5 descriptions), no other lines changed. Not checked in the browser yet.
- RDD off: no review assessment run.
- T2b verified: dry run printed all 15 es/en/zh results; 15 lines changed per file; no "<Company>, <Year>." left; `npx tsc -b` exit 0. Eranpay/Distripharmacias no longer show "Proyecto freelance".

- Language switch checked in the browser (dev server, /projects): descriptions switch es -> en correctly; the user's report was a stale locale file in their browser, no code change needed.
- Note: the home slider renders only projectData.slice(0, 5); with the new order it shows Labreicis, Luntriqa Ventas/Broker/Seguros and Qorsu. Sony and the rest appear under "Ver más proyectos".

## Next step
T3d–T3e: wait for the user to assign screenshot ranges for Luntriqa Broker and Luntriqa Seguros (29 screenshots left, 2026-11-19 122147..125524).
