import { readFileSync } from 'fs';
import { join } from 'path';

/** Nation row — sole source of truth for names, flags, and validation. */
export interface SeedTeam {
  teamId: string;
  teamName: string;
  country: string;
  countryLogo: string | null;
}

/** Match fixture — references teams by `teamId` only (no embedded team info). */
export interface SeedMatch {
  sequence: number;
  team1: string;
  team2: string;
  round: string;
  group: string | null;
  matchTime: string;
  predictionsEndingTime: string;
  status: string;
  matchTag: string;
}

export interface WorldCup2026SeedData {
  teams: SeedTeam[];
  matches: SeedMatch[];
}

const SEED_JSON_PATH = join(__dirname, 'worldCup2026.seed.json');

let cached: WorldCup2026SeedData | null = null;

/** Loads `worldCup2026.seed.json` (canonical teams + matches). */
export function loadWorldCup2026Seed(): WorldCup2026SeedData {
  if (cached) return cached;
  const raw = readFileSync(SEED_JSON_PATH, 'utf8');
  cached = JSON.parse(raw) as WorldCup2026SeedData;
  return cached;
}

/** FIFA nation codes used in group stage (excludes knockout placeholders). */
export function isNationTeamId(teamId: string): boolean {
  return /^[A-Z]{3}$/.test(teamId) && !/^[0-9W]/.test(teamId);
}

export function validateSeedData(data: WorldCup2026SeedData): void {
  const teamIds = new Set(data.teams.map((t) => t.teamId));
  if (teamIds.size !== data.teams.length) {
    throw new Error('Duplicate teamId in seed teams');
  }

  for (const m of data.matches) {
    if (isNationTeamId(m.team1) && !teamIds.has(m.team1)) {
      throw new Error(`Match ${m.sequence}: team1 "${m.team1}" missing from teams`);
    }
    if (isNationTeamId(m.team2) && !teamIds.has(m.team2)) {
      throw new Error(`Match ${m.sequence}: team2 "${m.team2}" missing from teams`);
    }
  }
}
