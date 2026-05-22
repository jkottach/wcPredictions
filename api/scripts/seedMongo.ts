import '../src/config/loadEnv';
import { ObjectId } from 'mongodb';
import {
  connectMongo,
  getTeamsCollection,
  getMatchesCollection,
  disconnectMongo,
} from '../src/lib/mongodb';
import type { MatchDocument, TeamDocument } from '../src/db/types';
import { buildMatchTag } from '../src/db/helpers';

const teams: Omit<TeamDocument, '_id' | 'createdAt' | 'updatedAt'>[] = [
  { teamId: 'AUS', teamName: 'Australia', country: 'Australia', countryLogo: 'https://flagcdn.com/w80/au.png' },
  { teamId: 'IRN', teamName: 'Iran', country: 'Iran', countryLogo: 'https://flagcdn.com/w80/ir.png' },
  { teamId: 'IRQ', teamName: 'Iraq', country: 'Iraq', countryLogo: 'https://flagcdn.com/w80/iq.png' },
  { teamId: 'JPN', teamName: 'Japan', country: 'Japan', countryLogo: 'https://flagcdn.com/w80/jp.png' },
  { teamId: 'JOR', teamName: 'Jordan', country: 'Jordan', countryLogo: 'https://flagcdn.com/w80/jo.png' },
  { teamId: 'QAT', teamName: 'Qatar', country: 'Qatar', countryLogo: 'https://flagcdn.com/w80/qa.png' },
  { teamId: 'KSA', teamName: 'Saudi Arabia', country: 'Saudi Arabia', countryLogo: 'https://flagcdn.com/w80/sa.png' },
  { teamId: 'KOR', teamName: 'South Korea', country: 'South Korea', countryLogo: 'https://flagcdn.com/w80/kr.png' },
  { teamId: 'UZB', teamName: 'Uzbekistan', country: 'Uzbekistan', countryLogo: 'https://flagcdn.com/w80/uz.png' },
  { teamId: 'ALG', teamName: 'Algeria', country: 'Algeria', countryLogo: 'https://flagcdn.com/w80/dz.png' },
  { teamId: 'CPV', teamName: 'Cape Verde', country: 'Cape Verde', countryLogo: 'https://flagcdn.com/w80/cv.png' },
  { teamId: 'COD', teamName: 'DR Congo', country: 'DR Congo', countryLogo: 'https://flagcdn.com/w80/cd.png' },
  { teamId: 'EGY', teamName: 'Egypt', country: 'Egypt', countryLogo: 'https://flagcdn.com/w80/eg.png' },
  { teamId: 'GHA', teamName: 'Ghana', country: 'Ghana', countryLogo: 'https://flagcdn.com/w80/gh.png' },
  { teamId: 'CIV', teamName: 'Ivory Coast', country: 'Ivory Coast', countryLogo: 'https://flagcdn.com/w80/ci.png' },
  { teamId: 'MAR', teamName: 'Morocco', country: 'Morocco', countryLogo: 'https://flagcdn.com/w80/ma.png' },
  { teamId: 'SEN', teamName: 'Senegal', country: 'Senegal', countryLogo: 'https://flagcdn.com/w80/sn.png' },
  { teamId: 'RSA', teamName: 'South Africa', country: 'South Africa', countryLogo: 'https://flagcdn.com/w80/za.png' },
  { teamId: 'TUN', teamName: 'Tunisia', country: 'Tunisia', countryLogo: 'https://flagcdn.com/w80/tn.png' },
  { teamId: 'CAN', teamName: 'Canada', country: 'Canada', countryLogo: 'https://flagcdn.com/w80/ca.png' },
  { teamId: 'CUW', teamName: 'Curacao', country: 'Curacao', countryLogo: 'https://flagcdn.com/w80/cw.png' },
  { teamId: 'HAI', teamName: 'Haiti', country: 'Haiti', countryLogo: 'https://flagcdn.com/w80/ht.png' },
  { teamId: 'MEX', teamName: 'Mexico', country: 'Mexico', countryLogo: 'https://flagcdn.com/w80/mx.png' },
  { teamId: 'PAN', teamName: 'Panama', country: 'Panama', countryLogo: 'https://flagcdn.com/w80/pa.png' },
  { teamId: 'USA', teamName: 'United States', country: 'United States', countryLogo: 'https://flagcdn.com/w80/us.png' },
  { teamId: 'ARG', teamName: 'Argentina', country: 'Argentina', countryLogo: 'https://flagcdn.com/w80/ar.png' },
  { teamId: 'BRA', teamName: 'Brazil', country: 'Brazil', countryLogo: 'https://flagcdn.com/w80/br.png' },
  { teamId: 'COL', teamName: 'Colombia', country: 'Colombia', countryLogo: 'https://flagcdn.com/w80/co.png' },
  { teamId: 'ECU', teamName: 'Ecuador', country: 'Ecuador', countryLogo: 'https://flagcdn.com/w80/ec.png' },
  { teamId: 'PAR', teamName: 'Paraguay', country: 'Paraguay', countryLogo: 'https://flagcdn.com/w80/py.png' },
  { teamId: 'URU', teamName: 'Uruguay', country: 'Uruguay', countryLogo: 'https://flagcdn.com/w80/uy.png' },
  { teamId: 'NZL', teamName: 'New Zealand', country: 'New Zealand', countryLogo: 'https://flagcdn.com/w80/nz.png' },
  { teamId: 'AUT', teamName: 'Austria', country: 'Austria', countryLogo: 'https://flagcdn.com/w80/at.png' },
  { teamId: 'BEL', teamName: 'Belgium', country: 'Belgium', countryLogo: 'https://flagcdn.com/w80/be.png' },
  { teamId: 'BIH', teamName: 'Bosnia and Herzegovina', country: 'Bosnia and Herzegovina', countryLogo: 'https://flagcdn.com/w80/ba.png' },
  { teamId: 'CRO', teamName: 'Croatia', country: 'Croatia', countryLogo: 'https://flagcdn.com/w80/hr.png' },
  { teamId: 'CZE', teamName: 'Czech Republic', country: 'Czech Republic', countryLogo: 'https://flagcdn.com/w80/cz.png' },
  { teamId: 'ENG', teamName: 'England', country: 'England', countryLogo: 'https://flagcdn.com/w80/gb-eng.png' },
  { teamId: 'FRA', teamName: 'France', country: 'France', countryLogo: 'https://flagcdn.com/w80/fr.png' },
  { teamId: 'GER', teamName: 'Germany', country: 'Germany', countryLogo: 'https://flagcdn.com/w80/de.png' },
  { teamId: 'NED', teamName: 'Netherlands', country: 'Netherlands', countryLogo: 'https://flagcdn.com/w80/nl.png' },
  { teamId: 'NOR', teamName: 'Norway', country: 'Norway', countryLogo: 'https://flagcdn.com/w80/no.png' },
  { teamId: 'POR', teamName: 'Portugal', country: 'Portugal', countryLogo: 'https://flagcdn.com/w80/pt.png' },
  { teamId: 'SCO', teamName: 'Scotland', country: 'Scotland', countryLogo: 'https://flagcdn.com/w80/gb-sct.png' },
  { teamId: 'ESP', teamName: 'Spain', country: 'Spain', countryLogo: 'https://flagcdn.com/w80/es.png' },
  { teamId: 'SWE', teamName: 'Sweden', country: 'Sweden', countryLogo: 'https://flagcdn.com/w80/se.png' },
  { teamId: 'SUI', teamName: 'Switzerland', country: 'Switzerland', countryLogo: 'https://flagcdn.com/w80/ch.png' },
  { teamId: 'TUR', teamName: 'Turkey', country: 'Turkey', countryLogo: 'https://flagcdn.com/w80/tr.png' },
];

const groups: Record<string, [string, string, string, string]> = {
  A: ['MEX', 'RSA', 'KOR', 'CZE'],
  B: ['CAN', 'BIH', 'QAT', 'SUI'],
  C: ['BRA', 'MAR', 'HAI', 'SCO'],
  D: ['USA', 'PAR', 'AUS', 'TUR'],
  E: ['GER', 'CUW', 'CIV', 'ECU'],
  F: ['NED', 'JPN', 'SWE', 'TUN'],
  G: ['BEL', 'EGY', 'IRN', 'NZL'],
  H: ['ESP', 'CPV', 'KSA', 'URU'],
  I: ['FRA', 'SEN', 'IRQ', 'NOR'],
  J: ['ARG', 'ALG', 'AUT', 'JOR'],
  K: ['POR', 'COD', 'UZB', 'COL'],
  L: ['ENG', 'CRO', 'GHA', 'PAN'],
};

function addHours(base: Date, hours: number): Date {
  return new Date(base.getTime() + hours * 60 * 60 * 1000);
}

function buildFixtures() {
  const fixtures: {
    sequence: number;
    team1: string;
    team2: string;
    round: string;
    group: string;
    offsetHours: number;
  }[] = [];
  let sequence = 1;
  let offsetHours = 24;

  for (const group of Object.keys(groups)) {
    const [t1, t2, t3, t4] = groups[group];
    fixtures.push({ sequence: sequence++, team1: t1, team2: t2, round: 'Group Stage', group, offsetHours });
    offsetHours += 6;
    fixtures.push({ sequence: sequence++, team1: t3, team2: t4, round: 'Group Stage', group, offsetHours });
    offsetHours += 6;
    fixtures.push({ sequence: sequence++, team1: t1, team2: t3, round: 'Group Stage', group, offsetHours });
    offsetHours += 6;
    fixtures.push({ sequence: sequence++, team1: t4, team2: t2, round: 'Group Stage', group, offsetHours });
    offsetHours += 6;
    fixtures.push({ sequence: sequence++, team1: t4, team2: t1, round: 'Group Stage', group, offsetHours });
    offsetHours += 6;
    fixtures.push({ sequence: sequence++, team1: t2, team2: t3, round: 'Group Stage', group, offsetHours });
    offsetHours += 6;
  }
  return fixtures;
}

async function main() {
  await connectMongo();
  const teamsCol = getTeamsCollection();
  const matchesCol = getMatchesCollection();
  const now = new Date();

  console.log('Clearing teams and matches (users collection is left unchanged)...');
  await teamsCol.deleteMany({});
  await matchesCol.deleteMany({});

  const teamDocs: TeamDocument[] = teams.map((t) => ({
    ...t,
    _id: new ObjectId(),
    createdAt: now,
    updatedAt: now,
  }));

  await teamsCol.insertMany(teamDocs);
  console.log(`Teams seeded: ${teamDocs.length} → collection "teams"`);

  const teamById = new Map(teamDocs.map((t) => [t.teamId, t]));
  const base = new Date();
  const matchDocs: MatchDocument[] = buildFixtures().map((f) => {
    const matchTime = addHours(base, f.offsetHours);
    const predictionsEndingTime = addHours(matchTime, -1);
    const t1 = teamById.get(f.team1)!;
    const t2 = teamById.get(f.team2)!;
    return {
      _id: new ObjectId(),
      sequence: f.sequence,
      team1: f.team1,
      team2: f.team2,
      team1Info: { teamName: t1.teamName, countryLogo: t1.countryLogo },
      team2Info: { teamName: t2.teamName, countryLogo: t2.countryLogo },
      team1Score: null,
      team2Score: null,
      matchTime,
      predictionsEndingTime,
      round: f.round,
      group: f.group,
      matchTag: buildMatchTag(f.team1, f.team2),
      comment: null,
      status: 'scheduled',
      createdAt: now,
      updatedAt: now,
    };
  });

  await matchesCol.insertMany(matchDocs);
  console.log(`Matches seeded: ${matchDocs.length} → collection "matches"`);
  console.log('Users are created on register/login → collection "users"');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => disconnectMongo());
