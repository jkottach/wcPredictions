import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ entries, title }) => {
  const medal = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-primary text-white p-4">
        <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
      </div>

      {/* Mobile: card list */}
      <div className="md:hidden divide-y divide-gray-100">
        {entries.map((entry) => (
          <div
            key={String(entry.userId ?? entry.email ?? `row-${entry.rank}`)}
            className={`px-4 py-3 flex items-center justify-between gap-3 ${
              entry.rank <= 3 ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-bold text-gray-900 shrink-0 w-10">
                {medal(entry.rank) || `#${entry.rank}`}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{entry.name}</p>
                {entry.state && (
                  <p className="text-xs text-gray-500 truncate">{entry.state}</p>
                )}
              </div>
            </div>
            <span className="font-bold text-secondary shrink-0">{entry.totalPoints}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="text-center py-8 text-gray-500">No entries yet</p>
        )}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">State</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Points</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={String(entry.userId ?? entry.email ?? `row-${entry.rank}`)}
                className={`border-b hover:bg-gray-50 ${entry.rank <= 3 ? 'bg-blue-50' : ''}`}
              >
                <td className="px-6 py-4">
                  <span className="font-bold">
                    {medal(entry.rank)} #{entry.rank}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{entry.name}</td>
                <td className="px-6 py-4 text-gray-600">{entry.state || '—'}</td>
                <td className="px-6 py-4 text-right font-bold text-secondary">
                  {entry.totalPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="text-center py-8 text-gray-500">No entries yet</p>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
