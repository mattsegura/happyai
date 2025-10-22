export type QuestionType =
  | 'poll'
  | 'multiple_choice_single'
  | 'multiple_choice_multi'
  | 'open_ended'
  | 'slider'
  | 'calendar'
  | 'rating_scale'
  | 'ranking'
  | 'short_answer'
  | 'yes_no_maybe'
  | 'likert_scale';

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  option_value: string | null;
  position: number;
  created_at: string;
}

export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
  midLabel?: string;
  showValue: boolean;
  style?: 'bar' | 'circular';
}

export interface CalendarConfig {
  mode: 'single' | 'range' | 'multiple';
  minDate?: string;
  maxDate?: string;
  maxSelections?: number;
  allowPastDates: boolean;
  allowFutureDates: boolean;
}

export interface RatingConfig {
  scale: 5 | 10 | 100;
  style: 'stars' | 'numbers' | 'emoji';
  labels?: Record<number, string>;
  emojiSet?: string[];
}

export interface RankingConfig {
  itemsToRank: number;
  requireFullRanking: boolean;
}

export interface MultiChoiceConfig {
  minSelections?: number;
  maxSelections?: number;
  randomizeOrder: boolean;
  allowOther: boolean;
}

export interface OpenEndedConfig {
  minCharacters?: number;
  maxCharacters: number;
  placeholder?: string;
  rows?: number;
}

export interface ShortAnswerConfig {
  minWords?: number;
  maxWords: number;
  placeholder?: string;
}

export interface LikertConfig {
  statements: string[];
  scalePoints: 3 | 5 | 7;
  leftLabel: string;
  rightLabel: string;
  middleLabel?: string;
}

export interface YesNoMaybeConfig {
  yesLabel?: string;
  noLabel?: string;
  maybeLabel?: string;
}

export type QuestionConfiguration =
  | { type: 'poll' }
  | { type: 'multiple_choice_single'; config: Partial<MultiChoiceConfig> }
  | { type: 'multiple_choice_multi'; config: MultiChoiceConfig }
  | { type: 'open_ended'; config: OpenEndedConfig }
  | { type: 'slider'; config: SliderConfig }
  | { type: 'calendar'; config: CalendarConfig }
  | { type: 'rating_scale'; config: RatingConfig }
  | { type: 'ranking'; config: RankingConfig }
  | { type: 'short_answer'; config: ShortAnswerConfig }
  | { type: 'yes_no_maybe'; config: YesNoMaybeConfig }
  | { type: 'likert_scale'; config: LikertConfig };

export interface PulseQuestion {
  id: string;
  pulse_set_id: string;
  question_text: string;
  question_type: QuestionType;
  position: number;
  is_required: boolean;
  points_value: number;
  configuration: Record<string, any>;
  created_at: string;
  options?: QuestionOption[];
}

export interface PulseCheckSet {
  id: string;
  class_id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  expires_at: string;
  is_active: boolean;
  is_draft: boolean;
  scheduled_for: string | null;
  total_points: number;
  created_at: string;
  updated_at: string;
  questions?: PulseQuestion[];
}

export interface PulseResponse {
  id: string;
  pulse_set_id: string;
  user_id: string;
  class_id: string;
  is_completed: boolean;
  total_points_earned: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
}

export type PollResponse = {
  type: 'poll';
  selectedOption: string;
};

export type MultipleChoiceSingleResponse = {
  type: 'multiple_choice_single';
  selectedOption: string;
};

export type MultipleChoiceMultiResponse = {
  type: 'multiple_choice_multi';
  selectedOptions: string[];
};

export type OpenEndedResponse = {
  type: 'open_ended';
  text: string;
  characterCount: number;
};

export type SliderResponse = {
  type: 'slider';
  value: number;
};

export type CalendarResponse = {
  type: 'calendar';
  dates: string[];
};

export type RatingResponse = {
  type: 'rating_scale';
  rating: number;
};

export type RankingResponse = {
  type: 'ranking';
  rankedItems: Array<{ optionId: string; rank: number }>;
};

export type ShortAnswerResponse = {
  type: 'short_answer';
  text: string;
  wordCount: number;
};

export type YesNoMaybeResponse = {
  type: 'yes_no_maybe';
  answer: 'yes' | 'no' | 'maybe';
};

export type LikertResponse = {
  type: 'likert_scale';
  responses: Array<{ statementIndex: number; value: number }>;
};

export type ResponseData =
  | PollResponse
  | MultipleChoiceSingleResponse
  | MultipleChoiceMultiResponse
  | OpenEndedResponse
  | SliderResponse
  | CalendarResponse
  | RatingResponse
  | RankingResponse
  | ShortAnswerResponse
  | YesNoMaybeResponse
  | LikertResponse;

export interface QuestionResponse {
  id: string;
  pulse_response_id: string;
  question_id: string;
  user_id: string;
  response_data: ResponseData;
  points_earned: number;
  answered_at: string;
}

export interface ResponseProgress {
  id: string;
  pulse_set_id: string;
  user_id: string;
  last_question_id: string | null;
  progress_data: Record<string, any>;
  updated_at: string;
}

export interface PulseTemplate {
  id: string;
  creator_id: string;
  template_name: string;
  description: string | null;
  category: string;
  is_public: boolean;
  template_data: {
    title: string;
    description?: string;
    questions: Array<{
      question_text: string;
      question_type: QuestionType;
      is_required: boolean;
      points_value: number;
      configuration: Record<string, any>;
      options?: Array<{ option_text: string; position: number }>;
    }>;
  };
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionTypeDefinition {
  value: QuestionType;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: 'choice' | 'text' | 'numeric' | 'date';
}

export const QUESTION_TYPE_DEFINITIONS: QuestionTypeDefinition[] = [
  {
    value: 'poll',
    label: 'Poll',
    description: 'Simple voting with multiple options',
    icon: 'BarChart3',
    color: 'blue',
    category: 'choice',
  },
  {
    value: 'multiple_choice_single',
    label: 'Multiple Choice (Single)',
    description: 'Choose one answer from options',
    icon: 'CircleDot',
    color: 'green',
    category: 'choice',
  },
  {
    value: 'multiple_choice_multi',
    label: 'Multiple Choice (Multi)',
    description: 'Choose multiple answers',
    icon: 'CheckSquare',
    color: 'emerald',
    category: 'choice',
  },
  {
    value: 'open_ended',
    label: 'Open Ended',
    description: 'Long-form text response',
    icon: 'FileText',
    color: 'purple',
    category: 'text',
  },
  {
    value: 'short_answer',
    label: 'Short Answer',
    description: 'Brief text response with word limit',
    icon: 'Type',
    color: 'violet',
    category: 'text',
  },
  {
    value: 'slider',
    label: 'Slider',
    description: 'Numeric value selection with slider',
    icon: 'Sliders',
    color: 'orange',
    category: 'numeric',
  },
  {
    value: 'rating_scale',
    label: 'Rating Scale',
    description: 'Rate from 1-5 or 1-10',
    icon: 'Star',
    color: 'yellow',
    category: 'numeric',
  },
  {
    value: 'calendar',
    label: 'Calendar',
    description: 'Select dates from calendar',
    icon: 'Calendar',
    color: 'red',
    category: 'date',
  },
  {
    value: 'ranking',
    label: 'Ranking',
    description: 'Order items by preference',
    icon: 'ArrowUpDown',
    color: 'cyan',
    category: 'choice',
  },
  {
    value: 'yes_no_maybe',
    label: 'Yes/No/Maybe',
    description: 'Quick three-option response',
    icon: 'HelpCircle',
    color: 'teal',
    category: 'choice',
  },
  {
    value: 'likert_scale',
    label: 'Likert Scale',
    description: 'Agreement scale for statements',
    icon: 'List',
    color: 'pink',
    category: 'numeric',
  },
];

export const getQuestionTypeDefinition = (
  type: QuestionType
): QuestionTypeDefinition | undefined => {
  return QUESTION_TYPE_DEFINITIONS.find((def) => def.value === type);
};

export const getQuestionTypesByCategory = (
  category: 'choice' | 'text' | 'numeric' | 'date'
): QuestionTypeDefinition[] => {
  return QUESTION_TYPE_DEFINITIONS.filter((def) => def.category === category);
};

export interface PulseAnalytics {
  pulse_set_id: string;
  total_students: number;
  total_responses: number;
  completed_responses: number;
  in_progress_responses: number;
  completion_rate: number;
  average_points_earned: number;
  question_analytics: QuestionAnalytics[];
}

export interface QuestionAnalytics {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  total_responses: number;
  response_distribution?: any;
  average_value?: number;
  common_answers?: Array<{ answer: string; count: number; percentage: number }>;
}
