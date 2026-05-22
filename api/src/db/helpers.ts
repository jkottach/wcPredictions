import { ObjectId } from 'mongodb';
import type { MatchDocument, TeamDocument, UserDocument } from './types';

export function formatUserId(user: UserDocument): string {
  return user._id.toString();
}

export function formatMatchId(match: MatchDocument): string {
  return match._id.toString();
}

export function formatMatchForApi(match: MatchDocument) {
  return {
    ...match,
    _id: match._id.toString(),
    matchId: match._id.toString(),
  };
}

export function formatUserForAuth(user: UserDocument) {
  return {
    userId: formatUserId(user),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    city: user.city,
    state: user.state,
    country: user.country,
    phoneNumber: user.phoneNumber ?? undefined,
    profileImage: user.profileImage ?? undefined,
    role: user.role,
    status: user.status,
    isActive: user.isActive,
  };
}

export function formatUserProfile(user: UserDocument) {
  return {
    ...formatUserForAuth(user),
    createdAt: user.createdAt,
  };
}

export function teamMapFromDocs(teams: TeamDocument[]): Map<string, { teamName: string; countryLogo?: string | null }> {
  return new Map(teams.map((t) => [t.teamId, { teamName: t.teamName, countryLogo: t.countryLogo }]));
}

export function enrichMatchWithTeams(
  match: MatchDocument,
  teamById: Map<string, { teamName: string; countryLogo?: string | null }>
) {
  const base = formatMatchForApi(match);
  return {
    ...base,
    team1Info:
      match.team1Info ??
      (teamById.get(match.team1)
        ? { teamName: teamById.get(match.team1)!.teamName, countryLogo: teamById.get(match.team1)!.countryLogo }
        : null),
    team2Info:
      match.team2Info ??
      (teamById.get(match.team2)
        ? { teamName: teamById.get(match.team2)!.teamName, countryLogo: teamById.get(match.team2)!.countryLogo }
        : null),
  };
}

export function buildMatchTag(team1: string, team2: string): string {
  return `#${team1}_${team2}`;
}

export function sumPredictionPoints(predictions: { points?: number }[]): number {
  return predictions.reduce((sum, p) => sum + (p.points ?? 0), 0);
}

export function newObjectId(): ObjectId {
  return new ObjectId();
}
