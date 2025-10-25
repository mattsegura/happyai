import { MessageSquare, CheckCircle, Clock, BarChart3, EyeOff } from 'lucide-react';

interface PulseQuestion {
  id: string;
  question: string;
  questionType: string;
  answerChoices?: string[];
}

interface AnswerSummary {
  answer: string;
  count: number;
  percentage: number;
  anonymousCount?: number;
}

interface ClassPulseSummaryProps {
  className: string;
  totalStudents: number;
  responded: number;
  missing: number;
  activePulses: PulseQuestion[];
  topAnswers: Record<string, AnswerSummary[]>;
  onViewDetails?: () => void;
}

export function ClassPulseSummary({
  className,
  totalStudents,
  responded,
  missing,
  activePulses,
  topAnswers,
  onViewDetails,
}: ClassPulseSummaryProps) {
  const completionRate = totalStudents > 0 ? Math.round((responded / totalStudents) * 100) : 0;

  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      multiple_choice: 'Multiple Choice',
      slider: 'Slider',
      yes_no: 'Yes/No',
      number: 'Number',
      open_ended: 'Open Ended',
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-card rounded-2xl p-6 border-2 border-border shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{className}</h3>
          <p className="text-xs text-muted-foreground">
            {activePulses.length} active {activePulses.length === 1 ? 'pulse' : 'pulses'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-500/10 dark:to-cyan-500/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Response Rate</span>
            <span className={`text-2xl font-bold ${completionRate >= 70 ? 'text-green-600 dark:text-green-400' : completionRate >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-orange-600 dark:text-orange-400'}`}>
              {completionRate}%
            </span>
          </div>

          <div className="w-full bg-background dark:bg-muted rounded-full h-3 overflow-hidden mb-3 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                completionRate >= 70
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : completionRate >= 50
                  ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                  : 'bg-gradient-to-r from-orange-400 to-red-500'
              }`}
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div>
                <div className="text-xs text-muted-foreground">Responded</div>
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{responded}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <div>
                <div className="text-xs text-muted-foreground">Missing</div>
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{missing}</div>
              </div>
            </div>
          </div>
        </div>

        {activePulses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Popular Answers</span>
            </div>

            {activePulses.map(pulse => {
              const answers = topAnswers[pulse.id] || [];

              return (
                <div key={pulse.id} className="bg-muted/30 dark:bg-muted/20 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-foreground flex-1 mr-2">
                      {pulse.question}
                    </p>
                    <span className="text-xs text-muted-foreground bg-background dark:bg-card px-2 py-1 rounded whitespace-nowrap border border-border">
                      {getQuestionTypeLabel(pulse.questionType)}
                    </span>
                  </div>

                  {answers.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {answers.slice(0, 3).map((answer, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                idx === 0 ? 'bg-blue-500 text-white dark:bg-blue-400' :
                                idx === 1 ? 'bg-blue-400 text-white dark:bg-blue-500' :
                                'bg-blue-300 text-white dark:bg-blue-600'
                              }`}>
                                {idx + 1}
                              </div>
                              <span className="text-sm text-foreground truncate">{answer.answer}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-muted dark:bg-muted/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                                  style={{ width: `${answer.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground w-10 text-right">
                                {answer.percentage}%
                              </span>
                            </div>
                          </div>
                          {answer.anonymousCount && answer.anonymousCount > 0 && (
                            <div className="flex items-center space-x-1 ml-8 text-xs text-purple-600 dark:text-purple-400">
                              <EyeOff className="w-3 h-3" />
                              <span>{answer.anonymousCount} anonymous</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No responses yet</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activePulses.length === 0 && (
          <div className="bg-muted/30 dark:bg-muted/20 rounded-lg p-4 text-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No active pulse checks</p>
          </div>
        )}
      </div>

      {onViewDetails && activePulses.length > 0 && (
        <button
          onClick={onViewDetails}
          className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          View Full Details in Hapi Lab
        </button>
      )}
    </div>
  );
}
