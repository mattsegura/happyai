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
        <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
          <Beaker className="h-5 w-5 text-primary-600" />
          Hapi lab
        </h2>
      </div>

      <div className="flex overflow-x-auto rounded-full border border-slate-200 bg-white p-1 text-sm font-semibold text-slate-500">
        {[
          { id: 'pulses', label: 'Class pulse', icon: MessageSquare },
          { id: 'moments', label: 'Hapi moments', icon: Heart },
          { id: 'meetings', label: 'Meetings', icon: Video },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`mr-1 flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 last:mr-0 transition ${
                isActive ? 'bg-primary-600 text-white shadow-sm' : 'hover:text-primary-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
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
