import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { PulseQuestion, QuestionOption, getQuestionTypeDefinition } from '../../../lib/pulseTypes';

interface QuestionBuilderProps {
  question: Partial<PulseQuestion>;
  onUpdate: (question: Partial<PulseQuestion>) => void;
  onClose: () => void;
}

export function QuestionBuilder({ question, onUpdate, onClose }: QuestionBuilderProps) {
  const typeDef = getQuestionTypeDefinition(question.question_type!);
  const [options, setOptions] = useState<Partial<QuestionOption>[]>(question.options || []);

  const requiresOptions = [
    'poll',
    'multiple_choice_single',
    'multiple_choice_multi',
    'ranking',
  ].includes(question.question_type!);

  const handleAddOption = () => {
    const newOption: Partial<QuestionOption> = {
      option_text: '',
      position: options.length,
    };
    const newOptions = [...options, newOption];
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions });
  };

  const handleUpdateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], option_text: text };
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions });
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    newOptions.forEach((opt, i) => {
      opt.position = i;
    });
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">
            {typeDef?.label || 'Edit Question'}
          </h3>
          <p className="text-sm text-gray-600">{typeDef?.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-blue-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Question Text <span className="text-red-500">*</span>
          </label>
          <textarea
            value={question.question_text || ''}
            onChange={(e) => onUpdate({ ...question, question_text: e.target.value })}
            placeholder="Enter your question..."
            rows={3}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {(question.question_text || '').length}/500
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Points Value
            </label>
            <input
              type="number"
              value={question.points_value || 10}
              onChange={(e) =>
                onUpdate({ ...question, points_value: parseInt(e.target.value) || 10 })
              }
              min={1}
              max={100}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mt-8">
              <input
                type="checkbox"
                checked={question.is_required ?? true}
                onChange={(e) => onUpdate({ ...question, is_required: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-400"
              />
              <span className="text-sm font-semibold text-gray-700">Required Question</span>
            </label>
          </div>
        </div>

        {requiresOptions && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                Answer Options <span className="text-red-500">*</span>
              </label>
              <button
                onClick={handleAddOption}
                className="px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center font-semibold text-sm text-gray-700">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option.option_text || ''}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 transition-all duration-300"
                    maxLength={200}
                  />
                  <button
                    onClick={() => handleDeleteOption(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {options.length === 0 && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800">
                    Add at least 2 options for students to choose from
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {question.question_type === 'open_ended' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Character Limit
            </label>
            <select
              value={question.configuration?.maxCharacters || 500}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  configuration: { ...question.configuration, maxCharacters: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
            >
              <option value={250}>250 characters</option>
              <option value={500}>500 characters</option>
              <option value={1000}>1000 characters</option>
              <option value={2000}>2000 characters</option>
            </select>
          </div>
        )}

        {question.question_type === 'short_answer' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Word Limit</label>
            <select
              value={question.configuration?.maxWords || 50}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  configuration: { ...question.configuration, maxWords: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
            >
              <option value={25}>25 words</option>
              <option value={50}>50 words</option>
              <option value={100}>100 words</option>
              <option value={200}>200 words</option>
            </select>
          </div>
        )}

        {question.question_type === 'slider' && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Min Value</label>
              <input
                type="number"
                value={question.configuration?.min || 0}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    configuration: { ...question.configuration, min: parseInt(e.target.value) },
                  })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Max Value</label>
              <input
                type="number"
                value={question.configuration?.max || 100}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    configuration: { ...question.configuration, max: parseInt(e.target.value) },
                  })
                }
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Step</label>
              <input
                type="number"
                value={question.configuration?.step || 1}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    configuration: { ...question.configuration, step: parseInt(e.target.value) },
                  })
                }
                min={1}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
              />
            </div>
          </div>
        )}

        {question.question_type === 'rating_scale' && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Scale Type</label>
            <select
              value={question.configuration?.scale || 5}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  configuration: { ...question.configuration, scale: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
            >
              <option value={5}>1-5 Scale</option>
              <option value={10}>1-10 Scale</option>
            </select>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-blue-200">
          <button
            onClick={onClose}
            disabled={!question.question_text?.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Done Editing
          </button>
        </div>
      </div>
    </div>
  );
}
