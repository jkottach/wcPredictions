# Database seed scripts

## Single source of truth

Fixture data is available in two forms:

- **`../../wc26.teams.json`** + **`../../wc26.matches.json`** — MongoDB export at repo root (recommended for new deployments; use `deploy/seed-from-export.sh`)
- **`data/worldCup2026.seed.json`** — simplified JSON used by `npm run seed`
- **`data/worldCup2026Seed.ts`** — types and loader/validation for the bundled seed

## Commands

| Command | Purpose |
|---------|---------|
| `npm run seed` | Wipe `teams` + `matches`, reload from `data/worldCup2026.seed.json` |
| `npm run seed:export` | Export current MongoDB `teams` + `matches` back into the JSON file |
| `../../deploy/seed-from-export.sh` | Import root `wc26.*.json` exports via `mongoimport` |

## Collections

| Collection | Contents |
|------------|----------|
| `teams` | Nation metadata (`teamId`, name, flag) — **canonical** |
| `matches` | Fixtures with `team1` / `team2` IDs only (no duplicated `team1Info`) |
| `users` | Not touched by seed |

The API enriches matches with names/flags from `teams` when serving responses.

## Updating data

1. Edit fixtures in MongoDB (or update the JSON by hand).
2. Run `npm run seed:export` to refresh `worldCup2026.seed.json`.
3. Commit the JSON, then `npm run seed` on other environments.
