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
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-slate-900">You’re not in any classes yet</h3>
          <p className="mt-2 text-sm text-slate-500">Ask your teacher for a class code to get started.</p>
          <button
            onClick={() => setShowJoinModal(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <Hash className="h-4 w-4" /> Enter class code
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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Your classes</h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Wellness and progress snapshots</p>
            </div>
          </div>
          <button
            onClick={() => setShowJoinModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 transition hover:border-primary-300 hover:bg-primary-50"
          >
            <Hash className="h-4 w-4" /> Enter class code
          </button>
        </div>

        <div className="grid gap-5">
          {classes.map((classItem) => (
            <article
              key={classItem.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-4">
                  <button
                    onClick={() => setSelectedClass(classItem)}
                    className="flex items-center gap-2 text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{classItem.name}</h3>
                      <p className="text-xs text-slate-500">Tap to open analytics</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>

                  <p className="text-sm leading-relaxed text-slate-600">{classItem.description}</p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    Teacher <span className="text-slate-900">{classItem.teacher_name}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                      <Award className="h-4 w-4 text-primary-500" /> Your points
                    </div>
                    <span className="text-2xl font-bold text-primary-600">{classItem.class_points}</span>
                  </div>

                  <ClassHapiInsightsSection classId={classItem.id} className={classItem.name} />
                </div>

                <div className="w-full max-w-md flex-shrink-0">
                  <ClassSentimentChart classId={classItem.id} className={classItem.name} />
                </div>
              </div>
            </article>
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
