import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';
import { buildMatchTag, formatMatchForApi } from '../db/helpers';
import {
  createMatch as insertMatch,
  deleteMatchById,
  findMatchById,
  getEnrichedMatch,
  getEnrichedMatches,
  listMatches,
  listTeams,
  resolveTeamInfoForMatch,
  updateMatchById,
} from '../db/repositories';

export const getAllTeams = async (_req: AuthRequest, res: Response) => {
  try {
    const teams = await listTeams();
    res.json({
      teams: teams.map((t) => ({
        teamId: t.teamId,
        teamName: t.teamName,
        countryLogo: t.countryLogo,
      })),
    });
  } catch (error) {
    const errorDetails = logger.error('getAllTeams', error, { method: 'GET', path: '/teams' });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to fetch teams' });
  }
};

export const getAllMatches = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const { matches, total } = await listMatches({
      status: status as string | undefined,
      page: pageNum,
      limit: limitNum,
    });

    const enrichedMatches = await getEnrichedMatches(matches);

    res.json({
      matches: enrichedMatches,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    const errorDetails = logger.error('getAllMatches', error, { method: req.method, path: req.path });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to fetch matches' });
  }
};

export const getMatchById = async (req: AuthRequest, res: Response) => {
  try {
    const match = await findMatchById(req.params.matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });
    res.json(await getEnrichedMatch(match));
  } catch (error) {
    const errorDetails = logger.error('getMatchById', error, { matchId: req.params.matchId });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to fetch match' });
  }
};

export const createMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { sequence, team1, team2, matchTime, predictionsEndingTime, round, group, matchTag, comment } = req.body;
    const resolvedMatchTag = matchTag || buildMatchTag(team1, team2);
    const { team1Info, team2Info } = await resolveTeamInfoForMatch(team1, team2);

    const match = await insertMatch({
      sequence,
      team1,
      team2,
      team1Info,
      team2Info,
      matchTime: new Date(matchTime),
      predictionsEndingTime: new Date(predictionsEndingTime),
      round,
      group,
      matchTag: resolvedMatchTag,
      comment,
      status: 'scheduled',
    });

    res.status(201).json({
      message: 'Match created successfully',
      match: formatMatchForApi(match),
    });
  } catch (error) {
    const errorDetails = logger.error('createMatch', error, { method: req.method, path: req.path });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to create match' });
  }
};

export const updateMatch = async (req: AuthRequest, res: Response) => {
  try {
    const {
      sequence,
      team1,
      team2,
      matchTime,
      predictionsEndingTime,
      round,
      group,
      matchTag,
      comment,
      team1Score,
      team2Score,
      status,
    } = req.body;

    const existing = await findMatchById(req.params.matchId);
    if (!existing) return res.status(404).json({ error: 'Match not found' });

    const nextTeam1 = team1 ?? existing.team1;
    const nextTeam2 = team2 ?? existing.team2;
    const teamInfo =
      team1 !== undefined || team2 !== undefined
        ? await resolveTeamInfoForMatch(nextTeam1, nextTeam2)
        : null;

    const updated = await updateMatchById(req.params.matchId, {
      ...(sequence !== undefined ? { sequence } : {}),
      ...(team1 !== undefined ? { team1 } : {}),
      ...(team2 !== undefined ? { team2 } : {}),
      ...(teamInfo?.team1Info ? { team1Info: teamInfo.team1Info } : {}),
      ...(teamInfo?.team2Info ? { team2Info: teamInfo.team2Info } : {}),
      ...(matchTime !== undefined ? { matchTime: new Date(matchTime) } : {}),
      ...(predictionsEndingTime !== undefined ? { predictionsEndingTime: new Date(predictionsEndingTime) } : {}),
      ...(round !== undefined ? { round } : {}),
      ...(group !== undefined ? { group } : {}),
      ...(comment !== undefined ? { comment } : {}),
      ...(team1Score !== undefined ? { team1Score } : {}),
      ...(team2Score !== undefined ? { team2Score } : {}),
      ...(status ? { status } : {}),
      ...((team1 !== undefined || team2 !== undefined || matchTag !== undefined)
        ? { matchTag: matchTag || buildMatchTag(nextTeam1, nextTeam2) }
        : {}),
    });

    res.json({
      message: 'Match updated successfully',
      match: formatMatchForApi(updated!),
    });
  } catch (error) {
    const errorDetails = logger.error('updateMatch', error, { matchId: req.params.matchId });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to update match' });
  }
};

export const deleteMatch = async (req: AuthRequest, res: Response) => {
  try {
    const deleted = await deleteMatchById(req.params.matchId);
    if (!deleted) return res.status(404).json({ error: 'Match not found' });
    res.json({ message: 'Match deleted successfully' });
  } catch (error) {
    const errorDetails = logger.error('deleteMatch', error, { matchId: req.params.matchId });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to delete match' });
  }
};
