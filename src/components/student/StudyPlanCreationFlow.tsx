import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, BookOpen, Upload, Calendar, Brain,
  Target, Clock, Loader, Sparkles, CheckCircle
} from 'lucide-react';
import { useStudyPlans } from '@/contexts/StudyPlanContext';
import { StudyPlan, StudyPreferences } from '@/lib/types/studyPlan';
import { cn } from '@/lib/utils';

const mockCourses = [
  { id: '1', name: 'Calculus II', code: 'MATH 201', color: '#3b82f6' },
  { id: '2', name: 'Physics', code: 'PHYS 101', color: '#a855f7' },
  { id: '3', name: 'Computer Science', code: 'CS 150', color: '#10b981' },
  { id: '4', name: 'English Literature', code: 'ENG 202', color: '#f97316' },
  { id: '5', name: 'History', code: 'HIST 101', color: '#eab308' },
];

type Step = 'purpose' | 'class' | 'detection' | 'topics' | 'materials' | 'preferences' | 'creating';

export function StudyPlanCreationFlow() {
  const navigate = useNavigate();
  const { createStudyPlan } = useStudyPlans();
  
  const [step, setStep] = useState<Step>('purpose');
  const [purpose, setPurpose] = useState<'exam' | 'topic-mastery' | 'review' | 'concept-learning'>('exam');
  const [selectedClass, setSelectedClass] = useState('');
  const [upcomingItems, setUpcomingItems] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [planTitle, setPlanTitle] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [preferences, setPreferences] = useState<StudyPreferences>({
    sessionDuration: 60,
    learningStyle: 'mixed',
    studyTimePreference: 'afternoon',
    breakFrequency: 45
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClassSelection = async (classId: string) => {
    setSelectedClass(classId);
    setIsProcessing(true);
    
    // Simulate fetching upcoming items
    setTimeout(() => {
      const items = [
        { id: '1', title: 'Midterm Exam', type: 'exam', dueDate: '2024-11-20' },
        { id: '2', title: 'Final Project', type: 'assignment', dueDate: '2024-12-05' },
        { id: '3', title: 'Quiz 3', type: 'quiz', dueDate: '2024-11-15' },
      ];
      setUpcomingItems(items);
      setIsProcessing(false);
      setStep('detection');
    }, 1000);
  };

  const handleItemSelection = (itemId: string | null) => {
    setSelectedItem(itemId);
    if (itemId) {
      const item = upcomingItems.find(i => i.id === itemId);
      if (item) {
        setPlanTitle(`${item.title} Preparation`);
        setGoalDate(item.dueDate);
      }
    }
    setStep('topics');
  };

  const handleAddTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setTopics(topics.filter(t => t !== topic));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleCreatePlan = async () => {
    setStep('creating');
    setIsProcessing(true);

    try {
      const course = mockCourses.find(c => c.id === selectedClass)!;
      
      // Generate study tasks based on topics
      const studyTasks = topics.map((topic, index) => ({
        id: `task-${Date.now()}-${index}`,
        title: `Study: ${topic}`,
        duration: 60,
        completed: false,
        topicTags: [topic],
        understanding: 'not-started' as const
      }));

      // Add review and practice tasks
      studyTasks.push(
        {
          id: `task-review-${Date.now()}`,
          title: 'Review all topics',
          duration: 90,
          completed: false,
          topicTags: topics,
          understanding: 'not-started' as const
        },
        {
          id: `task-practice-${Date.now()}`,
          title: 'Complete practice problems',
          duration: 120,
          completed: false,
          topicTags: topics,
          understanding: 'not-started' as const
        }
      );

      const newPlan = await createStudyPlan({
        title: planTitle || 'Study Plan',
        courseId: course.id,
        courseName: course.name,
        courseColor: course.color,
        purpose,
        uploadedFiles: uploadedFiles.map((file, i) => ({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          category: 'lecture-notes' as const,
        })),
        linkedAssignments: [],
        topics,
        studyTasks,
        generatedTools: {
          flashcards: [],
          quizzes: [],
          summaries: []
        },
        goalDate: goalDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        chatHistory: [{
          id: 'msg-welcome',
          role: 'tutor' as const,
          content: `Welcome! I'm your AI tutor for "${planTitle}". I've created a personalized study plan based on the topics you want to cover. Let's start learning! What would you like to focus on first?`,
          timestamp: new Date().toISOString(),
        }],
        aiInsights: [
          'Break your study sessions into focused blocks',
          'Review regularly to improve retention',
          'Test yourself frequently with practice problems'
        ],
        source: 'custom',
        studyPreferences: preferences
      });

      setTimeout(() => {
        navigate(`/dashboard/study-buddy/${newPlan.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating study plan:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => step === 'purpose' ? navigate('/dashboard/study-buddy') : setStep('purpose')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Create Study Plan</h1>
          <p className="text-muted-foreground">Get AI assistance for learning and understanding</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { id: 'purpose', label: 'Purpose' },
          { id: 'class', label: 'Class' },
          { id: 'topics', label: 'Topics' },
          { id: 'creating', label: 'Create' },
        ].map((s, index) => {
          const stepIndex = ['purpose', 'class', 'detection', 'topics', 'materials', 'preferences', 'creating'].indexOf(step);
          const thisStepIndex = ['purpose', 'class', 'detection', 'topics', 'materials', 'preferences', 'creating'].indexOf(s.id);
          const isActive = stepIndex >= thisStepIndex;
          
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors',
                  isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                )}>
                  {index + 1}
                </div>
                <span className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {s.label}
                </span>
              </div>
              {index < 3 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-4',
                  isActive ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-card rounded-xl border border-border p-8"
        >
          {step === 'purpose' && (
            <PurposeStep purpose={purpose} setPurpose={setPurpose} onNext={() => setStep('class')} />
          )}

          {step === 'class' && (
            <ClassSelectionStep
              courses={mockCourses}
              onSelect={handleClassSelection}
            />
          )}

          {step === 'detection' && (
            <ItemDetectionStep
              isProcessing={isProcessing}
              upcomingItems={upcomingItems}
              onSelect={handleItemSelection}
            />
          )}

          {step === 'topics' && (
            <TopicsStep
              planTitle={planTitle}
              setPlanTitle={setPlanTitle}
              topics={topics}
              newTopic={newTopic}
              setNewTopic={setNewTopic}
              onAddTopic={handleAddTopic}
              onRemoveTopic={handleRemoveTopic}
              goalDate={goalDate}
              setGoalDate={setGoalDate}
              onNext={() => setStep('materials')}
            />
          )}

          {step === 'materials' && (
            <MaterialsStep
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUpload}
              onNext={() => setStep('preferences')}
            />
          )}

          {step === 'preferences' && (
            <PreferencesStep
              preferences={preferences}
              setPreferences={setPreferences}
              onNext={handleCreatePlan}
            />
          )}

          {step === 'creating' && (
            <CreatingStep />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Step Components

function PurposeStep({ purpose, setPurpose, onNext }: any) {
  const purposes = [
    { value: 'exam', label: 'Exam Preparation', description: 'Study to ace your upcoming tests and exams', icon: Target },
    { value: 'topic-mastery', label: 'Master a Topic', description: 'Deep dive and truly understand specific concepts', icon: Brain },
    { value: 'review', label: 'General Review', description: 'Review and reinforce what you\'ve learned', icon: CheckCircle },
    { value: 'concept-learning', label: 'Learn New Concepts', description: 'Build understanding of new material from scratch', icon: Sparkles },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">What do you want to learn?</h2>
      <p className="text-muted-foreground mb-6">This is for studying, not completing work. Choose your learning goal:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {purposes.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.value}
              onClick={() => setPurpose(p.value)}
              className={cn(
                'p-6 rounded-xl border-2 transition-all text-left',
                purpose === p.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <Icon className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1">{p.label}</h3>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function ClassSelectionStep({ courses, onSelect }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Which class is this for?</h2>
      <p className="text-muted-foreground mb-6">Select the course you want to study</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course: any) => (
          <button
            key={course.id}
            onClick={() => onSelect(course.id)}
            className="p-6 rounded-xl border-2 border-border hover:border-primary transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: course.color }}
              >
                {course.code.split(' ')[0]}
              </div>
              <div>
                <h3 className="font-semibold">{course.name}</h3>
                <p className="text-sm text-muted-foreground">{course.code}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function ItemDetectionStep({ isProcessing, upcomingItems, onSelect }: any) {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-semibold">Checking upcoming exams and assignments...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">I see these upcoming items:</h2>
      <p className="text-muted-foreground mb-6">Is your study plan for any of these?</p>
      
      <div className="space-y-3 mb-6">
        {upcomingItems.map((item: any) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all text-left"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="text-sm text-muted-foreground">
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • Due {new Date(item.dueDate).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>

      <button
        onClick={() => onSelect(null)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        None of these • Create custom study plan
      </button>
    </div>
  );
}

function TopicsStep({ planTitle, setPlanTitle, topics, newTopic, setNewTopic, onAddTopic, onRemoveTopic, goalDate, setGoalDate, onNext }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Study Plan Details</h2>
        <p className="text-muted-foreground mb-6">What topics do you want to cover?</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Plan Title</label>
        <input
          type="text"
          value={planTitle}
          onChange={(e) => setPlanTitle(e.target.value)}
          placeholder="e.g., Midterm Exam Prep"
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Topics to Study</label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddTopic()}
            placeholder="Add a topic (e.g., Integration, Derivatives)"
            className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={onAddTopic}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic: string) => (
            <div
              key={topic}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-2"
            >
              {topic}
              <button
                onClick={() => onRemoveTopic(topic)}
                className="hover:text-primary/70"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Goal Date (Optional)</label>
        <input
          type="date"
          value={goalDate}
          onChange={(e) => setGoalDate(e.target.value)}
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        onClick={onNext}
        disabled={!planTitle || topics.length === 0}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function MaterialsStep({ uploadedFiles, onFileUpload, onNext }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Study Materials</h2>
        <p className="text-muted-foreground mb-6">Add lecture notes, textbooks, or study guides (optional)</p>
      </div>

      <label className="flex items-center justify-center w-full p-8 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
        <input
          type="file"
          onChange={onFileUpload}
          className="hidden"
          multiple
        />
        <div className="text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">
            {uploadedFiles.length > 0 
              ? `${uploadedFiles.length} file(s) selected`
              : 'Click to upload study materials'}
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, or images</p>
        </div>
      </label>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function PreferencesStep({ preferences, setPreferences, onNext }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Study Preferences</h2>
        <p className="text-muted-foreground mb-6">Help us customize your study experience</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Session Duration</label>
          <select
            value={preferences.sessionDuration}
            onChange={(e) => setPreferences({...preferences, sessionDuration: Number(e.target.value) as any})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
            <option value={90}>1.5 hours</option>
            <option value={120}>2 hours</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Learning Style</label>
          <select
            value={preferences.learningStyle}
            onChange={(e) => setPreferences({...preferences, learningStyle: e.target.value as any})}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="visual">Visual</option>
            <option value="practice-heavy">Practice-heavy</option>
            <option value="reading">Reading</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Create Study Plan
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function CreatingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Sparkles className="w-16 h-16 text-primary mb-4" />
      </motion.div>
      <h2 className="text-2xl font-bold mb-2">Creating Your Study Plan...</h2>
      <p className="text-muted-foreground text-center max-w-md">
        AI is analyzing your topics, creating study tasks, and setting up your personalized tutor
      </p>
    </div>
  );
}

