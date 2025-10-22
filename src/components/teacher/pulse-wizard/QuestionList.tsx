import { Edit, Trash2, Copy, GripVertical } from 'lucide-react';
import { PulseQuestion, getQuestionTypeDefinition } from '../../../lib/pulseTypes';

interface QuestionListProps {
  questions: Partial<PulseQuestion>[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function QuestionList({
  questions,
  onEdit,
  onDelete,
  onDuplicate,
}: QuestionListProps) {
  if (questions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-2xl p-12 border-2 border-dashed border-gray-300 text-center">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">No Questions Yet</h3>
        <p className="text-gray-600">Click "Add Question" below to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Questions ({questions.length})
      </h3>
      {questions.map((question, index) => {
        const typeDef = getQuestionTypeDefinition(question.question_type!);
        const hasText = question.question_text && question.question_text.trim().length > 0;

        return (
          <div
            key={index}
            className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start space-x-3">
              <div className="flex items-center space-x-2">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  {typeDef && (
                    <span className={`px-3 py-1 bg-${typeDef.color}-100 text-${typeDef.color}-700 rounded-full text-xs font-semibold`}>
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

                {hasText ? (
                  <p className="text-gray-800 font-medium line-clamp-2">
                    {question.question_text}
                  </p>
                ) : (
                  <p className="text-gray-400 italic">Question text not set</p>
                )}

                {question.options && question.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {question.options.slice(0, 3).map((opt, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                        {opt.option_text}
                      </span>
                    ))}
                    {question.options.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-semibold">
                        +{question.options.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => onEdit(index)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit question"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDuplicate(index)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Duplicate question"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
