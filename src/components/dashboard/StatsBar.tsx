import { useAuth } from '../../contexts/AuthContext';
import { Flame, Trophy, Zap } from 'lucide-react';

export function StatsBar() {
  const { profile } = useAuth();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current streak</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.current_streak || 0} days</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total points</p>
            <p className="text-lg font-semibold text-slate-900">{profile?.total_points || 0}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Level</p>
            <p className="text-lg font-semibold text-slate-900">
              {Math.floor((profile?.total_points || 0) / 100) + 1}
              <span className="ml-1 text-xs font-medium text-slate-500">
                {((profile?.total_points || 0) % 100)}/100
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
