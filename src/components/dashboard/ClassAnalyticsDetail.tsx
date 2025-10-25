import { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, Calendar, Clock, Video, Activity, Smile, Target, X } from 'lucide-react';
import {
  getClassSpecific2WeekData,
  getClassSpecificWeekData,
  getClassSpecificMonthData,
  getClassSpecificCustomData,
  getClassAnalyticsData,
  ClassAnalyticsData
} from '../../lib/classAnalyticsData';
import { mockOfficeHours } from '../../lib/mockData';

type ClassAnalyticsDetailProps = {
  classId: string;
  className: string;
  teacherName: string;
  description: string;
  onBack: () => void;
};

type TimeRange = 'week' | '2weeks' | 'month' | 'custom';

export function ClassAnalyticsDetail({ classId, className, teacherName, description, onBack }: ClassAnalyticsDetailProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('2weeks');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const analyticsData: ClassAnalyticsData = getClassAnalyticsData(classId, className);

  const weekData = getClassSpecificWeekData(classId);
  const twoWeekData = getClassSpecific2WeekData(classId);
  const monthData = getClassSpecificMonthData(classId);
  const customData = getClassSpecificCustomData(classId);

  const currentData = timeRange === 'week' ? weekData :
                     timeRange === '2weeks' ? twoWeekData :
                     timeRange === 'month' ? monthData :
                     customData;

  const applyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setTimeRange('custom');
      setShowCustomPicker(false);
    }
  };

  const classOfficeHours = mockOfficeHours.filter(oh => oh.class_id === classId);

  const maxValue = 6;
  const minValue = 1;

  const getBlueShade = (value: number): string => {
    if (value >= 5) return 'rgb(30 58 138)'; // blue-900
    if (value >= 4.5) return 'rgb(30 64 175)'; // blue-800
    if (value >= 4) return 'rgb(37 99 235)'; // blue-600
    if (value >= 3.5) return 'rgb(59 130 246)'; // blue-500
    if (value >= 3) return 'rgb(96 165 250)'; // blue-400
    if (value >= 2.5) return 'rgb(147 197 253)'; // blue-300
    if (value >= 2) return 'rgb(191 219 254)'; // blue-200
    return 'rgb(219 234 254)'; // blue-100
  };

  const getDateLabel = (dateStr: string, index: number) => {
    const date = new Date(dateStr);
    if (timeRange === 'week') {
      return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
    } else {
      return index % 5 === 0 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
    }
  };

  const average = currentData.reduce((sum, d) => sum + d.avgSentiment, 0) / currentData.length;
  const trend = currentData[currentData.length - 1].avgSentiment > currentData[0].avgSentiment ? 'up' : 'down';

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Rankings</span>
      </button>

      <div className="bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-3xl p-8 border-2 border-blue-300 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mb-24"></div>

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">{className}</h1>
              <p className="text-white/90 text-lg mb-1">{description}</p>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Users className="w-4 h-4" />
                <span>Taught by {teacherName}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 text-center">
                <div className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">Sentiment</div>
                <div className="text-4xl font-black text-white">{analyticsData.currentSentiment.toFixed(1)}</div>
                <div className="text-white/80 text-xs mt-1">out of 6.0</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-semibold">Total Students</span>
              </div>
              <div className="text-3xl font-black text-white">{analyticsData.totalStudents}</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-semibold">Active Today</span>
              </div>
              <div className="text-3xl font-black text-white">{analyticsData.activeStudents}</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-white" />
                <span className="text-white/80 text-sm font-semibold">Participation</span>
              </div>
              <div className="text-3xl font-black text-white">{analyticsData.participationRate}%</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className={`w-5 h-5 text-white ${trend === 'down' ? 'rotate-180' : ''}`} />
                <span className="text-white/80 text-sm font-semibold">Trend</span>
              </div>
              <div className="text-xl font-black text-white capitalize">{trend === 'up' ? 'Improving' : 'Stable'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border-2 border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Sentiment Trend</h3>
              <p className="text-xs text-gray-500">Track class emotional wellness over time</p>
            </div>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                timeRange === 'week'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('2weeks')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                timeRange === '2weeks'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              2 Weeks
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                timeRange === 'month'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              1 Month
            </button>
            <button
              onClick={() => setShowCustomPicker(true)}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-300 ${
                timeRange === 'custom'
                  ? 'bg-white text-blue-600 shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Custom
            </button>
          </div>
        </div>

        {showCustomPicker && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Custom Date Range</h3>
                    <p className="text-xs text-gray-500">Select your preferred timeframe</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCustomPicker(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCustomRange}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-md"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">
              Avg: <span className="font-bold text-gray-800">{average.toFixed(1)}/6.0</span>
            </span>
          </div>
          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            <TrendingUp className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`} />
            <span className="text-xs font-semibold">{trend === 'up' ? 'Improving' : 'Stable'}</span>
          </div>
        </div>

        <div className="relative h-48 mb-2">
          <div className="absolute inset-0 flex items-end justify-between gap-1">
            {currentData.map((point, index) => {
              const heightPixels = ((point.avgSentiment - minValue) / (maxValue - minValue)) * 192;

              return (
                <div key={index} className="flex-1 group relative" style={{ height: '100%' }}>
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center">
                    <div
                      className="w-full rounded-t-lg transition-all duration-500 cursor-pointer hover:opacity-80"
                      style={{
                        height: `${heightPixels}px`,
                        backgroundColor: getBlueShade(point.avgSentiment),
                        minHeight: '12px'
                      }}
                    >
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none">
                        Avg: {point.avgSentiment.toFixed(1)}/6<br/>
                        {point.studentCount} students
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 -ml-8">
            <span>6</span>
            <span>5</span>
            <span>4</span>
            <span>3</span>
            <span>2</span>
            <span>1</span>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          {currentData.map((point, index) => {
            const label = getDateLabel(point.date, index);
            if (label) {
              return (
                <span key={index} className="flex-1 text-center">
                  {label}
                </span>
              );
            }
            return <span key={index} className="flex-1"></span>;
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Emotion Breakdown</h3>
              <p className="text-xs text-gray-500">Current class sentiment distribution</p>
            </div>
          </div>

          <div className="space-y-3">
            {analyticsData.topEmotions.map((emotion) => (
              <div key={emotion.emotion}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700 capitalize">{emotion.emotion}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{emotion.count} students</span>
                    <span className="text-sm font-bold text-blue-600">{emotion.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${emotion.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
              <p className="text-xs text-gray-500">Latest class engagement</p>
            </div>
          </div>

          <div className="space-y-3">
            {analyticsData.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {classOfficeHours.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Office Hours</h3>
              <p className="text-xs text-gray-500">Upcoming support sessions for {className}</p>
            </div>
          </div>

          <div className="space-y-3">
            {classOfficeHours.map((oh) => (
              <div key={oh.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-bold text-gray-800">{new Date(oh.date).toLocaleDateString()}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        oh.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {oh.is_active ? 'Active Now' : 'Upcoming'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{oh.start_time} - {oh.end_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{oh.student_queue.length} in queue</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  Join
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
