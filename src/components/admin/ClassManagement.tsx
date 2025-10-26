import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ADMIN_CONFIG } from '../../lib/config';
import { handleError, handleSuccess } from '../../lib/errorHandler';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { CreateClassModal } from './CreateClassModal';
import { EditClassModal } from './EditClassModal';
import { ConfirmDialog } from './ConfirmDialog';
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
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = ADMIN_CONFIG.CLASS_PAGE_SIZE;

  useEffect(() => {
    loadClasses();
  }, [currentPage]);

  useEffect(() => {
    filterClasses();
  }, [searchQuery, classes]);

  const loadClasses = async () => {
    try {
      setLoading(true);

      // Get paginated classes with total count
      const from = (currentPage - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data: classesData, error: classesError, count } = await supabase
        .from('classes')
        .select('*', { count: 'exact' })
        .eq('is_active', true) // Only fetch active (non-deleted) classes
        .order('created_at', { ascending: false })
        .range(from, to);

      if (classesError) throw classesError;

      setTotalCount(count || 0);

      if (!classesData || classesData.length === 0) {
        setClasses([]);
        setLoading(false);
        return;
      }

      // Batch fetch all teachers in one query (fixes N+1 problem)
      const teacherIds = [...new Set(classesData.map(cls => cls.teacher_id))];
      const { data: teachers } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', teacherIds);

      // Create teacher lookup map
      const teacherMap = teachers?.reduce((acc, t) => ({
        ...acc,
        [t.id]: t.full_name
      }), {} as Record<string, string>) || {};

      // Batch fetch all student counts in one query (fixes N+1 problem)
      const { data: memberCounts } = await supabase
        .from('class_members')
        .select('class_id');

      // Count students per class
      const countMap = memberCounts?.reduce((acc, m) => ({
        ...acc,
        [m.class_id]: (acc[m.class_id] || 0) + 1
      }), {} as Record<string, number>) || {};

      // Combine data
      const classesWithDetails = classesData.map(cls => ({
        ...cls,
        teacher_name: teacherMap[cls.teacher_id] || 'Unknown Teacher',
        student_count: countMap[cls.id] || 0,
      }));

      setClasses(classesWithDetails);
    } catch (error) {
      handleError(error as Error, {
        action: 'load_classes',
        component: 'ClassManagement',
      });
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

  const handleDeleteClass = async () => {
    if (!deletingClass) return;

    setDeleting(true);
    try {
      // Soft delete: set is_active = false and deleted_at = NOW()
      const { error } = await supabase
        .from('classes')
        .update({
          is_active: false,
          deleted_at: new Date().toISOString(),
        })
        .eq('id', deletingClass.id);

      if (error) throw error;

      // Refresh the class list
      await loadClasses();
      handleSuccess(`Class "${deletingClass.name}" deleted successfully`);
      setDeletingClass(null);
    } catch (err: any) {
      handleError(err, {
        action: 'delete_class',
        component: 'ClassManagement',
        metadata: { classId: deletingClass.id, className: deletingClass.name },
      });
    } finally {
      setDeleting(false);
    }
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
                      onClick={() => setEditingClass(cls)}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                      title="Edit class"
                      aria-label="Edit class"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeletingClass(cls)}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      title="Delete class"
                      aria-label="Delete class"
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

      {/* Pagination Controls */}
      {!loading && filteredClasses.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * PAGE_SIZE) + 1} to {Math.min(currentPage * PAGE_SIZE, totalCount)} of {totalCount} classes
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.ceil(totalCount / PAGE_SIZE) }, (_, i) => i + 1)
                .filter(page => {
                  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, idx, arr) => (
                  <div key={page} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== page - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? 'bg-purple-600 hover:bg-purple-700' : ''}
                    >
                      {page}
                    </Button>
                  </div>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / PAGE_SIZE), p + 1))}
              disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      <CreateClassModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onClassCreated={loadClasses}
      />

      {/* Edit Class Modal */}
      {editingClass && (
        <EditClassModal
          open={!!editingClass}
          onOpenChange={(open) => !open && setEditingClass(null)}
          onClassUpdated={loadClasses}
          classId={editingClass.id}
          initialData={{
            name: editingClass.name,
            subject: editingClass.subject,
            description: editingClass.description || '',
            teacherId: editingClass.teacher_id,
          }}
        />
      )}

      {/* Delete Class Confirmation */}
      {deletingClass && (
        <ConfirmDialog
          open={!!deletingClass}
          onOpenChange={(open) => !open && setDeletingClass(null)}
          onConfirm={handleDeleteClass}
          title="Delete Class"
          description={`Are you sure you want to delete "${deletingClass.name}"? This action cannot be undone.`}
          confirmText="Delete Class"
          confirmVariant="destructive"
          loading={deleting}
        />
      )}
    </div>
  );
}
