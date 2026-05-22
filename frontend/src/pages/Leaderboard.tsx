import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { LeaderboardEntry } from '../types';
import Leaderboard from '../components/Leaderboard';

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTopLeaderboard(30);
      setLeaderboard(res.data.leaderboard || []);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6">Leaderboard</h1>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      ) : (
        <Leaderboard entries={leaderboard} title="All-time top players" />
      )}
    </div>
  );
};

export default LeaderboardPage;
