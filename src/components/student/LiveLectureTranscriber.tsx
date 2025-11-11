import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Mic, MicOff, Square, Circle, Download, Share2,
  FileText, Brain, Sparkles, BookOpen, Clock, Users,
  CheckCircle, XCircle, Settings, ChevronDown, ChevronUp,
  Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  isImportant: boolean;
};

type LectureSession = {
  id: string;
  title: string;
  platform: 'zoom' | 'teams' | 'meet' | 'other';
  date: string;
  duration: string;
  transcriptLines: number;
  status: 'live' | 'completed';
};

// Mock lecture history
const mockLectureHistory: LectureSession[] = [
  {
    id: 'lecture-1',
    title: 'Data Structures - Binary Trees',
    platform: 'zoom',
    date: '2025-11-10T10:00:00Z',
    duration: '1h 45m',
    transcriptLines: 324,
    status: 'completed'
  },
  {
    id: 'lecture-2',
    title: 'Calculus II - Integration Techniques',
    platform: 'meet',
    date: '2025-11-09T14:00:00Z',
    duration: '1h 30m',
    transcriptLines: 287,
    status: 'completed'
  },
  {
    id: 'lecture-3',
    title: 'Chemistry Lab - Titration Methods',
    platform: 'teams',
    date: '2025-11-08T09:00:00Z',
    duration: '2h 15m',
    transcriptLines: 412,
    status: 'completed'
  }
];

export function LiveLectureTranscriber() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [selectedPlatform, setSelectedPlatform] = useState<'zoom' | 'teams' | 'meet' | 'other'>('zoom');
  const [meetingId, setMeetingId] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Mock transcript for demo
  const mockTranscript: TranscriptLine[] = [
    {
      id: '1',
      speaker: 'Professor Johnson',
      text: 'Good morning everyone. Today we\'re going to dive deep into binary search trees and their applications in computer science.',
      timestamp: '10:00:15',
      isImportant: true
    },
    {
      id: '2',
      speaker: 'Professor Johnson',
      text: 'First, let\'s review what we covered last week about linked lists and how they relate to tree structures.',
      timestamp: '10:00:45',
      isImportant: false
    },
    {
      id: '3',
      speaker: 'Student (Sarah)',
      text: 'Professor, can you clarify the difference between a binary tree and a binary search tree?',
      timestamp: '10:02:30',
      isImportant: false
    },
    {
      id: '4',
      speaker: 'Professor Johnson',
      text: 'Great question! A binary search tree maintains the property that all left descendants are less than the node, and all right descendants are greater. This makes searching very efficient.',
      timestamp: '10:02:45',
      isImportant: true
    },
    {
      id: '5',
      speaker: 'Professor Johnson',
      text: 'The time complexity for search, insert, and delete operations in a balanced BST is O(log n), which is significantly better than O(n) for a linked list.',
      timestamp: '10:04:20',
      isImportant: true
    }
  ];

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, autoScroll]);

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const handleConnect = () => {
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsRecording(true);
      setTranscript(mockTranscript);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsRecording(false);
    setConnectionStatus('disconnected');
    setRecordingDuration(0);
    setTranscript([]);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const generateStudyMaterials = () => {
    // This would integrate with existing study tools
    alert('Generating flashcards, quizzes, and summaries from lecture transcript...');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-600" />
            Live Lecture Transcriber
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Connect to online lectures and automatically generate study materials
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            History
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {connectionStatus === 'disconnected' ? (
            /* Connection Setup */
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
              >
                <div className="text-center mb-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 flex items-center justify-center">
                    <Video className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Connect to Your Lecture</h2>
                  <p className="text-muted-foreground">
                    Join a live lecture to start transcribing and generating study materials
                  </p>
                </div>

                <div className="space-y-6 bg-card rounded-2xl border border-border p-8">
                  {/* Platform Selection */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Select Platform</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: 'zoom', name: 'Zoom', icon: Video },
                        { id: 'meet', name: 'Google Meet', icon: Users },
                        { id: 'teams', name: 'MS Teams', icon: Users },
                        { id: 'other', name: 'Other', icon: Video }
                      ].map((platform) => {
                        const Icon = platform.icon;
                        return (
                          <button
                            key={platform.id}
                            onClick={() => setSelectedPlatform(platform.id as any)}
                            className={cn(
                              'p-4 rounded-xl border-2 transition-all text-left',
                              selectedPlatform === platform.id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            )}
                          >
                            <Icon className="w-5 h-5 mb-2" />
                            <p className="font-medium text-sm">{platform.name}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meeting ID */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Meeting ID / Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={meetingId}
                      onChange={(e) => setMeetingId(e.target.value)}
                      placeholder="Enter meeting ID or paste link..."
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Or click connect to use system audio capture
                    </p>
                  </div>

                  {/* Connect Button */}
                  <Button
                    onClick={handleConnect}
                    className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <Video className="w-5 h-5 mr-2" />
                    Connect to Lecture
                  </Button>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <FileText className="w-6 h-6 text-blue-600 mb-2" />
                    <p className="text-sm font-medium">Real-time Transcription</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <Brain className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="text-sm font-medium">AI Study Tools</p>
                  </div>
                  <div className="p-4 bg-cyan-50 dark:bg-cyan-950/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                    <Sparkles className="w-6 h-6 text-cyan-600 mb-2" />
                    <p className="text-sm font-medium">Auto-generate Materials</p>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Active Transcription */
            <div className="flex-1 flex flex-col">
              {/* Recording Controls */}
              <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Status Indicator */}
                    <div className="flex items-center gap-2">
                      {connectionStatus === 'connecting' ? (
                        <>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                          <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                            Connecting...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-sm font-medium text-red-700 dark:text-red-400">
                            {isRecording && !isPaused ? 'Recording' : 'Paused'}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-border">
                      <Clock className="w-4 h-4" />
                      <span className="font-mono font-medium">{formatTime(recordingDuration)}</span>
                    </div>

                    {/* Platform Badge */}
                    <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-border">
                      <span className="text-sm font-medium capitalize">{selectedPlatform}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mute */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                      className={cn(isMuted && 'bg-red-50 border-red-300')}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>

                    {/* Pause/Resume */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </Button>

                    {/* Stop */}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDisconnect}
                      className="gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop & Save
                    </Button>
                  </div>
                </div>
              </div>

              {/* Transcript Display */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {transcript.map((line, index) => (
                    <motion.div
                      key={line.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        'p-4 rounded-xl border',
                        line.isImportant
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800'
                          : 'bg-card border-border'
                      )}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{line.speaker}</span>
                          {line.isImportant && (
                            <span className="px-2 py-0.5 bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded-full font-medium">
                              Important
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          {line.timestamp}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{line.text}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={transcriptEndRef} />
              </div>

              {/* Action Bar */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoScroll}
                        onChange={(e) => setAutoScroll(e.target.checked)}
                        className="rounded"
                      />
                      Auto-scroll
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Export Transcript
                    </Button>
                    <Button
                      size="sm"
                      onClick={generateStudyMaterials}
                      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate Study Materials
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="w-80 border-l border-border bg-card p-4 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Lecture History</h3>
                <button onClick={() => setShowHistory(false)}>
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {mockLectureHistory.map((lecture) => (
                  <div
                    key={lecture.id}
                    className="p-3 bg-background rounded-lg border border-border hover:border-primary cursor-pointer transition-all"
                  >
                    <h4 className="font-medium text-sm mb-2">{lecture.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(lecture.date).toLocaleDateString()}</span>
                      <span>{lecture.duration}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full capitalize">
                        {lecture.platform}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {lecture.transcriptLines} lines
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

