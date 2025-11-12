import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Calculator, GraduationCap, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface GPACalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const gradePoints: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0
};

const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];

export function GPACalculatorModal({ isOpen, onClose }: GPACalculatorModalProps) {
  // Load from localStorage or use current courses
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('gpa_calculator_courses');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: '1', name: 'Calculus II', credits: 4, grade: 'A-' },
      { id: '2', name: 'Biology 101', credits: 4, grade: 'B+' },
      { id: '3', name: 'English Literature', credits: 3, grade: 'A' },
      { id: '4', name: 'Chemistry 102', credits: 4, grade: 'B' },
      { id: '5', name: 'Physics 101', credits: 4, grade: 'A-' },
    ];
  });

  const [goalGPA, setGoalGPA] = useState<number>(3.8);

  const calculateGPA = (courseList: Course[]) => {
    if (courseList.length === 0) return 0;
    const totalPoints = courseList.reduce((sum, course) => {
      return sum + (gradePoints[course.grade] || 0) * course.credits;
    }, 0);
    const totalCredits = courseList.reduce((sum, course) => sum + course.credits, 0);
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const currentGPA = calculateGPA(courses);

  const addCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: 'New Course',
      credits: 3,
      grade: 'A'
    };
    const updated = [...courses, newCourse];
    setCourses(updated);
    localStorage.setItem('gpa_calculator_courses', JSON.stringify(updated));
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    const updated = courses.map(course =>
      course.id === id ? { ...course, [field]: value } : course
    );
    setCourses(updated);
    localStorage.setItem('gpa_calculator_courses', JSON.stringify(updated));
  };

  const deleteCourse = (id: string) => {
    const updated = courses.filter(course => course.id !== id);
    setCourses(updated);
    localStorage.setItem('gpa_calculator_courses', JSON.stringify(updated));
  };

  const calculateWhatIfGrade = () => {
    // Calculate what grade needed in remaining courses to reach goal
    const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
    const currentPoints = courses.reduce((sum, c) => sum + (gradePoints[c.grade] || 0) * c.credits, 0);
    const pointsNeeded = goalGPA * totalCredits;
    const pointsShortfall = pointsNeeded - currentPoints;
    
    return {
      pointsNeeded,
      pointsShortfall,
      achievable: pointsShortfall <= 0
    };
  };

  const whatIf = calculateWhatIfGrade();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">GPA Calculator</h2>
                  <p className="text-sm opacity-90">Calculate and track your academic progress</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Current GPA Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
                </div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {currentGPA.toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                </div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {courses.reduce((sum, c) => sum + c.credits, 0)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <p className="text-sm font-medium text-muted-foreground">Courses</p>
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {courses.length}
                </p>
              </div>
            </div>

            {/* Goal GPA Calculator */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Goal GPA
              </h3>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="0"
                  max="4"
                  step="0.01"
                  value={goalGPA}
                  onChange={(e) => setGoalGPA(parseFloat(e.target.value) || 0)}
                  className="w-24 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="flex-1">
                  {whatIf.achievable ? (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      ✓ Goal already achieved! Keep up the great work!
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      You need {whatIf.pointsShortfall.toFixed(2)} more grade points to reach your goal
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Courses List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Your Courses</h3>
                <button
                  onClick={addCourse}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add Course
                </button>
              </div>

              <div className="space-y-3">
                {courses.map((course) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Course name"
                    />
                    <input
                      type="number"
                      min="0"
                      max="6"
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, 'credits', parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-center"
                      placeholder="Credits"
                    />
                    <select
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                      className="w-24 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {gradeOptions.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade} ({gradePoints[grade].toFixed(1)})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}

                {courses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No courses added yet. Click "Add Course" to get started!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100 font-medium mb-2">💡 GPA Tips</p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>Add all your current semester courses to calculate your current GPA</li>
                <li>Set a goal GPA to see what you need to achieve it</li>
                <li>Use the "What-if" calculator to plan your academic strategy</li>
                <li>Your data is saved locally and will persist between sessions</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

