import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Mic, MicOff, Square, Upload, Download, Share2,
  FileText, Brain, Sparkles, BookOpen, Clock, Users,
  CheckCircle, XCircle, Settings, ChevronDown, ChevronUp,
  Play, Pause, Volume2, VolumeX, File, Youtube
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useContent } from '../../contexts/ContentContext';
import { processYouTubeUrl, isYouTubeUrl } from '../../lib/integrations/youtube';

type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  isImportant: boolean;
};

type LectureMode = 'live' | 'upload';

type LectureSession = {
  id: string;
  title: string;
  source: 'zoom' | 'teams' | 'meet' | 'file' | 'youtube';
  date: string;
  duration: string;
  transcriptLines: number;
  status: 'live' | 'processing' | 'completed';
};

// Mock lecture history
const mockLectureHistory: LectureSession[] = [
  {
    id: 'lecture-1',
    title: 'Data Structures - Binary Trees',
    source: 'zoom',
    date: '2025-11-10T10:00:00Z',
    duration: '1h 45m',
    transcriptLines: 324,
    status: 'completed'
  },
  {
    id: 'lecture-2',
    title: 'Calculus II - Integration Techniques',
    source: 'file',
    date: '2025-11-09T14:00:00Z',
    duration: '1h 30m',
    transcriptLines: 287,
    status: 'completed'
  },
  {
    id: 'lecture-3',
    title: 'Chemistry Lab - Titration Methods',
    source: 'youtube',
    date: '2025-11-08T09:00:00Z',
    duration: '2h 15m',
    transcriptLines: 412,
    status: 'completed'
  }
];

export function LectureCapture() {
  const [mode, setMode] = useState<LectureMode>('live');
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingUpload, setProcessingUpload] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addContent } = useContent();

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
    // Keep transcript for viewing
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setProcessingUpload(true);

    // Simulate processing
    setTimeout(() => {
      setTranscript(mockTranscript);
      setProcessingUpload(false);
      
      // Add to content library
      addContent({
        id: `lecture-upload-${Date.now()}`,
        source: 'upload',
        type: file.type.includes('video') ? 'video' : 'audio',
        name: file.name,
        metadata: {
          mimeType: file.type,
          size: file.size,
          duration: 3600, // Mock duration
          transcriptAvailable: true
        },
        linkedTo: {},
        tags: ['lecture', 'transcription'],
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      });
    }, 3000);
  };

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl || !isYouTubeUrl(youtubeUrl)) {
      alert('Please enter a valid YouTube URL');
      return;
    }

    setProcessingUpload(true);
    
    try {
      const content = await processYouTubeUrl(youtubeUrl);
      if (content) {
        addContent(content);
        setTranscript(mockTranscript);
      }
    } catch (error) {
      console.error('Failed to process YouTube URL:', error);
    } finally {
      setProcessingUpload(false);
    }
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
    alert('Generating flashcards, quizzes, and summaries from lecture transcript...');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-600" />
            Lecture Capture
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Record live lectures or transcribe existing recordings
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
            <button
              onClick={() => setMode('live')}
              className={cn(
                'px-4 py-2 rounded-md font-medium text-sm transition-all',
                mode === 'live'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Video className="w-4 h-4 inline mr-2" />
              Live
            </button>
            <button
              onClick={() => setMode('upload')}
              className={cn(
                'px-4 py-2 rounded-md font-medium text-sm transition-all',
                mode === 'upload'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            History
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {mode === 'live' ? (
            /* Live Transcription Mode */
            connectionStatus === 'disconnected' ? (
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
                </motion.div>
              </div>
            ) : (
              /* Active Live Transcription */
              <ActiveTranscription
                isRecording={isRecording}
                isPaused={isPaused}
                isMuted={isMuted}
                connectionStatus={connectionStatus}
                selectedPlatform={selectedPlatform}
                recordingDuration={recordingDuration}
                transcript={transcript}
                autoScroll={autoScroll}
                transcriptEndRef={transcriptEndRef}
                onPause={() => setIsPaused(!isPaused)}
                onMute={() => setIsMuted(!isMuted)}
                onStop={handleDisconnect}
                onAutoScrollToggle={() => setAutoScroll(!autoScroll)}
                onGenerateStudyMaterials={generateStudyMaterials}
                formatTime={formatTime}
              />
            )
          ) : (
            /* Upload Mode */
            <div className="flex-1 flex items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-3xl"
              >
                {!transcript.length && !processingUpload ? (
                  <div className="space-y-8">
                    <div className="text-center">
                      <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                        <Upload className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">Upload Recording</h2>
                      <p className="text-muted-foreground">
                        Upload audio/video files or paste a YouTube link to transcribe
                      </p>
                    </div>

                    {/* File Upload */}
                    <div className="bg-card rounded-2xl border-2 border-dashed border-border p-12 text-center hover:border-primary transition-all cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <File className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-semibold mb-2">Drop your file here or click to browse</p>
                      <p className="text-sm text-muted-foreground">
                        Supports MP3, MP4, WAV, MOV, AVI (max 500MB)
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="audio/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </div>

                    {/* YouTube Link */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-background text-muted-foreground">OR</span>
                      </div>
                    </div>

                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <Youtube className="w-6 h-6 text-red-600" />
                        <h3 className="font-semibold">YouTube Video</h3>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="Paste YouTube URL..."
                          className="flex-1 px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        />
                        <Button
                          onClick={handleYoutubeSubmit}
                          disabled={!youtubeUrl}
                          className="px-6"
                        >
                          Transcribe
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        We'll automatically extract and transcribe the video
                      </p>
                    </div>
                  </div>
                ) : processingUpload ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center animate-pulse">
                      <Brain className="w-10 h-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Processing...</h3>
                    <p className="text-muted-foreground">
                      Transcribing your {uploadedFile ? 'file' : 'video'} with AI
                    </p>
                  </div>
                ) : (
                  <TranscriptDisplay
                    transcript={transcript}
                    autoScroll={autoScroll}
                    transcriptEndRef={transcriptEndRef}
                    onAutoScrollToggle={() => setAutoScroll(!autoScroll)}
                    onGenerateStudyMaterials={generateStudyMaterials}
                    onReset={() => {
                      setTranscript([]);
                      setUploadedFile(null);
                      setYoutubeUrl('');
                    }}
                  />
                )}
              </motion.div>
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
                        {lecture.source}
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

// Sub-components for better organization

function ActiveTranscription({
  isRecording,
  isPaused,
  isMuted,
  connectionStatus,
  selectedPlatform,
  recordingDuration,
  transcript,
  autoScroll,
  transcriptEndRef,
  onPause,
  onMute,
  onStop,
  onAutoScrollToggle,
  onGenerateStudyMaterials,
  formatTime
}: any) {
  return (
    <div className="flex-1 flex flex-col">
      {/* Recording Controls */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">
                {isRecording && !isPaused ? 'Recording' : 'Paused'}
              </span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-border">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-medium">{formatTime(recordingDuration)}</span>
            </div>

            <div className="px-3 py-1 bg-white dark:bg-gray-800 rounded-lg border border-border">
              <span className="text-sm font-medium capitalize">{selectedPlatform}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onMute} className={cn(isMuted && 'bg-red-50 border-red-300')}>
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={onPause}>
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </Button>
            <Button variant="destructive" size="sm" onClick={onStop} className="gap-2">
              <Square className="w-4 h-4" />
              Stop & Save
            </Button>
          </div>
        </div>
      </div>

      <TranscriptDisplay
        transcript={transcript}
        autoScroll={autoScroll}
        transcriptEndRef={transcriptEndRef}
        onAutoScrollToggle={onAutoScrollToggle}
        onGenerateStudyMaterials={onGenerateStudyMaterials}
      />
    </div>
  );
}

function TranscriptDisplay({
  transcript,
  autoScroll,
  transcriptEndRef,
  onAutoScrollToggle,
  onGenerateStudyMaterials,
  onReset
}: any) {
  return (
    <>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {transcript.map((line: TranscriptLine, index: number) => (
            <motion.div
              key={line.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
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
                <span className="text-xs text-muted-foreground font-mono">{line.timestamp}</span>
              </div>
              <p className="text-sm leading-relaxed">{line.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={transcriptEndRef} />
      </div>

      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={onAutoScrollToggle}
                className="rounded"
              />
              Auto-scroll
            </label>
            {onReset && (
              <Button variant="outline" size="sm" onClick={onReset}>
                Upload Another
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button size="sm" onClick={onGenerateStudyMaterials} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
              <Sparkles className="w-4 h-4" />
              Generate Study Materials
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

