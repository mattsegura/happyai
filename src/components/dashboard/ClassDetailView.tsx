import { ArrowLeft, TrendingUp, Users } from 'lucide-react';
import { mockClassPulses } from '../../lib/mockData';

type ClassDetailViewProps = {
  classId: string;
  className: string;
  onBack: () => void;
};

export function ClassDetailView({ classId, className, onBack }: ClassDetailViewProps) {
  const classPulses = mockClassPulses.filter(p => p.class_id === classId);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Classes</span>
      </button>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 border-2 border-blue-200 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{className}</h1>
        <p className="text-gray-600">View class activity and sentiment trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">Class Overview</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Students</span>
              <span className="font-bold text-gray-800">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Pulses</span>
              <span className="font-bold text-gray-800">{classPulses.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Sentiment</span>
              <span className="font-bold text-green-600">Positive</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">Your Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Class Rank</span>
              <span className="font-bold text-gray-800">#3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Points in Class</span>
              <span className="font-bold text-blue-600">320</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Participation</span>
              <span className="font-bold text-green-600">92%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Class Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
            <span className="text-gray-700">Morning pulse check completed</span>
            <span className="text-sm text-gray-500">Today</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
            <span className="text-gray-700">Answered class pulse question</span>
            <span className="text-sm text-gray-500">Yesterday</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-pink-50 rounded-xl">
            <span className="text-gray-700">Sent Hapi Moment to classmate</span>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
