/**
 * Student Lookup Component
 *
 * Provides search and filtering for students within a class:
 * - Search by name/email with fuzzy matching
 * - Quick filters: At-risk, Top performers, Low participation
 * - Recent searches history
 * - Click on student to view full report
 *
 * Phase 3: Student Search & Reports
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, Users, AlertTriangle, Trophy, UserMinus, Clock, Loader2 } from 'lucide-react';
import {
  searchStudents,
  getAtRiskStudents,
  getTopPerformers,
  getLowParticipationStudents,
  type StudentSearchResult,
} from '../../../lib/students/studentDataService';

type FilterType = 'all' | 'at-risk' | 'top-performers' | 'low-participation';

interface StudentLookupProps {
  classId: string;
  teacherId: string;
  onStudentSelect: (studentId: string) => void;
}

export function StudentLookup({ classId, teacherId, onStudentSelect }: StudentLookupProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<StudentSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load students based on active filter
  useEffect(() => {
    loadStudents();
  }, [classId, teacherId, activeFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      let results: StudentSearchResult[] = [];

      switch (activeFilter) {
        case 'at-risk':
          results = await getAtRiskStudents(teacherId, classId);
          break;
        case 'top-performers':
          results = await getTopPerformers(teacherId, classId);
          break;
        case 'low-participation':
          results = await getLowParticipationStudents(teacherId, classId);
          break;
        default:
          results = await searchStudents(teacherId, classId, '');
      }

      setStudents(results);
    } catch (error) {
      console.error('[StudentLookup] Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;

    const lowerQuery = searchQuery.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(lowerQuery) || s.email.toLowerCase().includes(lowerQuery)
    );
  }, [students, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query)) {
      setRecentSearches((prev) => [query, ...prev.slice(0, 4)]);
    }
  };

  const handleStudentClick = (studentId: string) => {
    onStudentSelect(studentId);
  };

  const getRiskBadge = (riskLevel: StudentSearchResult['riskLevel']) => {
    switch (riskLevel) {
      case 'high':
        return (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
            High Risk
          </span>
        );
      case 'medium':
        return (
          <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
            Moderate Risk
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Student Lookup</h3>
          <p className="text-sm text-muted-foreground">Search and view detailed student reports</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full rounded-xl border-2 border-border bg-muted py-3 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:border-blue-400 focus:outline-none dark:focus:border-blue-600"
        />
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeFilter === 'all'
              ? 'bg-blue-500 text-white shadow-md dark:bg-blue-600'
              : 'bg-muted text-foreground hover:bg-muted/80 dark:bg-muted/50'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>All Students</span>
        </button>

        <button
          onClick={() => setActiveFilter('at-risk')}
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeFilter === 'at-risk'
              ? 'bg-red-500 text-white shadow-md dark:bg-red-600'
              : 'bg-muted text-foreground hover:bg-muted/80 dark:bg-muted/50'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          <span>At Risk</span>
        </button>

        <button
          onClick={() => setActiveFilter('top-performers')}
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeFilter === 'top-performers'
              ? 'bg-green-500 text-white shadow-md dark:bg-green-600'
              : 'bg-muted text-foreground hover:bg-muted/80 dark:bg-muted/50'
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Top Performers</span>
        </button>

        <button
          onClick={() => setActiveFilter('low-participation')}
          className={`flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
            activeFilter === 'low-participation'
              ? 'bg-orange-500 text-white shadow-md dark:bg-orange-600'
              : 'bg-muted text-foreground hover:bg-muted/80 dark:bg-muted/50'
          }`}
        >
          <UserMinus className="h-4 w-4" />
          <span>Low Participation</span>
        </button>
      </div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && !searchQuery && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-2 flex items-center space-x-2 text-sm font-semibold text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Recent Searches</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((query, idx) => (
              <button
                key={idx}
                onClick={() => setSearchQuery(query)}
                className="rounded-lg bg-muted px-3 py-1 text-sm text-foreground hover:bg-muted/80 dark:bg-muted/50"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading students...</p>
          </div>
        </div>
      )}

      {/* Student List */}
      {!loading && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
          </p>

          {filteredStudents.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-foreground">No students found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}

          {filteredStudents.map((student) => {
            const daysSinceCheck = student.lastPulseCheck
              ? Math.floor((Date.now() - new Date(student.lastPulseCheck).getTime()) / (1000 * 60 * 60 * 24))
              : 999;

            return (
              <button
                key={student.id}
                onClick={() => handleStudentClick(student.id)}
                className="w-full rounded-xl border-2 border-border bg-card p-4 text-left transition-all hover:border-blue-300 hover:shadow-md dark:hover:border-blue-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center space-x-2">
                      <h4 className="font-bold text-foreground">{student.name}</h4>
                      {getRiskBadge(student.riskLevel)}
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">{student.email}</p>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Class Points</p>
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{student.classPoints}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Streak</p>
                        <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{student.currentStreak}d</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Check</p>
                        <p
                          className={`text-sm font-semibold ${
                            daysSinceCheck >= 5
                              ? 'text-red-600 dark:text-red-400'
                              : daysSinceCheck >= 3
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          {student.lastPulseCheck ? `${daysSinceCheck}d ago` : 'Never'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Recent Emotions</p>
                        <div className="mt-1 flex space-x-1">
                          {student.recentEmotions.slice(0, 3).map((emotion, idx) => (
                            <span
                              key={idx}
                              className={`rounded px-2 py-0.5 text-xs font-semibold ${
                                ['sad', 'anxious', 'stressed', 'scared', 'worried', 'lonely'].includes(emotion)
                                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                  : ['happy', 'excited', 'grateful', 'hopeful', 'inspired', 'proud'].includes(emotion)
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                              }`}
                            >
                              {emotion}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 text-blue-600 dark:text-blue-400">
                    <span className="text-sm font-semibold">View Report →</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
