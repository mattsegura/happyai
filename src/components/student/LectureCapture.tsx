import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Mic, MicOff, Square, Upload, Download, Share2,
  FileText, Brain, Sparkles, CheckCircle, Youtube, File, Link
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useContent } from '../../contexts/ContentContext';
import { processYouTubeUrl, isYouTubeUrl } from '../../lib/integrations/youtube';
import { UniversalUploader, UploadedItem } from './UniversalUploader';

type TranscriptLine = {
  id: string;
  speaker: string;
  text: string;
  timestamp: string;
  isImportant: boolean;
};

// Mock transcript for demo
const mockTranscript: TranscriptLine[] = [
  {
    id: '1',
    speaker: 'Professor Smith',
    text: 'Today we\'re going to discuss advanced data structures, specifically focusing on binary trees and their applications.',
    timestamp: '00:00',
    isImportant: true
  },
  {
    id: '2',
    speaker: 'Professor Smith',
    text: 'A binary tree is a hierarchical data structure in which each node has at most two children.',
    timestamp: '00:15',
    isImportant: false
  },
  {
    id: '3',
    speaker: 'Student',
    text: 'How does this differ from a binary search tree?',
    timestamp: '00:45',
    isImportant: false
  },
  {
    id: '4',
    speaker: 'Professor Smith',
    text: 'Great question! A binary search tree is a special type of binary tree where the left child is always less than the parent, and the right child is always greater.',
    timestamp: '01:00',
    isImportant: true
  }
];

export function LectureCapture() {
  // Live Lecture States
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [selectedPlatform, setSelectedPlatform] = useState<'zoom' | 'teams' | 'meet' | 'other'>('zoom');
  const [meetingId, setMeetingId] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<TranscriptLine[]>([]);
  
  // Upload States
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [processingUpload, setProcessingUpload] = useState(false);
  const [uploadTranscript, setUploadTranscript] = useState<TranscriptLine[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addContent } = useContent();

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
    if (!meetingId.trim()) {
      alert('Please enter a meeting ID or link');
      return;
    }
    
    setConnectionStatus('connecting');
    setTimeout(() => {
      setConnectionStatus('connected');
      setIsRecording(true);
      setLiveTranscript(mockTranscript);
    }, 2000);
  };

  const handleUniversalUpload = (items: UploadedItem[]) => {
    setProcessingUpload(true);
    
    items.forEach((item) => {
      if (item.type === 'file' && item.file) {
        // Handle file upload
        setUploadedFile(item.file);
        
        // Add to content library
        addContent({
          id: `lecture-${Date.now()}`,
          type: item.file.type.startsWith('video') ? 'video' : 'audio',
          source: 'upload',
          title: item.name,
          metadata: { size: item.size || 0, mimeType: item.mimeType || '' }
        });
      } else if (item.type === 'link' && item.url) {
        // Handle YouTube link
        if (isYouTubeUrl(item.url)) {
          processYouTubeVideo(item.url);
        }
      }
    });

    // Simulate processing
    setTimeout(() => {
      setUploadTranscript(mockTranscript);
      setProcessingUpload(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsRecording(false);
    setConnectionStatus('disconnected');
    setRecordingDuration(0);
    setMeetingId('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setProcessingUpload(true);

    setTimeout(() => {
      setUploadTranscript(mockTranscript);
      setProcessingUpload(false);
      
      addContent({
        id: `lecture-upload-${Date.now()}`,
        source: 'upload',
        type: file.type.includes('video') ? 'video' : 'audio',
        name: file.name,
        metadata: {
          mimeType: file.type,
          size: file.size,
          duration: 3600,
          transcriptAvailable: true
        },
        linkedTo: {},
        tags: ['lecture', 'transcription'],
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      });
    }, 3000);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes('audio') || file.type.includes('video'))) {
      setUploadedFile(file);
      setProcessingUpload(true);
      
      setTimeout(() => {
        setUploadTranscript(mockTranscript);
        setProcessingUpload(false);
        
        addContent({
          id: `lecture-upload-${Date.now()}`,
          source: 'upload',
          type: file.type.includes('video') ? 'video' : 'audio',
          name: file.name,
          metadata: {
            mimeType: file.type,
            size: file.size,
            duration: 3600,
            transcriptAvailable: true
          },
          linkedTo: {},
          tags: ['lecture', 'transcription'],
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        });
      }, 3000);
    }
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
        setUploadTranscript(mockTranscript);
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

  const generateStudyMaterials = (transcript: TranscriptLine[]) => {
    if (transcript.length === 0) {
      alert('No transcript available to generate materials from');
      return;
    }
    alert('Generating flashcards, quizzes, and summaries from lecture transcript...');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="text-center py-8 px-6">
        <h1 className="text-4xl font-bold mb-2">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Lecture Capture
          </span>
        </h1>
        <p className="text-lg text-muted-foreground">
          Record live lectures or transcribe existing recordings
        </p>
      </div>

      {/* Split Content */}
      <div className="flex-1 grid grid-cols-2 gap-8 px-8 pb-8 overflow-hidden">
        {/* Left Side: Live Lecture */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-blue-950/40 dark:via-cyan-950/40 dark:to-blue-900/40 rounded-3xl border-2 border-blue-200 dark:border-blue-800 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-blue-200 dark:border-blue-800 bg-white/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Live Lecture</h2>
                <p className="text-sm text-muted-foreground">Connect to real-time transcription</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {connectionStatus === 'disconnected' ? (
              /* Connection Form */
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-3">Select Platform</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['zoom', 'meet', 'teams', 'other'].map((platform) => (
                      <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform as any)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-center font-medium capitalize',
                          selectedPlatform === platform
                            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                        )}
                      >
                        {platform === 'meet' ? 'Google Meet' : platform === 'teams' ? 'MS Teams' : platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Meeting ID / Link (Optional)</label>
                  <input
                    type="text"
                    value={meetingId}
                    onChange={(e) => setMeetingId(e.target.value)}
                    placeholder="Enter meeting ID or paste link..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Or click connect to use system audio capture
                  </p>
                </div>

                <Button
                  onClick={handleConnect}
                  className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Connect to Lecture
                </Button>
              </div>
            ) : (
              /* Recording Interface */
              <div className="space-y-6">
                {/* Recording Controls */}
                <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="font-semibold">Recording</span>
                      </div>
                      <div className="text-2xl font-mono font-bold text-blue-600 mt-1">
                        {formatTime(recordingDuration)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setIsMuted(!isMuted)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </Button>
                      <Button
                        onClick={() => setIsPaused(!isPaused)}
                        variant="outline"
                        size="sm"
                        className="rounded-xl"
                      >
                        {isPaused ? 'Resume' : 'Pause'}
                      </Button>
                      <Button
                        onClick={handleDisconnect}
                        variant="destructive"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Stop
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Live Transcript */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Live Transcript
                  </h3>
                  <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3 max-h-[400px] overflow-y-auto">
                    {liveTranscript.map((line) => (
                      <div key={line.id} className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono">{line.timestamp}</span>
                          <span className="font-semibold">{line.speaker}</span>
                          {line.isImportant && (
                            <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
                              Key Point
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{line.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <Button
                  onClick={() => generateStudyMaterials(liveTranscript)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Study Materials
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Side: Upload Recording */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-purple-950/40 dark:via-pink-950/40 dark:to-purple-900/40 rounded-3xl border-2 border-purple-200 dark:border-purple-800 shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-purple-200 dark:border-purple-800 bg-white/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Upload Recording</h2>
                <p className="text-sm text-muted-foreground">Files or YouTube links</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <UniversalUploader
              allowedTypes={['video/*', 'audio/*']}
              onUpload={handleUniversalUpload}
              showLinkInput={true}
              showCameraCapture={false}
              context="lecture"
              compact={true}
            />

            {/* Upload Status */}
            {processingUpload && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 mx-auto mb-4 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="font-semibold">Processing upload...</p>
                <p className="text-sm text-muted-foreground mt-1">This may take a few moments</p>
              </motion.div>
            )}

            {/* Uploaded File Info */}
            {uploadedFile && !processingUpload && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <File className="w-8 h-8 text-purple-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{uploadedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>

                {uploadTranscript.length > 0 && (
                  <>
                    <div className="mb-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        Transcript
                      </h3>
                      <div className="bg-white dark:bg-gray-900 rounded-lg p-3 space-y-2 max-h-[200px] overflow-y-auto">
                        {uploadTranscript.slice(0, 3).map((line) => (
                          <div key={line.id} className="text-xs">
                            <span className="font-semibold text-purple-600">{line.speaker}:</span>{' '}
                            {line.text}
                          </div>
                        ))}
                        {uploadTranscript.length > 3 && (
                          <p className="text-xs text-muted-foreground italic">
                            + {uploadTranscript.length - 3} more lines...
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={() => generateStudyMaterials(uploadTranscript)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Study Materials
                    </Button>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
