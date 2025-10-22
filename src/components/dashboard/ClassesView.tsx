import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, GraduationCap, Award, TrendingUp, ChevronRight, Hash, Sparkles } from 'lucide-react';
import { ClassAnalyticsDetail } from './ClassAnalyticsDetail';
import { JoinClassModal } from './JoinClassModal';
import { ClassSentimentChart } from './ClassSentimentChart';
import { ClassHapiInsightsSection } from './ClassHapiInsightsSection';
import { mockClasses, mockClassMembers } from '../../lib/mockData';

type ClassWithPoints = {
  id: string;
  name: string;
  description: string;
  teacher_name: string;
  class_points: number;
};

export function ClassesView() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<ClassWithPoints | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const classes: ClassWithPoints[] = mockClasses.map(cls => {
    const member = mockClassMembers.find(m => m.class_id === cls.id && m.user_id === user?.id);
    return {
      id: cls.id,
      name: cls.name,
      description: cls.description || '',
      teacher_name: cls.teacher_name,
      class_points: member?.class_points || 0,
    };
  });

  if (selectedClass) {
    const classData = mockClasses.find(c => c.id === selectedClass.id);
    return (
      <ClassAnalyticsDetail
        classId={selectedClass.id}
        className={selectedClass.name}
        teacherName={classData?.teacher_name || 'Unknown'}
        description={classData?.description || ''}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  const handleClassJoined = () => {
  };

  if (classes.length === 0) {
    return (
      <>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-12 border-2 border-blue-200 shadow-lg text-center">
          <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No Classes Yet</h3>
          <p className="text-gray-600 mb-6">
            Get a class code from your teacher to join a class!
          </p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 mx-auto"
          >
            <Hash className="w-5 h-5" />
            <span>Enter Class Code</span>
          </button>
        </div>

        {showJoinModal && (
          <JoinClassModal
            onClose={() => setShowJoinModal(false)}
            onClassJoined={handleClassJoined}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center">
              <div className="relative mr-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
              </div>
              Your Classes
            </h1>
          </div>
          <button
            onClick={() => setShowJoinModal(true)}
            className="relative px-5 py-3 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center space-x-2 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Hash className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Enter Class Code</span>
            <Sparkles className="w-4 h-4 relative z-10 opacity-70" />
          </button>
        </div>

      <div className="grid gap-6">
        {classes.map((classItem) => (
          <div
            key={classItem.id}
            className="relative bg-gradient-to-br from-white via-white to-blue-50/30 rounded-2xl border-2 border-blue-100 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.2)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl -mr-16 -mt-16"></div>

            <div className="relative z-10 p-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <div
                    onClick={() => setSelectedClass(classItem)}
                    className="flex items-center space-x-2 mb-3 cursor-pointer group"
                  >
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors flex items-center">
                      {classItem.name}
                      <ChevronRight className="w-5 h-5 ml-1 text-blue-500 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h3>
                  </div>
                  <p className="text-gray-600 mb-3 leading-relaxed">{classItem.description}</p>
                  <div className="inline-flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mb-4">
                    <span className="text-xs font-semibold text-blue-700">Teacher:</span>
                    <span className="text-xs font-bold text-blue-800">{classItem.teacher_name}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-blue-100/50 mb-4">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Award className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm">Your Points</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                        <TrendingUp className="w-5 h-5 text-white" />
                        <span className="text-2xl font-black text-white">{classItem.class_points}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  <ClassHapiInsightsSection classId={classItem.id} className={classItem.name} />
                </div>

                <div className="w-[400px] flex-shrink-0">
                  <ClassSentimentChart classId={classItem.id} className={classItem.name} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {showJoinModal && (
      <JoinClassModal
        onClose={() => setShowJoinModal(false)}
        onClassJoined={handleClassJoined}
      />
    )}
  </>
  );
}
