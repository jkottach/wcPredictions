/**
 * FIFA World Cup 2026™ group stage kick-offs (venue local time).
 * Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/scores-fixtures
 * Retrieved May 2026 — local times as published on FIFA match centre.
 */

export type FifaFixture = {
  team1: string;
  team2: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h, venue local)
  timezone: string; // IANA
};

/** June 2026 offsets from UTC (minutes). North American venues observe DST. */
export const VENUE_TIMEZONE_OFFSET_MINUTES: Record<string, number> = {
  'America/Mexico_City': -6 * 60,
  'America/Monterrey': -6 * 60,
  'America/Toronto': -4 * 60,
  'America/New_York': -4 * 60,
  'America/Los_Angeles': -7 * 60,
  'America/Vancouver': -7 * 60,
  'America/Chicago': -5 * 60,
};

export function localKickoffToUtc(date: string, time: string, timezone: string): Date {
  const offsetMinutes = VENUE_TIMEZONE_OFFSET_MINUTES[timezone];
  if (offsetMinutes === undefined) {
    throw new Error(`Unknown timezone: ${timezone}`);
  }
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  const utcMs = Date.UTC(y, m - 1, d, hh, mm) - offsetMinutes * 60 * 1000;
  return new Date(utcMs);
}

/** All 72 group-stage matches in FIFA schedule order. */
export const FIFA_WC26_GROUP_FIXTURES: FifaFixture[] = [
  { team1: 'MEX', team2: 'RSA', date: '2026-06-11', time: '19:00', timezone: 'America/Mexico_City' },
  { team1: 'KOR', team2: 'CZE', date: '2026-06-12', time: '02:00', timezone: 'America/Mexico_City' },
  { team1: 'CAN', team2: 'BIH', date: '2026-06-12', time: '19:00', timezone: 'America/Toronto' },
  { team1: 'USA', team2: 'PAR', date: '2026-06-13', time: '01:00', timezone: 'America/Los_Angeles' },
  { team1: 'QAT', team2: 'SUI', date: '2026-06-13', time: '19:00', timezone: 'America/Los_Angeles' },
  { team1: 'BRA', team2: 'MAR', date: '2026-06-13', time: '22:00', timezone: 'America/New_York' },
  { team1: 'HAI', team2: 'SCO', date: '2026-06-14', time: '01:00', timezone: 'America/New_York' },
  { team1: 'AUS', team2: 'TUR', date: '2026-06-14', time: '04:00', timezone: 'America/Vancouver' },
  { team1: 'GER', team2: 'CUW', date: '2026-06-14', time: '17:00', timezone: 'America/Chicago' },
  { team1: 'NED', team2: 'JPN', date: '2026-06-14', time: '20:00', timezone: 'America/Chicago' },
  { team1: 'CIV', team2: 'ECU', date: '2026-06-14', time: '23:00', timezone: 'America/New_York' },
  { team1: 'SWE', team2: 'TUN', date: '2026-06-15', time: '02:00', timezone: 'America/Monterrey' },
  { team1: 'ESP', team2: 'CPV', date: '2026-06-15', time: '16:00', timezone: 'America/New_York' },
  { team1: 'BEL', team2: 'EGY', date: '2026-06-15', time: '19:00', timezone: 'America/Los_Angeles' },
  { team1: 'KSA', team2: 'URU', date: '2026-06-15', time: '22:00', timezone: 'America/New_York' },
  { team1: 'IRN', team2: 'NZL', date: '2026-06-16', time: '01:00', timezone: 'America/Los_Angeles' },
  { team1: 'FRA', team2: 'SEN', date: '2026-06-16', time: '19:00', timezone: 'America/New_York' },
  { team1: 'IRQ', team2: 'NOR', date: '2026-06-16', time: '22:00', timezone: 'America/New_York' },
  { team1: 'ARG', team2: 'ALG', date: '2026-06-17', time: '01:00', timezone: 'America/Chicago' },
  { team1: 'AUT', team2: 'JOR', date: '2026-06-17', time: '04:00', timezone: 'America/Los_Angeles' },
  { team1: 'POR', team2: 'COD', date: '2026-06-17', time: '17:00', timezone: 'America/Chicago' },
  { team1: 'ENG', team2: 'CRO', date: '2026-06-17', time: '20:00', timezone: 'America/Chicago' },
  { team1: 'GHA', team2: 'PAN', date: '2026-06-17', time: '23:00', timezone: 'America/Toronto' },
  { team1: 'UZB', team2: 'COL', date: '2026-06-18', time: '02:00', timezone: 'America/Mexico_City' },
  { team1: 'CZE', team2: 'RSA', date: '2026-06-18', time: '16:00', timezone: 'America/New_York' },
  { team1: 'SUI', team2: 'BIH', date: '2026-06-18', time: '19:00', timezone: 'America/Los_Angeles' },
  { team1: 'CAN', team2: 'QAT', date: '2026-06-18', time: '22:00', timezone: 'America/Vancouver' },
  { team1: 'MEX', team2: 'KOR', date: '2026-06-19', time: '01:00', timezone: 'America/Mexico_City' },
  { team1: 'USA', team2: 'AUS', date: '2026-06-19', time: '19:00', timezone: 'America/Los_Angeles' },
  { team1: 'SCO', team2: 'MAR', date: '2026-06-19', time: '22:00', timezone: 'America/New_York' },
  { team1: 'BRA', team2: 'HAI', date: '2026-06-20', time: '00:30', timezone: 'America/New_York' },
  { team1: 'TUR', team2: 'PAR', date: '2026-06-20', time: '03:00', timezone: 'America/Los_Angeles' },
  { team1: 'NED', team2: 'SWE', date: '2026-06-20', time: '17:00', timezone: 'America/Chicago' },
  { team1: 'GER', team2: 'CIV', date: '2026-06-20', time: '20:00', timezone: 'America/Toronto' },
  { team1: 'ECU', team2: 'CUW', date: '2026-06-21', time: '00:00', timezone: 'America/Chicago' },
  { team1: 'TUN', team2: 'JPN', date: '2026-06-21', time: '04:00', timezone: 'America/Monterrey' },
  { team1: 'ESP', team2: 'KSA', date: '2026-06-21', time: '16:00', timezone: 'America/New_York' },
  { team1: 'BEL', team2: 'IRN', date: '2026-06-21', time: '19:00', timezone: 'America/Los_Angeles' },
  { team1: 'URU', team2: 'CPV', date: '2026-06-21', time: '22:00', timezone: 'America/New_York' },
  { team1: 'NZL', team2: 'EGY', date: '2026-06-22', time: '01:00', timezone: 'America/Vancouver' },
  { team1: 'ARG', team2: 'AUT', date: '2026-06-22', time: '17:00', timezone: 'America/Chicago' },
  { team1: 'FRA', team2: 'IRQ', date: '2026-06-22', time: '21:00', timezone: 'America/New_York' },
  { team1: 'NOR', team2: 'SEN', date: '2026-06-23', time: '00:00', timezone: 'America/New_York' },
  { team1: 'JOR', team2: 'ALG', date: '2026-06-23', time: '03:00', timezone: 'America/Los_Angeles' },
  { team1: 'POR', team2: 'UZB', date: '2026-06-23', time: '17:00', timezone: 'America/Chicago' },
  { team1: 'ENG', team2: 'GHA', date: '2026-06-23', time: '20:00', timezone: 'America/New_York' },
  { team1: 'PAN', team2: 'CRO', date: '2026-06-23', time: '23:00', timezone: 'America/Toronto' },
  { team1: 'COL', team2: 'COD', date: '2026-06-24', time: '02:00', timezone: 'America/Mexico_City' },
  { team1: 'SUI', team2: 'CAN', date: '2026-06-24', time: '19:00', timezone: 'America/Vancouver' },
  { team1: 'BIH', team2: 'QAT', date: '2026-06-24', time: '19:00', timezone: 'America/Los_Angeles' },
  { team1: 'SCO', team2: 'BRA', date: '2026-06-24', time: '22:00', timezone: 'America/New_York' },
  { team1: 'MAR', team2: 'HAI', date: '2026-06-24', time: '22:00', timezone: 'America/New_York' },
  { team1: 'CZE', team2: 'MEX', date: '2026-06-25', time: '01:00', timezone: 'America/Mexico_City' },
  { team1: 'RSA', team2: 'KOR', date: '2026-06-25', time: '01:00', timezone: 'America/Monterrey' },
  { team1: 'CUW', team2: 'CIV', date: '2026-06-25', time: '20:00', timezone: 'America/New_York' },
  { team1: 'ECU', team2: 'GER', date: '2026-06-25', time: '20:00', timezone: 'America/New_York' },
  { team1: 'JPN', team2: 'SWE', date: '2026-06-25', time: '23:00', timezone: 'America/Chicago' },
  { team1: 'TUN', team2: 'NED', date: '2026-06-25', time: '23:00', timezone: 'America/Chicago' },
  { team1: 'TUR', team2: 'USA', date: '2026-06-26', time: '02:00', timezone: 'America/Los_Angeles' },
  { team1: 'PAR', team2: 'AUS', date: '2026-06-26', time: '02:00', timezone: 'America/Los_Angeles' },
  { team1: 'NOR', team2: 'FRA', date: '2026-06-26', time: '19:00', timezone: 'America/New_York' },
  { team1: 'SEN', team2: 'IRQ', date: '2026-06-26', time: '19:00', timezone: 'America/Toronto' },
  { team1: 'CPV', team2: 'KSA', date: '2026-06-27', time: '00:00', timezone: 'America/Chicago' },
  { team1: 'URU', team2: 'ESP', date: '2026-06-27', time: '00:00', timezone: 'America/Mexico_City' },
  { team1: 'EGY', team2: 'IRN', date: '2026-06-27', time: '03:00', timezone: 'America/Los_Angeles' },
  { team1: 'NZL', team2: 'BEL', date: '2026-06-27', time: '03:00', timezone: 'America/Vancouver' },
  { team1: 'PAN', team2: 'ENG', date: '2026-06-27', time: '21:00', timezone: 'America/New_York' },
  { team1: 'CRO', team2: 'GHA', date: '2026-06-27', time: '21:00', timezone: 'America/New_York' },
  { team1: 'COL', team2: 'POR', date: '2026-06-27', time: '23:30', timezone: 'America/New_York' },
  { team1: 'COD', team2: 'UZB', date: '2026-06-27', time: '23:30', timezone: 'America/New_York' },
  { team1: 'ALG', team2: 'AUT', date: '2026-06-28', time: '02:00', timezone: 'America/Chicago' },
  { team1: 'JOR', team2: 'ARG', date: '2026-06-28', time: '02:00', timezone: 'America/Chicago' },
];

export function fixturePairKey(team1: string, team2: string): string {
  return [team1, team2].sort().join('|');
}

export function buildFixtureLookup(): Map<string, FifaFixture> {
  const map = new Map<string, FifaFixture>();
  for (const f of FIFA_WC26_GROUP_FIXTURES) {
    map.set(fixturePairKey(f.team1, f.team2), f);
  }
  return map;
}
