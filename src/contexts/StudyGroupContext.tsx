import { createContext, useContext, useState, ReactNode } from 'react';
import {
  StudyGroup,
  GroupMember,
  GroupChatMessage,
  GroupCompetition
} from '../lib/types/studyPlan';

interface StudyGroupContextType {
  studyGroups: StudyGroup[];
  createGroup: (group: Omit<StudyGroup, 'id' | 'createdAt' | 'chatHistory' | 'sharedPlans' | 'competitions'>) => Promise<StudyGroup>;
  joinGroup: (groupId: string, userId: string) => void;
  leaveGroup: (groupId: string, userId: string) => void;
  sendMessage: (groupId: string, message: Omit<GroupChatMessage, 'id' | 'timestamp'>) => void;
  shareStudyPlan: (groupId: string, studyPlanId: string) => void;
  createCompetition: (groupId: string, competition: Omit<GroupCompetition, 'id' | 'leaderboard'>) => void;
  updateMemberStats: (groupId: string, userId: string, stats: Partial<GroupMember['stats']>) => void;
  getGroup: (groupId: string) => StudyGroup | undefined;
  getUserGroups: (userId: string) => StudyGroup[];
}

const StudyGroupContext = createContext<StudyGroupContextType | undefined>(undefined);

// Mock study groups
const mockStudyGroups: StudyGroup[] = [
  {
    id: 'group-1',
    name: 'Data Structures Study Squad',
    description: 'Preparing for the final exam together!',
    courseId: 'cs-201',
    courseName: 'Data Structures',
    members: [
      {
        userId: 'user-1',
        userName: 'Alex Chen',
        userEmail: 'alex@university.edu',
        role: 'owner',
        joinedAt: '2025-11-01',
        stats: { hoursStudied: 15, topicsCompleted: 8, streak: 5 }
      },
      {
        userId: 'user-2',
        userName: 'Sarah Johnson',
        userEmail: 'sarah@university.edu',
        role: 'member',
        joinedAt: '2025-11-02',
        stats: { hoursStudied: 12, topicsCompleted: 6, streak: 3 }
      },
      {
        userId: 'user-3',
        userName: 'Mike Rodriguez',
        userEmail: 'mike@university.edu',
        role: 'member',
        joinedAt: '2025-11-03',
        stats: { hoursStudied: 18, topicsCompleted: 10, streak: 7 }
      }
    ],
    createdBy: 'user-1',
    createdAt: '2025-11-01',
    settings: {
      visibility: 'private',
      allowChatFiles: true,
      allowPlanSharing: true,
      competitionsEnabled: true
    },
    chatHistory: [
      {
        id: 'msg-1',
        senderId: 'user-1',
        senderName: 'Alex Chen',
        content: 'Hey everyone! Ready to crush this exam? 💪',
        timestamp: '2025-11-10T10:00:00Z'
      },
      {
        id: 'msg-2',
        senderId: 'user-2',
        senderName: 'Sarah Johnson',
        content: 'Definitely! Should we start with graph algorithms?',
        timestamp: '2025-11-10T10:05:00Z'
      }
    ],
    sharedPlans: ['study-2'],
    competitions: [
      {
        id: 'comp-1',
        name: 'Study Sprint Challenge',
        type: 'study-hours',
        startDate: '2025-11-08',
        endDate: '2025-11-15',
        participants: ['user-1', 'user-2', 'user-3'],
        leaderboard: [
          { userId: 'user-3', userName: 'Mike Rodriguez', score: 18, rank: 1, lastUpdated: '2025-11-11' },
          { userId: 'user-1', userName: 'Alex Chen', score: 15, rank: 2, lastUpdated: '2025-11-11' },
          { userId: 'user-2', userName: 'Sarah Johnson', score: 12, rank: 3, lastUpdated: '2025-11-11' }
        ],
        prize: 'Study Champion Badge 🏆',
        status: 'active'
      }
    ]
  },
  {
    id: 'group-2',
    name: 'Physics II Masterminds',
    description: 'Understanding thermodynamics together',
    courseId: 'phys-202',
    courseName: 'Physics II',
    members: [
      {
        userId: 'user-1',
        userName: 'Alex Chen',
        userEmail: 'alex@university.edu',
        role: 'member',
        joinedAt: '2025-11-05',
        stats: { hoursStudied: 8, topicsCompleted: 4, streak: 2 }
      },
      {
        userId: 'user-4',
        userName: 'Emma Wilson',
        userEmail: 'emma@university.edu',
        role: 'owner',
        joinedAt: '2025-11-04',
        stats: { hoursStudied: 14, topicsCompleted: 7, streak: 6 }
      }
    ],
    createdBy: 'user-4',
    createdAt: '2025-11-04',
    settings: {
      visibility: 'invite-only',
      allowChatFiles: true,
      allowPlanSharing: true,
      competitionsEnabled: false
    },
    chatHistory: [
      {
        id: 'msg-1',
        senderId: 'user-4',
        senderName: 'Emma Wilson',
        content: 'Let\'s tackle entropy today!',
        timestamp: '2025-11-11T14:00:00Z'
      }
    ],
    sharedPlans: ['study-3'],
    competitions: []
  }
];

export function StudyGroupProvider({ children }: { children: ReactNode }) {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>(mockStudyGroups);

  const createGroup = async (
    groupData: Omit<StudyGroup, 'id' | 'createdAt' | 'chatHistory' | 'sharedPlans' | 'competitions'>
  ): Promise<StudyGroup> => {
    const newGroup: StudyGroup = {
      ...groupData,
      id: `group-${Date.now()}`,
      createdAt: new Date().toISOString(),
      chatHistory: [],
      sharedPlans: [],
      competitions: []
    };

    setStudyGroups(prev => [...prev, newGroup]);
    return newGroup;
  };

  const joinGroup = (groupId: string, userId: string) => {
    setStudyGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          // Check if user is already a member
          if (group.members.some(m => m.userId === userId)) {
            return group;
          }

          const newMember: GroupMember = {
            userId,
            userName: `User ${userId}`,
            userEmail: `${userId}@university.edu`,
            role: 'member',
            joinedAt: new Date().toISOString(),
            stats: { hoursStudied: 0, topicsCompleted: 0, streak: 0 }
          };

          return {
            ...group,
            members: [...group.members, newMember]
          };
        }
        return group;
      })
    );
  };

  const leaveGroup = (groupId: string, userId: string) => {
    setStudyGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.filter(m => m.userId !== userId)
          };
        }
        return group;
      })
    );
  };

  const sendMessage = (groupId: string, message: Omit<GroupChatMessage, 'id' | 'timestamp'>) => {
    setStudyGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          const newMessage: GroupChatMessage = {
            ...message,
            id: `msg-${Date.now()}`,
            timestamp: new Date().toISOString()
          };

          return {
            ...group,
            chatHistory: [...group.chatHistory, newMessage]
          };
        }
        return group;
      })
    );
  };

  const shareStudyPlan = (groupId: string, studyPlanId: string) => {
    setStudyGroups(prev =>
      prev.map(group => {
        if (group.id === groupId && !group.sharedPlans.includes(studyPlanId)) {
          return {
            ...group,
            sharedPlans: [...group.sharedPlans, studyPlanId]
          };
        }
        return group;
      })
    );
  };

  const createCompetition = (groupId: string, competition: Omit<GroupCompetition, 'id' | 'leaderboard'>) => {
    setStudyGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          const newCompetition: GroupCompetition = {
            ...competition,
            id: `comp-${Date.now()}`,
            leaderboard: competition.participants.map((userId, index) => ({
              userId,
              userName: group.members.find(m => m.userId === userId)?.userName || 'Unknown',
              score: 0,
              rank: index + 1,
              lastUpdated: new Date().toISOString()
            }))
          };

          return {
            ...group,
            competitions: [...group.competitions, newCompetition]
          };
        }
        return group;
      })
    );
  };

  const updateMemberStats = (groupId: string, userId: string, stats: Partial<GroupMember['stats']>) => {
    setStudyGroups(prev =>
      prev.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            members: group.members.map(member => {
              if (member.userId === userId) {
                return {
                  ...member,
                  stats: { ...member.stats, ...stats }
                };
              }
              return member;
            })
          };
        }
        return group;
      })
    );
  };

  const getGroup = (groupId: string) => {
    return studyGroups.find(group => group.id === groupId);
  };

  const getUserGroups = (userId: string) => {
    return studyGroups.filter(group => 
      group.members.some(member => member.userId === userId)
    );
  };

  return (
    <StudyGroupContext.Provider
      value={{
        studyGroups,
        createGroup,
        joinGroup,
        leaveGroup,
        sendMessage,
        shareStudyPlan,
        createCompetition,
        updateMemberStats,
        getGroup,
        getUserGroups
      }}
    >
      {children}
    </StudyGroupContext.Provider>
  );
}

export function useStudyGroups() {
  const context = useContext(StudyGroupContext);
  if (!context) {
    throw new Error('useStudyGroups must be used within StudyGroupProvider');
  }
  return context;
}

