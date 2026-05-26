/**
 * Export current `teams` + `matches` collections into the canonical seed JSON.
 * Run after updating fixtures in MongoDB: npm run seed:export
 */
import '../src/config/loadEnv';
import { writeFileSync } from 'fs';
import { join } from 'path';
import {
  connectMongo,
  getTeamsCollection,
  getMatchesCollection,
  disconnectMongo,
} from '../src/lib/mongodb';
import type { WorldCup2026SeedData } from './data/worldCup2026Seed';
import { buildMatchTag } from '../src/db/helpers';

/** Legacy IDs in old match docs → canonical teamId in `teams` collection. */
const TEAM_ID_ALIASES: Record<string, string> = {
  SAU: 'KSA',
};

function canonicalTeamId(teamId: string): string {
  return TEAM_ID_ALIASES[teamId] ?? teamId;
}

const OUT_PATH = join(__dirname, 'data', 'worldCup2026.seed.json');

async function main() {
  await connectMongo();
  const teamsCol = getTeamsCollection();
  const matchesCol = getMatchesCollection();

  const teams = await teamsCol.find({}).sort({ teamId: 1 }).toArray();
  const matches = await matchesCol.find({}).sort({ sequence: 1 }).toArray();

  const payload: WorldCup2026SeedData = {
    teams: teams.map((t) => ({
      teamId: t.teamId,
      teamName: t.teamName,
      country: t.country,
      countryLogo: t.countryLogo ?? null,
    })),
    matches: matches.map((m) => {
      const team1 = canonicalTeamId(m.team1);
      const team2 = canonicalTeamId(m.team2);
      return {
        sequence: m.sequence,
        team1,
        team2,
        round: m.round,
        group: m.group ?? null,
        matchTime: new Date(m.matchTime).toISOString(),
        predictionsEndingTime: new Date(m.predictionsEndingTime).toISOString(),
        status: m.status,
        matchTag: buildMatchTag(team1, team2),
      };
    }),
  };

  writeFileSync(OUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Exported ${payload.teams.length} teams, ${payload.matches.length} matches`);
  console.log(`→ ${OUT_PATH}`);
  console.log('Review the file, then run: npm run seed');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => disconnectMongo());
