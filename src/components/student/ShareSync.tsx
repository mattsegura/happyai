import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Lock, Globe, Mail, Trophy, MessageCircle,
  TrendingUp, Target, Clock, Search, Filter, FileText, Upload,
  Download, Share2, Calendar, CheckSquare, Folder, Send, Bell,
  MoreVertical, Settings, UserPlus, LogOut
} from 'lucide-react';
import { useStudyGroups } from '@/contexts/StudyGroupContext';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

export function ShareSync() {
  const navigate = useNavigate();
  const { studyGroups, getUserGroups } = useStudyGroups();
  const [filter, setFilter] = useState<'all' | 'my-groups' | 'public'>('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

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

  // Mock shared files data
  const recentSharedFiles = [
    {
      id: '1',
      name: 'Calculus Midterm Study Guide.pdf',
      sharedBy: 'Sarah Chen',
      groupName: 'Calc II Study Squad',
      timestamp: '2 hours ago',
      type: 'pdf'
    },
    {
      id: '2',
      name: 'Binary Trees Visualization.mp4',
      sharedBy: 'Mike Johnson',
      groupName: 'CS 201 - Data Structures',
      timestamp: '5 hours ago',
      type: 'video'
    },
    {
      id: '3',
      name: 'Lab Report Template.docx',
      sharedBy: 'Emma Wilson',
      groupName: 'Chemistry Lab Partners',
      timestamp: '1 day ago',
      type: 'document'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Share Sync
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate, share documents, and work together seamlessly
          </p>
        </div>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          label="My Groups"
          value={myGroups.length}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={FileText}
          label="Shared Files"
          value={47} // Mock value
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          icon={MessageCircle}
          label="Unread Messages"
          value={5}
          gradient="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={CheckSquare}
          label="Active Projects"
          value={3}
          gradient="from-orange-500 to-red-500"
        />
        <StatCard
          icon={Trophy}
          label="Competitions"
          value={myGroups.reduce((sum, g) => sum + g.competitions.filter(c => c.status === 'active').length, 0)}
          gradient="from-yellow-500 to-amber-500"
        />
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Shared Files */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-600" />
              Recently Shared
            </h3>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentSharedFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.sharedBy} • {file.groupName} • {file.timestamp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Share File
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Meeting
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CheckSquare className="w-4 h-4 mr-2" />
              Create Project
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Start Competition
            </Button>
          </div>
        </div>
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
            { id: 'my-groups', label: 'My Groups' },
            { id: 'public', label: 'Public' },
            { id: 'all', label: 'All' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id as any)}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                filter === option.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredGroups.map((group) => (
            <ShareSyncGroupCard key={group.id} group={group} currentUserId={currentUserId} />
          ))}
        </AnimatePresence>
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            {filter === 'my-groups' 
              ? "You haven't joined any groups yet"
              : 'No groups match your search'
            }
          </p>
          {filter === 'my-groups' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Group
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: any) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 bg-card border border-border rounded-xl"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={cn('p-2 rounded-lg bg-gradient-to-br', gradient, 'bg-opacity-10')}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-green-600" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </motion.div>
  );
}

function ShareSyncGroupCard({ group, currentUserId }: any) {
  const isMember = group.members.some((m: any) => m.userId === currentUserId);
  const memberCount = group.members.length;
  const sharedFilesCount = Math.floor(Math.random() * 20) + 5; // Mock
  const unreadMessages = Math.floor(Math.random() * 10); // Mock

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
            {group.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold">{group.name}</h3>
            <p className="text-xs text-muted-foreground">{group.courseName}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <Users className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-sm font-bold">{memberCount}</div>
          <div className="text-xs text-muted-foreground">Members</div>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <FileText className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-sm font-bold">{sharedFilesCount}</div>
          <div className="text-xs text-muted-foreground">Files</div>
        </div>
        <div className="text-center p-2 bg-muted/30 rounded-lg">
          <MessageCircle className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-sm font-bold">{unreadMessages}</div>
          <div className="text-xs text-muted-foreground">New</div>
        </div>
      </div>

      {/* Active Projects */}
      {group.settings.allowProjects && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 text-xs">
            <CheckSquare className="w-3 h-3 text-blue-600" />
            <span className="font-medium text-blue-700 dark:text-blue-400">2 active projects</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {isMember ? (
          <>
            <Button size="sm" className="flex-1" variant="outline">
              <MessageCircle className="w-3 h-3 mr-1" />
              Chat
            </Button>
            <Button size="sm" className="flex-1">
              <Folder className="w-3 h-3 mr-1" />
              Files
            </Button>
          </>
        ) : (
          <Button size="sm" className="flex-1">
            <UserPlus className="w-3 h-3 mr-1" />
            Join Group
          </Button>
        )}
      </div>

      {/* Visibility Badge */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {group.settings.visibility === 'public' ? (
            <>
              <Globe className="w-3 h-3" />
              Public
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              Private
            </>
          )}
        </div>
        {group.competitions.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <Trophy className="w-3 h-3" />
            {group.competitions.filter((c: any) => c.status === 'active').length} active
          </div>
        )}
      </div>
    </motion.div>
  );
}

