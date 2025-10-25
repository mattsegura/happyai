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
    onUpdate({ ...question, options: newOptions as QuestionOption[] });
  };

  const handleUpdateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], option_text: text };
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions as QuestionOption[] });
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    newOptions.forEach((opt, i) => {
      opt.position = i;
    });
    setOptions(newOptions);
    onUpdate({ ...question, options: newOptions as QuestionOption[] });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-foreground">
            {typeDef?.label || 'Edit Question'}
          </h3>
          <p className="text-sm text-muted-foreground">{typeDef?.description}</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Question Text <span className="text-red-500 dark:text-red-400">*</span>
          </label>
          <textarea
            value={question.question_text || ''}
            onChange={(e) => onUpdate({ ...question, question_text: e.target.value })}
            placeholder="Enter your question..."
            rows={3}
            className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 resize-none text-foreground placeholder:text-muted-foreground"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {(question.question_text || '').length}/500
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
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
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
            />
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer mt-8">
              <input
                type="checkbox"
                checked={question.is_required ?? true}
                onChange={(e) => onUpdate({ ...question, is_required: e.target.checked })}
                className="w-5 h-5 text-blue-600 dark:text-blue-500 rounded focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600"
              />
              <span className="text-sm font-semibold text-foreground">Required Question</span>
            </label>
          </div>
        </div>

        {requiresOptions && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-foreground">
                Answer Options <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <button
                onClick={handleAddOption}
                className="px-3 py-1.5 bg-blue-500 dark:bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Option</span>
              </button>
            </div>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-muted dark:bg-muted/50 rounded-lg flex items-center justify-center font-semibold text-sm text-foreground">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option.option_text || ''}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-card border-2 border-border rounded-lg focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground placeholder:text-muted-foreground"
                    maxLength={200}
                  />
                  <button
                    onClick={() => handleDeleteOption(index)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {options.length === 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    Add at least 2 options for students to choose from
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {question.question_type === 'open_ended' && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
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
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
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
            <label className="block text-sm font-semibold text-foreground mb-2">Word Limit</label>
            <select
              value={question.configuration?.maxWords || 50}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  configuration: { ...question.configuration, maxWords: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
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
              <label className="block text-sm font-semibold text-foreground mb-2">Min Value</label>
              <input
                type="number"
                value={question.configuration?.min || 0}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    configuration: { ...question.configuration, min: parseInt(e.target.value) },
                  })
                }
                className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Max Value</label>
              <input
                type="number"
                value={question.configuration?.max || 100}
                onChange={(e) =>
                  onUpdate({
                    ...question,
                    configuration: { ...question.configuration, max: parseInt(e.target.value) },
                  })
                }
                className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Step</label>
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
                className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
              />
            </div>
          </div>
        )}

        {question.question_type === 'rating_scale' && (
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Scale Type</label>
            <select
              value={question.configuration?.scale || 5}
              onChange={(e) =>
                onUpdate({
                  ...question,
                  configuration: { ...question.configuration, scale: parseInt(e.target.value) },
                })
              }
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
            >
              <option value={5}>1-5 Scale</option>
              <option value={10}>1-10 Scale</option>
            </select>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-blue-200 dark:border-blue-800">
          <button
            onClick={onClose}
            disabled={!question.question_text?.trim()}
            className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Done Editing
          </button>
        </div>
      </div>
    </div>
  );
}
