import { useState, useEffect } from 'react';
import { X, Users, GraduationCap, Search, Check, Loader2, Hash } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

type AvailableClass = {
  id: string;
  name: string;
  description: string | null;
  teacher_name: string;
  class_code: string;
  subject: string | null;
};

type BrowseClassesModalProps = {
  onClose: () => void;
  onClassJoined: () => void;
};

export function BrowseClassesModal({ onClose, onClassJoined }: BrowseClassesModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [joiningClassId, setJoiningClassId] = useState<string | null>(null);
  const [classes, setClasses] = useState<AvailableClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableClasses();
  }, [user]);

  const fetchAvailableClasses = async () => {
    if (!user) return;

    try {
      // Get all active classes (you can add filters here like university_id)
      const { data: allClasses, error } = await supabase
        .from('classes')
        .select('id, name, description, teacher_name, class_code, subject')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user's current enrollments
      const { data: enrollments } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('user_id', user.id);

      const enrolledIds = new Set(enrollments?.map(e => e.class_id) || []);

      // Filter out already enrolled classes
      const availableClasses = (allClasses || []).filter(c => !enrolledIds.has(c.id));

      setClasses(availableClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleJoinClass = async (classItem: AvailableClass) => {
    if (!user) return;

    setJoiningClassId(classItem.id);

    try {
      // Join the class
      const { error } = await supabase
        .from('class_members')
        .insert({
          user_id: user.id,
          class_id: classItem.id,
          class_points: 0,
          joined_at: new Date().toISOString(),
        });

      if (error) throw error;

      setJoiningClassId(null);
      onClassJoined();
      onClose();
    } catch (error) {
      console.error('Error joining class:', error);
      alert('Failed to join class. Please try again.');
      setJoiningClassId(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Browse Available Classes
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 border-b border-border">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search classes or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-muted/30 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Loading available classes...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No classes found matching your search' : 'No classes available to join'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredClasses.map((classItem) => (
                <div
                  key={classItem.id}
                  className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">{classItem.name}</h3>
                        <p className="text-sm text-muted-foreground">by {classItem.teacher_name}</p>
                      </div>
                    </div>

                    {/* Class Code Badge */}
                    <button
                      onClick={() => handleCopyCode(classItem.class_code)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                      title="Click to copy class code"
                    >
                      <Hash className="w-4 h-4" />
                      <span className="font-mono font-semibold">{classItem.class_code}</span>
                      {copiedCode === classItem.class_code && (
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{classItem.description || 'No description available'}</p>

                  <button
                    onClick={() => handleJoinClass(classItem)}
                    disabled={joiningClassId === classItem.id}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {joiningClassId === classItem.id ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Join Class</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
