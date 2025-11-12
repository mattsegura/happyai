import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Lock, Globe, Mail, Trophy, MessageCircle,
  TrendingUp, Target, Clock, Search, Filter
} from 'lucide-react';
import { useStudyGroups } from '@/contexts/StudyGroupContext';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export function StudyGroups() {
  const navigate = useNavigate();
  const { studyGroups, getUserGroups } = useStudyGroups();
  const [filter, setFilter] = useState<'all' | 'my-groups' | 'public'>('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock current user ID
  const currentUserId = 'user-1';
  const myGroups = getUserGroups(currentUserId);

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'my-groups') {
      return matchesSearch && group.members.some(m => m.userId === currentUserId);
    }
    if (filter === 'public') {
      return matchesSearch && group.settings.visibility === 'public';
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Study Groups
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate, compete, and learn together
          </p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="My Groups"
          value={myGroups.length}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={Trophy}
          label="Active Competitions"
          value={myGroups.reduce((sum, g) => sum + g.competitions.filter(c => c.status === 'active').length, 0)}
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={MessageCircle}
          label="Unread Messages"
          value={5} // Mock value
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Members"
          value={myGroups.reduce((sum, g) => sum + g.members.length, 0)}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups by name or course..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg">
          {[
            { value: 'my-groups', label: 'My Groups' },
            { value: 'public', label: 'Public' },
            { value: 'all', label: 'All' }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={cn(
                'px-4 py-2 rounded-md transition-all font-medium text-sm',
                filter === tab.value ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-xl border border-border p-12 text-center"
        >
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Groups Found</h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'my-groups' 
              ? 'Join or create a study group to get started'
              : 'No groups match your search'}
          </p>
          {filter === 'my-groups' && (
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Group
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGroups.map((group, index) => (
            <GroupCard
              key={group.id}
              group={group}
              index={index}
              currentUserId={currentUserId}
              onClick={() => navigate(`/dashboard/study-groups/${group.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-background rounded-xl border border-border p-4"
    >
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

function GroupCard({ group, index, currentUserId, onClick }: any) {
  const isMember = group.members.some((m: any) => m.userId === currentUserId);
  const activeCompetition = group.competitions.find((c: any) => c.status === 'active');
  
  const visibilityConfig = {
    public: { icon: Globe, color: 'text-green-500', label: 'Public' },
    private: { icon: Lock, color: 'text-orange-500', label: 'Private' },
    'invite-only': { icon: Mail, color: 'text-blue-500', label: 'Invite Only' }
  };
  
  const config = visibilityConfig[group.settings.visibility as keyof typeof visibilityConfig];
  const VisibilityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, shadow: 'lg' }}
      onClick={onClick}
      className="bg-card rounded-xl border border-border p-6 cursor-pointer transition-all hover:border-primary/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold">{group.name}</h3>
            {isMember && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                Member
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{group.description}</p>
        </div>
        <VisibilityIcon className={`w-5 h-5 ${config.color} flex-shrink-0`} />
      </div>

      {/* Course Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full text-sm mb-4">
        <div className="w-2 h-2 rounded-full bg-primary" />
        {group.courseName}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-bold">
            <Users className="w-4 h-4" />
            {group.members.length}
          </div>
          <p className="text-xs text-muted-foreground">Members</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-bold">
            <MessageCircle className="w-4 h-4" />
            {group.chatHistory.length}
          </div>
          <p className="text-xs text-muted-foreground">Messages</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-bold">
            <Trophy className="w-4 h-4" />
            {group.competitions.length}
          </div>
          <p className="text-xs text-muted-foreground">Competitions</p>
        </div>
      </div>

      {/* Active Competition */}
      {activeCompetition && (
        <div className="p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="font-medium">Active: {activeCompetition.name}</span>
          </div>
        </div>
      )}

      {/* Member Avatars */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
        <div className="flex -space-x-2">
          {group.members.slice(0, 3).map((member: any, i: number) => (
            <div
              key={member.userId}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold border-2 border-background"
              title={member.userName}
            >
              {member.userName.charAt(0)}
            </div>
          ))}
          {group.members.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
              +{group.members.length - 3}
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground ml-auto">
          Created {new Date(group.createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}

