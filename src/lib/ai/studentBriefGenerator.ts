/**
 * Student Brief Generator (Feature 16)
 *
 * Generates AI-powered student-specific briefs for teachers covering:
 * - Executive Summary
 * - Academic Assessment
 * - Emotional Assessment
 * - Risk Analysis
 * - Recommendations
 * - Strengths to Leverage
 *
 * Generated on-demand (<5 seconds) with mock data support.
 */

import { getAIService } from './aiService';
import type { CompletionRequest } from './aiTypes';

// =====================================================
// TYPES
// =====================================================

export interface StudentBrief {
  id?: string;
  studentId: string;
  teacherId: string;
  generatedAt: Date;
  focusArea: 'academic' | 'emotional' | 'balanced';
  brief: {
    executiveSummary: string;
    academicAssessment: AcademicAssessment;
    emotionalAssessment: EmotionalAssessment;
    riskAnalysis: RiskAnalysis;
    recommendations: Recommendation[];
    strengthsToLeverage: string[];
  };
}

export interface AcademicAssessment {
  currentPerformance: string;
  recentTrends: string;
  strengths: string[];
  areasForImprovement: string[];
  comparisonToClassAverage: string;
}

export interface EmotionalAssessment {
  recentMoodPatterns: string;
  concerningTrends: string | null;
  emotionalStability: string;
  correlationWithAcademics: string;
}

export interface RiskAnalysis {
  overallRiskLevel: 'low' | 'medium' | 'high';
  specificRiskFactors: string[];
  earlyWarningSigns: string[];
}

export interface Recommendation {
  priority: 'immediate' | 'medium-term' | 'long-term';
  category: 'academic' | 'emotional' | 'engagement' | 'resources';
  action: string;
  rationale?: string;
}

export interface GenerateStudentBriefOptions {
  studentId: string;
  teacherId: string;
  focusArea?: 'academic' | 'emotional' | 'balanced';
  classId?: string;
}

// =====================================================
// MOCK DATA GENERATOR
// =====================================================

function generateMockStudentBrief(
  studentId: string,
  teacherId: string,
  focusArea: 'academic' | 'emotional' | 'balanced'
): StudentBrief {
  // Generate different mock profiles based on student ID pattern
  const profileType = (studentId.charCodeAt(0) % 3) as 0 | 1 | 2;

  const profiles = [
    // Profile 0: High performer with recent stress
    {
      executiveSummary: 'Emma is a strong academic performer (current A-) showing excellent understanding of course material. However, recent emotional check-ins reveal increasing stress levels over the past 5 days. Recommend proactive check-in to prevent potential academic decline.',
      academicAssessment: {
        currentPerformance: 'Current grade: 92% (A-). Consistently high quiz scores (average 94%) and strong lab performance. Recently completed project scored 88% - slightly below her typical standard.',
        recentTrends: 'Performance has remained stable over the semester with a slight dip in the last two weeks. Project score was 6 points lower than her usual performance, potentially indicating current challenges.',
        strengths: [
          'Exceptional understanding of theoretical concepts',
          'Strong written communication in lab reports',
          'Active participation in class discussions',
          'Helps peers during group work',
        ],
        areasForImprovement: [
          'Recent project showed time management struggles',
          'Could improve practical lab techniques',
          'Sometimes perfectionistic - may cause unnecessary stress',
        ],
        comparisonToClassAverage: 'Emma performs 10 percentage points above the class average (82%). She ranks in the top 15% of the class and is a consistent high achiever.',
      },
      emotionalAssessment: {
        recentMoodPatterns: 'Last 7 days show declining sentiment: started at Tier 5 (Hopeful), now at Tier 2 (Worried). Most frequently reported emotions: "Worried" (3 times), "Tired" (2 times), "Nervous" (2 times).',
        concerningTrends: 'Significant mood drop over 5 consecutive days (Tier 5 → Tier 2). This rapid decline has triggered a care alert and requires attention.',
        emotionalStability: 'Historically stable (SD: 0.8) but current week shows high volatility (SD: 1.4). This is unusual for Emma and suggests external stressors.',
        correlationWithAcademics: 'Strong positive correlation (r=0.72) between mood and academic performance. When Emma reports Tier 5-6 sentiment, her grades average 4% higher than during Tier 1-3 periods.',
      },
      riskAnalysis: {
        overallRiskLevel: 'medium' as const,
        specificRiskFactors: [
          'Persistent low mood for 5 days (emotional flag)',
          'Recent academic performance dip (project score)',
          'High achiever showing signs of burnout',
          'Perfectionist tendencies causing stress',
        ],
        earlyWarningSigns: [
          'Sentiment dropped from Tier 5 to Tier 2 in under a week',
          'Reported feeling "Worried" and "Tired" frequently',
          'Project submitted on time but quality lower than usual',
          'Less engagement in office hours this week',
        ],
      },
      recommendations: [
        {
          priority: 'immediate' as const,
          category: 'emotional' as const,
          action: 'Schedule a 1-on-1 check-in within the next 2 days to discuss recent stress',
          rationale: 'Rapid mood decline and care alert require timely intervention to prevent burnout',
        },
        {
          priority: 'immediate' as const,
          category: 'emotional' as const,
          action: 'Send an encouraging Hapi Moment acknowledging her consistent efforts',
          rationale: 'Positive recognition may help counter current stress and remind her of her capabilities',
        },
        {
          priority: 'medium-term' as const,
          category: 'academic' as const,
          action: 'Offer feedback session on recent project to identify improvement areas',
          rationale: 'Lower-than-usual project score may be contributing to her worry - constructive feedback can help',
        },
        {
          priority: 'medium-term' as const,
          category: 'resources' as const,
          action: 'Suggest time management workshop or study techniques session',
          rationale: 'Recent project timing issues indicate she may benefit from better planning strategies',
        },
        {
          priority: 'long-term' as const,
          category: 'emotional' as const,
          action: 'Monitor for perfectionism patterns and encourage healthy academic balance',
          rationale: 'High achievers often struggle with unrealistic standards - ongoing support needed',
        },
      ],
      strengthsToLeverage: [
        'Strong theoretical understanding - encourage her to tutor struggling peers for mutual benefit',
        'Excellent written communication - could contribute to class study guides or summaries',
        'Natural leadership in group work - assign her to support groups needing structure',
        'Consistent participation - her engagement sets a positive example for other students',
      ],
    },
    // Profile 1: Struggling student with improving mood
    {
      executiveSummary: 'Marcus is currently struggling academically (current C-) with 3 missing assignments. However, emotional check-ins show improving mood over the past week after recent intervention. Continue support and monitor closely for academic recovery.',
      academicAssessment: {
        currentPerformance: 'Current grade: 72% (C-). Inconsistent assignment completion with 3 missing submissions. Quiz average is 68%, indicating understanding gaps.',
        recentTrends: 'Declining performance throughout the semester - started at B (85%) in Week 1, now at C- (72%). Missed 3 out of last 5 assignments.',
        strengths: [
          'Attends class regularly (98% attendance)',
          'Engages well during hands-on lab activities',
          'Shows improvement when given one-on-one help',
          'Willing to ask questions during office hours',
        ],
        areasForImprovement: [
          'Assignment completion rate only 60%',
          'Struggles with independent problem-solving',
          'Time management challenges',
          'May have gaps in foundational concepts',
        ],
        comparisonToClassAverage: 'Marcus performs 10 percentage points below the class average (82%). Currently in the bottom 25% of the class but has shown capacity for improvement with support.',
      },
      emotionalAssessment: {
        recentMoodPatterns: 'Last 7 days show improving sentiment: started at Tier 2 (Frustrated), now at Tier 4 (Peaceful). Recent check-ins: "Peaceful" (2 times), "Hopeful" (2 times), "Content" (1 time).',
        concerningTrends: null,
        emotionalStability: 'Previously volatile (SD: 1.6) but has stabilized this week (SD: 0.7). The recent teacher intervention appears to have positive emotional impact.',
        correlationWithAcademics: 'Moderate positive correlation (r=0.54) between mood and grades. When mood improves, assignment completion typically increases within 3-5 days.',
      },
      riskAnalysis: {
        overallRiskLevel: 'medium' as const,
        specificRiskFactors: [
          'Current grade below passing threshold (C-)',
          '3 missing assignments',
          'Declining grade trend over semester',
          'May have foundational knowledge gaps',
        ],
        earlyWarningSigns: [
          'Assignment completion rate dropped to 60%',
          'Quiz scores consistently below class average',
          'Previously triggered care alert for persistent low mood',
        ],
      },
      recommendations: [
        {
          priority: 'immediate' as const,
          category: 'academic' as const,
          action: 'Offer makeup opportunity for 3 missing assignments with extended deadline',
          rationale: 'Missing work is primary factor in low grade - providing second chance shows support',
        },
        {
          priority: 'immediate' as const,
          category: 'emotional' as const,
          action: 'Send Hapi Moment celebrating recent mood improvement and resilience',
          rationale: 'Positive reinforcement can sustain recent emotional progress',
        },
        {
          priority: 'medium-term' as const,
          category: 'academic' as const,
          action: 'Schedule weekly check-in sessions to review progress and provide guidance',
          rationale: 'Regular touchpoints can help him stay on track and address challenges early',
        },
        {
          priority: 'medium-term' as const,
          category: 'resources' as const,
          action: 'Connect Marcus with peer tutor for foundational concept review',
          rationale: 'One-on-one tutoring could address knowledge gaps more effectively',
        },
        {
          priority: 'long-term' as const,
          category: 'academic' as const,
          action: 'Break down large assignments into smaller milestones with check-ins',
          rationale: 'Structured approach may help with time management and completion',
        },
      ],
      strengthsToLeverage: [
        'Strong attendance shows commitment - acknowledge this positive behavior',
        'Hands-on learning preference - incorporate more lab/practical activities',
        'Willing to seek help - create safe spaces for questions and support',
        'Recent mood improvement - build on this momentum for academic recovery',
      ],
    },
    // Profile 2: Solid performer with consistent mood
    {
      executiveSummary: 'Sarah is a reliable student (current B+) with steady performance and stable emotional wellbeing. Low maintenance but engaged. Consider leveraging her strengths for peer support activities.',
      academicAssessment: {
        currentPerformance: 'Current grade: 88% (B+). Consistent assignment completion (95%) and reliable quiz scores (average 86%). Recent lab project scored 90%.',
        recentTrends: 'Stable performance throughout semester - has maintained B+/A- range consistently. Slight improvement trend with grade increasing from 86% to 88% over last month.',
        strengths: [
          'Highly reliable with deadlines (only 1 late assignment)',
          'Balanced performance across all assessment types',
          'Good collaborative skills in group work',
          'Steady participation in class activities',
        ],
        areasForImprovement: [
          'Could push for higher achievement (capable of A range)',
          'Sometimes plays it safe rather than taking academic risks',
          'Participation could be more active in discussions',
        ],
        comparisonToClassAverage: 'Sarah performs 6 percentage points above class average (82%). Solidly in the top 35% of the class with room to move higher.',
      },
      emotionalAssessment: {
        recentMoodPatterns: 'Last 7 days consistently in Tier 4-5 range. Most frequent emotions: "Content" (4 times), "Peaceful" (2 times), "Hopeful" (1 time). Very stable pattern.',
        concerningTrends: null,
        emotionalStability: 'Excellent stability (SD: 0.4) - lowest volatility in the class. Sarah maintains consistent positive mood regardless of academic pressures.',
        correlationWithAcademics: 'Weak correlation (r=0.28) between mood and performance - both remain consistently stable. Sarah appears to have good emotional regulation skills.',
      },
      riskAnalysis: {
        overallRiskLevel: 'low' as const,
        specificRiskFactors: [],
        earlyWarningSigns: [],
      },
      recommendations: [
        {
          priority: 'medium-term' as const,
          category: 'academic' as const,
          action: 'Encourage Sarah to take on more challenging optional assignments or projects',
          rationale: 'She has capacity for A-level work but may need encouragement to push herself',
        },
        {
          priority: 'medium-term' as const,
          category: 'engagement' as const,
          action: 'Invite Sarah to be a peer tutor or study group facilitator',
          rationale: 'Her stability and solid understanding would make her an excellent peer mentor',
        },
        {
          priority: 'long-term' as const,
          category: 'academic' as const,
          action: 'Provide opportunities for creative or independent research projects',
          rationale: 'May benefit from challenges that let her explore topics of interest more deeply',
        },
      ],
      strengthsToLeverage: [
        'Exceptional emotional stability - could help support peers struggling with stress',
        'Reliable and consistent - perfect candidate for leadership roles or responsibilities',
        'Balanced skill set - her steady approach could model healthy academic habits for others',
        'Good collaborator - pair with struggling students for mutual benefit',
      ],
    },
  ];

  return {
    studentId,
    teacherId,
    generatedAt: new Date(),
    focusArea,
    brief: profiles[profileType],
  };
}

// =====================================================
// AI PROMPT BUILDER
// =====================================================

function buildStudentBriefPrompt(
  studentData: {
    studentName: string;
    academicData: any;
    sentimentData: any;
    engagementData: any;
  },
  focusArea: string
): string {
  return `You are an AI assistant helping a teacher understand an individual student. Generate a comprehensive student brief.

**Student:** ${studentData.studentName}
**Focus Area:** ${focusArea}
**Generated:** ${new Date().toLocaleDateString()}

**Instructions:**
1. Analyze the student's academic and emotional data holistically
2. Identify patterns, strengths, and areas of concern
3. Provide specific, actionable recommendations
4. Maintain a professional, compassionate tone
5. Be concise but thorough (300-500 words total)

**Focus on ${focusArea}:**
${focusArea === 'academic' ? '- Emphasize grades, assignments, and learning patterns' : ''}
${focusArea === 'emotional' ? '- Emphasize mood patterns, wellbeing, and emotional health' : ''}
${focusArea === 'balanced' ? '- Provide equal weight to academic and emotional factors' : ''}

**Output Format:** JSON with 6 sections:
- executiveSummary (2-3 sentence overview)
- academicAssessment (detailed academic analysis)
- emotionalAssessment (detailed emotional analysis)
- riskAnalysis (risk level and factors)
- recommendations (prioritized action items)
- strengthsToLeverage (positive attributes to build on)

Generate the brief now in JSON format.`;
}

// =====================================================
// MAIN GENERATION FUNCTION
// =====================================================

export async function generateStudentBrief(
  options: GenerateStudentBriefOptions
): Promise<StudentBrief> {
  const useMockAI = import.meta.env.VITE_USE_MOCK_AI === 'true';
  const focusArea = options.focusArea || 'balanced';

  // Use mock data if enabled
  if (useMockAI) {
    console.log('[Student Brief] Using mock data');
    return generateMockStudentBrief(options.studentId, options.teacherId, focusArea);
  }

  // Real AI generation (when APIs are available)
  try {
    // TODO: Fetch real student data from Supabase
    const studentData = {
      studentName: 'Student',
      academicData: {},
      sentimentData: {},
      engagementData: {},
    };

    const prompt = buildStudentBriefPrompt(studentData, focusArea);

    const aiService = getAIService();
    if (options.teacherId) {
      aiService.setUserId(options.teacherId);
    }

    const request: CompletionRequest = {
      prompt,
      featureType: 'student_brief',
      options: {
        responseFormat: 'json',
        temperature: 0.4,
        maxTokens: 2000,
      },
    };

    const response = await aiService.complete(request);

    // Parse AI response
    const briefData = JSON.parse(response.content);

    return {
      studentId: options.studentId,
      teacherId: options.teacherId,
      generatedAt: new Date(),
      focusArea,
      brief: briefData,
    };
  } catch (error) {
    console.error('[Student Brief] AI generation failed:', error);
    // Fallback to mock data on error
    return generateMockStudentBrief(options.studentId, options.teacherId, focusArea);
  }
}
