import { useState } from 'react';
import { Volume2, Play, Pause, RotateCw } from 'lucide-react';
import { StudyBuddyFileUpload } from '../../student/StudyBuddyFileUpload';
import { ToolHistorySidebar } from '../../student/ToolHistorySidebar';
import { audioRecapHistory } from '../../../lib/mockData/toolHistory';

export function AudioRecapsTab() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  return (
    <div className="flex h-full">
      {/* History Sidebar */}
      <ToolHistorySidebar
        items={audioRecapHistory}
        title="Previous Audio Recaps"
        onSelectItem={(item) => {
          console.log('Selected audio recap:', item);
        }}
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 p-6">
        {/* File Upload Section - Persistent across all Study Buddy pages */}
        <StudyBuddyFileUpload />
        
        <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Volume2 className="w-6 h-6 text-violet-600" />
          Audio Recaps
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Listen to AI-generated audio summaries of your study materials
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white text-center shadow-2xl">
            <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Volume2 className="w-16 h-16" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Biology Chapter 3 Summary</h3>
            <p className="text-white/80 mb-8">15 minutes • Generated from your notes</p>
            
            <div className="mb-8">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex justify-between text-sm text-white/60">
                <span>2:34</span>
                <span>15:00</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <RotateCw className="w-6 h-6" />
              </button>
              <button 
                onClick={() => {
                  setIsPlaying(!isPlaying);
                  if (!isPlaying) {
                    const interval = setInterval(() => {
                      setProgress(p => {
                        if (p >= 100) {
                          clearInterval(interval);
                          setIsPlaying(false);
                          return 0;
                        }
                        return p + 1;
                      });
                    }, 150);
                  }
                }}
                className="p-6 bg-white text-violet-600 hover:bg-white/90 rounded-full transition-all shadow-lg"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>
              <button className="p-4 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <RotateCw className="w-6 h-6 rotate-180" />
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {['Chapter 2 Review', 'Exam Prep Guide', 'Key Concepts', 'Practice Problems'].map((title, i) => (
              <button key={i} className="p-4 bg-muted/30 hover:bg-muted/50 rounded-xl text-left transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                    <Volume2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-foreground">{title}</div>
                    <div className="text-xs text-muted-foreground">{8 + i} min</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
