# 🤖 Hapi Academics Tab - Chat Prompts for Phases 7-11

This document contains detailed prompts for phases 7-11 of the Hapi Academics Tab implementation. Use these prompts when starting new Claude Code chat sessions for each phase.

**Important:** Always read `ACADEMICS_CHAT_PROMPTS.md` for the general instructions that apply to ALL phases before using these prompts.

---

# Phase 7: Course Tutor Enhancement

## 📝 Chat Prompt for Phase 7

```
I'm working on Phase 7 of the Hapi Academics Tab implementation. This phase focuses on enhancing the existing Course Tutor with real AI capabilities instead of the simulated functionality.

**Project Context:**
- Phases 1-6 are complete: Database, Canvas API, Google Calendar, AI integration, Smart Calendar, and Grade Intelligence
- We have a CourseTutorMode component at `src/components/academics/CourseTutorMode.tsx` that currently shows alerts instead of real AI
- We have AI services from Phase 4 in `src/lib/ai/` that we can leverage
- Canvas data includes course modules, module items, assignments, and pages
- The existing HapiLab already has AI chat functionality that we should review to avoid duplication

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 7
2. Review the existing CourseTutorMode component at `src/components/academics/CourseTutorMode.tsx`
3. Check if HapiLab has AI chat functionality (look for `src/components/student/HapiLab.tsx` or similar)
4. Review the AI service from Phase 4 at `src/lib/ai/aiService.ts`
5. Check Canvas module and course data structure in `src/lib/canvasApiMock.ts`
6. Review what module items are available (files, pages, videos, assignments, quizzes)

STEP 2 - ANALYSIS PHASE:
1. Identify what's missing from current CourseTutorMode (currently just shows alerts)
2. Determine if we can reuse HapiLab's AI chat functionality
3. Plan how to provide course context to the AI
4. Design practice quiz generation logic
5. Design assignment summarization logic
6. Plan quick review generation
7. Design flashcard creation system

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Course Tutor AI Service:**
Create `src/lib/ai/features/courseTutor.ts`:

```typescript
import { AIService } from '../aiService';
import type {
  TutorContext,
  TutorResponse,
  Quiz,
  QuizContext,
  ReviewMaterials,
  Flashcard,
  AssignmentSummary
} from '../types';

export class AICourseTutor {
  private aiService: AIService;
  private cache: AICache;

  constructor() {
    this.aiService = new AIService();
    this.cache = new AICache();
  }

  /**
   * Answer course-related questions with context awareness
   */
  async answerQuestion(
    question: string,
    context: TutorContext
  ): Promise<TutorResponse> {
    // Build cache key
    const cacheKey = this.cache.generateKey('tutor_question', {
      question,
      courseId: context.courseId,
      moduleId: context.moduleId
    });

    // Check cache first (cache similar questions)
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Build context-aware prompt
    const prompt = this.buildTutorPrompt(question, context);

    // Get AI response
    const response = await this.aiService.complete(prompt, {
      temperature: 0.7,
      maxTokens: 1000
    });

    // Parse response
    const tutorResponse: TutorResponse = {
      answer: response,
      relatedTopics: this.extractRelatedTopics(response, context),
      additionalResources: await this.findResources(context.courseId, question),
      confidence: 0.8, // Could use AI to assess its own confidence
      citations: this.extractCitations(response)
    };

    // Cache response (7 day TTL for course content)
    await this.cache.set(cacheKey, JSON.stringify(tutorResponse), 7 * 24 * 60 * 60);

    // Track usage
    await this.trackUsage(context.userId, 'course_tutor', response);

    return tutorResponse;
  }

  /**
   * Generate practice quiz based on module content
   */
  async generatePracticeQuiz(context: QuizContext): Promise<Quiz> {
    const prompt = `
You are creating a practice quiz for students to test their understanding.

Course: ${context.courseName}
Module: ${context.moduleName}
Topics: ${context.topics.join(', ')}
Difficulty: ${context.difficulty}
Number of questions: ${context.questionCount}

Learning objectives:
${context.learningObjectives?.join('\n') || 'Not provided'}

Module content summary:
${context.contentSummary || 'Not provided'}

Generate ${context.questionCount} quiz questions with the following structure for each:

1. Question text
2. Question type (multiple_choice, true_false, or short_answer)
3. Options (for multiple choice, provide 4 options)
4. Correct answer
5. Explanation (why this is correct and what concept it tests)
6. Hints (2-3 hints to guide students)
7. Related topics for further study

Make questions challenging but fair. Test understanding, not memorization.

Return in JSON format:
{
  "title": "Quiz title",
  "description": "Brief description",
  "estimatedTime": 15,
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "...",
      "hints": ["hint1", "hint2"],
      "relatedTopics": ["topic1"]
    }
  ]
}
`;

    const response = await this.aiService.complete(prompt, {
      temperature: 0.8, // Higher temp for varied questions
      maxTokens: 2000
    });

    // Parse JSON response
    const quiz = this.parseQuizResponse(response);

    // Store in database
    await this.saveQuiz(quiz, context);

    return quiz;
  }

  /**
   * Summarize assignment instructions
   */
  async summarizeAssignment(
    assignmentId: string,
    userId: string
  ): Promise<AssignmentSummary> {
    // Fetch assignment from database
    const assignment = await this.getAssignment(assignmentId);

    // Check cache
    const cacheKey = this.cache.generateKey('assignment_summary', { assignmentId });
    const cached = await this.cache.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const prompt = `
You are helping a student understand their assignment requirements.

Assignment: ${assignment.name}
Course: ${assignment.course_name}
Due: ${assignment.due_at}
Points: ${assignment.points_possible}

Full Instructions:
${assignment.description}

Submission Type: ${assignment.submission_types.join(', ')}

Provide:
1. A brief summary (2-3 sentences)
2. Key requirements (bullet points)
3. Deliverables expected
4. Estimated time needed (in hours)
5. Suggested approach/steps
6. Common mistakes to avoid
7. Resources that might help

Be clear, concise, and actionable.

Return in JSON format:
{
  "summary": "...",
  "keyRequirements": ["req1", "req2"],
  "deliverables": ["deliverable1"],
  "estimatedHours": 3,
  "suggestedSteps": ["step1", "step2"],
  "commonMistakes": ["mistake1"],
  "recommendedResources": ["resource1"]
}
`;

    const response = await this.aiService.complete(prompt, {
      temperature: 0.5,
      maxTokens: 1500
    });

    const summary = this.parseAssignmentSummary(response);

    // Cache for 24 hours
    await this.cache.set(cacheKey, JSON.stringify(summary), 24 * 60 * 60);

    return summary;
  }

  /**
   * Generate quick review materials (summary + flashcards + practice)
   */
  async generateQuickReview(
    courseId: string,
    moduleIds: string[],
    userId: string
  ): Promise<ReviewMaterials> {
    // Fetch modules and assignments
    const modules = await this.getModules(courseId, moduleIds);
    const assignments = await this.getRecentAssignments(courseId, userId);

    const prompt = `
You are creating quick review materials for a student preparing for an exam or quiz.

Course: ${modules[0]?.course_name}
Modules covered: ${modules.map(m => m.name).join(', ')}

Module topics:
${modules.map(m => `- ${m.name}: ${m.items?.length || 0} items`).join('\n')}

Recent assignments:
${assignments.map(a => `- ${a.name} (Score: ${a.score}/${a.points_possible})`).join('\n')}

Create comprehensive review materials:

1. **Key Concepts Summary** (5-10 main points)
   - Most important concepts to remember
   - How they connect to each other

2. **Flashcards** (15-20 cards)
   - Front: Question or term
   - Back: Answer or definition
   - Include hints

3. **Practice Problems** (5-10 problems)
   - Similar to what might appear on exam
   - Include step-by-step solutions
   - Vary difficulty

4. **Study Tips**
   - What to focus on
   - How to study this material
   - Time management suggestions

Return in JSON format with all sections.
`;

    const response = await this.aiService.complete(prompt, {
      temperature: 0.7,
      maxTokens: 3000
    });

    const reviewMaterials = this.parseReviewMaterials(response);

    // Save to database for future reference
    await this.saveReviewMaterials(reviewMaterials, courseId, userId);

    return reviewMaterials;
  }

  /**
   * Generate flashcards from content
   */
  async generateFlashcards(
    content: string,
    count: number,
    userId: string
  ): Promise<Flashcard[]> {
    const prompt = `
Create ${count} flashcards from this educational content:

${content}

Each flashcard should:
- Test understanding, not just memorization
- Be clear and concise
- Include helpful hints
- Cover different aspects of the material

Return in JSON format:
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition",
      "hint": "Helpful hint if stuck",
      "category": "Topic category",
      "difficulty": "easy|medium|hard"
    }
  ]
}
`;

    const response = await this.aiService.complete(prompt, {
      temperature: 0.8,
      maxTokens: 2000
    });

    const flashcards = this.parseFlashcards(response);

    return flashcards;
  }

  /**
   * Find related resources (from Canvas and external)
   */
  private async findResources(
    courseId: string,
    query: string
  ): Promise<Resource[]> {
    // Search Canvas course materials
    const canvasResources = await this.searchCanvasMaterials(courseId, query);

    // Optionally: Search external resources (requires web search API)
    // const externalResources = await this.searchExternalResources(query);

    return canvasResources;
  }

  /**
   * Build context-aware tutor prompt
   */
  private buildTutorPrompt(question: string, context: TutorContext): string {
    return `
You are an AI tutor helping a student with their coursework.

Course: ${context.courseName}
Current Module: ${context.moduleName || 'Not specified'}
Current Assignment: ${context.assignmentName || 'Not specified'}

Course Materials Context:
${context.moduleContent || 'Not provided'}

Learning Objectives:
${context.learningObjectives?.join('\n') || 'Not provided'}

Student Question: ${question}

Provide a clear, helpful answer that:
1. Explains the concept step-by-step
2. Uses simple language and relevant examples
3. References course materials when possible
4. Suggests related topics to explore
5. Encourages critical thinking
6. Provides concrete next steps

If you're unsure or the question is outside the course scope, say so honestly.
Be supportive and constructive in your tone.

Format your response in markdown for readability.
`;
  }

  /**
   * Extract related topics from AI response
   */
  private extractRelatedTopics(
    response: string,
    context: TutorContext
  ): string[] {
    // Simple extraction: look for phrases like "You might also want to learn about..."
    // Could use NLP or another AI call for more sophisticated extraction

    const topics: string[] = [];

    // Add related module items
    if (context.relatedModuleItems) {
      topics.push(...context.relatedModuleItems.map(item => item.title));
    }

    return topics;
  }

  /**
   * Extract citations from response
   */
  private extractCitations(response: string): string[] {
    // Extract references to course materials
    // Look for patterns like "According to Module 3..." or "As shown in the lecture..."
    return [];
  }

  /**
   * Track AI usage for analytics and cost
   */
  private async trackUsage(
    userId: string,
    feature: string,
    response: string
  ): Promise<void> {
    const tokens = this.estimateTokens(response);
    const cost = this.calculateCost(tokens);

    await supabase.from('ai_interactions').insert({
      user_id: userId,
      feature_type: feature,
      tokens_used: tokens,
      cost_cents: cost
    });
  }
}
```

**3.2 - Enhanced CourseTutorMode Component:**
Update `src/components/academics/CourseTutorMode.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { AICourseTutor } from '@/lib/ai/features/courseTutor';
import { Sparkles, BookOpen, Lightbulb, FileText, GraduationCap } from 'lucide-react';

export function CourseTutorMode() {
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const courseTutor = new AICourseTutor();

  // Handle sending a question to the AI tutor
  const handleSendQuestion = async () => {
    if (!inputMessage.trim()) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages([...chatMessages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build context from selected course and module
      const context: TutorContext = {
        userId: user.id,
        courseId: selectedCourse!,
        courseName: courses.find(c => c.id === selectedCourse)?.name || '',
        moduleId: selectedModule || undefined,
        moduleName: modules.find(m => m.id === selectedModule)?.name || undefined,
        moduleContent: await getModuleContent(selectedModule),
        learningObjectives: await getLearningObjectives(selectedCourse, selectedModule)
      };

      // Get AI response
      const response = await courseTutor.answerQuestion(inputMessage, context);

      // Add AI message to chat
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        relatedTopics: response.relatedTopics,
        resources: response.additionalResources,
        timestamp: new Date()
      };

      setChatMessages([...chatMessages, userMessage, aiMessage]);
    } catch (error) {
      console.error('Failed to get tutor response:', error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };

  // Generate practice quiz
  const handleGenerateQuiz = async () => {
    if (!selectedModule) {
      alert('Please select a module first');
      return;
    }

    setIsLoading(true);

    try {
      const context: QuizContext = {
        userId: user.id,
        courseId: selectedCourse!,
        courseName: courses.find(c => c.id === selectedCourse)?.name || '',
        moduleId: selectedModule,
        moduleName: modules.find(m => m.id === selectedModule)?.name || '',
        topics: await getModuleTopics(selectedModule),
        difficulty: 'medium',
        questionCount: 10,
        learningObjectives: await getLearningObjectives(selectedCourse, selectedModule),
        contentSummary: await getModuleContentSummary(selectedModule)
      };

      const quiz = await courseTutor.generatePracticeQuiz(context);

      // Open quiz modal
      openQuizModal(quiz);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate quick review
  const handleGenerateReview = async () => {
    if (!selectedCourse) {
      alert('Please select a course first');
      return;
    }

    setIsLoading(true);

    try {
      const selectedModuleIds = selectedModule ? [selectedModule] : allModuleIds;
      const reviewMaterials = await courseTutor.generateQuickReview(
        selectedCourse,
        selectedModuleIds,
        user.id
      );

      // Open review modal
      openReviewModal(reviewMaterials);
    } catch (error) {
      console.error('Failed to generate review:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with course/module selector */}
      <div className="border-b border-border p-4">
        <h2 className="text-2xl font-bold mb-4">AI Course Tutor</h2>

        <div className="flex gap-4">
          {/* Course selector */}
          <select
            value={selectedCourse || ''}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="flex-1 px-3 py-2 border border-border rounded-lg"
          >
            <option value="">Select a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>

          {/* Module selector */}
          {selectedCourse && (
            <select
              value={selectedModule || ''}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg"
            >
              <option value="">All modules</option>
              {modules.filter(m => m.course_id === selectedCourse).map(module => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-border p-4 flex gap-2">
        <button
          onClick={handleGenerateQuiz}
          disabled={!selectedModule || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          <GraduationCap className="w-4 h-4" />
          Generate Practice Quiz
        </button>

        <button
          onClick={handleGenerateReview}
          disabled={!selectedCourse || isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <FileText className="w-4 h-4" />
          Generate Quick Review
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Ask me anything about your course!</p>
            <p className="text-sm">
              I can explain concepts, help with assignments, generate practice materials, and more.
            </p>
          </div>
        )}

        {chatMessages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendQuestion()}
            placeholder="Ask a question about your course..."
            className="flex-1 px-4 py-2 border border-border rounded-lg"
            disabled={!selectedCourse || isLoading}
          />
          <button
            onClick={handleSendQuestion}
            disabled={!selectedCourse || !inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Send
          </button>
        </div>

        {!selectedCourse && (
          <p className="text-xs text-muted-foreground mt-2">
            Select a course to start chatting with the AI tutor
          </p>
        )}
      </div>
    </div>
  );
}

// Chat message component
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        }`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content}
        </div>

        {/* Related topics */}
        {message.relatedTopics && message.relatedTopics.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs font-medium mb-2">Related topics:</p>
            <div className="flex flex-wrap gap-2">
              {message.relatedTopics.map((topic, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-background/50 rounded"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Resources */}
        {message.resources && message.resources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-xs font-medium mb-2">Helpful resources:</p>
            <ul className="text-xs space-y-1">
              {message.resources.map((resource, i) => (
                <li key={i}>
                  <a href={resource.url} className="underline hover:no-underline">
                    {resource.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-xs opacity-70 mt-2">
          {message.timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
```

**3.3 - Practice Quiz Component:**
Create `src/components/academics/PracticeQuizModal.tsx`:

```typescript
export function PracticeQuizModal({ quiz, onClose }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const handleSubmitQuiz = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return (correct / quiz.questions.length) * 100;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
        <p className="text-muted-foreground mb-6">{quiz.description}</p>

        {!showResults ? (
          <>
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                <span>Estimated time: {quiz.estimatedTime} min</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question */}
            <div className="bg-muted/30 rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-4">{currentQuestion.question}</h3>

              {/* Multiple choice options */}
              {currentQuestion.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                    >
                      <input
                        type="radio"
                        name={currentQuestion.id}
                        value={option}
                        checked={userAnswers[currentQuestion.id] === option}
                        onChange={(e) => setUserAnswers({ ...userAnswers, [currentQuestion.id]: e.target.value })}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Short answer */}
              {currentQuestion.type === 'short_answer' && (
                <textarea
                  value={userAnswers[currentQuestion.id] || ''}
                  onChange={(e) => setUserAnswers({ ...userAnswers, [currentQuestion.id]: e.target.value })}
                  className="w-full p-3 border border-border rounded-lg"
                  rows={4}
                  placeholder="Type your answer here..."
                />
              )}
            </div>

            {/* Hints */}
            <button
              onClick={() => setShowHints(!showHints)}
              className="text-sm text-primary hover:underline mb-4"
            >
              {showHints ? 'Hide' : 'Show'} Hints
            </button>

            {showHints && currentQuestion.hints && (
              <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium mb-2">Hints:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  {currentQuestion.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestionIndex < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Submit Quiz
                </button>
              )}
            </div>
          </>
        ) : (
          <QuizResults
            quiz={quiz}
            userAnswers={userAnswers}
            score={calculateScore()}
            onRetry={() => {
              setUserAnswers({});
              setCurrentQuestionIndex(0);
              setShowResults(false);
            }}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
```

**3.4 - Quick Review Modal:**
Create `src/components/academics/QuickReviewModal.tsx`:

```typescript
export function QuickReviewModal({ reviewMaterials, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'practice'>('summary');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Quick Review Materials</h2>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-3 ${activeTab === 'summary' ? 'border-b-2 border-primary' : ''}`}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`flex-1 py-3 ${activeTab === 'flashcards' ? 'border-b-2 border-primary' : ''}`}
          >
            Flashcards ({reviewMaterials.flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex-1 py-3 ${activeTab === 'practice' ? 'border-b-2 border-primary' : ''}`}
          >
            Practice ({reviewMaterials.practiceProblems.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'summary' && (
            <SummaryTab keyConcepts={reviewMaterials.keyConcepts} studyTips={reviewMaterials.studyTips} />
          )}
          {activeTab === 'flashcards' && (
            <FlashcardsTab flashcards={reviewMaterials.flashcards} />
          )}
          {activeTab === 'practice' && (
            <PracticeTab problems={reviewMaterials.practiceProblems} />
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-border rounded-lg">
            Close
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
            Save Materials
          </button>
        </div>
      </div>
    </div>
  );
}
```

**CRITICAL REQUIREMENTS:**

**AI Quality:**
- Test AI responses with real Canvas course data
- Ensure explanations are accurate and helpful
- Provide disclaimers for AI-generated content
- Allow users to report poor responses
- Track response quality metrics

**Context Awareness:**
- Always provide course/module context to AI
- Reference actual Canvas materials in responses
- Tie responses back to learning objectives
- Use assignment context when relevant

**Resource Integration:**
- Search Canvas course materials for relevant resources
- Link to Canvas pages, files, and modules
- Suggest related topics from the course structure
- Don't hallucinate resources that don't exist

**Cost Management:**
- Cache common questions (7 day TTL)
- Use appropriate model for each task (don't use GPT-4 for simple tasks)
- Track token usage per user
- Implement usage limits

**User Experience:**
- Show thinking/loading states
- Stream responses when possible (better perceived performance)
- Allow editing/regenerating responses
- Provide helpful error messages
- Save chat history

**Testing:**
- Test with various question types (conceptual, procedural, factual)
- Test quiz generation with different difficulty levels
- Test assignment summarization with complex instructions
- Test with courses that have minimal content
- Verify all Canvas references are valid

STEP 4 - VALIDATION:
1. Test AI tutor with real questions from Canvas courses
2. Verify quiz generation produces valid, educational questions
3. Test assignment summarization accuracy
4. Test quick review generation with multiple modules
5. Verify flashcard quality and relevance
6. Test with courses that have various content types
7. Ensure proper error handling when AI fails

STEP 5 - DOCUMENTATION:
1. Document AI prompts and their reasoning
2. Add user guide for using course tutor features
3. Document quiz generation parameters
4. Add JSDoc comments to all functions
5. Create examples of good tutor interactions

**What NOT to do:**
❌ Don't replace the existing component entirely (enhance it)
❌ Don't make AI features mandatory (provide fallbacks)
❌ Don't generate content unrelated to the course
❌ Don't hallucinate course materials that don't exist
❌ Don't ignore the existing HapiLab AI patterns
❌ Don't skip caching (costs will be high)
❌ Don't assume all courses have rich content

After you complete this phase, I should have:
✅ Real AI-powered course tutor (not simulated)
✅ Practice quiz generation
✅ Assignment summarization
✅ Quick review materials generation
✅ Flashcard creation
✅ Enhanced CourseTutorMode component
✅ Quiz and review modals
✅ Complete documentation

Please start by reviewing the existing CourseTutorMode and HapiLab components to understand what's already there and ensure consistent patterns.
```

---

# Phase 8: Instructor Feedback Hub

## 📝 Chat Prompt for Phase 8

```
I'm working on Phase 8 of the Hapi Academics Tab implementation. This phase focuses on creating a completely NEW feature: a centralized Instructor Feedback Hub that aggregates feedback from all courses and provides AI-powered insights.

**Project Context:**
- Phases 1-7 are complete: Database, Canvas API, AI integration, and Course Tutor
- We have Canvas submissions with instructor feedback in the database
- We have AI feedback analyzer from Phase 4/6 that we can leverage
- This is a BRAND NEW FEATURE (0% complete) - nothing exists yet
- Similar to Phase 6's feedback explainer, but this is course-wide aggregation

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 8
2. Review Phase 6's feedback explainer implementation (if done)
3. Review Canvas submission data structure in database
4. Check how Canvas stores instructor feedback and rubric data
5. Review existing AI services from Phase 4
6. Look for any existing feedback-related components

STEP 2 - ANALYSIS PHASE:
1. Design the feedback hub UI/UX (centralized view)
2. Plan feedback aggregation strategy
3. Design AI sentiment analysis logic
4. Plan pattern detection algorithm
5. Design improvement goal generation
6. Plan feedback timeline visualization

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Database Schema:**
Create migration for feedback hub tables:

```sql
-- Migration: create_instructor_feedback_hub.sql

-- Store analyzed instructor feedback
CREATE TABLE IF NOT EXISTS instructor_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submission_id uuid NOT NULL REFERENCES canvas_submissions(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES canvas_courses(id) ON DELETE CASCADE,
  assignment_id uuid NOT NULL REFERENCES canvas_assignments(id),
  instructor_id text,
  instructor_name text,
  feedback_text text,
  rubric_data jsonb,
  score numeric,
  points_possible numeric,

  -- AI analysis results
  sentiment_score numeric CHECK (sentiment_score BETWEEN -1 AND 1), -- -1 (negative) to 1 (positive)
  sentiment_label text, -- 'positive', 'neutral', 'negative'
  key_themes text[], -- ['structure', 'clarity', 'depth']
  strengths text[], -- What student did well
  improvements text[], -- Areas for improvement

  analyzed_at timestamptz,
  ai_explanation text, -- Plain language explanation

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store detected patterns across feedback
CREATE TABLE IF NOT EXISTS feedback_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_type text NOT NULL, -- 'strength', 'weakness', 'trend', 'instructor_style'
  category text, -- 'writing', 'analysis', 'organization', 'research', etc.
  description text NOT NULL,
  evidence jsonb, -- Array of feedback examples that support this pattern
  occurrences integer DEFAULT 1,
  courses_affected uuid[], -- Array of course IDs where this appears
  first_detected_at timestamptz DEFAULT now(),
  last_detected_at timestamptz DEFAULT now(),
  severity text, -- 'high', 'medium', 'low' (for weaknesses)
  confidence numeric, -- 0-1, how confident we are in this pattern

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Store improvement goals generated from feedback
CREATE TABLE IF NOT EXISTS feedback_improvement_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pattern_id uuid REFERENCES feedback_patterns(id) ON DELETE CASCADE,
  goal_title text NOT NULL,
  goal_description text,
  action_items jsonb, -- Array of specific steps
  target_courses uuid[], -- Which courses to apply this in
  status text DEFAULT 'active', -- 'active', 'completed', 'dismissed'
  progress integer DEFAULT 0, -- 0-100
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_instructor_feedback_user ON instructor_feedback(user_id, created_at DESC);
CREATE INDEX idx_instructor_feedback_course ON instructor_feedback(course_id, created_at DESC);
CREATE INDEX idx_instructor_feedback_sentiment ON instructor_feedback(user_id, sentiment_label);
CREATE INDEX idx_feedback_patterns_user ON feedback_patterns(user_id, pattern_type);
CREATE INDEX idx_improvement_goals_user_status ON feedback_improvement_goals(user_id, status);

-- RLS Policies
ALTER TABLE instructor_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_improvement_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own feedback"
  ON instructor_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own patterns"
  ON feedback_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own goals"
  ON feedback_improvement_goals FOR ALL
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_instructor_feedback_updated_at
  BEFORE UPDATE ON instructor_feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_patterns_updated_at
  BEFORE UPDATE ON feedback_patterns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_improvement_goals_updated_at
  BEFORE UPDATE ON feedback_improvement_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**3.2 - Feedback Aggregation Service:**
Create `src/lib/academics/feedbackAggregator.ts`:

```typescript
import { supabase } from '@/lib/supabase';
import type { InstructorFeedback, FeedbackPattern, ImprovementGoal } from './types';

export class FeedbackAggregator {
  /**
   * Sync and analyze all feedback for a user
   */
  async syncUserFeedback(userId: string): Promise<void> {
    // 1. Fetch all submissions with feedback from Canvas
    const submissions = await this.getSubmissionsWithFeedback(userId);

    // 2. For each submission, analyze feedback if not already analyzed
    for (const submission of submissions) {
      const exists = await this.feedbackExists(submission.id);
      if (!exists && submission.feedback_text) {
        await this.analyzeFeedback(submission, userId);
      }
    }

    // 3. Detect patterns across all feedback
    await this.detectPatterns(userId);

    // 4. Generate improvement goals from patterns
    await this.generateImprovementGoals(userId);
  }

  /**
   * Analyze a single piece of feedback with AI
   */
  private async analyzeFeedback(
    submission: CanvasSubmission,
    userId: string
  ): Promise<void> {
    const prompt = `
Analyze this instructor feedback and provide a comprehensive assessment.

Assignment: ${submission.assignment_name}
Course: ${submission.course_name}
Student Score: ${submission.score}/${submission.points_possible} (${submission.percentage}%)

Instructor Feedback:
${submission.feedback_text}

${submission.rubric_data ? `Rubric Breakdown:\n${JSON.stringify(submission.rubric_data, null, 2)}` : ''}

Provide the following in JSON format:
{
  "sentiment": {
    "score": -1 to 1 (where -1 is very negative, 0 is neutral, 1 is very positive),
    "label": "positive" | "neutral" | "negative",
    "reasoning": "Why you scored it this way"
  },
  "keyThemes": ["theme1", "theme2"],
  "strengths": ["What student did well"],
  "improvements": ["Areas that need work"],
  "plainLanguageExplanation": "Student-friendly explanation of the feedback"
}

Be objective and constructive. Focus on actionable insights.
`;

    const response = await aiService.complete(prompt, {
      temperature: 0.5,
      maxTokens: 1000
    });

    const analysis = JSON.parse(response);

    // Store in database
    await supabase.from('instructor_feedback').insert({
      user_id: userId,
      submission_id: submission.id,
      course_id: submission.course_id,
      assignment_id: submission.assignment_id,
      instructor_id: submission.grader_id,
      instructor_name: submission.grader_name,
      feedback_text: submission.feedback_text,
      rubric_data: submission.rubric_data,
      score: submission.score,
      points_possible: submission.points_possible,
      sentiment_score: analysis.sentiment.score,
      sentiment_label: analysis.sentiment.label,
      key_themes: analysis.keyThemes,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      ai_explanation: analysis.plainLanguageExplanation,
      analyzed_at: new Date().toISOString()
    });
  }

  /**
   * Detect patterns across all feedback for a user
   */
  private async detectPatterns(userId: string): Promise<void> {
    // Fetch all analyzed feedback
    const { data: allFeedback } = await supabase
      .from('instructor_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!allFeedback || allFeedback.length < 3) {
      // Need at least 3 pieces of feedback to detect patterns
      return;
    }

    const prompt = `
Analyze these instructor feedback instances to detect patterns, trends, and themes.

Student Feedback History (${allFeedback.length} items):
${allFeedback.map(f => `
Course: ${f.course_name}
Date: ${f.created_at}
Score: ${f.score}/${f.points_possible}
Sentiment: ${f.sentiment_label}
Themes: ${f.key_themes.join(', ')}
Strengths: ${f.strengths.join('; ')}
Improvements: ${f.improvements.join('; ')}
`).join('\n---\n')}

Identify:
1. **Consistent Strengths**: What does this student consistently do well?
2. **Recurring Weaknesses**: What areas repeatedly need improvement?
3. **Trends**: Is the student improving, declining, or staying consistent?
4. **Course-Specific Patterns**: Different feedback patterns in different courses?
5. **Instructor Communication Styles**: How do different instructors give feedback?

Return in JSON format:
{
  "patterns": [
    {
      "type": "strength" | "weakness" | "trend",
      "category": "writing" | "analysis" | "organization" | "research" | "other",
      "description": "Clear description of the pattern",
      "evidence": ["feedback examples that show this"],
      "severity": "high" | "medium" | "low",
      "confidence": 0-1,
      "coursesAffected": ["course IDs where this appears"],
      "recommendations": ["What student should do about this"]
    }
  ]
}

Be specific and actionable. Focus on patterns that appear in 30%+ of feedback.
`;

    const response = await aiService.complete(prompt, {
      temperature: 0.6,
      maxTokens: 2000
    });

    const { patterns } = JSON.parse(response);

    // Store patterns in database (upsert to avoid duplicates)
    for (const pattern of patterns) {
      // Check if pattern already exists
      const { data: existing } = await supabase
        .from('feedback_patterns')
        .select('id')
        .eq('user_id', userId)
        .eq('description', pattern.description)
        .single();

      if (existing) {
        // Update existing pattern
        await supabase
          .from('feedback_patterns')
          .update({
            occurrences: pattern.evidence.length,
            last_detected_at: new Date().toISOString(),
            confidence: pattern.confidence,
            courses_affected: pattern.coursesAffected
          })
          .eq('id', existing.id);
      } else {
        // Insert new pattern
        await supabase.from('feedback_patterns').insert({
          user_id: userId,
          pattern_type: pattern.type,
          category: pattern.category,
          description: pattern.description,
          evidence: pattern.evidence,
          occurrences: pattern.evidence.length,
          courses_affected: pattern.coursesAffected,
          severity: pattern.severity,
          confidence: pattern.confidence
        });
      }
    }
  }

  /**
   * Generate improvement goals from detected patterns
   */
  private async generateImprovementGoals(userId: string): Promise<void> {
    // Get high-severity weakness patterns
    const { data: weaknesses } = await supabase
      .from('feedback_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('pattern_type', 'weakness')
      .in('severity', ['high', 'medium'])
      .order('severity', { ascending: false });

    if (!weaknesses || weaknesses.length === 0) return;

    for (const weakness of weaknesses) {
      // Check if goal already exists for this pattern
      const { data: existingGoal } = await supabase
        .from('feedback_improvement_goals')
        .select('id')
        .eq('pattern_id', weakness.id)
        .eq('status', 'active')
        .single();

      if (existingGoal) continue;

      // Generate goal with AI
      const prompt = `
Create an improvement goal for this student weakness:

Pattern: ${weakness.description}
Category: ${weakness.category}
Evidence: ${JSON.stringify(weakness.evidence)}

Create a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound) that:
1. Addresses this weakness directly
2. Provides 3-5 concrete action items
3. Can be tracked over time
4. Is encouraging and constructive

Return in JSON format:
{
  "title": "Goal title (concise)",
  "description": "What and why",
  "actionItems": [
    {
      "step": "Specific action to take",
      "how": "How to do it",
      "resources": ["Optional: resources that can help"]
    }
  ],
  "targetCourses": ["IDs of courses to apply this in"],
  "successCriteria": "How to know you've achieved this"
}
`;

      const response = await aiService.complete(prompt, {
        temperature: 0.7,
        maxTokens: 1000
      });

      const goal = JSON.parse(response);

      // Store goal
      await supabase.from('feedback_improvement_goals').insert({
        user_id: userId,
        pattern_id: weakness.id,
        goal_title: goal.title,
        goal_description: goal.description,
        action_items: goal.actionItems,
        target_courses: goal.targetCourses,
        status: 'active'
      });
    }
  }

  /**
   * Get feedback timeline for visualization
   */
  async getFeedbackTimeline(userId: string): Promise<TimelineData> {
    const { data: feedback } = await supabase
      .from('instructor_feedback')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (!feedback) return { entries: [], stats: {} };

    // Group by month/week
    const timeline = this.groupByTimePeriod(feedback);

    // Calculate statistics
    const stats = this.calculateTimelineStats(feedback);

    return { entries: timeline, stats };
  }

  /**
   * Get sentiment distribution
   */
  async getSentimentDistribution(userId: string): Promise<SentimentStats> {
    const { data: feedback } = await supabase
      .from('instructor_feedback')
      .select('sentiment_label, sentiment_score')
      .eq('user_id', userId);

    if (!feedback) return { positive: 0, neutral: 0, negative: 0, average: 0 };

    const counts = {
      positive: feedback.filter(f => f.sentiment_label === 'positive').length,
      neutral: feedback.filter(f => f.sentiment_label === 'neutral').length,
      negative: feedback.filter(f => f.sentiment_label === 'negative').length
    };

    const average = feedback.reduce((sum, f) => sum + f.sentiment_score, 0) / feedback.length;

    return { ...counts, average, total: feedback.length };
  }
}
```

**3.3 - Feedback Hub UI Component:**
Create `src/components/academics/FeedbackHub.tsx`:

```typescript
export function FeedbackHub() {
  const [feedback, setFeedback] = useState<InstructorFeedback[]>([]);
  const [patterns, setPatterns] = useState<FeedbackPattern[]>([]);
  const [goals, setGoals] = useState<ImprovementGoal[]>([]);
  const [sentimentStats, setSentimentStats] = useState<SentimentStats | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'timeline' | 'patterns' | 'goals'>('overview');
  const [isLoading, setIsLoading] = useState(true);

  const feedbackAggregator = new FeedbackAggregator();

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const loadFeedbackData = async () => {
    setIsLoading(true);

    // Sync feedback first
    await feedbackAggregator.syncUserFeedback(user.id);

    // Load all feedback data
    const [feedbackData, patternsData, goalsData, sentimentData] = await Promise.all([
      feedbackAggregator.getAllFeedback(user.id),
      feedbackAggregator.getPatterns(user.id),
      feedbackAggregator.getImprovementGoals(user.id),
      feedbackAggregator.getSentimentDistribution(user.id)
    ]);

    setFeedback(feedbackData);
    setPatterns(patternsData);
    setGoals(goalsData);
    setSentimentStats(sentimentData);
    setIsLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Instructor Feedback Hub</h1>
        <p className="opacity-90">
          Understand your strengths, track improvements, and learn from instructor feedback across all courses
        </p>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 border-b border-border">
        {['overview', 'timeline', 'patterns', 'goals'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view as any)}
            className={`px-4 py-2 capitalize ${
              selectedView === view
                ? 'border-b-2 border-primary font-medium'
                : 'text-muted-foreground'
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {selectedView === 'overview' && (
            <FeedbackOverview
              feedback={feedback}
              patterns={patterns}
              sentimentStats={sentimentStats}
            />
          )}
          {selectedView === 'timeline' && (
            <FeedbackTimeline feedback={feedback} />
          )}
          {selectedView === 'patterns' && (
            <FeedbackPatterns patterns={patterns} />
          )}
          {selectedView === 'goals' && (
            <ImprovementGoals goals={goals} onUpdate={loadFeedbackData} />
          )}
        </>
      )}
    </div>
  );
}

// Overview tab
function FeedbackOverview({ feedback, patterns, sentimentStats }: Props) {
  return (
    <div className="space-y-6">
      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="text-sm text-muted-foreground mb-1">Total Feedback</div>
          <div className="text-3xl font-bold">{sentimentStats.total}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800 p-6">
          <div className="text-sm text-green-700 dark:text-green-400 mb-1">Positive</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {sentimentStats.positive}
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            {((sentimentStats.positive / sentimentStats.total) * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border border-yellow-200 dark:border-yellow-800 p-6">
          <div className="text-sm text-yellow-700 dark:text-yellow-400 mb-1">Neutral</div>
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
            {sentimentStats.neutral}
          </div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            {((sentimentStats.neutral / sentimentStats.total) * 100).toFixed(0)}%
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800 p-6">
          <div className="text-sm text-red-700 dark:text-red-400 mb-1">Negative</div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {sentimentStats.negative}
          </div>
          <div className="text-xs text-red-600 dark:text-red-400">
            {((sentimentStats.negative / sentimentStats.total) * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Key Patterns Summary */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-lg mb-4">Key Patterns Detected</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div>
            <h4 className="font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Your Strengths
            </h4>
            <ul className="space-y-2">
              {patterns.filter(p => p.pattern_type === 'strength').slice(0, 3).map(pattern => (
                <li key={pattern.id} className="text-sm">
                  <span className="font-medium">{pattern.category}:</span> {pattern.description}
                  <span className="text-muted-foreground ml-2">({pattern.occurrences}×)</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div>
            <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Areas for Growth
            </h4>
            <ul className="space-y-2">
              {patterns.filter(p => p.pattern_type === 'weakness').slice(0, 3).map(pattern => (
                <li key={pattern.id} className="text-sm">
                  <span className="font-medium">{pattern.category}:</span> {pattern.description}
                  <span className="text-muted-foreground ml-2">({pattern.occurrences}×)</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Feedback */}
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Feedback</h3>
        <div className="space-y-4">
          {feedback.slice(0, 5).map(item => (
            <FeedbackCard key={item.id} feedback={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Individual feedback card
function FeedbackCard({ feedback }: { feedback: InstructorFeedback }) {
  const [expanded, setExpanded] = useState(false);

  const sentimentColor = {
    positive: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30',
    neutral: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30',
    negative: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
  }[feedback.sentiment_label];

  return (
    <div className="border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium">{feedback.assignment_name}</div>
          <div className="text-sm text-muted-foreground">{feedback.course_name}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold">{feedback.score}/{feedback.points_possible}</div>
            <div className="text-xs text-muted-foreground">
              {((feedback.score / feedback.points_possible) * 100).toFixed(0)}%
            </div>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${sentimentColor}`}>
            {feedback.sentiment_label}
          </span>
        </div>
      </div>

      {/* AI Explanation */}
      {feedback.ai_explanation && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-3 mb-2">
          <p className="text-sm">{feedback.ai_explanation}</p>
        </div>
      )}

      {/* Themes */}
      {feedback.key_themes && feedback.key_themes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {feedback.key_themes.map((theme, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-muted rounded">
              {theme}
            </span>
          ))}
        </div>
      )}

      {/* Expand for details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-sm text-primary hover:underline"
      >
        {expanded ? 'Show less' : 'Show details'}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {/* Original feedback */}
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Original Feedback:</div>
            <p className="text-sm bg-muted/30 p-2 rounded">{feedback.feedback_text}</p>
          </div>

          {/* Strengths */}
          {feedback.strengths && feedback.strengths.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">
                ✓ What you did well:
              </div>
              <ul className="text-sm list-disc list-inside space-y-1">
                {feedback.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {feedback.improvements && feedback.improvements.length > 0 && (
            <div>
              <div className="text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
                → Areas for improvement:
              </div>
              <ul className="text-sm list-disc list-inside space-y-1">
                {feedback.improvements.map((i, idx) => (
                  <li key={idx}>{i}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

**CRITICAL REQUIREMENTS:**

**Data Privacy:**
- Don't share instructor feedback with AI without anonymization
- Allow users to opt out of AI analysis
- Clearly label AI-analyzed content
- Store sensitive feedback securely

**AI Quality:**
- Test sentiment analysis accuracy with various feedback types
- Validate pattern detection with real data
- Ensure improvement goals are actionable
- Monitor AI analysis quality

**Performance:**
- Batch analyze feedback (don't analyze one-by-one)
- Cache sentiment analysis results
- Use database indexes for fast queries
- Lazy load feedback details

**User Experience:**
- Make insights easy to understand
- Provide visual feedback (charts, graphs)
- Allow filtering by course, date, sentiment
- Export feedback reports (PDF)

**Canvas Integration:**
- Sync feedback when new grades are posted
- Handle Canvas rubric data correctly
- Link back to Canvas assignments
- Support multiple feedback formats

STEP 4 - TESTING:
1. Test with various types of instructor feedback
2. Test sentiment analysis accuracy
3. Test pattern detection with 5+ feedback items
4. Test improvement goal generation
5. Test with courses that have no feedback yet
6. Verify RLS policies work correctly
7. Test feedback timeline visualization

STEP 5 - DOCUMENTATION:
1. Document feedback analysis methodology
2. Document pattern detection algorithm
3. Add user guide for feedback hub features
4. Document database schema
5. Add JSDoc comments to all functions

**What NOT to do:**
❌ Don't make assumptions about instructor intent
❌ Don't ignore privacy concerns with feedback data
❌ Don't show overly negative pattern descriptions
❌ Don't generate goals without user's patterns
❌ Don't analyze feedback without consent
❌ Don't break Canvas feedback formatting

After you complete this phase, I should have:
✅ Complete Instructor Feedback Hub (NEW FEATURE)
✅ AI sentiment analysis of feedback
✅ Pattern detection across courses
✅ Improvement goal generation
✅ Feedback timeline visualization
✅ Database schema for feedback
✅ Complete documentation

This is a brand new feature - start from scratch following existing patterns from other phases.
```

---

# Phase 9: Gamification & Achievements

## 📝 Chat Prompt for Phase 9

```
I'm working on Phase 9 of the Hapi Academics Tab implementation. This phase focuses on integrating gamification features with the existing HapiAI points system and creating academic-specific achievements.

**Project Context:**
- Phases 1-8 are complete: Database, Canvas, AI, Calendar, Grades, Tutor, Feedback Hub
- The main HapiAI app already has a points and achievements system
- Students earn points for various activities (morning pulse, class pulses, hapi moments)
- There's a leaderboard system already in place
- We need to ADD academic-specific achievements and integrate them with the existing system

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 9
2. Review the existing points system - check `src/lib/mockData.ts` for user points
3. Review the existing achievements system (if it exists)
4. Check the leaderboard component at `src/components/leaderboard/`
5. Review how points are currently awarded (Morning Pulse = 10pts, etc.)
6. Check database schema for `profiles` table (has points, streaks)

STEP 2 - ANALYSIS PHASE:
1. Identify existing gamification patterns to follow
2. Plan academic-specific achievements (don't duplicate existing ones)
3. Design study streak tracking system
4. Plan integration with existing points system
5. Design badge display UI
6. Plan leaderboard enhancements for academics

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Database Schema for Academic Achievements:**
Create migration for academic gamification:

```sql
-- Migration: academic_gamification.sql

-- Academic-specific achievements
CREATE TABLE IF NOT EXISTS academic_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_key text UNIQUE NOT NULL, -- e.g., 'perfect_week', 'streak_master'
  name text NOT NULL,
  description text NOT NULL,
  icon text, -- Icon name or emoji
  category text NOT NULL, -- 'assignments', 'study', 'grades', 'tutor', 'planner'
  tier text NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum'
  points_reward integer NOT NULL,
  criteria jsonb NOT NULL, -- { type: 'streak', target: 30, unit: 'days' }
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User achievement progress and unlocks
CREATE TABLE IF NOT EXISTS user_academic_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_key text NOT NULL REFERENCES academic_achievements(achievement_key),
  progress integer DEFAULT 0, -- Current progress toward unlock
  target integer, -- Target to reach (from achievement criteria)
  is_unlocked boolean DEFAULT false,
  unlocked_at timestamptz,
  notified boolean DEFAULT false, -- Whether user has been notified of unlock
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_key)
);

-- Study streak tracking
CREATE TABLE IF NOT EXISTS study_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_study_date date,
  streak_start_date date,
  total_study_days integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Academic points log (separate from main points for analytics)
CREATE TABLE IF NOT EXISTS academic_points_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points integer NOT NULL,
  source text NOT NULL, -- 'assignment_early', 'study_session', 'ai_tutor_usage', etc.
  source_id uuid, -- ID of related entity (assignment_id, session_id, etc.)
  description text,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_user_achievements_user ON user_academic_achievements(user_id, is_unlocked);
CREATE INDEX idx_study_streaks_user ON study_streaks(user_id);
CREATE INDEX idx_academic_points_user_date ON academic_points_log(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE academic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_academic_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_points_log ENABLE ROW LEVEL SECURITY;

-- Achievements are public
CREATE POLICY "Anyone can view achievements"
  ON academic_achievements FOR SELECT
  TO authenticated
  USING (true);

-- Users can only see their own progress
CREATE POLICY "Users can view their own achievement progress"
  ON user_academic_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own streaks"
  ON study_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own points log"
  ON academic_points_log FOR SELECT
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_user_achievements_updated_at
  BEFORE UPDATE ON user_academic_achievements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_streaks_updated_at
  BEFORE UPDATE ON study_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**3.2 - Seed Academic Achievements:**
```sql
-- Insert predefined academic achievements
INSERT INTO academic_achievements (achievement_key, name, description, icon, category, tier, points_reward, criteria) VALUES

-- Assignment Achievements
('perfect_week', 'Perfect Week', 'Submitted all assignments on time for a week', '🎯', 'assignments', 'bronze', 50, '{"type": "on_time_assignments", "target": 5, "window": "week"}'),
('early_bird', 'Early Bird', 'Submitted 5 assignments at least 24 hours early', '🐦', 'assignments', 'silver', 100, '{"type": "early_submissions", "target": 5}'),
('deadline_crusher', 'Deadline Crusher', 'Submitted 20 assignments on time', '💪', 'assignments', 'gold', 200, '{"type": "on_time_assignments", "target": 20}'),
('assignment_streak', 'Assignment Streak', 'Submitted assignments on time for 4 weeks straight', '🔥', 'assignments', 'platinum', 500, '{"type": "assignment_streak", "target": 4, "unit": "weeks"}'),

-- Study Streak Achievements
('study_starter', 'Study Starter', 'Completed a study session for 3 days in a row', '📚', 'study', 'bronze', 30, '{"type": "study_streak", "target": 3}'),
('dedicated_learner', 'Dedicated Learner', 'Maintained 7-day study streak', '🎓', 'study', 'silver', 100, '{"type": "study_streak", "target": 7}'),
('streak_master', 'Streak Master', 'Maintained 30-day study streak', '🏆', 'study', 'gold', 300, '{"type": "study_streak", "target": 30}'),
('study_legend', 'Study Legend', 'Maintained 90-day study streak', '👑', 'study', 'platinum', 1000, '{"type": "study_streak", "target": 90}'),

-- Grade Achievements
('grade_improver', 'Grade Improver', 'Improved grade by 10%+ in a course', '📈', 'grades', 'silver', 150, '{"type": "grade_improvement", "target": 10, "unit": "percent"}'),
('honors_student', 'Honors Student', 'Maintained 90%+ average in a course', '⭐', 'grades', 'gold', 250, '{"type": "course_average", "target": 90}'),
('quiz_champion', 'Quiz Champion', 'Scored 90%+ on 5 quizzes in a course', '🎯', 'grades', 'silver', 100, '{"type": "quiz_performance", "target": 5, "threshold": 90}'),

-- AI Tutor Achievements
('curious_mind', 'Curious Mind', 'Asked 10 questions to AI tutor', '🤔', 'tutor', 'bronze', 50, '{"type": "tutor_questions", "target": 10}'),
('tutor_expert', 'Tutor Expert', 'Asked 50+ questions to AI tutor', '🧠', 'tutor', 'silver', 150, '{"type": "tutor_questions", "target": 50}'),
('quiz_master', 'Quiz Master', 'Generated and completed 10 practice quizzes', '✍️', 'tutor', 'gold', 200, '{"type": "practice_quizzes", "target": 10}'),

-- Planner Achievements
('planner_pro', 'Planner Pro', 'Followed AI study plan for 4 weeks', '📅', 'planner', 'gold', 300, '{"type": "study_plan_adherence", "target": 4, "unit": "weeks", "threshold": 80}'),
('organized_student', 'Organized Student', 'Used study planner for 30 days', '🗂️', 'planner', 'silver', 100, '{"type": "planner_usage", "target": 30}'),
('time_manager', 'Time Manager', 'Completed 50 planned study sessions', '⏰', 'planner', 'gold', 200, '{"type": "completed_sessions", "target": 50}');
```

**3.3 - Achievement Tracking Service:**
Create `src/lib/gamification/achievementTracker.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export class AcademicAchievementTracker {
  /**
   * Check and update achievements for a user action
   */
  async trackAction(
    userId: string,
    action: AchievementAction,
    metadata?: any
  ): Promise<UnlockedAchievement[]> {
    const unlockedAchievements: UnlockedAchievement[] = [];

    // Get all relevant achievements for this action
    const achievements = await this.getRelevantAchievements(action.type);

    for (const achievement of achievements) {
      // Get or create user progress
      const progress = await this.getUserProgress(userId, achievement.achievement_key);

      // Update progress based on action
      const newProgress = this.calculateProgress(progress, action, achievement);

      // Check if achievement is unlocked
      if (newProgress >= achievement.criteria.target && !progress.is_unlocked) {
        await this.unlockAchievement(userId, achievement);
        unlockedAchievements.push(achievement);
      } else {
        await this.updateProgress(userId, achievement.achievement_key, newProgress);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Track assignment submission
   */
  async trackAssignmentSubmission(
    userId: string,
    assignment: Assignment,
    submittedAt: Date
  ): Promise<void> {
    const isOnTime = submittedAt <= assignment.due_at;
    const hoursEarly = isOnTime
      ? (assignment.due_at.getTime() - submittedAt.getTime()) / 3600000
      : 0;

    if (isOnTime) {
      // Award points for on-time submission
      await this.awardPoints(userId, 10, 'assignment_on_time', assignment.id);

      // Track for achievements
      await this.trackAction(userId, {
        type: 'assignment_submitted',
        onTime: true,
        early: hoursEarly >= 24
      });
    }

    if (hoursEarly >= 24) {
      // Bonus points for early submission
      await this.awardPoints(userId, 20, 'assignment_early', assignment.id);
    }
  }

  /**
   * Track study session completion
   */
  async trackStudySession(
    userId: string,
    session: StudySession
  ): Promise<void> {
    // Award points based on duration
    const hours = (session.end_time.getTime() - session.start_time.getTime()) / 3600000;
    const points = Math.floor(hours * 10); // 10 points per hour

    await this.awardPoints(userId, points, 'study_session', session.id);

    // Update study streak
    await this.updateStudyStreak(userId, session.start_time);

    // Track for achievements
    await this.trackAction(userId, {
      type: 'study_session_completed',
      duration: hours
    });
  }

  /**
   * Track AI tutor usage
   */
  async trackTutorUsage(userId: string, questionId: string): Promise<void> {
    await this.awardPoints(userId, 5, 'ai_tutor_question', questionId);

    await this.trackAction(userId, {
      type: 'tutor_question_asked'
    });
  }

  /**
   * Track practice quiz completion
   */
  async trackQuizCompletion(
    userId: string,
    quiz: Quiz,
    score: number
  ): Promise<void> {
    const points = Math.floor((score / 100) * 50); // Up to 50 points
    await this.awardPoints(userId, points, 'practice_quiz', quiz.id);

    await this.trackAction(userId, {
      type: 'practice_quiz_completed',
      score
    });
  }

  /**
   * Update study streak
   */
  private async updateStudyStreak(userId: string, studyDate: Date): Promise<void> {
    // Get current streak
    let { data: streak } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!streak) {
      // Create new streak
      streak = {
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_study_date: studyDate.toISOString().split('T')[0],
        streak_start_date: studyDate.toISOString().split('T')[0],
        total_study_days: 1
      };

      await supabase.from('study_streaks').insert(streak);
      return;
    }

    // Calculate days since last study
    const lastDate = new Date(streak.last_study_date);
    const daysSince = Math.floor(
      (studyDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSince === 0) {
      // Same day, no streak change
      return;
    } else if (daysSince === 1) {
      // Consecutive day, increment streak
      const newStreak = streak.current_streak + 1;
      await supabase
        .from('study_streaks')
        .update({
          current_streak: newStreak,
          longest_streak: Math.max(newStreak, streak.longest_streak),
          last_study_date: studyDate.toISOString().split('T')[0],
          total_study_days: streak.total_study_days + 1
        })
        .eq('user_id', userId);

      // Award streak milestone points
      if (newStreak % 7 === 0) {
        await this.awardPoints(userId, newStreak * 5, 'streak_milestone');
      }
    } else {
      // Streak broken, reset
      await supabase
        .from('study_streaks')
        .update({
          current_streak: 1,
          last_study_date: studyDate.toISOString().split('T')[0],
          streak_start_date: studyDate.toISOString().split('T')[0],
          total_study_days: streak.total_study_days + 1
        })
        .eq('user_id', userId);
    }
  }

  /**
   * Award points to user (integrates with main points system)
   */
  private async awardPoints(
    userId: string,
    points: number,
    source: string,
    sourceId?: string
  ): Promise<void> {
    // Log in academic points table
    await supabase.from('academic_points_log').insert({
      user_id: userId,
      points,
      source,
      source_id: sourceId,
      description: this.getPointsDescription(source)
    });

    // Update user's total points in profiles table
    await supabase.rpc('increment_user_points', {
      user_id_param: userId,
      points_param: points
    });
  }

  /**
   * Unlock achievement
   */
  private async unlockAchievement(
    userId: string,
    achievement: Achievement
  ): Promise<void> {
    // Mark as unlocked
    await supabase
      .from('user_academic_achievements')
      .update({
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
        progress: achievement.criteria.target
      })
      .eq('user_id', userId)
      .eq('achievement_key', achievement.achievement_key);

    // Award achievement points
    await this.awardPoints(
      userId,
      achievement.points_reward,
      'achievement_unlocked',
      achievement.id
    );

    // Create notification
    await this.notifyAchievementUnlock(userId, achievement);
  }

  /**
   * Get user's achievement progress
   */
  async getUserAchievements(userId: string): Promise<UserAchievementData> {
    // Get all achievements with user progress
    const { data: achievements } = await supabase
      .from('academic_achievements')
      .select(`
        *,
        user_academic_achievements!left(*)
      `)
      .eq('is_active', true);

    // Get study streak
    const { data: streak } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Calculate stats
    const unlocked = achievements?.filter(a =>
      a.user_academic_achievements?.[0]?.is_unlocked
    ).length || 0;

    const total = achievements?.length || 0;

    const totalPoints = achievements
      ?.filter(a => a.user_academic_achievements?.[0]?.is_unlocked)
      .reduce((sum, a) => sum + a.points_reward, 0) || 0;

    return {
      achievements: achievements || [],
      streak: streak || null,
      stats: {
        unlocked,
        total,
        percentage: (unlocked / total) * 100,
        totalPoints
      }
    };
  }
}

// Database function to increment points (add to migration)
/*
CREATE OR REPLACE FUNCTION increment_user_points(user_id_param uuid, points_param integer)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET points = points + points_param
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;
*/
```

**3.4 - Achievement Display Components:**
Create `src/components/academics/AchievementsDisplay.tsx`:

```typescript
export function AchievementsDisplay() {
  const [achievementData, setAchievementData] = useState<UserAchievementData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const tracker = new AcademicAchievementTracker();

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    const data = await tracker.getUserAchievements(user.id);
    setAchievementData(data);
  };

  const categories = ['all', 'assignments', 'study', 'grades', 'tutor', 'planner'];

  const filteredAchievements = achievementData?.achievements.filter(
    a => selectedCategory === 'all' || a.category === selectedCategory
  ) || [];

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header with stats */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-4">Academic Achievements</h1>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold">{achievementData?.stats.unlocked}/{achievementData?.stats.total}</div>
            <div className="text-sm opacity-90">Achievements Unlocked</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{achievementData?.stats.totalPoints}</div>
            <div className="text-sm opacity-90">Points Earned</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{achievementData?.streak?.current_streak || 0}🔥</div>
            <div className="text-sm opacity-90">Study Streak</div>
          </div>
        </div>
      </div>

      {/* Study Streak Card */}
      {achievementData?.streak && (
        <div className="bg-card rounded-lg border border-border p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Study Streak
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500">
                {achievementData.streak.current_streak}
              </div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">
                {achievementData.streak.longest_streak}
              </div>
              <div className="text-sm text-muted-foreground">Longest Streak</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">
                {achievementData.streak.total_study_days}
              </div>
              <div className="text-sm text-muted-foreground">Total Days</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
            userProgress={achievement.user_academic_achievements?.[0]}
          />
        ))}
      </div>
    </div>
  );
}

// Achievement card component
function AchievementCard({ achievement, userProgress }: Props) {
  const isUnlocked = userProgress?.is_unlocked || false;
  const progress = userProgress?.progress || 0;
  const target = achievement.criteria.target;
  const progressPercent = (progress / target) * 100;

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-cyan-400 to-blue-600'
  };

  return (
    <div
      className={`bg-card rounded-lg border-2 p-6 transition-all ${
        isUnlocked
          ? `border-transparent bg-gradient-to-br ${tierColors[achievement.tier]} text-white`
          : 'border-border opacity-60'
      }`}
    >
      <div className="text-center mb-4">
        <div className="text-5xl mb-2">
          {isUnlocked ? achievement.icon : '🔒'}
        </div>
        <h3 className="font-semibold">{achievement.name}</h3>
        <p className={`text-sm ${isUnlocked ? 'opacity-90' : 'text-muted-foreground'}`}>
          {achievement.description}
        </p>
      </div>

      {!isUnlocked && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{progress}/{target}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}

      {isUnlocked && (
        <div className="text-center pt-4 border-t border-white/20">
          <div className="text-sm opacity-90">+{achievement.points_reward} points</div>
          <div className="text-xs opacity-75">
            Unlocked {new Date(userProgress.unlocked_at).toLocaleDateString()}
          </div>
        </div>
      )}

      <div className={`text-xs text-center mt-2 ${isUnlocked ? 'opacity-75' : 'text-muted-foreground'}`}>
        {achievement.tier.toUpperCase()} • {achievement.category.toUpperCase()}
      </div>
    </div>
  );
}
```

**3.5 - Achievement Unlock Notification:**
Create `src/components/academics/AchievementUnlockModal.tsx`:

```typescript
export function AchievementUnlockModal({ achievement, onClose }: Props) {
  const [showConfetti, setShowConfetti] = useState(true);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      {showConfetti && <Confetti />}

      <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 max-w-md text-white text-center animate-scale-in">
        <div className="text-8xl mb-4">{achievement.icon}</div>
        <h2 className="text-3xl font-bold mb-2">Achievement Unlocked!</h2>
        <h3 className="text-2xl font-semibold mb-4">{achievement.name}</h3>
        <p className="text-lg opacity-90 mb-6">{achievement.description}</p>

        <div className="bg-white/20 rounded-lg p-4 mb-6">
          <div className="text-3xl font-bold">+{achievement.points_reward}</div>
          <div className="text-sm opacity-90">Points Earned</div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-white text-purple-600 font-semibold py-3 rounded-lg hover:bg-white/90 transition"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

**CRITICAL REQUIREMENTS:**

**Integration with Existing System:**
- Don't break the existing points system
- Follow existing patterns for leaderboards
- Integrate with existing achievement notifications
- Respect existing gamification UI/UX

**Points Consistency:**
- Make sure academic points add to user's total points
- Don't award points twice for the same action
- Track points separately for analytics
- Show academic vs non-academic points breakdown

**Achievement Balance:**
- Make achievements challenging but achievable
- Test point values (not too generous, not too stingy)
- Ensure achievements motivate positive behaviors
- Don't create achievements that encourage cramming or bad habits

**Streak Tracking:**
- Handle timezone issues correctly
- Consider what counts as a "study day"
- Allow grace period for missed days (optional)
- Don't punish students for planned breaks

**Performance:**
- Cache achievement progress
- Batch progress updates
- Use database indexes
- Don't slow down other operations

STEP 4 - TESTING:
1. Test achievement unlock conditions
2. Test study streak calculation with various scenarios
3. Test points integration with main system
4. Test with users who have existing points
5. Verify leaderboard includes academic points
6. Test achievement notifications
7. Verify RLS policies work correctly

STEP 5 - DOCUMENTATION:
1. Document all achievement types and criteria
2. Document points system integration
3. Add user guide for achievements
4. Document streak tracking logic
5. Add JSDoc comments to all functions

**What NOT to do:**
❌ Don't break the existing points/achievements system
❌ Don't create achievements that encourage unhealthy behavior
❌ Don't make achievements too easy or too hard
❌ Don't ignore existing gamification patterns
❌ Don't forget to test with real user data
❌ Don't award points for actions that aren't beneficial

After you complete this phase, I should have:
✅ Academic-specific achievements system
✅ Study streak tracking
✅ Integration with existing points system
✅ Achievement display UI
✅ Achievement unlock notifications
✅ Badge system
✅ Complete documentation

Start by thoroughly understanding the existing gamification system before adding academic features.
```

---

# Phase 10: Smart Notifications & Accountability

## 📝 Chat Prompt for Phase 10

```
I'm working on Phase 10 of the Hapi Academics Tab implementation. This phase focuses on creating a comprehensive smart notification system that combines academic data, mood trends, and AI insights.

**Project Context:**
- Phases 1-9 are complete: Database, Canvas, AI, Calendar, Grades, Tutor, Feedback Hub, Gamification
- We have rich data: assignments, grades, calendar events, mood data, study sessions
- The app already has a popup system (see `src/components/popups/PopupQueueManager.tsx`)
- We need to create SMART notifications that trigger based on multiple factors
- This is a BRAND NEW FEATURE with some overlap with existing popup system

**What I Need You To Do:**

STEP 1 - UNDERSTANDING PHASE:
1. Read `CLAUDE.md` and `ACADEMICS_IMPLEMENTATION_PLAN.md` Phase 10
2. Review the existing PopupQueueManager at `src/components/popups/PopupQueueManager.tsx`
3. Review how the app currently handles notifications/alerts
4. Check if there's email notification capability
5. Review mood data structure (from emotion system)
6. Understand the calendar and assignment data available

STEP 2 - ANALYSIS PHASE:
1. Identify overlap with existing notification system
2. Plan notification trigger logic (mood + workload + time)
3. Design notification queue and prioritization
4. Plan email/SMS/push notification integration
5. Design smart timing algorithm (when to send)
6. Plan Do Not Disturb and notification preferences

STEP 3 - IMPLEMENTATION PHASE:

**3.1 - Database Schema:**
```sql
-- Migration: smart_notifications.sql

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  type text NOT NULL, -- 'deadline', 'mood', 'performance', 'ai_suggestion'
  title_template text NOT NULL, -- Can include {{variables}}
  body_template text NOT NULL,
  action_url_template text,
  action_label text,
  priority integer DEFAULT 50, -- 0-100, higher = more important
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- User notification queue
CREATE TABLE IF NOT EXISTS notification_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  university_id uuid NOT NULL REFERENCES universities(id),
  template_key text REFERENCES notification_templates(template_key),
  notification_type text NOT NULL,
  trigger_type text NOT NULL, -- 'deadline', 'mood', 'performance', 'ai'
  title text NOT NULL,
  body text NOT NULL,
  action_url text,
  action_label text,
  priority integer DEFAULT 50,

  -- Scheduling
  scheduled_for timestamptz NOT NULL,
  sent_at timestamptz,
  status text DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'

  -- Delivery channels
  channels jsonb DEFAULT '["in_app"]', -- ['in_app', 'email', 'push', 'sms']

  -- Tracking
  read_at timestamptz,
  clicked_at timestamptz,
  dismissed_at timestamptz,

  -- Metadata
  metadata jsonb,
  error_message text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,

  -- Channel preferences
  in_app_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT false,
  push_enabled boolean DEFAULT false,
  sms_enabled boolean DEFAULT false,

  -- Type preferences
  deadline_notifications boolean DEFAULT true,
  mood_notifications boolean DEFAULT true,
  performance_notifications boolean DEFAULT true,
  ai_suggestions boolean DEFAULT true,
  achievement_notifications boolean DEFAULT true,

  -- Quiet hours
  quiet_hours_enabled boolean DEFAULT false,
  quiet_hours_start time DEFAULT '22:00:00',
  quiet_hours_end time DEFAULT '08:00:00',
  quiet_hours_timezone text DEFAULT 'UTC',

  -- Frequency limits
  max_notifications_per_day integer DEFAULT 10,
  min_hours_between_notifications numeric DEFAULT 1.0,

  -- Contact info
  email_address text,
  phone_number text,
  phone_verified boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notification triggers log (for analytics)
CREATE TABLE IF NOT EXISTS notification_triggers_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trigger_type text NOT NULL,
  trigger_data jsonb,
  notification_created boolean,
  notification_id uuid REFERENCES notification_queue(id),
  reason text, -- Why notification was/wasn't created
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_notification_queue_user_status ON notification_queue(user_id, status, scheduled_for);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_triggers_log_user_date ON notification_triggers_log(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_triggers_log ENABLE ROW LEVEL SECURITY;

-- Templates are public
CREATE POLICY "Anyone can view templates"
  ON notification_templates FOR SELECT
  TO authenticated
  USING (true);

-- Users can only access their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notification_queue FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notification_queue FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON notification_preferences FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own trigger log"
  ON notification_triggers_log FOR SELECT
  USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_notification_queue_updated_at
  BEFORE UPDATE ON notification_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**3.2 - Seed Notification Templates:**
```sql
-- Insert notification templates
INSERT INTO notification_templates (template_key, type, title_template, body_template, action_url_template, action_label, priority) VALUES

-- Deadline notifications
('assignment_due_tomorrow', 'deadline', 'Assignment Due Tomorrow', '{{assignment_name}} is due tomorrow at {{due_time}}. Have you started working on it?', '/academics?view=grades', 'View Assignment', 80),
('assignment_due_today', 'deadline', 'Assignment Due Today!', '{{assignment_name}} is due today at {{due_time}}. {{hours_left}} hours remaining.', '/academics?view=grades', 'View Assignment', 90),
('quiz_tomorrow', 'deadline', 'Quiz Tomorrow', 'You have a quiz in {{course_name}} tomorrow at {{quiz_time}}.', '/academics?view=calendar', 'View Calendar', 85),
('study_session_starting', 'deadline', 'Study Session Starting Soon', 'Your {{session_name}} starts in 15 minutes.', '/academics?view=planner', 'View Planner', 70),

-- Mood + workload notifications
('heavy_load_low_mood', 'mood', 'Take Care of Yourself', 'You have {{assignment_count}} assignments due soon and your mood has been low. Consider taking a break or reaching out for support.', '/student/hapilab', 'Talk to HapiLab', 95),
('stressed_with_deadlines', 'mood', 'Feeling Stressed?', 'You seem stressed and have multiple deadlines coming up. Would you like help creating a manageable study plan?', '/academics?view=planner', 'Generate Study Plan', 90),

-- Performance notifications
('grade_dropped', 'performance', 'Grade Alert', 'Your grade in {{course_name}} has dropped to {{new_grade}}%. Let\'s create a plan to improve it.', '/academics?view=grades&course={{course_id}}', 'View Course', 85),
('missing_assignments', 'performance', 'Missing Assignments', 'You have {{count}} missing assignments. Would you like to create a catch-up plan?', '/academics?view=planner', 'Create Plan', 80),
('low_quiz_score', 'performance', 'Quiz Review Needed', 'You scored {{score}}% on the recent {{quiz_name}}. Consider reviewing the material or asking for help.', '/academics?view=tutor', 'Get Help', 75),

-- AI suggestions
('ai_study_block', 'ai_suggestion', 'Study Suggestion', 'Based on your schedule and upcoming assignments, I suggest a {{duration}}-hour study block {{when}}.', '/academics?view=planner', 'Add to Calendar', 60),
('ai_review_recommendation', 'ai_suggestion', 'Review Recommendation', 'Your {{course_name}} exam is in {{days}} days. I recommend reviewing {{topics}}.', '/academics?view=tutor', 'Start Review', 70),
('ai_workload_warning', 'ai_suggestion', 'Workload Alert', 'Next week looks very busy with {{load}}% capacity. Consider rescheduling some tasks.', '/academics?view=planner', 'Adjust Schedule', 65),

-- Achievement notifications
('achievement_unlocked', 'achievement', 'Achievement Unlocked!', 'Congratulations! You\'ve unlocked {{achievement_name}}: {{achievement_description}}', '/academics?view=achievements', 'View Achievements', 50),
('streak_milestone', 'achievement', 'Streak Milestone!', 'Amazing! You\'ve maintained a {{days}}-day study streak! Keep it up!', '/academics?view=achievements', 'View Streak', 55);
```

**3.3 - Smart Notification Service:**
Create `src/lib/notifications/smartNotificationService.ts`:

```typescript
import { supabase } from '@/lib/supabase';

export class SmartNotificationService {
  /**
   * Main scheduler - runs periodically to check triggers
   */
  async checkAndCreateNotifications(userId: string): Promise<void> {
    // Check user preferences first
    const prefs = await this.getUserPreferences(userId);
    if (!this.canSendNotifications(prefs)) {
      return;
    }

    // Get user context (mood, assignments, calendar, etc.)
    const context = await this.getUserContext(userId);

    // Check all trigger types
    await Promise.all([
      this.checkDeadlineTriggers(userId, context, prefs),
      this.checkMoodTriggers(userId, context, prefs),
      this.checkPerformanceTriggers(userId, context, prefs),
      this.checkAISuggestions(userId, context, prefs)
    ]);
  }

  /**
   * Check deadline-based triggers
   */
  private async checkDeadlineTriggers(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.deadline_notifications) return;

    // Assignment due tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const assignment of context.upcomingAssignments) {
      const daysDiff = this.daysBetween(new Date(), assignment.due_at);

      if (daysDiff === 1) {
        await this.createNotification(userId, {
          templateKey: 'assignment_due_tomorrow',
          variables: {
            assignment_name: assignment.name,
            due_time: this.formatTime(assignment.due_at)
          },
          scheduledFor: this.calculateOptimalTime(userId, prefs, 'morning'),
          priority: 80
        });
      } else if (daysDiff === 0) {
        const hoursLeft = this.hoursUntil(assignment.due_at);
        if (hoursLeft <= 12 && hoursLeft > 0) {
          await this.createNotification(userId, {
            templateKey: 'assignment_due_today',
            variables: {
              assignment_name: assignment.name,
              due_time: this.formatTime(assignment.due_at),
              hours_left: hoursLeft
            },
            scheduledFor: new Date(), // Send immediately
            priority: 90
          });
        }
      }
    }

    // Study session reminders
    for (const session of context.upcomingSessions) {
      const minutesUntil = this.minutesUntil(session.start_time);
      if (minutesUntil === 15) {
        await this.createNotification(userId, {
          templateKey: 'study_session_starting',
          variables: {
            session_name: session.title
          },
          scheduledFor: new Date(),
          priority: 70
        });
      }
    }
  }

  /**
   * Check mood-triggered notifications
   */
  private async checkMoodTriggers(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.mood_notifications) return;

    // Mood has been low + heavy workload
    if (context.moodTrend.average < 3 && context.assignmentCount >= 3) {
      await this.createNotification(userId, {
        templateKey: 'heavy_load_low_mood',
        variables: {
          assignment_count: context.assignmentCount
        },
        scheduledFor: this.calculateOptimalTime(userId, prefs, 'afternoon'),
        priority: 95
      });
    }

    // Stressed with multiple deadlines
    if (
      context.recentMood?.sentiment === 2 && // Frustrated/Worried/Nervous
      context.upcomingAssignments.filter(a => this.daysBetween(new Date(), a.due_at) <= 3).length >= 2
    ) {
      await this.createNotification(userId, {
        templateKey: 'stressed_with_deadlines',
        variables: {},
        scheduledFor: this.calculateOptimalTime(userId, prefs, 'evening'),
        priority: 90
      });
    }
  }

  /**
   * Check performance-triggered notifications
   */
  private async checkPerformanceTriggers(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.performance_notifications) return;

    // Grade dropped significantly
    for (const course of context.courses) {
      if (course.previousGrade && course.currentGrade) {
        const drop = course.previousGrade - course.currentGrade;
        if (drop >= 5) {
          await this.createNotification(userId, {
            templateKey: 'grade_dropped',
            variables: {
              course_name: course.name,
              new_grade: course.currentGrade.toFixed(1)
            },
            metadata: { course_id: course.id },
            scheduledFor: this.calculateOptimalTime(userId, prefs, 'afternoon'),
            priority: 85
          });
        }
      }
    }

    // Missing assignments
    const missingCount = context.assignments.filter(
      a => a.missing && !a.submitted
    ).length;

    if (missingCount >= 2) {
      await this.createNotification(userId, {
        templateKey: 'missing_assignments',
        variables: { count: missingCount },
        scheduledFor: this.calculateOptimalTime(userId, prefs, 'morning'),
        priority: 80
      });
    }
  }

  /**
   * Check AI-generated suggestions
   */
  private async checkAISuggestions(
    userId: string,
    context: UserContext,
    prefs: NotificationPreferences
  ): Promise<void> {
    if (!prefs.ai_suggestions) return;

    // AI suggests study block
    const suggestion = await this.getAIStudySuggestion(userId, context);
    if (suggestion) {
      await this.createNotification(userId, {
        templateKey: 'ai_study_block',
        variables: {
          duration: suggestion.duration,
          when: suggestion.when
        },
        scheduledFor: new Date(),
        priority: 60
      });
    }

    // Workload warning
    const nextWeekLoad = await this.calculateNextWeekLoad(userId);
    if (nextWeekLoad > 80) {
      await this.createNotification(userId, {
        templateKey: 'ai_workload_warning',
        variables: {
          load: nextWeekLoad
        },
        scheduledFor: this.calculateOptimalTime(userId, prefs, 'weekend'),
        priority: 65
      });
    }
  }

  /**
   * Calculate optimal time to send notification
   */
  private calculateOptimalTime(
    userId: string,
    prefs: NotificationPreferences,
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'weekend'
  ): Date {
    const now = new Date();

    // Check quiet hours
    if (prefs.quiet_hours_enabled) {
      const currentTime = now.toLocaleTimeString('en-US', { hour12: false, timeZone: prefs.quiet_hours_timezone });
      if (this.isQuietHours(currentTime, prefs.quiet_hours_start, prefs.quiet_hours_end)) {
        // Schedule for end of quiet hours
        return this.parseTime(prefs.quiet_hours_end);
      }
    }

    // Use preferred time
    const scheduledTime = new Date(now);

    switch (preferredTime) {
      case 'morning':
        scheduledTime.setHours(9, 0, 0, 0);
        break;
      case 'afternoon':
        scheduledTime.setHours(14, 0, 0, 0);
        break;
      case 'evening':
        scheduledTime.setHours(19, 0, 0, 0);
        break;
      case 'weekend':
        // Next Saturday at 10am
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
        scheduledTime.setDate(now.getDate() + daysUntilSaturday);
        scheduledTime.setHours(10, 0, 0, 0);
        break;
    }

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now && preferredTime !== 'weekend') {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    return scheduledTime;
  }

  /**
   * Create notification (respecting rate limits)
   */
  private async createNotification(
    userId: string,
    params: CreateNotificationParams
  ): Promise<void> {
    // Check if similar notification already exists
    const duplicate = await this.checkDuplicateNotification(userId, params.templateKey);
    if (duplicate) {
      await this.logTrigger(userId, params.templateKey, false, 'Duplicate notification');
      return;
    }

    // Check daily limit
    const todayCount = await this.getTodayNotificationCount(userId);
    const prefs = await this.getUserPreferences(userId);

    if (todayCount >= prefs.max_notifications_per_day) {
      await this.logTrigger(userId, params.templateKey, false, 'Daily limit reached');
      return;
    }

    // Check minimum time between notifications
    const lastNotification = await this.getLastNotification(userId);
    if (lastNotification) {
      const hoursSince = (Date.now() - lastNotification.created_at.getTime()) / 3600000;
      if (hoursSince < prefs.min_hours_between_notifications) {
        await this.logTrigger(userId, params.templateKey, false, 'Too soon after last notification');
        return;
      }
    }

    // Get template
    const template = await this.getTemplate(params.templateKey);

    // Render template with variables
    const title = this.renderTemplate(template.title_template, params.variables);
    const body = this.renderTemplate(template.body_template, params.variables);
    const actionUrl = params.metadata?.course_id
      ? this.renderTemplate(template.action_url_template, params.metadata)
      : template.action_url_template;

    // Insert notification
    const { data } = await supabase.from('notification_queue').insert({
      user_id: userId,
      university_id: (await this.getUserUniversityId(userId)),
      template_key: params.templateKey,
      notification_type: template.type,
      trigger_type: template.type,
      title,
      body,
      action_url: actionUrl,
      action_label: template.action_label,
      priority: params.priority || template.priority,
      scheduled_for: params.scheduledFor.toISOString(),
      channels: this.getEnabledChannels(prefs),
      metadata: params.metadata,
      status: 'pending'
    }).select().single();

    await this.logTrigger(userId, params.templateKey, true, 'Notification created', data.id);
  }

  /**
   * Send pending notifications (background job)
   */
  async sendPendingNotifications(): Promise<void> {
    const { data: pending } = await supabase
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: false })
      .limit(100);

    if (!pending) return;

    for (const notification of pending) {
      try {
        // Send via enabled channels
        const channels = notification.channels || ['in_app'];

        for (const channel of channels) {
          switch (channel) {
            case 'in_app':
              // Already in database, just mark as sent
              break;
            case 'email':
              await this.sendEmail(notification);
              break;
            case 'push':
              await this.sendPushNotification(notification);
              break;
            case 'sms':
              await this.sendSMS(notification);
              break;
          }
        }

        // Mark as sent
        await supabase
          .from('notification_queue')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);
      } catch (error) {
        // Mark as failed
        await supabase
          .from('notification_queue')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notification.id);
      }
    }
  }

  /**
   * Send email notification
   */
  private async sendEmail(notification: Notification): Promise<void> {
    // Get user email from preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('email_address')
      .eq('user_id', notification.user_id)
      .single();

    if (!prefs?.email_address) return;

    // Use email service (Resend, SendGrid, etc.)
    // await emailService.send({
    //   to: prefs.email_address,
    //   subject: notification.title,
    //   html: this.renderEmailTemplate(notification)
    // });
  }

  /**
   * Send push notification
   */
  private async sendPushNotification(notification: Notification): Promise<void> {
    // Use web push API
    // await webPush.sendNotification(subscription, {
    //   title: notification.title,
    //   body: notification.body,
    //   icon: '/icon.png',
    //   data: { url: notification.action_url }
    // });
  }

  /**
   * Send SMS notification
   */
  private async sendSMS(notification: Notification): Promise<void> {
    // Use Twilio or similar
    // await twilioClient.messages.create({
    //   to: phoneNumber,
    //   body: `${notification.title}: ${notification.body}`
    // });
  }
}
```

**CRITICAL REQUIREMENTS:**

**User Control:**
- Respect user preferences at all times
- Allow disabling any notification type
- Respect quiet hours
- Provide easy opt-out
- Don't spam users

**Smart Timing:**
- Calculate optimal send time based on user activity patterns
- Respect quiet hours and timezone
- Don't send notifications too frequently
- Prioritize important notifications
- Batch low-priority notifications

**Privacy:**
- Don't send sensitive information via email/SMS
- Encrypt any notification data
- Allow users to control data sharing
- Clear privacy policy

**Performance:**
- Run checks in background jobs
- Batch notification creation
- Use database indexes
- Cache user preferences
- Don't slow down other operations

**Testing:**
- Test all trigger conditions
- Test quiet hours logic
- Test rate limiting
- Test with different timezones
- Test email/SMS delivery (if implemented)

STEP 4 - TESTING:
1. Test deadline notifications with various scenarios
2. Test mood-triggered notifications
3. Test performance notifications
4. Test AI suggestions
5. Test quiet hours and rate limiting
6. Test notification preferences
7. Verify no notification spam

STEP 5 - DOCUMENTATION:
1. Document all notification types and triggers
2. Document smart timing algorithm
3. Add user guide for notification preferences
4. Document rate limiting logic
5. Add JSDoc comments to all functions

**What NOT to do:**
❌ Don't spam users with notifications
❌ Don't ignore quiet hours
❌ Don't send sensitive data via external channels
❌ Don't make notifications too intrusive
❌ Don't ignore user preferences
❌ Don't send duplicate notifications

After you complete this phase, I should have:
✅ Smart notification system with multiple triggers
✅ Notification queue and scheduler
✅ Notification preferences UI
✅ Email/push/SMS integration (optional)
✅ Smart timing algorithm
✅ Rate limiting and spam prevention
✅ Complete documentation

This is a complex system - start with in-app notifications and add external channels later.
```

---

# Phase 11: Canvas LTI Deep Integration (OPTIONAL)

## 📝 Chat Prompt for Phase 11

```
I'm working on Phase 11 of the Hapi Academics Tab implementation. This phase focuses on Canvas LTI 1.3 deep integration for embedding Hapi features directly in Canvas.

**⚠️ IMPORTANT: This phase is OPTIONAL and requires:**
- Canvas admin/instructor access
- LTI developer keys
- Deep understanding of LTI 1.3 spec
- Server-side LTI provider implementation

**Project Context:**
- All previous phases are complete
- Canvas API integration exists (read/sync)
- We want to ADD LTI for deep embedding and grade pass-back
- This enables: embedded widgets in Canvas, grade sync back to Canvas gradebook, deep-linked assignments

**What I Need You To Do:**

STEP 1 - REQUIREMENTS CHECK:
Before proceeding, verify:
1. Do we have Canvas admin access to create LTI developer keys?
2. Do we need this feature immediately or can it be deferred?
3. Are we okay with the complexity of LTI implementation?
4. Do we have server infrastructure for LTI provider?

If ANY of these are "no", **DEFER THIS PHASE**.

STEP 2 - UNDERSTANDING PHASE:
1. Read [IMS Global LTI 1.3 Specification](https://www.imsglobal.org/spec/lti/v1p3/)
2. Read [Canvas LTI 1.3 Documentation](https://canvas.instructure.com/doc/api/file.lti_dev_key_config.html)
3. Understand LTI concepts: Platform, Tool, Launch, Deep Linking, AGS, NRPS
4. Review existing Canvas integration (read-only API)
5. Understand the difference between API and LTI

STEP 3 - IMPLEMENTATION OVERVIEW:

**LTI 1.3 Core Concepts:**
- **Platform**: Canvas (the LMS)
- **Tool**: HapiAI (our app)
- **Launch**: User clicks link in Canvas → launches Hapi tool
- **Deep Linking**: Instructors can add Hapi content to Canvas courses
- **AGS** (Assignment & Grading Services): Pass grades back to Canvas
- **NRPS** (Names & Role Provisioning): Get roster data from Canvas

**Implementation Steps:**

**3.1 - LTI Configuration Database:**
```sql
-- LTI 1.3 configuration and state
CREATE TABLE lti_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issuer text NOT NULL, -- Canvas instance URL
  client_id text NOT NULL,
  deployment_id text,
  auth_login_url text NOT NULL,
  auth_token_url text NOT NULL,
  auth_audience text,
  jwks_url text NOT NULL,
  public_key text,
  private_key text, -- Our tool's private key
  created_at timestamptz DEFAULT now(),
  UNIQUE(issuer, client_id)
);

-- LTI launch state
CREATE TABLE lti_launches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state text UNIQUE NOT NULL,
  nonce text NOT NULL,
  configuration_id uuid REFERENCES lti_configurations(id),
  user_id uuid REFERENCES profiles(id),
  context jsonb, -- Full LTI launch data
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- LTI grade pass-back
CREATE TABLE lti_grade_passback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  line_item_id text NOT NULL, -- AGS line item
  score numeric,
  activity_progress text,
  grading_progress text,
  timestamp timestamptz DEFAULT now()
);
```

**3.2 - LTI Provider (Supabase Edge Function):**
```typescript
// supabase/functions/lti-launch/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

serve(async (req) => {
  const url = new URL(req.url);

  // Step 1: OIDC Login Initiation
  if (url.pathname === '/lti/login') {
    return handleLoginInitiation(req);
  }

  // Step 2: OIDC Authentication Response (launch)
  if (url.pathname === '/lti/launch') {
    return handleLaunch(req);
  }

  // Step 3: JWKS endpoint (our public keys)
  if (url.pathname === '/lti/jwks') {
    return handleJWKS(req);
  }

  return new Response('Not found', { status: 404 });
});

async function handleLoginInitiation(req: Request) {
  const params = new URL(req.url).searchParams;

  // Extract OIDC parameters
  const iss = params.get('iss'); // Canvas URL
  const login_hint = params.get('login_hint');
  const target_link_uri = params.get('target_link_uri');
  const lti_message_hint = params.get('lti_message_hint');

  // Generate state and nonce
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  // Store state in database
  await storeState(state, nonce, iss);

  // Get LTI config for this issuer
  const config = await getLTIConfig(iss);

  // Redirect to Canvas auth endpoint
  const authUrl = new URL(config.auth_login_url);
  authUrl.searchParams.set('scope', 'openid');
  authUrl.searchParams.set('response_type', 'id_token');
  authUrl.searchParams.set('client_id', config.client_id);
  authUrl.searchParams.set('redirect_uri', target_link_uri);
  authUrl.searchParams.set('login_hint', login_hint);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('nonce', nonce);
  authUrl.searchParams.set('prompt', 'none');

  if (lti_message_hint) {
    authUrl.searchParams.set('lti_message_hint', lti_message_hint);
  }

  return Response.redirect(authUrl.toString(), 302);
}

async function handleLaunch(req: Request) {
  const formData = await req.formData();
  const id_token = formData.get('id_token') as string;
  const state = formData.get('state') as string;

  // Verify state
  const storedState = await getState(state);
  if (!storedState) {
    return new Response('Invalid state', { status: 400 });
  }

  // Get LTI config
  const config = await getLTIConfig(storedState.issuer);

  // Verify JWT
  const { payload } = await jose.jwtVerify(
    id_token,
    await getPublicKey(config.jwks_url),
    {
      issuer: config.issuer,
      audience: config.client_id
    }
  );

  // Verify nonce
  if (payload.nonce !== storedState.nonce) {
    return new Response('Invalid nonce', { status: 400 });
  }

  // Extract LTI claims
  const ltiClaims = payload['https://purl.imsglobal.org/spec/lti/claim'];

  // Create or link user
  const user = await createOrLinkUser(payload, ltiClaims);

  // Store launch context
  await storeLaunchContext(user.id, ltiClaims);

  // Generate session token
  const sessionToken = await createSessionToken(user.id);

  // Redirect to Hapi app with session
  const appUrl = new URL(Deno.env.get('APP_URL') + '/academics');
  appUrl.searchParams.set('lti_token', sessionToken);
  appUrl.searchParams.set('context', ltiClaims.context?.id);

  return Response.redirect(appUrl.toString(), 302);
}

async function handleJWKS(req: Request) {
  // Return our public key in JWKS format
  const publicKey = await getToolPublicKey();

  return new Response(
    JSON.stringify({
      keys: [publicKey]
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
```

**3.3 - Assignment & Grading Services (AGS):**
```typescript
// Pass grades back to Canvas gradebook

export class LTIGradingService {
  async passbackGrade(
    userId: string,
    lineItemId: string,
    score: number,
    maxScore: number
  ): Promise<void> {
    // Get LTI launch context
    const context = await this.getLaunchContext(userId);

    // Get access token
    const accessToken = await this.getAccessToken(context);

    // Send score to Canvas
    await fetch(lineItemId + '/scores', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.ims.lis.v1.score+json'
      },
      body: JSON.stringify({
        userId: context.user_id,
        scoreGiven: score,
        scoreMaximum: maxScore,
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded',
        timestamp: new Date().toISOString()
      })
    });
  }
}
```

**CRITICAL NOTES:**

**LTI is COMPLEX:**
- Requires deep understanding of OIDC and JWT
- Security is critical (proper signature verification)
- State management is tricky
- Debugging is difficult

**Infrastructure Required:**
- Server-side endpoints (can't do LTI in browser)
- HTTPS required (Canvas won't connect to HTTP)
- Public JWKS endpoint
- Session management

**Canvas Configuration:**
- Need admin access to create developer key
- Must register redirect URIs
- Must provide JWKS URL
- Configuration is per-Canvas-instance

**When to Use LTI vs API:**
- **LTI**: Embedding in Canvas, grade pass-back, SSO
- **API**: Sync data, read information, external features

**Recommendation:**
Unless you have a specific need for embedded Canvas widgets or grade pass-back, **DEFER THIS PHASE** and use the Canvas API (Phase 2) instead.

If you MUST implement LTI:
1. Start with LTI 1.3 core (basic launch)
2. Add Deep Linking (content selection)
3. Add AGS (grade pass-back)
4. Add NRPS (roster sync)

**Resources:**
- [IMS Global LTI 1.3 Core Spec](https://www.imsglobal.org/spec/lti/v1p3/)
- [Canvas LTI 1.3 Docs](https://canvas.instructure.com/doc/api/file.lti_dev_key_config.html)
- [LTI Advantage](https://www.imsglobal.org/spec/lti/v1p3/)

After you complete this phase (if needed), I should have:
✅ LTI 1.3 provider implementation
✅ Canvas deep linking support
✅ Grade pass-back to Canvas (AGS)
✅ Roster provisioning (NRPS)
✅ Embedded Hapi widgets in Canvas
✅ Complete LTI documentation

**Final Note:** This phase is highly advanced. Unless you have specific requirements and Canvas admin access, it's recommended to skip this and rely on Canvas API integration from Phase 2.
```

---

## 📝 Final Notes for All Phases

**General Reminders for ALL Phases 7-11:**

1. **Always start by understanding existing code** before writing new code
2. **Follow established patterns** from earlier phases
3. **Keep Canvas API in mind** - all features should work with real Canvas data
4. **Write Supabase-friendly code** - RLS, indexes, efficient queries
5. **Test incrementally** - don't wait until everything is done
6. **Document as you go** - add comments and docs while coding
7. **Think about edge cases** - empty states, errors, missing data
8. **Consider performance** - will this scale?
9. **Maintain consistency** - follow existing UI/UX patterns
10. **Ask questions** - if requirements are unclear, ask before implementing

**Success Criteria for Each Phase:**
- All deliverables implemented
- Code follows project patterns
- TypeScript compilation passes
- Database migrations tested
- RLS policies verified
- Dark mode works
- Mobile responsive
- Documentation complete
- No console errors
- Performance acceptable

Good luck with your implementation! 🚀

