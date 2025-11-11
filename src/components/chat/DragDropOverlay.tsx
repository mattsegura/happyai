import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, FileText, Video, Mic, File } from 'lucide-react';

interface DragDropOverlayProps {
  isVisible: boolean;
  onDrop: (files: File[]) => void;
}

export function DragDropOverlay({ isVisible, onDrop }: DragDropOverlayProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    onDrop(files);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-primary/10"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="text-center p-12 rounded-3xl bg-white/80 dark:bg-gray-900/80 border-4 border-dashed border-primary shadow-2xl max-w-2xl"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
            >
              <Upload className="h-12 w-12 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-foreground mb-4">
              Drop your files here
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              I'll analyze them and help you study!
            </p>

            {/* Supported File Types */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <Image className="h-8 w-8 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Images</span>
              </div>
              <div className="flex flex-col items-center">
                <FileText className="h-8 w-8 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">PDFs</span>
              </div>
              <div className="flex flex-col items-center">
                <Video className="h-8 w-8 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Videos</span>
              </div>
              <div className="flex flex-col items-center">
                <Mic className="h-8 w-8 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Audio</span>
              </div>
              <div className="flex flex-col items-center">
                <File className="h-8 w-8 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Code</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

