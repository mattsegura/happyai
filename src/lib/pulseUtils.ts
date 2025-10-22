import { ClassPulse, StudentRoster } from './mockData';

export interface PulseStatistics {
  totalStudents: number;
  responded: number;
  missing: number;
  responseRate: number;
  topAnswers: Record<string, Array<{
    answer: string;
    count: number;
    percentage: number;
  }>>;
}

export interface PulseQuestionWithAnswers {
  id: string;
  question: string;
  questionType: string;
  answerChoices?: string[];
}

export function calculatePulseStatistics(
  classId: string,
  classPulses: ClassPulse[],
  roster: StudentRoster[]
): PulseStatistics {
  const totalStudents = roster.length;
  const responded = Math.floor(totalStudents * (Math.random() * 0.4 + 0.5));
  const missing = totalStudents - responded;
  const responseRate = totalStudents > 0 ? Math.round((responded / totalStudents) * 100) : 0;

  const activePulses = classPulses.filter(p => p.class_id === classId && p.is_active);
  const topAnswersMap: Record<string, Array<{ answer: string; count: number; percentage: number }>> = {};

  activePulses.forEach(pulse => {
    if (pulse.answer_choices && pulse.answer_choices.length > 0) {
      const counts = pulse.answer_choices.map(() => Math.floor(Math.random() * responded));
      const total = counts.reduce((a, b) => a + b, 0) || 1;

      topAnswersMap[pulse.id] = pulse.answer_choices
        .map((answer, i) => ({
          answer,
          count: counts[i],
          percentage: Math.round((counts[i] / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
    }
  });

  return {
    totalStudents,
    responded,
    missing,
    responseRate,
    topAnswers: topAnswersMap,
  };
}

export function getActivePulses(classId: string, classPulses: ClassPulse[]): PulseQuestionWithAnswers[] {
  return classPulses
    .filter(p => p.class_id === classId && p.is_active)
    .map(pulse => ({
      id: pulse.id,
      question: pulse.question,
      questionType: pulse.question_type,
      answerChoices: pulse.answer_choices || undefined,
    }));
}

export function getTimeRemaining(expiresAt: string): { text: string; hours: number } {
  const expiresIn = new Date(expiresAt).getTime() - Date.now();
  const hoursLeft = Math.floor(expiresIn / (1000 * 60 * 60));

  if (hoursLeft <= 0) {
    return { text: 'Expired', hours: 0 };
  }

  if (hoursLeft >= 24) {
    const daysLeft = Math.floor(hoursLeft / 24);
    return { text: `${daysLeft}d ${hoursLeft % 24}h remaining`, hours: hoursLeft };
  }

  return { text: `${hoursLeft}h remaining`, hours: hoursLeft };
}

export function getQuestionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    multiple_choice: 'Multiple Choice',
    slider: 'Slider',
    yes_no: 'Yes/No',
    number: 'Number',
    open_ended: 'Open Ended',
  };
  return labels[type] || type;
}
