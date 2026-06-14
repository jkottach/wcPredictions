import React, { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import PageHero from '../components/PageHero';
import { apiService } from '../services/apiService';
import { AdminUser, Match } from '../types';
import {
  alertError,
  alertSuccess,
  btnOutline,
  btnPrimary,
  cardPad,
  input,
  pageBg,
  spinner,
} from '../theme';

type AdminTab = 'matches' | 'users';

const MATCH_PAGE_SIZE = 100;

const Admin: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scoreDraft, setScoreDraft] = useState<Record<string, { team1: string; team2: string }>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMatches = useCallback(async () => {
    const res = await apiService.getAllMatches(undefined, 1, MATCH_PAGE_SIZE);
    setMatches(res.data?.matches ?? []);
  }, []);

  const loadUsers = useCallback(async () => {
    const res = await apiService.getAdminUsers();
    setUsers(res.data?.users ?? []);
  }, []);

  const loadTabData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (tab === 'matches') {
        await loadMatches();
      } else {
        await loadUsers();
      }
    } catch (err) {
      console.error('Admin load failed:', err);
      setError('Failed to load admin data. Check your permissions and try again.');
    } finally {
      setLoading(false);
    }
  }, [tab, loadMatches, loadUsers]);

  useEffect(() => {
    void loadTabData();
  }, [loadTabData]);

  const updateScoreDraft = (matchId: string, field: 'team1' | 'team2', value: string) => {
    setScoreDraft((prev) => ({
      ...prev,
      [matchId]: {
        team1: field === 'team1' ? value : (prev[matchId]?.team1 ?? ''),
        team2: field === 'team2' ? value : (prev[matchId]?.team2 ?? ''),
      },
    }));
  };

  const handleFinalize = async (match: Match) => {
    const draft = scoreDraft[match.matchId];
    const team1Score = Number(draft?.team1);
    const team2Score = Number(draft?.team2);

    if (!Number.isInteger(team1Score) || team1Score < 0 || !Number.isInteger(team2Score) || team2Score < 0) {
      setError('Enter valid non-negative whole-number scores.');
      return;
    }

    setSubmittingId(match.matchId);
    setError('');
    setSuccess('');

    try {
      await apiService.finalizeMatch(match.matchId, team1Score, team2Score);
      setSuccess(`Finalized ${match.matchTag} — points calculated.`);
      await loadMatches();
    } catch (err) {
      console.error('Finalize failed:', err);
      setError('Failed to finalize match. It may already be completed.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (user.role === 'admin') return;
    if (!window.confirm(`Delete ${user.firstName} ${user.lastName} (${user.email})?`)) return;

    setDeletingId(user.userId);
    setError('');
    setSuccess('');

    try {
      await apiService.deleteAdminUser(user.userId);
      setSuccess(`Removed ${user.email}.`);
      await loadUsers();
    } catch (err) {
      console.error('Delete user failed:', err);
      setError('Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const teamLabel = (match: Match, side: 'team1' | 'team2') => {
    const info = side === 'team1' ? match.team1Info : match.team2Info;
    const code = side === 'team1' ? match.team1 : match.team2;
    return info?.teamName ?? code;
  };

  const tabBtn = (id: AdminTab, label: string) => (
    <button
      type="button"
      onClick={() => setTab(id)}
      className={`min-h-[44px] flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
        tab === id
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={pageBg}>
      <PageHero
        badge="Admin"
        title="Admin panel"
        subtitle="Finalize match results and manage users."
      />

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
        <div className="flex gap-2">
          {tabBtn('matches', 'Finalize matches')}
          {tabBtn('users', 'Users')}
        </div>

        {error && <div className={alertError}>{error}</div>}
        {success && <div className={alertSuccess}>{success}</div>}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className={spinner} />
          </div>
        ) : tab === 'matches' ? (
          <div className="space-y-3">
            {matches.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">No matches found.</p>
            ) : (
              matches.map((match) => {
                const isCompleted = match.status === 'completed';
                const draft = scoreDraft[match.matchId];

                return (
                  <div key={match.matchId} className={cardPad}>
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                          {match.round}
                          {match.group ? ` · Group ${match.group}` : ''}
                        </p>
                        <p className="font-display text-lg font-bold text-slate-900">
                          {teamLabel(match, 'team1')} vs {teamLabel(match, 'team2')}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {match.matchTag} ·{' '}
                          {match.matchTime
                            ? format(new Date(match.matchTime), 'MMM d, yyyy HH:mm')
                            : 'TBD'}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-600'
                            : match.status === 'ongoing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>

                    {isCompleted ? (
                      <p className="text-sm font-semibold text-slate-700">
                        Final score: {match.team1Score} – {match.team2Score}
                      </p>
                    ) : (
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="w-20">
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            {match.team1}
                          </label>
                          <input
                            type="number"
                            min={0}
                            className={input}
                            value={draft?.team1 ?? ''}
                            onChange={(e) => updateScoreDraft(match.matchId, 'team1', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <span className="pb-3 text-slate-400 font-bold">–</span>
                        <div className="w-20">
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            {match.team2}
                          </label>
                          <input
                            type="number"
                            min={0}
                            className={input}
                            value={draft?.team2 ?? ''}
                            onChange={(e) => updateScoreDraft(match.matchId, 'team2', e.target.value)}
                            placeholder="0"
                          />
                        </div>
                        <button
                          type="button"
                          className={`${btnPrimary} !w-auto px-5`}
                          disabled={submittingId === match.matchId}
                          onClick={() => void handleFinalize(match)}
                        >
                          {submittingId === match.matchId ? 'Saving…' : 'Finalize'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {users.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-8">No users yet.</p>
            ) : (
              users.map((user) => (
                <div key={user.userId} className={cardPad}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {user.firstName} {user.lastName}
                        {user.role === 'admin' && (
                          <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-700">
                            admin
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {user.totalPoints} pts · {user.predictionCount} predictions
                        {!user.isActive ? ' · inactive' : ''}
                      </p>
                    </div>
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        className={`${btnOutline} !w-auto px-4 text-red-600 border-red-200 hover:bg-red-50`}
                        disabled={deletingId === user.userId}
                        onClick={() => void handleDeleteUser(user)}
                      >
                        {deletingId === user.userId ? 'Deleting…' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
