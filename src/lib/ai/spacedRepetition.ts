// Spaced Repetition Algorithm (SM-2 inspired)
// Implements intelligent review scheduling for flashcards

export interface ReviewSchedule {
  nextReviewDate: Date;
  interval: number; // days until next review
  easeFactor: number; // determines how quickly intervals grow
  reviewCount: number;
}

export interface FlashcardReviewData {
  id: string;
  lastReviewed?: Date;
  nextReview?: Date;
  interval: number;
  easeFactor: number;
  reviewCount: number;
  correctStreak: number;
  masteryScore: number;
}

/**
 * Calculate next review date based on SM-2 algorithm
 * @param quality - User's self-assessment (0-5)
 * @param reviewData - Current review data
 * @returns Updated review schedule
 */
export function calculateNextReview(
  quality: number,
  reviewData: FlashcardReviewData
): ReviewSchedule {
  let { easeFactor, interval, reviewCount } = reviewData;
  
  // Update ease factor (SM-2 formula)
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );
  
  // Calculate new interval
  if (quality < 3) {
    // Failed card - reset to beginning
    interval = 1;
  } else {
    if (reviewCount === 0) {
      interval = 1;
    } else if (reviewCount === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return {
    nextReviewDate,
    interval,
    easeFactor,
    reviewCount: reviewCount + 1
  };
}

/**
 * Check if a flashcard is due for review
 */
export function isDueForReview(card: FlashcardReviewData): boolean {
  if (!card.nextReview) {
    return true; // Never reviewed
  }
  
  const now = new Date();
  const dueDate = new Date(card.nextReview);
  return now >= dueDate;
}

/**
 * Get cards that are due for review today
 */
export function getDueCards(cards: FlashcardReviewData[]): FlashcardReviewData[] {
  return cards.filter(isDueForReview).sort((a, b) => {
    // Prioritize older due dates
    const aDate = a.nextReview ? new Date(a.nextReview).getTime() : 0;
    const bDate = b.nextReview ? new Date(b.nextReview).getTime() : 0;
    return aDate - bDate;
  });
}

/**
 * Get upcoming review count for the next N days
 */
export function getUpcomingReviewCount(
  cards: FlashcardReviewData[],
  days: number = 7
): { [date: string]: number } {
  const counts: { [date: string]: number } = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  cards.forEach(card => {
    if (!card.nextReview) return;
    
    const reviewDate = new Date(card.nextReview);
    reviewDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor(
      (reviewDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (diffDays >= 0 && diffDays < days) {
      const dateKey = reviewDate.toISOString().split('T')[0];
      counts[dateKey] = (counts[dateKey] || 0) + 1;
    }
  });
  
  return counts;
}

/**
 * Convert confidence rating (1-5) to SM-2 quality (0-5)
 */
export function confidenceToQuality(
  confidence: 1 | 2 | 3 | 4 | 5,
  isCorrect: boolean
): number {
  if (!isCorrect) return 0; // Incorrect answer
  
  // Map confidence to quality
  switch (confidence) {
    case 1: return 3; // Correct but hard
    case 2: return 3;
    case 3: return 4; // Correct with some effort
    case 4: return 5; // Correct easily
    case 5: return 5;
    default: return 3;
  }
}

/**
 * Suggest optimal study session length based on due cards
 */
export function suggestStudySession(
  dueCards: FlashcardReviewData[]
): {
  cardCount: number;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
} {
  const count = dueCards.length;
  
  // Average 30 seconds per card
  const estimatedMinutes = Math.ceil((count * 0.5));
  
  let priority: 'high' | 'medium' | 'low' = 'low';
  if (count > 20) priority = 'high';
  else if (count > 10) priority = 'medium';
  
  return {
    cardCount: count,
    estimatedMinutes,
    priority
  };
}

