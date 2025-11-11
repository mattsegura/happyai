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

const mockCourses = [
  { id: '1', name: 'Calculus II', code: 'MATH 201', color: '#3b82f6' },
  { id: '2', name: 'Physics', code: 'PHYS 101', color: '#a855f7' },
  { id: '3', name: 'Computer Science', code: 'CS 150', color: '#10b981' },
  { id: '4', name: 'English Literature', code: 'ENG 202', color: '#f97316' },
  { id: '5', name: 'History', code: 'HIST 101', color: '#eab308' },
];

type Step = 'class' | 'detection' | 'type' | 'instructions' | 'supporting' | 'creating';

export function AssignmentCreationFlow() {
  const navigate = useNavigate();
  const { createAssignment } = useAssignments();
  
  const [step, setStep] = useState<Step>('class');
  const [selectedClass, setSelectedClass] = useState('');
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentType, setAssignmentType] = useState<'essay' | 'project' | 'lab-report' | 'presentation' | 'other'>('essay');
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
    setStep('instructions');
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
        <button
          onClick={() => step === 'class' ? navigate('/dashboard/assignments') : setStep('class')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Create Assignment</h1>
          <p className="text-muted-foreground">Get AI assistance with your assignment</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[
          { id: 'class', label: 'Select Class' },
          { id: 'detection', label: 'Detect Assignment' },
          { id: 'instructions', label: 'Upload Files' },
          { id: 'creating', label: 'Create' },
        ].map((s, index) => {
          const stepIndex = ['class', 'detection', 'type', 'instructions', 'supporting', 'creating'].indexOf(step);
          const thisStepIndex = ['class', 'detection', 'type', 'instructions', 'supporting', 'creating'].indexOf(s.id);
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

          {step === 'instructions' && (
            <InstructionsStep
              assignmentTitle={assignmentTitle}
              setAssignmentTitle={setAssignmentTitle}
              assignmentType={assignmentType}
              setAssignmentType={setAssignmentType}
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

function ClassSelectionStep({ courses, selectedClass, onSelect }: any) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">What class is this for?</h2>
      <p className="text-muted-foreground mb-6">Select the course for this assignment</p>
      
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

function InstructionsStep({
  assignmentTitle,
  setAssignmentTitle,
  assignmentType,
  setAssignmentType,
  dueDate,
  setDueDate,
  instructionFile,
  onInstructionUpload,
  supportingFiles,
  onSupportingUpload,
  onNext
}: any) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Assignment Details</h2>
        <p className="text-muted-foreground mb-6">Let's set up your assignment workspace</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Assignment Title</label>
        <input
          type="text"
          value={assignmentTitle}
          onChange={(e) => setAssignmentTitle(e.target.value)}
          placeholder="e.g., Literary Analysis Essay"
          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <select
            value={assignmentType}
            onChange={(e) => setAssignmentType(e.target.value as any)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="essay">Essay</option>
            <option value="project">Project</option>
            <option value="lab-report">Lab Report</option>
            <option value="presentation">Presentation</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Upload Instructions (Optional)</label>
        <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
          <input
            type="file"
            onChange={onInstructionUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt"
          />
          <div className="text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">
              {instructionFile ? instructionFile.name : 'Click to upload assignment instructions'}
            </p>
          </div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Supporting Materials (Optional)</label>
        <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors cursor-pointer">
          <input
            type="file"
            onChange={onSupportingUpload}
            className="hidden"
            multiple
          />
          <div className="text-center">
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm">
              {supportingFiles.length > 0 
                ? `${supportingFiles.length} file(s) selected`
                : 'Click to upload drafts, notes, or research'}
            </p>
          </div>
        </label>
      </div>

      <button
        onClick={onNext}
        disabled={!assignmentTitle}
        className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        Create Assignment Workspace
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
      <h2 className="text-2xl font-bold mb-2">Creating Your Workspace...</h2>
      <p className="text-muted-foreground text-center max-w-md">
        AI is analyzing your instructions, generating a personalized checklist, and setting up your dedicated assistant
      </p>
    </div>
  );
}

