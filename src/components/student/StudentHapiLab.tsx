import { useState } from 'react';
import { Beaker, Heart, Video, MessageSquare } from 'lucide-react';
import { HapiMomentsView } from '../moments/HapiMomentsView';
import { StudentMeetingsView } from './StudentMeetingsView';
import { StudentClassPulseView } from './StudentClassPulseView';

type Tab = 'moments' | 'meetings' | 'pulses';

export function StudentHapiLab() {
  const [activeTab, setActiveTab] = useState<Tab>('moments');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent flex items-center">
          <Beaker className="w-7 h-7 mr-2 text-cyan-600" />
          Hapi Labs
        </h2>
      </div>

      <div className="flex space-x-2 bg-white rounded-xl p-2 shadow-md overflow-x-auto">
        <button
          onClick={() => setActiveTab('pulses')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap ${
            activeTab === 'pulses'
              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm sm:text-base">Class Pulse</span>
        </button>
        <button
          onClick={() => setActiveTab('moments')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap ${
            activeTab === 'moments'
              ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-sm sm:text-base">Hapi Moments</span>
        </button>
        <button
          onClick={() => setActiveTab('meetings')}
          className={`flex-1 py-3 px-3 sm:px-4 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-2 whitespace-nowrap ${
            activeTab === 'meetings'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Video className="w-5 h-5" />
          <span className="text-sm sm:text-base">Meetings</span>
        </button>
      </div>

      {activeTab === 'pulses' && (
        <div className="animate-in fade-in duration-300">
          <StudentClassPulseView />
        </div>
      )}

      {activeTab === 'moments' && (
        <div className="animate-in fade-in duration-300">
          <HapiMomentsView />
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="animate-in fade-in duration-300">
          <StudentMeetingsView />
        </div>
      )}
    </div>
  );
}
