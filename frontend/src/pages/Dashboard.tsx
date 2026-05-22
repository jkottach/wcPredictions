import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginWithGoogle, useAzureAuth } from '../services/swaAuth';
import { apiService } from '../services/apiService';
import { Match, Prediction } from '../types';
import MatchCard from '../components/MatchCard';

interface UserRankInfo {
  rank: string | number;
  totalPoints: number;
}

const defaultRankInfo: UserRankInfo = { rank: '-', totalPoints: 0 };

const pickRank = (data: { final?: UserRankInfo; overall?: UserRankInfo } | undefined): UserRankInfo =>
  data?.final ?? data?.overall ?? defaultRankInfo;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, authReady } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [myRank, setMyRank] = useState<UserRankInfo>(defaultRankInfo);
  const [loadError, setLoadError] = useState('');

  const getPredictionMatchId = (prediction: Prediction): string =>
    typeof prediction.matchId === 'string' ? prediction.matchId : prediction.matchId.matchId;

  useEffect(() => {
    if (!authReady) return;
    if (!isLoggedIn) {
      if (useAzureAuth) {
        loginWithGoogle('/dashboard');
      } else {
        navigate('/login');
      }
      return;
    }
    loadDashboardData();
  }, [authReady, isLoggedIn, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setLoadError('');
      const [matchesRes, predictionsRes, statsRes] = await Promise.all([
        apiService.getAllMatches('scheduled', 1, 50),
        apiService.getUserPredictions(1, 100),
        apiService.getUserStats(),
      ]);

      setMatches(matchesRes.data?.matches ?? []);
      setUserPredictions(predictionsRes.data?.predictions ?? []);
      setMyRank(pickRank(statsRes.data));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoadError('Could not load dashboard. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionSubmit = (matchId: string, team1Score: number, team2Score: number) => {
    const submittedTime = new Date().toISOString();

    setUserPredictions((prev) => {
      const existingIndex = prev.findIndex((p) => getPredictionMatchId(p) === matchId);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          matchId,
          team1Score,
          team2Score,
          submittedTime,
        };
        return next;
      }

      const optimisticPrediction: Prediction = {
        _id: `optimistic-${matchId}`,
        userId: user?.userId || '',
        matchId,
        matchTag: '',
        team1Score,
        team2Score,
        submittedTime,
        points: 0,
      };
      return [optimisticPrediction, ...prev];
    });

    void apiService
      .getUserStats()
      .then((statsRes) => setMyRank(pickRank(statsRes.data)))
      .catch(() => undefined);
  };

  const displayMatches = useMemo(() => {
    const activeMatches = matches.filter((m) => {
      const normalizedStatus = String(m.status || '').trim().toLowerCase();
      return normalizedStatus === 'scheduled' || normalizedStatus === 'ongoing';
    });

    const toSorted = (list: Match[]) =>
      [...list].sort((a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime());

    return activeMatches.length > 0 ? toSorted(activeMatches) : toSorted(matches);
  }, [matches]);

  const rankDisplay =
    myRank.rank === '-' ? '–' : `#${myRank.rank}`;

  return (
    <div className="px-4 py-6">
      {loadError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{loadError}</div>
      )}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-1">
          Welcome, {user?.firstName}!
        </h1>
        <p className="text-sm text-gray-600">
          Predict upcoming matches and climb the leaderboard
        </p>
      </div>

      <div className="mb-6 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-5 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-white/80">My rank</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <p className="text-3xl font-black">{rankDisplay}</p>
          <span className="rounded-lg bg-white/20 px-3 py-1 text-sm font-bold">
            {myRank.totalPoints} pts
          </span>
        </div>
      </div>

      <Link
        to="/my-predictions"
        className="flex items-center justify-between mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-secondary transition min-h-[56px]"
      >
        <span className="font-bold text-primary">View previous predictions</span>
        <span className="text-secondary">→</span>
      </Link>

      <h2 className="text-xl font-bold text-primary mb-4">Matches to predict</h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
          <p className="mt-4 text-gray-600">Loading matches...</p>
        </div>
      ) : displayMatches.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {displayMatches.map((match) => {
            const userPrediction = userPredictions.find(
              (p) => getPredictionMatchId(p) === match.matchId
            );
            return (
              <MatchCard
                key={match.matchId}
                match={match}
                userPrediction={userPrediction}
                onPredictionSubmit={handlePredictionSubmit}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600 rounded-xl bg-white border border-gray-100">
          No matches scheduled yet
        </div>
      )}
    </div>
  );
};

export default Dashboard;
