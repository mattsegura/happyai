import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CreateHapiMoment } from './CreateHapiMoment';
import { Heart, Send, Inbox, Sparkles } from 'lucide-react';

type MomentType = {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  created_at: string;
  sender: { full_name: string };
  recipient: { full_name: string };
  classes: { name: string };
  isReferral?: boolean;
  points?: number;
};

export function HapiMomentsView() {
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const loading = false;

  const directMoments: MomentType[] = [
    {
      id: 'moment-1',
      sender_id: user?.id || '',
      recipient_id: 'student-1',
      message: 'Thanks for helping me understand cellular respiration! Your explanation was super clear.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      sender: { full_name: 'Alex Johnson' },
      recipient: { full_name: 'Emma Thompson' },
      classes: { name: 'Biology II' },
    },
    {
      id: 'moment-2',
      sender_id: 'student-2',
      recipient_id: user?.id || '',
      message: 'Great job on your presentation about market equilibrium!',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      sender: { full_name: 'Liam Rodriguez' },
      recipient: { full_name: 'Alex Johnson' },
      classes: { name: 'Economics 101' },
    },
  ];

  // TODO: Implement referral moments from Supabase
  const referralMoments: MomentType[] = [];

  const allMoments = [...directMoments, ...referralMoments].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const moments = allMoments.filter(moment => {
    if (filter === 'sent') return moment.sender_id === user?.id;
    if (filter === 'received') return moment.recipient_id === user?.id || moment.isReferral;
    return true;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMomentCreated = () => {
    setShowCreate(false);
  };

  if (showCreate) {
    return <CreateHapiMoment onClose={() => setShowCreate(false)} onCreated={handleMomentCreated} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Share Positivity</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>Create Moment</span>
        </button>
      </div>

      <div className="flex space-x-2 bg-card rounded-xl p-2 shadow-md border border-border">
        {[
          { id: 'all', label: 'All', icon: Heart },
          { id: 'sent', label: 'Sent', icon: Send },
          { id: 'received', label: 'Received', icon: Inbox },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = filter === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-orange-600 text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-6 shadow-lg animate-pulse border border-border">
              <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-orange-50 dark:to-orange-950/30 rounded-3xl p-12 border-2 border-pink-200 dark:border-pink-800 shadow-lg text-center">
          <Heart className="w-16 h-16 text-pink-400 dark:text-pink-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">No Moments Yet</h3>
          <p className="text-muted-foreground mb-6">
            Start spreading positivity by creating your first Hapi Moment!
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Create Your First Moment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {moments.map((moment) => {
            const isSender = moment.sender_id === user?.id;
            const points = moment.isReferral ? moment.points : 5;

            return (
              <div
                key={moment.id}
                className={`bg-card rounded-2xl p-6 border-2 shadow-lg transform hover:scale-[1.01] transition-all duration-300 ${
                  isSender
                    ? 'border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 dark:from-blue-950/30 to-cyan-50 dark:to-cyan-950/30'
                    : 'border-pink-200 dark:border-pink-800 bg-gradient-to-br from-pink-50 dark:from-pink-950/30 to-orange-50 dark:to-orange-950/30'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isSender ? 'bg-blue-500' : 'bg-pink-500'
                      }`}
                    >
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {isSender ? 'You' : moment.sender.full_name}
                        <span className="text-muted-foreground font-normal"> → </span>
                        {isSender ? moment.recipient.full_name : 'You'}
                      </p>
                      <p className="text-xs text-muted-foreground">{moment.classes.name}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(moment.created_at)}</span>
                </div>

                <p className="text-foreground mb-3 leading-relaxed">{moment.message}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isSender
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300'
                      }`}
                    >
                      {isSender ? 'Sent' : 'Received'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-500">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-semibold">+{points} pts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
