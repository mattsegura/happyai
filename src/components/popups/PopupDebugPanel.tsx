import { useState } from 'react';
import { Info, X, RefreshCw } from 'lucide-react';

interface DebugInfo {
  morningPulseNeeded: boolean;
  morningPulseShownInSession: boolean;
  userClassCount: number;
  activePulsesCount: number;
  incompletePulsesCount: number;
  newPulsesCount: number;
  queueLength: number;
}

interface PopupDebugPanelProps {
  debugInfo: DebugInfo;
  onClearCache: () => void;
}

export function PopupDebugPanel({ debugInfo, onClearCache }: PopupDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-24 right-4 z-[9999] w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200"
        title="Popup Debug Info"
      >
        <Info className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 right-4 z-[9999] bg-white rounded-xl shadow-2xl border-2 border-blue-200 p-4 max-w-sm w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Popup Debug Info</span>
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Morning Pulse Needed:</span>
          <span className={`font-bold ${debugInfo.morningPulseNeeded ? 'text-green-600' : 'text-red-600'}`}>
            {debugInfo.morningPulseNeeded ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Already Shown Today:</span>
          <span className={`font-bold ${debugInfo.morningPulseShownInSession ? 'text-red-600' : 'text-green-600'}`}>
            {debugInfo.morningPulseShownInSession ? 'Yes' : 'No'}
          </span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Classes Enrolled:</span>
          <span className="font-bold text-gray-800">{debugInfo.userClassCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Active Pulses:</span>
          <span className="font-bold text-gray-800">{debugInfo.activePulsesCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">Incomplete Pulses:</span>
          <span className="font-bold text-gray-800">{debugInfo.incompletePulsesCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <span className="text-gray-600">New to Show:</span>
          <span className="font-bold text-gray-800">{debugInfo.newPulsesCount}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-gray-700 font-semibold">Queue Length:</span>
          <span className="font-bold text-blue-600 text-lg">{debugInfo.queueLength}</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={onClearCache}
          className="w-full py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear Cache & Reload</span>
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This will reset popup tracking and refresh the page
        </p>
      </div>

      <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-gray-600">
          <strong>Why no popups?</strong><br />
          {!debugInfo.morningPulseNeeded && 'Morning pulse already completed today. '}
          {debugInfo.morningPulseShownInSession && 'Morning pulse shown in this session. '}
          {debugInfo.userClassCount === 0 && 'Not enrolled in any classes. '}
          {debugInfo.activePulsesCount === 0 && debugInfo.userClassCount > 0 && 'No active class pulses. '}
          {debugInfo.newPulsesCount === 0 && debugInfo.incompletePulsesCount > 0 && 'All pulses already shown. '}
          {debugInfo.queueLength === 0 && 'No items in queue. '}
        </p>
      </div>
    </div>
  );
}
