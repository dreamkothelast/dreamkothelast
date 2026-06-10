# CLAUDE.md — monorepo `dreamkothelast`

Monorepo pnpm + turbo. Deux univers indépendants cohabitent :

- **`apps/civ2030`** — **Civilization 2030**, jeu 4X (2026→2050), projet actif.
  → **Lis `apps/civ2030/CLAUDE.md`** avant toute session sur le jeu : il
  contient les conventions, commandes, DoD et la roadmap des phases.
- `apps/web`, `apps/api`, `apps/mas-tablet`, `packages/*` — projet « parislivr »
  préexistant, sans rapport avec le jeu. Ne pas y toucher lors des sessions civ2030.

Commandes racine : `pnpm install`, puis `pnpm -F civ2030 dev|test|lint|typecheck|build`
pour cibler le jeu sans builder le reste.
