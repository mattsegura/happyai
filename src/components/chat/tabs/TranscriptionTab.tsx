import { useState } from 'react';
import { Upload, Mic, Loader } from 'lucide-react';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { transcriptionHistory } from '../../../lib/mockData/toolHistory';

export function TranscriptionTab() {
  const [transcription, setTranscription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setTimeout(() => {
      setTranscription(`[00:00] Professor: Welcome to today's lecture on cellular biology.\n\n[00:15] Today we'll be discussing the structure and function of mitochondria, often called the powerhouse of the cell.\n\n[01:30] The mitochondria has two membranes - an outer membrane and an inner membrane with many folds called cristae.\n\n[03:00] These cristae increase the surface area for ATP production through cellular respiration.\n\n[05:45] Student Question: How does this relate to energy production?\n\n[06:00] Professor: Great question! The cristae contain the electron transport chain, which is crucial for ATP synthesis...`);
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      <ToolHistorySidebar
        items={transcriptionHistory}
        title="Previous Transcriptions"
        onSelectItem={(item) => {
          console.log('Selected transcription:', item);
        }}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* File Upload Section - Persistent across all Study Buddy pages */}
        <StudyBuddyFileUpload />
        
        <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mic className="w-6 h-6 text-violet-600" />
          Lecture Recording & Transcription
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Upload audio/video recordings for AI transcription with timestamps
        </p>
      </div>

      {!transcription ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
              <Mic className="w-10 h-10 text-violet-600 dark:text-violet-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No Transcriptions Yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload an audio or video file using the upload section above to generate a transcription
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="bg-muted/30 rounded-2xl p-6 font-mono text-sm space-y-4">
            {transcription.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-foreground">{paragraph}</p>
            ))}
          </div>
          <button onClick={() => setTranscription('')} className="mt-6 px-6 py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
            Transcribe Another Recording
          </button>
        </div>
      )}
      </div>
    </div>
  );
}
