import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, FileText, Upload, Calendar, BookOpen,
  CheckCircle, Sparkles, Loader
} from 'lucide-react';
import { useAssignments } from '@/contexts/AssignmentContext';
import { Assignment, UploadedFile } from '@/lib/types/assignment';
import { parseInstructions, generateChecklist } from '@/lib/ai/instructionParser';
import { extractTextFromFile, findMatchingAssignments } from '@/lib/ai/fileContextDetection';
import { cn } from '@/lib/utils';
import { UniversalUploader, UploadedItem } from './UniversalUploader';

const mockCourses = [
  { id: '1', name: 'Calculus II', code: 'MATH 201', color: '#3b82f6' },
  { id: '2', name: 'Physics', code: 'PHYS 101', color: '#a855f7' },
  { id: '3', name: 'Computer Science', code: 'CS 150', color: '#10b981' },
  { id: '4', name: 'English Literature', code: 'ENG 202', color: '#f97316' },
  { id: '5', name: 'History', code: 'HIST 101', color: '#eab308' },
];

type Step = 'type' | 'class' | 'detection' | 'details' | 'creating';

export function AssignmentCreationFlow() {
  const navigate = useNavigate();
  const { createAssignment } = useAssignments();
  
  const [step, setStep] = useState<Step>('type');
  const [selectedClass, setSelectedClass] = useState('');
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentType, setAssignmentType] = useState<'assignment' | 'project' | 'essay'>('assignment');
  const [dueDate, setDueDate] = useState('');
  const [instructionFile, setInstructionFile] = useState<File | null>(null);
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClassSelection = async (classId: string) => {
    setSelectedClass(classId);
    setIsProcessing(true);
    
    // Simulate fetching upcoming assignments
    setTimeout(() => {
      const matches = [
        { id: '1', title: 'Literary Analysis Essay', dueDate: '2024-11-20' },
        { id: '2', title: 'Final Project Proposal', dueDate: '2024-11-25' },
      ];
      setUpcomingAssignments(matches);
      setIsProcessing(false);
      setStep('detection');
    }, 1000);
  };

  const handleAssignmentSelection = (assignmentId: string | null) => {
    setSelectedExisting(assignmentId);
    if (assignmentId) {
      const assignment = upcomingAssignments.find(a => a.id === assignmentId);
      if (assignment) {
        setAssignmentTitle(assignment.title);
        setDueDate(assignment.dueDate);
      }
    }
    setStep('details');
  };

  const handleInstructionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInstructionFile(file);
    }
  };

  const handleSupportingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSupportingFiles(prev => [...prev, ...files]);
  };

  const handleCreateAssignment = async () => {
    setStep('creating');
    setIsProcessing(true);

    try {
      const course = mockCourses.find(c => c.id === selectedClass)!;
      
      // Parse instructions if file provided
      let parsedInstructions: any = {
        requirements: [],
        rubric: [],
        sections: ['Introduction', 'Body', 'Conclusion'],
        keyPoints: [],
      };
      
      if (instructionFile) {
        const extractedText = await extractTextFromFile(instructionFile);
        parsedInstructions = await parseInstructions(extractedText);
      }

      // Create assignment object
      const newAssignment = await createAssignment({
        title: assignmentTitle || 'Untitled Assignment',
        courseId: course.id,
        courseName: course.name,
        courseColor: course.color,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'not-started',
        phase: 'outline',
        type: assignmentType,
        instructionFiles: instructionFile ? [{
          id: `file-${Date.now()}`,
          name: instructionFile.name,
          type: instructionFile.type,
          size: instructionFile.size,
          uploadedAt: new Date().toISOString(),
          category: 'instruction' as const,
        }] : [],
        supportingFiles: supportingFiles.map((file, i) => ({
          id: `file-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          category: 'supporting' as const,
        })),
        draftFiles: [],
        parsedInstructions,
        checklist: generateChecklist(parsedInstructions, `temp-${Date.now()}`),
        aiSuggestions: [
          'Start by understanding all requirements',
          'Break down the work into manageable tasks',
          'Set aside dedicated time for each phase',
        ],
        estimatedTimeRemaining: (parsedInstructions.estimatedHours || 10) * 60,
        chatHistory: [{
          id: 'msg-welcome',
          role: 'assistant' as const,
          content: `Welcome! I'm your AI assistant for "${assignmentTitle}". I've analyzed the instructions and created a personalized checklist for you. Let's work together to make this assignment great! What would you like to start with?`,
          timestamp: new Date().toISOString(),
        }],
        linkedStudyPlans: [],
        linkedCalendarEvents: [],
      });

      // Navigate to the workspace
      setTimeout(() => {
        navigate(`/dashboard/assignments/${newAssignment.id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating assignment:', error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <motion.button
          onClick={() => step === 'type' ? navigate('/dashboard/assignments') : setStep('type')}
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
            Create Assignment
          </h1>
          <p className="text-muted-foreground">Get AI assistance with your work</p>
        </motion.div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { id: 'type', label: 'Type' },
          { id: 'class', label: 'Class' },
          { id: 'detection', label: 'Detect' },
          { id: 'details', label: 'Details' },
          { id: 'creating', label: 'Create' },
        ].map((s, index) => {
          const stepIndex = ['type', 'class', 'detection', 'details', 'creating'].indexOf(step);
          const thisStepIndex = ['type', 'class', 'detection', 'details', 'creating'].indexOf(s.id);
          const isActive = stepIndex >= thisStepIndex;
          const isCompleted = stepIndex > thisStepIndex;
          
          return (
            <div key={s.id} className="flex items-center flex-1">
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-all duration-300',
                    isCompleted
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg'
                      : isActive
                      ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg'
                      : 'bg-muted text-muted-foreground'
                  )}
                  whileHover={isActive || isCompleted ? { scale: 1.1 } : {}}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </motion.div>
                <span className={cn(
                  'text-sm font-medium transition-colors',
                  isActive || isCompleted ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {s.label}
                </span>
              </motion.div>
              {index < 4 && (
                <motion.div
                  className={cn(
                    'flex-1 h-0.5 mx-4 transition-all duration-300',
                    isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : isActive
                      ? 'bg-gradient-to-r from-primary to-accent'
                      : 'bg-muted'
                  )}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                />
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
          transition={{ duration: 0.3 }}
          className="bg-card rounded-xl border border-border p-8 shadow-lg"
        >
          {step === 'type' && (
            <TypeSelectionStep
              assignmentType={assignmentType}
              setAssignmentType={setAssignmentType}
              onNext={() => setStep('class')}
            />
          )}

          {step === 'class' && (
            <ClassSelectionStep
              courses={mockCourses}
              selectedClass={selectedClass}
              onSelect={handleClassSelection}
            />
          )}

          {step === 'detection' && (
            <AssignmentDetectionStep
              isProcessing={isProcessing}
              upcomingAssignments={upcomingAssignments}
              onSelect={handleAssignmentSelection}
            />
          )}

          {step === 'details' && (
            <DetailsStep
              assignmentTitle={assignmentTitle}
              setAssignmentTitle={setAssignmentTitle}
              assignmentType={assignmentType}
              dueDate={dueDate}
              setDueDate={setDueDate}
              instructionFile={instructionFile}
              onInstructionUpload={handleInstructionUpload}
              supportingFiles={supportingFiles}
              onSupportingUpload={handleSupportingUpload}
              onNext={handleCreateAssignment}
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

function TypeSelectionStep({ assignmentType, setAssignmentType, onNext }: any) {
  const types = [
    {
      value: 'assignment',
      label: 'Assignment',
      description: 'Homework, problem sets, or general coursework',
      icon: '📝',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      value: 'project',
      label: 'Project',
      description: 'Long-term research projects or presentations',
      icon: '🎯',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      value: 'essay',
      label: 'Essay',
      description: 'Writing assignments, papers, or reports',
      icon: '✍️',
      gradient: 'from-orange-500 to-red-500',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">What type of work is this?</h2>
        <p className="text-muted-foreground">Choose the category that best describes your assignment</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {types.map((type) => (
          <motion.button
            key={type.value}
            onClick={() => setAssignmentType(type.value)}
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'p-6 rounded-2xl border-2 transition-all text-left relative overflow-hidden',
              assignmentType === type.value
                ? 'border-primary shadow-xl'
                : 'border-border hover:border-primary/50 shadow-sm'
            )}
          >
            <div className={cn(
              'absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full -mr-16 -mt-16',
              type.gradient
            )} />
            
            <div className="relative z-10">
              <div className="text-4xl mb-3">{type.icon}</div>
              <h3 className="text-xl font-bold mb-2">{type.label}</h3>
              <p className="text-sm text-muted-foreground">{type.description}</p>
              
              {assignmentType === type.value && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-4 right-4"
                >
                  <CheckCircle className="w-6 h-6 text-primary" />
                </motion.div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.button
        onClick={onNext}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
      >
        Continue
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

function ClassSelectionStep({ courses, selectedClass, onSelect }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">What class is this for?</h2>
        <p className="text-muted-foreground">Select the course for this assignment</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {courses.map((course: any, index: number) => (
          <motion.button
            key={course.id}
            onClick={() => onSelect(course.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-xl border-2 border-border hover:border-primary hover:shadow-xl transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shadow-lg"
                style={{ backgroundColor: course.color }}
                whileHover={{ rotate: 5 }}
              >
                {course.code.split(' ')[0]}
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg">{course.name}</h3>
                <p className="text-sm text-muted-foreground">{course.code}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function AssignmentDetectionStep({ isProcessing, upcomingAssignments, onSelect }: any) {
  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-lg font-semibold">Checking upcoming assignments...</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">I see these upcoming assignments:</h2>
      <p className="text-muted-foreground mb-6">Is it for any of these?</p>
      
      <div className="space-y-3 mb-6">
        {upcomingAssignments.map((assignment: any) => (
          <button
            key={assignment.id}
            onClick={() => onSelect(assignment.id)}
            className="w-full p-4 rounded-lg border-2 border-border hover:border-primary transition-all text-left"
          >
            <h3 className="font-semibold">{assignment.title}</h3>
            <p className="text-sm text-muted-foreground">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() => onSelect(null)}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        None of these • Create new assignment
      </button>
    </div>
  );
}

function DetailsStep({
  assignmentTitle,
  setAssignmentTitle,
  assignmentType,
  dueDate,
  setDueDate,
  instructionFile,
  onInstructionUpload,
  supportingFiles,
  onSupportingUpload,
  onNext
}: any) {
  const placeholders = {
    assignment: 'e.g., Calculus Problem Set 5',
    project: 'e.g., Final Research Project',
    essay: 'e.g., Literary Analysis Essay',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Assignment Details</h2>
        <p className="text-muted-foreground">Let's set up your workspace</p>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-semibold mb-2">Title</label>
        <input
          type="text"
          value={assignmentTitle}
          onChange={(e) => setAssignmentTitle(e.target.value)}
          placeholder={placeholders[assignmentType as keyof typeof placeholders]}
          className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-semibold mb-2">Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-4 py-3 border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label className="block text-sm font-semibold mb-2">Upload Files (Optional)</label>
        <p className="text-xs text-muted-foreground mb-3">Instructions, drafts, notes, research, or any supporting materials</p>
        <UniversalUploader
          onUpload={(items) => {
            // Convert UploadedItems to Files for compatibility
            const files = items
              .filter(item => item.file)
              .map(item => item.file as File);
            
            if (files.length > 0) {
              // First file becomes instruction if no instruction file yet
              if (!instructionFile && files[0]) {
                const syntheticEvent = {
                  target: {
                    files: [files[0]]
                  }
                } as any;
                onInstructionUpload(syntheticEvent);
              }
              
              // Remaining files are supporting files
              if (files.length > 1 || instructionFile) {
                const supportingFilesToAdd = instructionFile ? files : files.slice(1);
                if (supportingFilesToAdd.length > 0) {
                  const syntheticEvent = {
                    target: {
                      files: supportingFilesToAdd
                    }
                  } as any;
                  onSupportingUpload(syntheticEvent);
                }
              }
            }
          }}
          showLinkInput={true}
          showCameraCapture={true}
          context="assignment"
          compact={true}
        />
        {(instructionFile || supportingFiles.length > 0) && (
          <div className="mt-4 space-y-2">
            {instructionFile && (
              <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm flex-1">Instructions: {instructionFile.name}</span>
              </div>
            )}
            {supportingFiles.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Supporting Materials:</p>
                {supportingFiles.map((file: File, i: number) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-accent/10 rounded-lg">
                    <BookOpen className="w-4 h-4 text-accent" />
                    <span className="text-sm flex-1">{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      <motion.button
        onClick={onNext}
        disabled={!assignmentTitle}
        whileHover={assignmentTitle ? { scale: 1.02 } : {}}
        whileTap={assignmentTitle ? { scale: 0.98 } : {}}
        className="w-full py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
      >
        <Sparkles className="w-5 h-5" />
        Create Workspace
        <ArrowRight className="w-5 h-5" />
      </motion.button>
    </motion.div>
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
        Creating Your Workspace...
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-muted-foreground text-center max-w-md mb-8"
      >
        AI is analyzing your instructions, generating a personalized checklist, and setting up your dedicated assistant
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

