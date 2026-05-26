/**
 * Seed MongoDB from a single canonical file: scripts/data/worldCup2026.seed.json
 *
 * - `teams` collection: nation metadata (names, flags)
 * - `matches` collection: fixtures with team1/team2 IDs only (no embedded team1Info/team2Info)
 *
 * Regenerate the JSON from your database: npm run seed:export
 */
import '../src/config/loadEnv';
import { ObjectId } from 'mongodb';
import {
  connectMongo,
  getTeamsCollection,
  getMatchesCollection,
  disconnectMongo,
} from '../src/lib/mongodb';
import type { MatchDocument, TeamDocument } from '../src/db/types';
import { loadWorldCup2026Seed, validateSeedData } from './data/worldCup2026Seed';

async function main() {
  const seed = loadWorldCup2026Seed();
  validateSeedData(seed);

  await connectMongo();
  const teamsCol = getTeamsCollection();
  const matchesCol = getMatchesCollection();
  const now = new Date();

  console.log('Clearing teams and matches (users collection is left unchanged)...');
  await teamsCol.deleteMany({});
  await matchesCol.deleteMany({});

  const teamDocs: TeamDocument[] = seed.teams.map((t) => ({
    _id: new ObjectId(),
    teamId: t.teamId,
    teamName: t.teamName,
    country: t.country,
    countryLogo: t.countryLogo,
    coach: null,
    foundedYear: null,
    createdAt: now,
    updatedAt: now,
  }));

  await teamsCol.insertMany(teamDocs);
  console.log(`Teams seeded: ${teamDocs.length} → collection "teams"`);

  const teamIds = new Set(teamDocs.map((t) => t.teamId));
  const matchDocs: MatchDocument[] = seed.matches.map((m) => {
    if (teamIds.has(m.team1) === false && /^[A-Z]{3}$/.test(m.team1) && !/^[0-9W]/.test(m.team1)) {
      throw new Error(`Unknown nation team1: ${m.team1} (sequence ${m.sequence})`);
    }
    if (teamIds.has(m.team2) === false && /^[A-Z]{3}$/.test(m.team2) && !/^[0-9W]/.test(m.team2)) {
      throw new Error(`Unknown nation team2: ${m.team2} (sequence ${m.sequence})`);
    }

    return {
      _id: new ObjectId(),
      sequence: m.sequence,
      team1: m.team1,
      team2: m.team2,
      team1Info: null,
      team2Info: null,
      team1Score: null,
      team2Score: null,
      matchTime: new Date(m.matchTime),
      predictionsEndingTime: new Date(m.predictionsEndingTime),
      round: m.round,
      group: m.group,
      matchTag: m.matchTag,
      comment: null,
      status: m.status,
      createdAt: now,
      updatedAt: now,
    };
  });

  await matchesCol.insertMany(matchDocs);
  console.log(`Matches seeded: ${matchDocs.length} → collection "matches"`);
  console.log('Team names/flags are resolved from "teams" at API read time.');
  console.log('Users are created on register/login → collection "users"');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => disconnectMongo());
