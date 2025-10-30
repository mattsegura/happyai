import { mockHapiMoments, MOCK_USER_ID } from '../../lib/mockData';
import { Heart, Send, Inbox, TrendingUp, Sparkles } from 'lucide-react';

export function HapiMomentsWidget() {
  const sentMoments = mockHapiMoments.filter(m => m.sender_id === MOCK_USER_ID);
  const receivedMoments = mockHapiMoments.filter(m => m.recipient_id === MOCK_USER_ID);

  const totalSent = sentMoments.length;
  const totalReceived = receivedMoments.length;
  const totalPoints = (totalSent * 5) + (totalReceived * 5); // 5 points each

  // Get recent moments
  const recentMoments = [...mockHapiMoments]
    .filter(m => m.sender_id === MOCK_USER_ID || m.recipient_id === MOCK_USER_ID)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Hapi Moments
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Kindness shared with classmates</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-2 mb-2">
            <Send className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <div className="text-xs font-medium text-muted-foreground">Sent</div>
          </div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{totalSent}</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Inbox className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div className="text-xs font-medium text-muted-foreground">Received</div>
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{totalReceived}</div>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <div className="text-xs font-medium text-muted-foreground">Points</div>
          </div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalPoints}</div>
        </div>
      </div>

      {/* Recent Moments */}
      <div className="space-y-3">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Recent Activity
        </div>

        {recentMoments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No Hapi moments yet</p>
            <p className="text-sm mt-1">Send appreciation to a classmate!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMoments.map((moment) => {
              const isSent = moment.sender_id === MOCK_USER_ID;
              
              return (
                <div
                  key={moment.id}
                  className={`p-4 rounded-xl border-2 ${
                    isSent
                      ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800'
                      : 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isSent
                        ? 'bg-rose-100 dark:bg-rose-900/30'
                        : 'bg-purple-100 dark:bg-purple-900/30'
                    }`}>
                      {isSent ? (
                        <Send className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <Inbox className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="text-sm font-semibold text-foreground">
                          {isSent ? `To ${moment.recipient.full_name}` : `From ${moment.sender.full_name}`}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {getTimeAgo(moment.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        "{moment.message}"
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{moment.classes.name}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          +5 pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Impact Summary */}
      <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-rose-50 to-purple-50 dark:from-rose-950/20 dark:to-purple-950/20 border border-rose-200 dark:border-rose-800">
        <div className="flex items-start gap-2">
          <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-foreground mb-1">Kindness Impact</div>
            <p className="text-sm text-muted-foreground">
              {totalSent + totalReceived === 0
                ? 'Start spreading positivity! Send a Hapi moment to appreciate a classmate\'s help or kindness.'
                : totalSent > totalReceived
                ? `You're a generous peer! You've sent ${totalSent} moments of appreciation. Your kindness makes a difference! 💖`
                : totalReceived > totalSent
                ? `You're valued by your peers! You've received ${totalReceived} appreciations. Consider paying it forward! 🌟`
                : `Great balance! You're both giving and receiving appreciation. Keep building positive connections! ✨`}
            </p>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="mt-4">
        <button className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
          <Heart className="w-5 h-5" />
          Send a Hapi Moment
        </button>
      </div>
    </div>
  );
}
