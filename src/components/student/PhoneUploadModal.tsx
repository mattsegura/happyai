import { motion } from 'framer-motion';
import { X, Smartphone, Camera, QrCode, CheckCircle2, Upload } from 'lucide-react';

interface PhoneUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadUrl?: string;
}

export function PhoneUploadModal({ isOpen, onClose, uploadUrl }: PhoneUploadModalProps) {
  if (!isOpen) return null;

  // Fake QR code - in production this would be dynamically generated
  const fakeQRCode = `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="black">
      <!-- Simplified QR code pattern -->
      <!-- Position markers (corners) -->
      <rect x="0" y="0" width="70" height="70" fill="black"/>
      <rect x="10" y="10" width="50" height="50" fill="white"/>
      <rect x="20" y="20" width="30" height="30" fill="black"/>
      
      <rect x="186" y="0" width="70" height="70" fill="black"/>
      <rect x="196" y="10" width="50" height="50" fill="white"/>
      <rect x="206" y="20" width="30" height="30" fill="black"/>
      
      <rect x="0" y="186" width="70" height="70" fill="black"/>
      <rect x="10" y="196" width="50" height="50" fill="white"/>
      <rect x="20" y="206" width="30" height="30" fill="black"/>
      
      <!-- Data pattern (simplified) -->
      <rect x="80" y="10" width="10" height="10"/>
      <rect x="100" y="10" width="10" height="10"/>
      <rect x="120" y="10" width="10" height="10"/>
      <rect x="140" y="10" width="10" height="10"/>
      <rect x="160" y="10" width="10" height="10"/>
      
      <rect x="10" y="80" width="10" height="10"/>
      <rect x="30" y="80" width="10" height="10"/>
      <rect x="50" y="80" width="10" height="10"/>
      
      <rect x="80" y="30" width="10" height="10"/>
      <rect x="90" y="40" width="10" height="10"/>
      <rect x="100" y="30" width="10" height="10"/>
      <rect x="110" y="50" width="10" height="10"/>
      <rect x="120" y="30" width="10" height="10"/>
      <rect x="130" y="40" width="10" height="10"/>
      <rect x="140" y="50" width="10" height="10"/>
      <rect x="150" y="30" width="10" height="10"/>
      <rect x="160" y="40" width="10" height="10"/>
      <rect x="170" y="50" width="10" height="10"/>
      
      <rect x="80" y="80" width="10" height="10"/>
      <rect x="100" y="80" width="10" height="10"/>
      <rect x="120" y="80" width="10" height="10"/>
      <rect x="140" y="80" width="10" height="10"/>
      <rect x="160" y="80" width="10" height="10"/>
      <rect x="180" y="80" width="10" height="10"/>
      <rect x="200" y="80" width="10" height="10"/>
      <rect x="220" y="80" width="10" height="10"/>
      
      <rect x="80" y="100" width="10" height="10"/>
      <rect x="100" y="100" width="10" height="10"/>
      <rect x="130" y="100" width="10" height="10"/>
      <rect x="150" y="100" width="10" height="10"/>
      <rect x="180" y="100" width="10" height="10"/>
      <rect x="200" y="100" width="10" height="10"/>
      <rect x="230" y="100" width="10" height="10"/>
      
      <rect x="90" y="120" width="10" height="10"/>
      <rect x="110" y="120" width="10" height="10"/>
      <rect x="140" y="120" width="10" height="10"/>
      <rect x="160" y="120" width="10" height="10"/>
      <rect x="190" y="120" width="10" height="10"/>
      <rect x="210" y="120" width="10" height="10"/>
      
      <rect x="80" y="140" width="10" height="10"/>
      <rect x="110" y="140" width="10" height="10"/>
      <rect x="130" y="140" width="10" height="10"/>
      <rect x="160" y="140" width="10" height="10"/>
      <rect x="180" y="140" width="10" height="10"/>
      <rect x="220" y="140" width="10" height="10"/>
      
      <rect x="100" y="160" width="10" height="10"/>
      <rect x="120" y="160" width="10" height="10"/>
      <rect x="150" y="160" width="10" height="10"/>
      <rect x="170" y="160" width="10" height="10"/>
      <rect x="200" y="160" width="10" height="10"/>
      <rect x="230" y="160" width="10" height="10"/>
      
      <rect x="80" y="180" width="10" height="10"/>
      <rect x="110" y="180" width="10" height="10"/>
      <rect x="140" y="180" width="10" height="10"/>
      <rect x="170" y="180" width="10" height="10"/>
      <rect x="200" y="180" width="10" height="10"/>
      
      <rect x="90" y="200" width="10" height="10"/>
      <rect x="120" y="200" width="10" height="10"/>
      <rect x="150" y="200" width="10" height="10"/>
      <rect x="180" y="200" width="10" height="10"/>
      <rect x="210" y="200" width="10" height="10"/>
      
      <rect x="80" y="220" width="10" height="10"/>
      <rect x="100" y="220" width="10" height="10"/>
      <rect x="130" y="220" width="10" height="10"/>
      <rect x="160" y="220" width="10" height="10"/>
      <rect x="190" y="220" width="10" height="10"/>
      <rect x="220" y="220" width="10" height="10"/>
    </svg>
  `)}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-border"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Upload from Phone</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-white/90">
            Scan this QR code to upload handwritten notes from your phone
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* QR Code */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-pink-500/20 blur-2xl" />
              <div className="relative bg-white p-6 rounded-2xl shadow-lg">
                <img
                  src={fakeQRCode}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              QR code expires in <span className="font-semibold text-foreground">10 minutes</span>
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
              <QrCode className="w-4 h-4 text-primary" />
              How to upload:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-violet-600">1</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Open your phone's camera app
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-purple-600">2</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan the QR code above
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-pink-600">3</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Take a photo of your handwritten notes and upload
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">Supports multiple photos</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">AI text extraction</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-muted-foreground">Automatic organization</span>
            </div>
          </div>

          {/* Alternative Upload */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Or upload directly from this device
            </p>
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) {
                    console.log('Files selected:', files);
                    // Handle file upload
                    onClose();
                  }
                };
                input.click();
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose Files
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

