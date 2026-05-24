/**
 * Update `matches` collection kick-off times from FIFA's official World Cup 2026 schedule.
 *
 * Usage: npm run update:match-times
 * Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures
 */
import '../src/config/loadEnv';
import { connectMongo, getMatchesCollection, disconnectMongo } from '../src/lib/mongodb';
import type { MatchDocument } from '../src/db/types';
import {
  buildFixtureLookup,
  fixturePairKey,
  localKickoffToUtc,
} from './data/fifaWorldCup2026GroupFixtures';

const PREDICTION_CLOSE_HOURS_BEFORE = 1;

function subtractHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 60 * 60 * 1000);
}

async function main() {
  const lookup = buildFixtureLookup();
  await connectMongo();
  const col = getMatchesCollection();

  const allMatches = await col.find({ round: /group/i }).toArray();
  const groupMatches = allMatches.length > 0
    ? allMatches
    : await col.find({}).toArray();

  let updated = 0;
  const unmatched: MatchDocument[] = [];

  for (const match of groupMatches) {
    const key = fixturePairKey(match.team1, match.team2);
    const fixture = lookup.get(key);

    if (!fixture) {
      unmatched.push(match);
      continue;
    }

    const matchTime = localKickoffToUtc(fixture.date, fixture.time, fixture.timezone);
    const predictionsEndingTime = subtractHours(matchTime, PREDICTION_CLOSE_HOURS_BEFORE);

    await col.updateOne(
      { _id: match._id },
      {
        $set: {
          matchTime,
          predictionsEndingTime,
          updatedAt: new Date(),
        },
      }
    );
    updated += 1;

    console.log(
      `✓ ${match.team1} vs ${match.team2} → ${matchTime.toISOString()} (FIFA ${fixture.date} ${fixture.time} ${fixture.timezone})`
    );
  }

  console.log(`\nUpdated ${updated} match(es).`);
  if (unmatched.length > 0) {
    console.warn(`\n${unmatched.length} match(es) not in FIFA group schedule (skipped):`);
    for (const m of unmatched) {
      console.warn(`  - ${m.team1} vs ${m.team2} (${m.round}, group ${m.group ?? '—'})`);
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => disconnectMongo());
