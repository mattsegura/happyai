import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Eye, Save, Send, BookTemplate } from 'lucide-react';
import { PulseQuestion, QuestionType, QUESTION_TYPE_DEFINITIONS, PulseTemplate } from '../../lib/pulseTypes';
import { PulseMetadataForm } from './pulse-wizard/PulseMetadataForm';
import { QuestionList } from './pulse-wizard/QuestionList';
import { QuestionBuilder } from './pulse-wizard/QuestionBuilder';
import { PulsePreview } from './pulse-wizard/PulsePreview';

interface CreatePulseWizardProps {
  onClose: () => void;
  classId?: string;
  classes: Array<{ id: string; name: string }>;
  loadedTemplate?: Partial<PulseTemplate>;
}

type WizardStep = 'metadata' | 'questions' | 'preview';

export function CreatePulseWizard({ onClose, classId, classes, loadedTemplate }: CreatePulseWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('metadata');
  const [selectedClassId, setSelectedClassId] = useState(classId || '');
  const [title, setTitle] = useState(loadedTemplate?.template_data?.title || '');
  const [description, setDescription] = useState(loadedTemplate?.template_data?.description || '');
  const [expiresIn, setExpiresIn] = useState('24');
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [questions, setQuestions] = useState<Partial<PulseQuestion>[]>(
    loadedTemplate?.template_data?.questions?.map((q, i) => ({
      ...q,
      position: i,
      options: q.options?.map((opt, optIdx) => ({
        id: `opt-${optIdx}`,
        question_id: '',
        option_text: opt.option_text,
        option_value: null,
        position: opt.position,
        created_at: '',
      })),
    })) || []
  );
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Partial<PulseQuestion> = {
      question_text: '',
      question_type: type,
      position: questions.length,
      is_required: true,
      points_value: 10,
      configuration: {},
      options: [],
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(questions.length);
    setShowQuestionTypeSelector(false);
  };

  const handleUpdateQuestion = (index: number, updated: Partial<PulseQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updated };
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingQuestion === index) {
      setEditingQuestion(null);
    }
  };

  const handleDuplicateQuestion = (index: number) => {
    const questionToDuplicate = { ...questions[index] };
    const newQuestion = {
      ...questionToDuplicate,
      position: questions.length,
      question_text: questionToDuplicate.question_text + ' (Copy)',
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleReorderQuestions = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions];
    const [removed] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, removed);
    newQuestions.forEach((q, i) => {
      q.position = i;
    });
    setQuestions(newQuestions);
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
  };

  const handleSaveAsTemplate = async (templateName: string, templateDescription: string, category: string) => {
    setSaving(true);
    const templateData = {
      title: title,
      description: description,
      questions: questions.map((q) => ({
        question_text: q.question_text || '',
        question_type: q.question_type!,
        is_required: q.is_required ?? true,
        points_value: q.points_value || 10,
        configuration: q.configuration || {},
        options: q.options?.map((opt) => ({
          option_text: opt.option_text || '',
          position: opt.position || 0,
        })),
      })),
    };

    console.log('Saving template:', { templateName, templateDescription, category, templateData });
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    setShowSaveTemplateModal(false);
  };

  const handlePublish = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSaving(false);
    onClose();
  };

  const canProceedToQuestions = selectedClassId && title.trim();
  const canProceedToPreview = questions.length > 0 && questions.every(q => q.question_text?.trim());
  const canSaveAsTemplate = title.trim() && questions.length > 0;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points_value || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {currentStep === 'metadata' && 'Create Pulse Check'}
              {currentStep === 'questions' && 'Add Questions'}
              {currentStep === 'preview' && 'Preview & Publish'}
            </h2>
            <p className="text-gray-600 mt-1">
              {currentStep === 'metadata' && 'Set up your pulse check details'}
              {currentStep === 'questions' && `${questions.length} ${questions.length === 1 ? 'question' : 'questions'} added • ${totalPoints} points total`}
              {currentStep === 'preview' && 'Review your pulse check before publishing'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center justify-center py-4 px-6 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              currentStep === 'metadata' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
            }`}>
              {currentStep === 'metadata' ? '1' : '✓'}
            </div>
            <span className={`font-semibold ${currentStep === 'metadata' ? 'text-blue-600' : 'text-gray-600'}`}>
              Details
            </span>
            <div className="w-12 h-0.5 bg-gray-300 mx-2" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              currentStep === 'questions' ? 'bg-blue-500 text-white' :
              currentStep === 'preview' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              {currentStep === 'preview' ? '✓' : '2'}
            </div>
            <span className={`font-semibold ${currentStep === 'questions' ? 'text-blue-600' : 'text-gray-600'}`}>
              Questions
            </span>
            <div className="w-12 h-0.5 bg-gray-300 mx-2" />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
              currentStep === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              3
            </div>
            <span className={`font-semibold ${currentStep === 'preview' ? 'text-blue-600' : 'text-gray-600'}`}>
              Review
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'metadata' && (
            <PulseMetadataForm
              classes={classes}
              selectedClassId={selectedClassId}
              onClassChange={setSelectedClassId}
              title={title}
              onTitleChange={setTitle}
              description={description}
              onDescriptionChange={setDescription}
              expiresIn={expiresIn}
              onExpiresInChange={setExpiresIn}
              allowAnonymous={allowAnonymous}
              onAllowAnonymousChange={setAllowAnonymous}
            />
          )}

          {currentStep === 'questions' && (
            <div className="space-y-6">
              {editingQuestion !== null && questions[editingQuestion] ? (
                <QuestionBuilder
                  question={questions[editingQuestion]}
                  onUpdate={(updated) => handleUpdateQuestion(editingQuestion, updated)}
                  onClose={() => setEditingQuestion(null)}
                />
              ) : (
                <>
                  <QuestionList
                    questions={questions}
                    onEdit={setEditingQuestion}
                    onDelete={handleDeleteQuestion}
                    onDuplicate={handleDuplicateQuestion}
                    onReorder={handleReorderQuestions}
                  />
                  <button
                    onClick={() => setShowQuestionTypeSelector(true)}
                    className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 font-semibold hover:bg-blue-50 hover:border-blue-400 transition-all duration-300"
                  >
                    + Add Question
                  </button>
                </>
              )}

              {showQuestionTypeSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">Choose Question Type</h3>
                      <button
                        onClick={() => setShowQuestionTypeSelector(false)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      >
                        <X className="w-6 h-6 text-gray-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {QUESTION_TYPE_DEFINITIONS.map((typeDef) => (
                        <button
                          key={typeDef.value}
                          onClick={() => handleAddQuestion(typeDef.value)}
                          className={`p-6 border-2 rounded-2xl text-left hover:shadow-lg transition-all duration-300 hover:scale-105 bg-${typeDef.color}-50 border-${typeDef.color}-200 hover:border-${typeDef.color}-400`}
                        >
                          <div className={`w-12 h-12 rounded-xl bg-${typeDef.color}-500 text-white flex items-center justify-center mb-3 text-2xl`}>
                            {typeDef.icon === 'BarChart3' && '📊'}
                            {typeDef.icon === 'CircleDot' && '⭕'}
                            {typeDef.icon === 'CheckSquare' && '☑️'}
                            {typeDef.icon === 'FileText' && '📝'}
                            {typeDef.icon === 'Type' && '✏️'}
                            {typeDef.icon === 'Sliders' && '🎚️'}
                            {typeDef.icon === 'Star' && '⭐'}
                            {typeDef.icon === 'Calendar' && '📅'}
                            {typeDef.icon === 'ArrowUpDown' && '↕️'}
                            {typeDef.icon === 'HelpCircle' && '❓'}
                            {typeDef.icon === 'List' && '📋'}
                          </div>
                          <h4 className="font-bold text-gray-800 mb-1">{typeDef.label}</h4>
                          <p className="text-sm text-gray-600">{typeDef.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'preview' && (
            <PulsePreview
              title={title}
              description={description}
              className={classes.find(c => c.id === selectedClassId)?.name || ''}
              questions={questions}
              totalPoints={totalPoints}
              expiresIn={expiresIn}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving || !canProceedToQuestions}
              className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Draft'}</span>
            </button>

            <button
              onClick={() => setShowSaveTemplateModal(true)}
              disabled={!canSaveAsTemplate}
              className="px-6 py-3 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200 disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
            >
              <BookTemplate className="w-5 h-5" />
              <span>Save as Template</span>
            </button>
          </div>

          <div className="flex space-x-3">
            {currentStep !== 'metadata' && (
              <button
                onClick={() => {
                  if (currentStep === 'questions') setCurrentStep('metadata');
                  if (currentStep === 'preview') setCurrentStep('questions');
                }}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center space-x-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}

            {currentStep === 'metadata' && (
              <button
                onClick={() => setCurrentStep('questions')}
                disabled={!canProceedToQuestions}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
              >
                <span>Next: Add Questions</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {currentStep === 'questions' && (
              <button
                onClick={() => setCurrentStep('preview')}
                disabled={!canProceedToPreview}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
              >
                <Eye className="w-5 h-5" />
                <span>Preview</span>
              </button>
            )}

            {currentStep === 'preview' && (
              <button
                onClick={handlePublish}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:shadow-xl disabled:opacity-50 transition-all duration-300 flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>{saving ? 'Publishing...' : 'Publish Pulse'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {showSaveTemplateModal && (
        <SaveTemplateModal
          onClose={() => setShowSaveTemplateModal(false)}
          onSave={handleSaveAsTemplate}
          saving={saving}
        />
      )}
    </div>
  );
}

interface SaveTemplateModalProps {
  onClose: () => void;
  onSave: (name: string, description: string, category: string) => void;
  saving: boolean;
}

function SaveTemplateModal({ onClose, onSave, saving }: SaveTemplateModalProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [category, setCategory] = useState('general');

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName, templateDescription, category);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Save as Template</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Weekly Check-In Template"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300 resize-none"
              maxLength={300}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 transition-all duration-300"
            >
              <option value="general">General</option>
              <option value="check-in">Check-In</option>
              <option value="assessment">Assessment</option>
              <option value="feedback">Feedback</option>
              <option value="reflection">Reflection</option>
              <option value="survey">Survey</option>
            </select>
          </div>

          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              💡 Templates save your questions and structure. You can reuse them later and customize
              them for different classes and topics.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!templateName.trim() || saving}
              className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 transition-all duration-300"
            >
              {saving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
