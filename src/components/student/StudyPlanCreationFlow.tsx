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
import { UniversalUploader, UploadedItem } from './UniversalUploader';

const mockCourses = [
  { id: '1', name: 'Calculus II', code: 'MATH 201', color: '#3b82f6' },
  { id: '2', name: 'Physics', code: 'PHYS 101', color: '#a855f7' },
  { id: '3', name: 'Computer Science', code: 'CS 150', color: '#10b981' },
  { id: '4', name: 'English Literature', code: 'ENG 202', color: '#f97316' },
  { id: '5', name: 'History', code: 'HIST 101', color: '#eab308' },
];

type Step = 'purpose' | 'class' | 'detection' | 'topics' | 'difficulty' | 'materials' | 'time-availability' | 'preferences' | 'creating';

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
  const [difficultyRatings, setDifficultyRatings] = useState<{ [topic: string]: 1 | 2 | 3 | 4 | 5 }>({});
  const [timeAvailability, setTimeAvailability] = useState<any>(null);
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
          summaries: [],
          transcriptions: [],
          audioRecaps: [],
          imageAnalyses: []
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
        source: 'ai-generated',
        studyPreferences: preferences,
        difficultyRatings,
        timeAvailability,
        autoScheduled: true
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
        <motion.button
          onClick={() => step === 'purpose' ? navigate('/dashboard/study-buddy') : setStep('purpose')}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Create Study Plan
          </h1>
          <p className="text-muted-foreground">Get AI assistance for learning and understanding</p>
        </motion.div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { id: 'purpose', label: 'Purpose' },
          { id: 'class', label: 'Class' },
          { id: 'topics', label: 'Topics' },
          { id: 'difficulty', label: 'Difficulty' },
          { id: 'materials', label: 'Materials' },
          { id: 'time-availability', label: 'Schedule' },
          { id: 'creating', label: 'Create' },
        ].map((s, index) => {
          const allSteps = ['purpose', 'class', 'detection', 'topics', 'difficulty', 'materials', 'time-availability', 'preferences', 'creating'];
          const stepIndex = allSteps.indexOf(step);
          const thisStepIndex = allSteps.indexOf(s.id);
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
              {index < 6 && (
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
              onNext={() => setStep('difficulty')}
            />
          )}

          {step === 'difficulty' && (
            <DifficultyStep
              topics={topics}
              difficultyRatings={difficultyRatings}
              setDifficultyRatings={setDifficultyRatings}
              onNext={() => setStep('materials')}
            />
          )}

          {step === 'materials' && (
            <MaterialsStep
              uploadedFiles={uploadedFiles}
              onFileUpload={handleFileUpload}
              onNext={() => setStep('time-availability')}
            />
          )}

          {step === 'time-availability' && (
            <TimeAvailabilityStep
              timeAvailability={timeAvailability}
              setTimeAvailability={setTimeAvailability}
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

function DifficultyStep({ topics, difficultyRatings, setDifficultyRatings, onNext }: any) {
  const handleRatingChange = (topic: string, rating: 1 | 2 | 3 | 4 | 5) => {
    setDifficultyRatings((prev: any) => ({ ...prev, [topic]: rating }));
  };

  const allRated = topics.every((topic: string) => difficultyRatings[topic]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Rate Topic Difficulty</h2>
        <p className="text-muted-foreground mb-6">
          How challenging do you find each topic? This helps AI create better study plans.
        </p>
      </div>

      <div className="space-y-4">
        {topics.map((topic: string) => (
          <div key={topic} className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{topic}</h3>
              <span className="text-xs text-muted-foreground">
                {difficultyRatings[topic] 
                  ? ['Very Easy', 'Easy', 'Moderate', 'Hard', 'Very Hard'][difficultyRatings[topic] - 1]
                  : 'Not rated'}
              </span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleRatingChange(topic, rating as any)}
                  className={cn(
                    'flex-1 py-2 rounded-md transition-all font-medium text-sm',
                    difficultyRatings[topic] === rating
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-background hover:bg-primary/10'
                  )}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!allRated}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function MaterialsStep({ uploadedFiles, onFileUpload, onNext }: any) {
  const handleUpload = (items: UploadedItem[]) => {
    // Convert UploadedItems to Files for compatibility
    const files = items
      .filter(item => item.file)
      .map(item => item.file as File);
    
    // Create a synthetic event to match the existing handler
    const syntheticEvent = {
      target: {
        files: files
      }
    } as any;
    
    onFileUpload(syntheticEvent);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Upload Study Materials</h2>
        <p className="text-muted-foreground mb-6">Add lecture notes, textbooks, study guides, or links (optional)</p>
      </div>

      <UniversalUploader
        onUpload={handleUpload}
        showLinkInput={true}
        showCameraCapture={true}
        context="study-plan"
        compact={true}
      />

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploaded Files:</h3>
          {uploadedFiles.map((file: File, index: number) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1">{file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}

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

function TimeAvailabilityStep({ timeAvailability, setTimeAvailability, onNext }: any) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timeSlots = [
    { label: 'Morning (6am-12pm)', value: 'morning', hours: '6am-12pm' },
    { label: 'Afternoon (12pm-6pm)', value: 'afternoon', hours: '12pm-6pm' },
    { label: 'Evening (6pm-10pm)', value: 'evening', hours: '6pm-10pm' },
    { label: 'Night (10pm-12am)', value: 'night', hours: '10pm-12am' },
  ];

  const [availability, setAvailability] = useState<{ [key: string]: string[] }>(
    timeAvailability || days.reduce((acc: any, day) => ({ ...acc, [day]: [] }), {})
  );

  const toggleSlot = (day: string, slot: string) => {
    setAvailability((prev: any) => {
      const daySlots = prev[day] || [];
      const newSlots = daySlots.includes(slot)
        ? daySlots.filter((s: string) => s !== slot)
        : [...daySlots, slot];
      return { ...prev, [day]: newSlots };
    });
  };

  const handleContinue = () => {
    setTimeAvailability(availability);
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">When Can You Study?</h2>
        <p className="text-muted-foreground mb-6">
          Select your available time slots. AI will schedule sessions during these times.
        </p>
      </div>

      <div className="space-y-3">
        {days.map((day) => (
          <div key={day} className="border border-border rounded-lg p-4">
            <h3 className="font-medium mb-3">{day}</h3>
            <div className="grid grid-cols-2 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => toggleSlot(day, slot.value)}
                  className={cn(
                    'p-2 rounded-md text-sm transition-all',
                    availability[day]?.includes(slot.value)
                      ? 'bg-primary text-white'
                      : 'bg-muted hover:bg-muted/80'
                  )}
                >
                  {slot.hours}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleContinue}
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
          scale: { duration: 1, repeat: Infinity }
        }}
        className="mb-8"
      >
        <Sparkles className="w-20 h-20 text-primary" />
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
      >
        Creating Your Study Plan...
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-center max-w-md mb-8"
      >
        AI is analyzing your topics, creating study tasks, and setting up your personalized tutor
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-2"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

