import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../lib/logger';
import {
  findTeamsByIds,
  findUserById,
  getEarliestMatchKickoff,
  upsertTournamentPrediction,
} from '../db/repositories';

function parseDeadline(): Date | null {
  const env = process.env.TOURNAMENT_PREDICTION_DEADLINE?.trim();
  if (env) {
    const parsed = new Date(env);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

async function resolvePredictionDeadline(): Promise<Date | null> {
  return parseDeadline() ?? (await getEarliestMatchKickoff());
}

function uniqueTeamIds(ids: string[]): boolean {
  return new Set(ids).size === ids.length;
}

function validateBracketLogic(
  champion: string,
  finalists: [string, string],
  semifinalists: [string, string, string, string]
): string | null {
  if (!uniqueTeamIds(semifinalists)) {
    return 'Each semifinalist must be a different team';
  }
  if (!uniqueTeamIds(finalists)) {
    return 'Your two finalists must be different teams';
  }
  if (!finalists.includes(champion)) {
    return 'Champion must be one of your two finalist picks';
  }
  for (const f of finalists) {
    if (!semifinalists.includes(f)) {
      return 'Both finalists must be chosen from your four semifinalist picks';
    }
  }
  return null;
}

export const getTournamentPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const deadline = await resolvePredictionDeadline();
    const stored = user.tournamentPrediction;

    if (!stored) {
      return res.json({
        prediction: null,
        deadline: deadline?.toISOString() ?? null,
        isOpen: deadline ? new Date() < deadline : true,
      });
    }

    const teamIds = [stored.champion, ...stored.finalists, ...stored.semifinalists];
    const teams = await findTeamsByIds(teamIds);
    const teamById = new Map(teams.map((t) => [t.teamId, t]));

    const enrich = (teamId: string) => {
      const t = teamById.get(teamId);
      return {
        teamId,
        teamName: t?.teamName ?? teamId,
        countryLogo: t?.countryLogo ?? null,
      };
    };

    res.json({
      prediction: {
        champion: enrich(stored.champion),
        finalists: stored.finalists.map(enrich),
        semifinalists: stored.semifinalists.map(enrich),
        points: stored.points ?? 0,
        submittedTime: stored.submittedTime,
        updatedAt: stored.updatedAt,
      },
      deadline: deadline?.toISOString() ?? null,
      isOpen: deadline ? new Date() < deadline : true,
    });
  } catch (error) {
    const errorDetails = logger.error('getTournamentPrediction', error, {
      userId: req.user?.userId,
    });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to fetch tournament prediction' });
  }
};

export const submitTournamentPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    const { champion, finalists, semifinalists } = req.body as {
      champion: string;
      finalists: [string, string];
      semifinalists: [string, string, string, string];
    };

    const deadline = await resolvePredictionDeadline();
    if (deadline && new Date() >= deadline) {
      return res.status(400).json({ error: 'Tournament prediction deadline has passed' });
    }

    const logicError = validateBracketLogic(champion, finalists, semifinalists);
    if (logicError) return res.status(400).json({ error: logicError });

    const uniqueIds = [...new Set([champion, ...finalists, ...semifinalists])];
    const knownTeams = await findTeamsByIds(uniqueIds);
    if (knownTeams.length !== uniqueIds.length) {
      return res.status(400).json({ error: 'One or more selected teams are invalid' });
    }

    const userBefore = await findUserById(userId);
    const isUpdate = Boolean(userBefore?.tournamentPrediction);

    const saved = await upsertTournamentPrediction(userId, {
      champion,
      finalists,
      semifinalists,
    });

    res.status(isUpdate ? 200 : 201).json({
      message: isUpdate
        ? 'Tournament prediction updated successfully'
        : 'Tournament prediction submitted successfully',
      prediction: saved,
    });
  } catch (error) {
    const errorDetails = logger.error('submitTournamentPrediction', error, {
      userId: req.user?.userId,
    });
    res.status(errorDetails.statusCode || 500).json({ error: 'Failed to submit tournament prediction' });
  }
};
