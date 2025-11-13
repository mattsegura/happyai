import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { handleError, handleSuccess } from '../../lib/errorHandler';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
  GraduationCap,
  Plus,
  Edit2,
  Search,
  Building2,
  Globe,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';

interface University {
  id: string;
  name: string;
  domain: string | null;
  canvas_account_id: string | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  _count?: {
    users?: number;
    classes?: number;
  };
}

export function UniversityManagement() {
  const { role } = useAuth();
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);

  // Only super admins can access this
  const isSuperAdmin = role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      loadUniversities();
    }
  }, [isSuperAdmin]);

  const loadUniversities = async () => {
    try {
      setLoading(true);

      // Fetch all universities
      const { data: universitiesData, error: universitiesError } = await supabase
        .from('universities')
        .select('*')
        .order('name', { ascending: true });

      if (universitiesError) throw universitiesError;

      // Fetch user counts for each university
      const universitiesWithCounts = await Promise.all(
        (universitiesData || []).map(async (uni) => {
          const { count: userCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('university_id', uni.id);

          const { count: classCount } = await supabase
            .from('classes')
            .select('*', { count: 'exact', head: true })
            .eq('university_id', uni.id);

          return {
            ...uni,
            _count: {
              users: userCount || 0,
              classes: classCount || 0,
            },
          };
        })
      );

      setUniversities(universitiesWithCounts);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to load universities'), {
        component: 'UniversityManagement',
        action: 'Loading universities',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (universityData: Partial<University>) => {
    try {
      if (editingUniversity) {
        // Update existing university
        const { error } = await supabase
          .from('universities')
          .update({
            name: universityData.name,
            domain: universityData.domain || null,
            canvas_account_id: universityData.canvas_account_id || null,
            logo_url: universityData.logo_url || null,
            is_active: universityData.is_active ?? true,
          })
          .eq('id', editingUniversity.id);

        if (error) throw error;

        handleSuccess(`${universityData.name} has been updated successfully.`);
      } else {
        // Create new university
        const { error } = await supabase.from('universities').insert({
          name: universityData.name,
          domain: universityData.domain || null,
          canvas_account_id: universityData.canvas_account_id || null,
          logo_url: universityData.logo_url || null,
          is_active: true,
        });

        if (error) throw error;

        handleSuccess(`${universityData.name} has been created successfully.`);
      }

      setShowModal(false);
      setEditingUniversity(null);
      loadUniversities();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(editingUniversity ? 'Failed to update university' : 'Failed to create university'), {
        component: 'UniversityManagement',
        action: editingUniversity ? 'Updating university' : 'Creating university',
      });
    }
  };

  const handleToggleActive = async (university: University) => {
    try {
      const { error } = await supabase
        .from('universities')
        .update({ is_active: !university.is_active })
        .eq('id', university.id);

      if (error) throw error;

      handleSuccess(
        `${university.name} has been ${university.is_active ? 'deactivated' : 'activated'}.`
      );

      loadUniversities();
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to update university status'), {
        component: 'UniversityManagement',
        action: 'Toggling university status',
      });
    }
  };

  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (uni.domain && uni.domain.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isSuperAdmin) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-border/60 bg-card">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">Access Denied</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Only super administrators can manage universities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">University Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all universities in the platform
          </p>
        </div>
        <Button onClick={() => {
          setEditingUniversity(null);
          setShowModal(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add University
        </Button>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search universities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Universities List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredUniversities.map((university, index) => (
            <motion.div
              key={university.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
            <Card className={!university.is_active ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{university.name}</h3>
                      {university.domain && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="h-3 w-3" />
                          {university.domain}
                        </div>
                      )}
                      {university.canvas_account_id && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Building2 className="h-3 w-3" />
                          Canvas: {university.canvas_account_id}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`rounded-full p-1 ${university.is_active ? 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                    {university.is_active ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mt-4 flex gap-4 border-t border-border/50 pt-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                  >
                    <div className="text-2xl font-bold text-foreground">
                      {university._count?.users || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + index * 0.05 }}
                  >
                    <div className="text-2xl font-bold text-foreground">
                      {university._count?.classes || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Classes</div>
                  </motion.div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUniversity(university);
                        setShowModal(true);
                      }}
                      className="w-full"
                    >
                      <Edit2 className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </motion.div>
                  <motion.div className="flex-1" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(university)}
                      className="w-full"
                    >
                      {university.is_active ? (
                        <>
                          <XCircle className="mr-1 h-3 w-3" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Activate
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUniversities.length === 0 && (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-border/60 bg-card">
          <div className="text-center">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">No universities found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Get started by adding a university'}
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <UniversityModal
          university={editingUniversity}
          onClose={() => {
            setShowModal(false);
            setEditingUniversity(null);
          }}
          onSave={handleCreateOrUpdate}
        />
      )}
    </motion.div>
  );
}

// Modal Component
interface UniversityModalProps {
  university: University | null;
  onClose: () => void;
  onSave: (data: Partial<University>) => Promise<void>;
}

function UniversityModal({ university, onClose, onSave }: UniversityModalProps) {
  const [formData, setFormData] = useState({
    name: university?.name || '',
    domain: university?.domain || '',
    canvas_account_id: university?.canvas_account_id || '',
    logo_url: university?.logo_url || '',
    is_active: university?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
      <Card className="w-full max-w-lg">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-foreground">
            {university ? 'Edit University' : 'Add University'}
          </h3>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">
                University Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Stanford University"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Domain (for auto-assignment)
              </label>
              <Input
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="e.g., stanford.edu"
                type="text"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Users with emails matching this domain will be auto-assigned to this university
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Canvas Account ID
              </label>
              <Input
                value={formData.canvas_account_id}
                onChange={(e) => setFormData({ ...formData, canvas_account_id: e.target.value })}
                placeholder="e.g., 12345"
                type="text"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Canvas root account ID for syncing Canvas data
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">
                Logo URL
              </label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
                type="url"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" isLoading={saving} className="flex-1">
                {university ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
