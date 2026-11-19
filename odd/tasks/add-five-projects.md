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
- [ ] T3 Sort screenshots from Pictures/Screenshots per project, convert to webp, wire `slides` and `image` — route: TBD (next phase, user-driven)

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

## Next step
T3: sort the 73 screenshots in Pictures/Screenshots by project.
