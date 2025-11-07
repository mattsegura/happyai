/**
 * AI Prompt Templates
 *
 * Centralized prompt templates for all AI features with versioning support.
 * Each template is carefully crafted for optimal AI performance.
 */

import type { PromptTemplate, PromptVariables } from './aiTypes';

// =====================================================
// TEMPLATE HELPER
// =====================================================

/**
 * Fill in template variables
 */
export function fillTemplate(template: string, variables: PromptVariables): string {
  let result = template;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    const replacement = typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value);
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  });

  return result;
}

// =====================================================
// STUDY COACH PROMPTS
// =====================================================

export const STUDY_PLAN_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'study_coach',
  model: 'claude-3-sonnet-20240229',
  systemPrompt: 'You are an expert AI Study Coach helping college students optimize their learning and manage their academic workload effectively.',
  template: `You are an AI Study Coach creating a personalized weekly study plan for a college student.

**Student Context:**

**Upcoming Assignments:**
{assignments}

**Recent Academic Performance:**
{grades}

**Calendar Availability:**
{availability}

**Recent Mood & Energy Levels:**
{mood}

**Study Preferences:**
{preferences}

**Task:**
Generate a realistic, balanced weekly study plan that:
1. Prioritizes high-impact and urgent assignments
2. Breaks large assignments into manageable 60-90 minute sessions
3. Considers the student's mood patterns (schedule harder tasks when energy is typically high)
4. Includes 10-15 minute breaks between sessions
5. Respects the student's preferred study times
6. Leaves buffer time for unexpected events
7. Avoids over-scheduling (max 6 hours of focused study per day)

**Output Format (JSON):**
\`\`\`json
{
  "weekSummary": "Brief overview of the week's academic load",
  "totalStudyHours": 20,
  "days": [
    {
      "date": "2024-11-01",
      "dayOfWeek": "Monday",
      "totalHours": 4,
      "sessions": [
        {
          "startTime": "14:00",
          "endTime": "15:30",
          "assignmentId": "assignment-uuid",
          "assignmentName": "Biology Lab Report",
          "courseId": "course-uuid",
          "courseName": "BIOL 101",
          "focus": "Complete data analysis and create graphs",
          "priority": "high",
          "estimatedDifficulty": "medium"
        }
      ],
      "loadLevel": "moderate"
    }
  ],
  "recommendations": [
    "Take a 15-minute walk between afternoon sessions",
    "Consider studying Biology in the morning when your energy is highest"
  ],
  "warnings": [
    "Heavy load on Tuesday (3 deadlines) - consider redistributing if possible"
  ]
}
\`\`\`

Respond ONLY with valid JSON. No additional text.`,
  variables: ['assignments', 'grades', 'availability', 'mood', 'preferences']
};

export const ADJUST_STUDY_PLAN_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'study_coach',
  model: 'claude-3-sonnet-20240229',
  systemPrompt: 'You are an AI Study Coach adjusting study plans based on real-time changes.',
  template: `Adjust the student's study plan based on this trigger:

**Current Study Plan:**
{currentPlan}

**Trigger Event:**
Type: {triggerType}
Details: {triggerDetails}

**Available Context:**
- Current time: {currentTime}
- Remaining assignments: {remainingAssignments}
- Recent mood: {mood}

**Adjustment Guidelines:**
- If assignment submitted early: Free up that time, suggest review for upcoming work
- If low grade detected: Add review/practice sessions for that subject
- If mood declining: Reduce daily study hours by 20%, add more breaks
- If new urgent assignment: Reprioritize, move less urgent items

**Output Format (JSON):**
Return the adjusted plan in the same format as the original, highlighting what changed.

Respond ONLY with valid JSON.`,
  variables: ['currentPlan', 'triggerType', 'triggerDetails', 'currentTime', 'remainingAssignments', 'mood']
};

// =====================================================
// SCHEDULING ASSISTANT PROMPTS
// =====================================================

export const SCHEDULING_REQUEST_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'scheduling_assistant',
  model: 'claude-3-sonnet-20240229',
  systemPrompt: 'You are an AI Scheduling Assistant that understands natural language and helps students manage their calendar.',
  template: `Parse this scheduling request and determine the appropriate action.

**User Request:**
"{userMessage}"

**Current Context:**
**Current Date/Time:** {currentDateTime}
**User's Calendar:**
{calendar}

**Available Study Sessions:**
{studySessions}

**Upcoming Assignments:**
{assignments}

**Task:**
Understand the user's intent and return a structured action to perform.

**Possible Actions:**
1. move_study_session - Move an existing session to a different time
2. create_study_session - Create a new study block
3. delete_study_session - Remove a session
4. reschedule_multiple - Adjust multiple sessions
5. generate_plan - Create a new study plan
6. clarify - Need more information from user

**Output Format (JSON):**
\`\`\`json
{
  "action": "move_study_session",
  "confidence": 0.95,
  "parameters": {
    "sessionId": "uuid-of-session",
    "newDate": "2024-11-07",
    "newStartTime": "14:00",
    "reason": "User requested move to Thursday"
  },
  "explanation": "I'll move your Biology review session to Thursday at 2 PM",
  "needsConfirmation": true,
  "confirmationMessage": "Move Biology review to Thursday, November 7th at 2:00 PM?"
}
\`\`\`

Respond ONLY with valid JSON.`,
  variables: ['userMessage', 'currentDateTime', 'calendar', 'studySessions', 'assignments']
};

// =====================================================
// COURSE TUTOR PROMPTS
// =====================================================

export const COURSE_TUTOR_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'course_tutor',
  model: 'gpt-3.5-turbo',
  systemPrompt: 'You are a patient, knowledgeable AI tutor helping students understand their course material.',
  template: `**Course Context:**
Course: {courseName} ({courseCode})
Module: {moduleName}
Current Assignment: {assignmentName}

**Student Question:**
{question}

**Additional Context:**
{additionalContext}

**Instructions:**
Provide a clear, helpful answer that:
1. Explains the concept step-by-step in simple language
2. Uses relevant examples from the course material
3. Encourages critical thinking with follow-up questions
4. Suggests related topics to explore
5. References course materials when possible

If the question is outside the course scope or you're unsure, clearly state that and suggest where the student might find the answer.

Keep your response focused and educational. Aim for clarity over complexity.`,
  variables: ['courseName', 'courseCode', 'moduleName', 'assignmentName', 'question', 'additionalContext']
};

export const GENERATE_QUIZ_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'course_tutor',
  model: 'claude-3-sonnet-20240229',
  template: `Generate a practice quiz for this course module.

**Course:** {courseName}
**Module:** {moduleName}
**Topics:** {topics}
**Difficulty:** {difficulty}
**Number of Questions:** {questionCount}

**Learning Objectives:**
{learningObjectives}

**Generate:**
- Multiple choice questions (with 4 options each)
- True/False questions
- Short answer questions

For each question, provide:
1. The question text
2. Answer options (for MC/TF)
3. Correct answer
4. Brief explanation of why the answer is correct

**Output Format (JSON):**
\`\`\`json
{
  "quizTitle": "Module 3 Practice Quiz",
  "estimatedTime": "15 minutes",
  "questions": [
    {
      "id": 1,
      "type": "multiple_choice",
      "question": "What is...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "B",
      "explanation": "The answer is B because..."
    }
  ]
}
\`\`\`

Respond ONLY with valid JSON.`,
  variables: ['courseName', 'moduleName', 'topics', 'difficulty', 'questionCount', 'learningObjectives']
};

// =====================================================
// GRADE PROJECTION PROMPTS
// =====================================================

export const GRADE_PROJECTION_INSIGHTS_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'grade_projection',
  model: 'claude-3-haiku-20240307',
  template: `Analyze this student's academic performance and provide actionable insights.

**Course:** {courseName}
**Current Grade:** {currentGrade}%
**Course Progress:** {completedWeight}% complete, {remainingWeight}% remaining

**Recent Performance:**
{recentGrades}

**Grade Trend:** {trend}

**Remaining Assignments:**
{remainingAssignments}

**Projected Final Grade:** {projectedGrade}%

**Task:**
Provide insights on:
1. Likelihood of reaching their target grade ({targetGrade}%)
2. Which remaining assignments have the most impact (high weight/points)
3. Realistic target scores needed for remaining work
4. Any concerning patterns in their performance
5. Specific recommendations for improvement

Keep your response concise and actionable. Focus on what the student can control.

**Output Format (JSON):**
\`\`\`json
{
  "targetAchievable": true,
  "confidence": "high",
  "keyInsights": [
    "You're on track to achieve your target grade",
    "Focus on the final exam (30% of grade) - it has the most impact"
  ],
  "priorityAssignments": [
    {
      "name": "Final Exam",
      "weight": "30%",
      "targetScore": "85%",
      "reason": "Highest impact on final grade"
    }
  ],
  "recommendations": [
    "Maintain current performance on quizzes",
    "Allocate extra study time for final exam prep"
  ],
  "warnings": []
}
\`\`\`

Respond ONLY with valid JSON.`,
  variables: ['courseName', 'currentGrade', 'completedWeight', 'remainingWeight', 'recentGrades', 'trend', 'remainingAssignments', 'projectedGrade', 'targetGrade']
};

// =====================================================
// FEEDBACK ANALYZER PROMPTS
// =====================================================

export const ANALYZE_FEEDBACK_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'feedback_analyzer',
  model: 'claude-3-haiku-20240307',
  template: `Analyze this instructor feedback and make it more understandable for the student.

**Assignment:** {assignmentName}
**Course:** {courseName}

**Instructor Feedback:**
{feedback}

**Rubric Scores:**
{rubricScores}

**Task:**
1. Rewrite the feedback in simple, student-friendly language
2. Identify what the student did well
3. Identify areas for improvement
4. Extract specific, actionable steps for improvement
5. Determine overall sentiment (positive, neutral, negative, mixed)

**Output Format (JSON):**
\`\`\`json
{
  "summary": "Your instructor was generally positive about...",
  "sentiment": "positive",
  "sentimentScore": 0.7,
  "strengths": [
    "Strong thesis statement",
    "Good use of evidence"
  ],
  "improvements": [
    "Work on paragraph transitions",
    "Cite sources more consistently"
  ],
  "actionItems": [
    "Review the style guide for citation format",
    "Practice writing transition sentences between paragraphs",
    "Read the example essays provided in the course module"
  ],
  "keyThemes": ["structure", "citation", "analysis"]
}
\`\`\`

Respond ONLY with valid JSON.`,
  variables: ['assignmentName', 'courseName', 'feedback', 'rubricScores']
};

export const DETECT_FEEDBACK_PATTERNS_PROMPT: PromptTemplate = {
  version: 'v1.0',
  featureType: 'feedback_analyzer',
  model: 'claude-3-haiku-20240307',
  template: `Analyze multiple instructor feedback comments to identify patterns.

**Student:** {studentName}
**Time Period:** {timePeriod}
**Number of Assignments:** {assignmentCount}

**Feedback History:**
{feedbackHistory}

**Task:**
Identify patterns across all feedback:
1. Common themes mentioned multiple times (e.g., "structure", "clarity")
2. Consistent strengths praised by instructors
3. Recurring weaknesses or areas for improvement
4. Trends over time (improving vs declining)

**Output Format (JSON):**
\`\`\`json
{
  "overallTrend": "improving",
  "commonStrengths": [
    {
      "theme": "Research quality",
      "count": 5,
      "description": "Instructors consistently praise your thorough research"
    }
  ],
  "commonWeaknesses": [
    {
      "theme": "Essay structure",
      "count": 4,
      "description": "Multiple instructors mention unclear paragraph organization"
    }
  ],
  "improvementTrend": [
    {
      "theme": "Citation format",
      "trend": "improving",
      "note": "Getting better over time"
    }
  ],
  "recommendations": [
    "Focus on essay structure - take the writing workshop course",
    "Continue your strong research habits"
  ]
}
\`\`\`

Respond ONLY with valid JSON.`,
  variables: ['studentName', 'timePeriod', 'assignmentCount', 'feedbackHistory']
};

// =====================================================
// PROMPT VERSIONING
// =====================================================

export const PROMPT_VERSIONS: Record<string, string> = {
  'study_plan_v1.0': STUDY_PLAN_PROMPT.template,
  'adjust_plan_v1.0': ADJUST_STUDY_PLAN_PROMPT.template,
  'scheduling_v1.0': SCHEDULING_REQUEST_PROMPT.template,
  'course_tutor_v1.0': COURSE_TUTOR_PROMPT.template,
  'generate_quiz_v1.0': GENERATE_QUIZ_PROMPT.template,
  'grade_insights_v1.0': GRADE_PROJECTION_INSIGHTS_PROMPT.template,
  'analyze_feedback_v1.0': ANALYZE_FEEDBACK_PROMPT.template,
  'detect_patterns_v1.0': DETECT_FEEDBACK_PATTERNS_PROMPT.template,
};

export default {
  STUDY_PLAN_PROMPT,
  ADJUST_STUDY_PLAN_PROMPT,
  SCHEDULING_REQUEST_PROMPT,
  COURSE_TUTOR_PROMPT,
  GENERATE_QUIZ_PROMPT,
  GRADE_PROJECTION_INSIGHTS_PROMPT,
  ANALYZE_FEEDBACK_PROMPT,
  DETECT_FEEDBACK_PATTERNS_PROMPT,
  fillTemplate,
  PROMPT_VERSIONS,
};
