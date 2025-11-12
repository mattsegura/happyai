import { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Save,
  Send,
  BookTemplate,
} from "lucide-react";
import {
  PulseQuestion,
  QuestionType,
  QUESTION_TYPE_DEFINITIONS,
  PulseTemplate,
} from "../../lib/pulseTypes";
import { PulseMetadataForm } from "./pulse-wizard/PulseMetadataForm";
import { QuestionList } from "./pulse-wizard/QuestionList";
import { QuestionBuilder } from "./pulse-wizard/QuestionBuilder";
import { PulsePreview } from "./pulse-wizard/PulsePreview";
import { motion } from "framer-motion";

interface CreatePulseWizardProps {
  onClose: () => void;
  classId?: string;
  classes: Array<{ id: string; name: string }>;
  loadedTemplate?: Partial<PulseTemplate>;
}

type WizardStep = "metadata" | "questions" | "preview";

export function CreatePulseWizard({
  onClose,
  classId,
  classes,
  loadedTemplate,
}: CreatePulseWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>("metadata");
  const [selectedClassId, setSelectedClassId] = useState(classId || "");
  const [title, setTitle] = useState(
    loadedTemplate?.template_data?.title || ""
  );
  const [description, setDescription] = useState(
    loadedTemplate?.template_data?.description || ""
  );
  const [expiresIn, setExpiresIn] = useState("24");
  const [allowAnonymous, setAllowAnonymous] = useState(false);
  const [questions, setQuestions] = useState<Partial<PulseQuestion>[]>(
    loadedTemplate?.template_data?.questions?.map((q, i) => ({
      ...q,
      position: i,
      options: q.options?.map((opt, optIdx) => ({
        id: `opt-${optIdx}`,
        question_id: "",
        option_text: opt.option_text,
        option_value: null,
        position: opt.position,
        created_at: "",
      })),
    })) || []
  );
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Partial<PulseQuestion> = {
      question_text: "",
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

  const handleUpdateQuestion = (
    index: number,
    updated: Partial<PulseQuestion>
  ) => {
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
      question_text: questionToDuplicate.question_text + " (Copy)",
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

  const handleSaveAsTemplate = async (
    templateName: string,
    templateDescription: string,
    category: string
  ) => {
    setSaving(true);
    const templateData = {
      title: title,
      description: description,
      questions: questions.map((q) => ({
        question_text: q.question_text || "",
        question_type: q.question_type!,
        is_required: q.is_required ?? true,
        points_value: q.points_value || 10,
        configuration: q.configuration || {},
        options: q.options?.map((opt) => ({
          option_text: opt.option_text || "",
          position: opt.position || 0,
        })),
      })),
    };

    console.log("Saving template:", {
      templateName,
      templateDescription,
      category,
      templateData,
    });
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
  const canProceedToPreview =
    questions.length > 0 && questions.every((q) => q.question_text?.trim());
  const canSaveAsTemplate = title.trim() && questions.length > 0;
  const totalPoints = questions.reduce(
    (sum, q) => sum + (q.points_value || 0),
    0
  );

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-lg z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl border border-border/50 my-8"
        >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {currentStep === "metadata" && "Create Pulse Check"}
              {currentStep === "questions" && "Add Questions"}
              {currentStep === "preview" && "Preview & Publish"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {currentStep === "metadata" && "Set up your pulse check details"}
              {currentStep === "questions" &&
                `${questions.length} ${
                  questions.length === 1 ? "question" : "questions"
                } added • ${totalPoints} points total`}
              {currentStep === "preview" &&
                "Review your pulse check before publishing"}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Step Indicator - Matching Student Modal Style */}
        <div className="flex items-center justify-center py-3 px-6 bg-muted/20 dark:bg-muted/10 border-b border-border">
          <div className="flex items-center gap-3">
            {/* Step 1 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${
                  currentStep === "metadata"
                    ? "bg-primary text-white shadow-md"
                    : "bg-green-500 text-white"
                }`}
              >
                {currentStep === "metadata" ? "1" : "✓"}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === "metadata"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Details
              </span>
            </div>

            {/* Connector */}
            <div className="w-8 h-0.5 bg-border" />

            {/* Step 2 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${
                  currentStep === "questions"
                    ? "bg-primary text-white shadow-md"
                    : currentStep === "preview"
                    ? "bg-green-500 text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep === "preview" ? "✓" : "2"}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === "questions"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Questions
              </span>
            </div>

            {/* Connector */}
            <div className="w-8 h-0.5 bg-border" />

            {/* Step 3 */}
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm transition-all ${
                  currentStep === "preview"
                    ? "bg-primary text-white shadow-md"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                3
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === "preview"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Review
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/5 dark:bg-muted/5">
          {currentStep === "metadata" && (
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

          {currentStep === "questions" && (
            <div className="space-y-6">
              {editingQuestion !== null && questions[editingQuestion] ? (
                <QuestionBuilder
                  question={questions[editingQuestion]}
                  onUpdate={(updated) =>
                    handleUpdateQuestion(editingQuestion, updated)
                  }
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
                    className="w-full py-4 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-xl text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300"
                  >
                    + Add Question
                  </button>
                </>
              )}

              {showQuestionTypeSelector && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-card rounded-3xl p-8 max-w-4xl w-full shadow-2xl max-h-[80vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-foreground">
                        Choose Question Type
                      </h3>
                      <button
                        onClick={() => setShowQuestionTypeSelector(false)}
                        className="p-2 hover:bg-muted rounded-xl transition-colors"
                      >
                        <X className="w-6 h-6 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {QUESTION_TYPE_DEFINITIONS.map((typeDef) => (
                        <button
                          key={typeDef.value}
                          onClick={() => handleAddQuestion(typeDef.value)}
                          className={`p-6 border-2 rounded-2xl text-left hover:shadow-lg transition-all duration-300 hover:scale-105 bg-${typeDef.color}-50 dark:bg-${typeDef.color}-950/30 border-${typeDef.color}-200 dark:border-${typeDef.color}-800 hover:border-${typeDef.color}-400 dark:hover:border-${typeDef.color}-600`}
                        >
                          <div
                            className={`w-12 h-12 rounded-xl bg-${typeDef.color}-500 dark:bg-${typeDef.color}-600 text-white flex items-center justify-center mb-3 text-2xl`}
                          >
                            {typeDef.icon === "BarChart3" && "📊"}
                            {typeDef.icon === "CircleDot" && "⭕"}
                            {typeDef.icon === "CheckSquare" && "☑️"}
                            {typeDef.icon === "FileText" && "📝"}
                            {typeDef.icon === "Type" && "✏️"}
                            {typeDef.icon === "Sliders" && "🎚️"}
                            {typeDef.icon === "Star" && "⭐"}
                            {typeDef.icon === "Calendar" && "📅"}
                            {typeDef.icon === "ArrowUpDown" && "↕️"}
                            {typeDef.icon === "HelpCircle" && "❓"}
                            {typeDef.icon === "List" && "📋"}
                          </div>
                          <h4 className="font-bold text-foreground mb-1">
                            {typeDef.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {typeDef.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === "preview" && (
            <PulsePreview
              title={title}
              description={description}
              className={
                classes.find((c) => c.id === selectedClassId)?.name || ""
              }
              questions={questions}
              totalPoints={totalPoints}
              expiresIn={expiresIn}
            />
          )}
        </div>

        <div className="flex items-center justify-between p-5 border-t border-border bg-muted/20 dark:bg-muted/10">
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveDraft}
              disabled={saving || !canProceedToQuestions}
              className="px-4 py-2 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSaveTemplateModal(true)}
              disabled={!canSaveAsTemplate}
              className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-lg hover:border-primary/50 disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
            >
              <BookTemplate className="h-4 w-4" />
              <span>Save as Template</span>
            </motion.button>
          </div>

          <div className="flex gap-2">
            {currentStep !== "metadata" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (currentStep === "questions") setCurrentStep("metadata");
                  if (currentStep === "preview") setCurrentStep("questions");
                }}
                className="px-4 py-2 bg-card border border-border text-foreground font-medium rounded-lg hover:bg-muted/50 transition-all duration-200 flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </motion.button>
            )}

            {currentStep === "metadata" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep("questions")}
                disabled={!canProceedToQuestions}
                className="px-5 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
              >
                <span>Next: Questions</span>
                <ChevronRight className="h-4 w-4" />
              </motion.button>
            )}

            {currentStep === "questions" && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStep("preview")}
                disabled={!canProceedToPreview}
                className="px-5 py-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </motion.button>
            )}

            {currentStep === "preview" && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePublish}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:shadow-xl disabled:opacity-50 transition-all duration-200 flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                <span>{saving ? "Publishing..." : "Publish Pulse"}</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

        {showSaveTemplateModal && (
          <SaveTemplateModal
            onClose={() => setShowSaveTemplateModal(false)}
            onSave={handleSaveAsTemplate}
            saving={saving}
          />
        )}
      </div>
    </motion.div>,
    document.body
  );
}

interface SaveTemplateModalProps {
  onClose: () => void;
  onSave: (name: string, description: string, category: string) => void;
  saving: boolean;
}

function SaveTemplateModal({
  onClose,
  onSave,
  saving,
}: SaveTemplateModalProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [category, setCategory] = useState("general");

  const handleSave = () => {
    if (templateName.trim()) {
      onSave(templateName, templateDescription, category);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-card rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-border/50"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl font-bold text-foreground">
            Save as Template
          </h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </motion.button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Template Name{" "}
              <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Weekly Check-In Template"
              className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/20 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground placeholder:text-muted-foreground"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Description (Optional)
            </label>
            <textarea
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
              placeholder="Describe when to use this template..."
              rows={3}
              className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/20 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 resize-none text-foreground placeholder:text-muted-foreground"
              maxLength={300}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-muted/30 dark:bg-muted/20 border-2 border-border rounded-xl focus:outline-none focus:border-blue-400 dark:focus:border-blue-600 transition-all duration-300 text-foreground"
            >
              <option value="general">General</option>
              <option value="check-in">Check-In</option>
              <option value="assessment">Assessment</option>
              <option value="feedback">Feedback</option>
              <option value="reflection">Reflection</option>
              <option value="survey">Survey</option>
            </select>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 Templates save your questions and structure. You can reuse them
              later and customize them for different classes and topics.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-2.5 bg-muted text-foreground font-medium rounded-lg hover:bg-muted/80 disabled:opacity-50 transition-all duration-200"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={!templateName.trim() || saving}
              className="flex-1 py-2.5 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all duration-200"
            >
              {saving ? "Saving..." : "Save Template"}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
