import { Clock, Award, CheckCircle } from 'lucide-react';
import { PulseQuestion, getQuestionTypeDefinition } from '../../../lib/pulseTypes';

interface PulsePreviewProps {
  title: string;
  description: string;
  className: string;
  questions: Partial<PulseQuestion>[];
  totalPoints: number;
  expiresIn: string;
}

export function PulsePreview({
  title,
  description,
  className,
  questions,
  totalPoints,
  expiresIn,
}: PulsePreviewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
            {description && <p className="text-gray-700">{description}</p>}
          </div>
          <div className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold">
            {className}
          </div>
        </div>

        <div className="flex items-center space-x-6 pt-4 border-t border-blue-300">
          <div className="flex items-center space-x-2 text-gray-700">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">
              Due in {expiresIn} {parseInt(expiresIn) === 1 ? 'hour' : 'hours'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">{questions.length} Questions</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-700">
            <Award className="w-5 h-5" />
            <span className="font-semibold">{totalPoints} Points Total</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Preview Questions</h3>
        {questions.map((question, index) => {
          const typeDef = getQuestionTypeDefinition(question.question_type!);
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-md"
            >
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {typeDef && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {typeDef.label}
                      </span>
                    )}
                    {question.is_required && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        Required
                      </span>
                    )}
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      {question.points_value} pts
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-800 mb-3">
                    {question.question_text}
                  </p>

                  {question.question_type === 'poll' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                            <span className="text-gray-700">{opt.option_text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'multiple_choice_single' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-400" />
                            <span className="text-gray-700">{opt.option_text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'multiple_choice_multi' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-5 h-5 rounded border-2 border-gray-400" />
                            <span className="text-gray-700">{opt.option_text}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'open_ended' && (
                    <textarea
                      placeholder="Students will type their answer here..."
                      rows={4}
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl resize-none"
                    />
                  )}

                  {question.question_type === 'short_answer' && (
                    <input
                      type="text"
                      placeholder="Students will type a brief answer here..."
                      disabled
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl"
                    />
                  )}

                  {question.question_type === 'slider' && (
                    <div className="space-y-2">
                      <input
                        type="range"
                        min={question.configuration?.min || 0}
                        max={question.configuration?.max || 100}
                        step={question.configuration?.step || 1}
                        disabled
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{question.configuration?.min || 0}</span>
                        <span>{question.configuration?.max || 100}</span>
                      </div>
                    </div>
                  )}

                  {question.question_type === 'rating_scale' && (
                    <div className="flex space-x-2">
                      {Array.from({ length: question.configuration?.scale || 5 }).map((_, idx) => (
                        <button
                          key={idx}
                          disabled
                          className="w-12 h-12 border-2 border-gray-300 rounded-lg hover:bg-yellow-100 transition-colors flex items-center justify-center text-2xl"
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'yes_no_maybe' && (
                    <div className="flex space-x-3">
                      {['Yes', 'No', 'Maybe'].map((option) => (
                        <button
                          key={option}
                          disabled
                          className="flex-1 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-blue-300 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'ranking' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 border-2 border-gray-200 rounded-lg flex items-center space-x-3"
                        >
                          <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs font-bold">
                            ⋮⋮
                          </div>
                          <span className="text-gray-700">{opt.option_text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.question_type === 'calendar' && (
                    <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-center">
                      <div className="text-4xl mb-2">📅</div>
                      <p className="text-sm text-gray-600">Calendar picker will appear here</p>
                    </div>
                  )}

                  {question.question_type === 'likert_scale' && (
                    <div className="space-y-3">
                      {['Statement 1', 'Statement 2', 'Statement 3'].map((statement, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 mb-2">{statement}</p>
                          <div className="flex space-x-2">
                            {['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].map(
                              (label, labelIdx) => (
                                <button
                                  key={labelIdx}
                                  disabled
                                  className="flex-1 py-2 bg-white border border-gray-300 rounded text-xs hover:border-blue-300 transition-colors"
                                >
                                  {labelIdx + 1}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
        <h4 className="text-lg font-bold text-green-900 mb-2">Ready to Publish?</h4>
        <p className="text-green-800">
          This pulse will be sent to all students in {className}. They'll have {expiresIn} hours to
          complete it and earn up to {totalPoints} points.
        </p>
      </div>
    </div>
  );
}
