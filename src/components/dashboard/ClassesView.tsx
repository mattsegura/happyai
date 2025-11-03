import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  Users,
  GraduationCap,
  Award,
  ChevronRight,
  Hash,
  Loader2,
  Search,
} from "lucide-react";
import { ClassAnalyticsDetail } from "./ClassAnalyticsDetail";
import { JoinClassModal } from "./JoinClassModal";
import { BrowseClassesModal } from "./BrowseClassesModal";
import { ClassSentimentChart } from "./ClassSentimentChart";
import { ClassHapiInsightsSection } from "./ClassHapiInsightsSection";

type ClassWithPoints = {
  id: string;
  name: string;
  description: string;
  teacher_name: string;
  class_points: number;
};

export function ClassesView() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<ClassWithPoints | null>(
    null
  );
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [classes, setClasses] = useState<ClassWithPoints[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's class memberships with class details
      const { data: memberships, error } = await supabase
        .from("class_members")
        .select(
          `
          class_points,
          classes (
            id,
            name,
            description,
            teacher_name
          )
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      const classesData: ClassWithPoints[] = (memberships || []).map(
        (m: any) => ({
          id: m.classes.id,
          name: m.classes.name,
          description: m.classes.description || "",
          teacher_name: m.classes.teacher_name || "Unknown Teacher",
          class_points: m.class_points || 0,
        })
      );

      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  if (selectedClass) {
    return (
      <ClassAnalyticsDetail
        classId={selectedClass.id}
        className={selectedClass.name}
        teacherName={selectedClass.teacher_name}
        description={selectedClass.description}
        onBack={() => setSelectedClass(null)}
      />
    );
  }

  const handleClassJoined = () => {
    fetchClasses(); // Refresh classes after joining
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <>
        <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-xl font-semibold text-foreground">
            You're not in any classes yet
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse available classes or enter a class code to join.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowBrowseModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Search className="h-4 w-4" /> Browse Classes
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <Hash className="h-4 w-4" /> Enter Class Code
            </button>
          </div>
        </div>

        {showJoinModal && (
          <JoinClassModal
            onClose={() => setShowJoinModal(false)}
            onClassJoined={handleClassJoined}
          />
        )}

        {showBrowseModal && (
          <BrowseClassesModal
            onClose={() => setShowBrowseModal(false)}
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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Your classes
              </h1>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Wellness and progress snapshots
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBrowseModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
            >
              <Search className="h-4 w-4" /> Browse Classes
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <Hash className="h-4 w-4" /> Enter Code
            </button>
          </div>
        </div>

        <div className="grid gap-5">
          {classes.map((classItem) => (
            <article
              key={classItem.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1 space-y-4">
                  <button
                    onClick={() => setSelectedClass(classItem)}
                    className="flex items-center gap-2 text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 text-primary">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {classItem.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Tap to open analytics
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {classItem.description}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-semibold text-muted-foreground">
                    Teacher{" "}
                    <span className="text-foreground">
                      {classItem.teacher_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                      <Award className="h-4 w-4 text-primary" /> Your points
                    </div>
                    <span className="text-2xl font-bold text-primary">
                      {classItem.class_points}
                    </span>
                  </div>

                  <ClassHapiInsightsSection
                    classId={classItem.id}
                    className={classItem.name}
                  />
                </div>

                <div className="w-full max-w-md flex-shrink-0">
                  <ClassSentimentChart
                    classId={classItem.id}
                    className={classItem.name}
                  />
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

      {showBrowseModal && (
        <BrowseClassesModal
          onClose={() => setShowBrowseModal(false)}
          onClassJoined={handleClassJoined}
        />
      )}
    </>
  );
}
