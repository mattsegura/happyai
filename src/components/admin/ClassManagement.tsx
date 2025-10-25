import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CreateClassModal } from './CreateClassModal';
import {
  GraduationCap,
  Search,
  Users,
  Calendar,
  Edit,
  Trash2,
  Plus,
  UserPlus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Class {
  id: string;
  name: string;
  subject: string;
  description?: string;
  teacher_id: string;
  created_at: string;
  teacher_name?: string;
  student_count?: number;
}

export function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, classes]);

  const loadClasses = async () => {
    try {
      // Get all classes
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (classesError) throw classesError;

      // Get teacher info for each class
      const classesWithDetails = await Promise.all(
        (classesData || []).map(async (cls) => {
          // Get teacher name
          const { data: teacherData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', cls.teacher_id)
            .single();

          // Get student count
          const { count: studentCount } = await supabase
            .from('class_members')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', cls.id);

          return {
            ...cls,
            teacher_name: teacherData?.full_name || 'Unknown Teacher',
            student_count: studentCount || 0,
          };
        })
      );

      setClasses(classesWithDetails);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;

    if (searchQuery) {
      filtered = filtered.filter(
        (cls) =>
          cls.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cls.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredClasses(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSubjectColor = (subject: string) => {
    const colors: Record<string, string> = {
      Mathematics: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      Science: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      English: 'bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400',
      History: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
      Art: 'bg-pink-100 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400',
    };
    return colors[subject] || 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Class Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage all classes across the platform
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by class name, subject, or teacher..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Total Classes</p>
          <p className="text-2xl font-bold text-foreground">{classes.length}</p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-2xl font-bold text-foreground">
            {classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0)}
          </p>
        </div>
        <div className="rounded-lg border border-border/60 bg-background/50 p-4">
          <p className="text-sm text-muted-foreground">Avg. Class Size</p>
          <p className="text-2xl font-bold text-foreground">
            {classes.length > 0
              ? Math.round(
                  classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0) /
                    classes.length
                )
              : 0}
          </p>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted"></div>
          ))}
        </div>
      ) : filteredClasses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <Card key={cls.id} className="transition hover:shadow-lg">
              <CardContent className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      title="Edit class"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      title="Delete class"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="mb-2 text-lg font-bold text-foreground">{cls.name}</h3>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-semibold',
                        getSubjectColor(cls.subject)
                      )}
                    >
                      {cls.subject}
                    </span>
                  </div>

                  {cls.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {cls.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 border-t border-border/60 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Teacher</span>
                    <span className="font-semibold text-foreground">
                      {cls.teacher_name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Students</span>
                    <span className="flex items-center gap-1 font-semibold text-foreground">
                      <Users className="h-3 w-3" />
                      {cls.student_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(cls.created_at)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    <UserPlus className="mr-1 h-3 w-3" />
                    Enroll Students
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border/60 bg-background py-12">
          <GraduationCap className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">No classes found</p>
          <p className="text-xs text-muted-foreground">
            Try adjusting your search or create a new class
          </p>
        </div>
      )}

      {/* Create Class Modal */}
      <CreateClassModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onClassCreated={loadClasses}
      />
    </div>
  );
}
