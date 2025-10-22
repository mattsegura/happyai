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
    <div className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center space-x-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">{className}</h3>
          <p className="text-xs text-gray-500">
            {activePulses.length} active {activePulses.length === 1 ? 'pulse' : 'pulses'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Response Rate</span>
            <span className={`text-2xl font-bold ${completionRate >= 70 ? 'text-green-600' : completionRate >= 50 ? 'text-yellow-600' : 'text-orange-600'}`}>
              {completionRate}%
            </span>
          </div>

          <div className="w-full bg-white rounded-full h-3 overflow-hidden mb-3 shadow-inner">
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
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-600">Responded</div>
                <div className="text-lg font-bold text-green-600">{responded}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <div className="text-xs text-gray-600">Missing</div>
                <div className="text-lg font-bold text-orange-600">{missing}</div>
              </div>
            </div>
          </div>
        </div>

        {activePulses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Popular Answers</span>
            </div>

            {activePulses.map(pulse => {
              const answers = topAnswers[pulse.id] || [];

              return (
                <div key={pulse.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-medium text-gray-800 flex-1 mr-2">
                      {pulse.question}
                    </p>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded whitespace-nowrap">
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
                                idx === 0 ? 'bg-blue-500 text-white' :
                                idx === 1 ? 'bg-blue-400 text-white' :
                                'bg-blue-300 text-white'
                              }`}>
                                {idx + 1}
                              </div>
                              <span className="text-sm text-gray-700 truncate">{answer.answer}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full transition-all duration-500"
                                  style={{ width: `${answer.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-600 w-10 text-right">
                                {answer.percentage}%
                              </span>
                            </div>
                          </div>
                          {answer.anonymousCount && answer.anonymousCount > 0 && (
                            <div className="flex items-center space-x-1 ml-8 text-xs text-purple-600">
                              <EyeOff className="w-3 h-3" />
                              <span>{answer.anonymousCount} anonymous</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">No responses yet</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activePulses.length === 0 && (
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No active pulse checks</p>
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
