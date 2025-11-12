import { Flashcard } from '../types/studyPlan';

export const mockFlashcards: Flashcard[] = [
  // Biology Set - Cell Biology
  {
    id: 'bio-1',
    type: 'term-definition',
    front: 'What is the powerhouse of the cell?',
    back: 'Mitochondria - They generate most of the cell\'s supply of ATP through cellular respiration.',
    topic: 'Cell Biology',
    difficulty: 'easy',
    sourceFile: 'biology-chapter-3.pdf',
    hint: 'Think about where energy is produced in cells',
    explanation: 'Mitochondria are organelles that act as the cell\'s power plants. They convert nutrients into energy through a process called cellular respiration, producing ATP (adenosine triphosphate) which is the energy currency of cells.',
    masteryScore: 85,
    reviewCount: 5,
    correctStreak: 3,
    confidenceLevel: 4,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastReviewed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextReview: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Due yesterday (overdue)
    interval: 3,
    easeFactor: 2.1
  },
  {
    id: 'bio-2',
    type: 'mcq',
    front: 'Which organelle is responsible for photosynthesis?',
    back: 'Chloroplast',
    options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'],
    correctOption: 1,
    topic: 'Cell Biology',
    difficulty: 'easy',
    sourceFile: 'biology-chapter-3.pdf',
    hint: 'It\'s found in plant cells and gives them their green color',
    explanation: 'Chloroplasts contain chlorophyll, which captures light energy and converts it to chemical energy through photosynthesis. This process produces glucose and oxygen from carbon dioxide and water.',
    masteryScore: 92,
    reviewCount: 6,
    correctStreak: 5,
    confidenceLevel: 5,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'bio-3',
    type: 'cloze',
    front: 'DNA stands for ___ acid.',
    back: 'Deoxyribonucleic',
    topic: 'Cell Biology',
    difficulty: 'medium',
    sourceFile: 'biology-chapter-3.pdf',
    hint: 'It starts with "Deoxy"',
    explanation: 'DNA (Deoxyribonucleic acid) is the molecule that carries genetic information. The "deoxy" part refers to the absence of one oxygen atom in the sugar component compared to RNA.',
    masteryScore: 70,
    reviewCount: 3,
    correctStreak: 2,
    confidenceLevel: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'bio-4',
    type: 'true-false',
    front: 'The cell membrane is selectively permeable.',
    back: 'True',
    options: ['True', 'False'],
    correctOption: 0,
    topic: 'Cell Biology',
    difficulty: 'easy',
    sourceFile: 'biology-chapter-3.pdf',
    explanation: 'The cell membrane is selectively permeable, meaning it allows some substances to pass through while blocking others. This is crucial for maintaining homeostasis and controlling what enters and exits the cell.',
    masteryScore: 95,
    reviewCount: 4,
    correctStreak: 4,
    confidenceLevel: 5,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Math Set - Calculus
  {
    id: 'math-1',
    type: 'term-definition',
    front: 'Define: Derivative',
    back: 'The derivative measures the rate at which a function changes. It represents the slope of the tangent line to a curve at any point.',
    topic: 'Calculus',
    difficulty: 'medium',
    sourceFile: 'calculus-derivatives.pdf',
    hint: 'Think about rate of change and slopes',
    explanation: 'In calculus, the derivative f\'(x) gives the instantaneous rate of change of f(x) with respect to x. Geometrically, it\'s the slope of the tangent line at a point on the curve.',
    masteryScore: 78,
    reviewCount: 4,
    correctStreak: 2,
    confidenceLevel: 3,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'math-2',
    type: 'mcq',
    front: 'What is the derivative of x²?',
    back: '2x',
    options: ['x', '2x', 'x²', '2'],
    correctOption: 1,
    topic: 'Calculus',
    difficulty: 'easy',
    sourceFile: 'calculus-derivatives.pdf',
    hint: 'Use the power rule: bring down the exponent and reduce it by 1',
    explanation: 'Using the power rule: d/dx(x^n) = n·x^(n-1). For x²: d/dx(x²) = 2·x^(2-1) = 2x.',
    masteryScore: 90,
    reviewCount: 5,
    correctStreak: 5,
    confidenceLevel: 5,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'math-3',
    type: 'term-definition',
    front: 'What is an integral?',
    back: 'The integral represents the area under a curve or the antiderivative of a function. It\'s the reverse process of differentiation.',
    topic: 'Calculus',
    difficulty: 'medium',
    sourceFile: 'calculus-integrals.pdf',
    hint: 'Think about area under curves and the opposite of derivatives',
    explanation: 'Integration is the process of finding the accumulated sum or the antiderivative. The definite integral gives the area between a curve and the x-axis, while the indefinite integral gives the family of antiderivatives.',
    masteryScore: 65,
    reviewCount: 3,
    correctStreak: 1,
    confidenceLevel: 3,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastReviewed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nextReview: new Date(Date.now()).toISOString(), // Due today
    interval: 1,
    easeFactor: 1.7
  },

  // History Set - World War II
  {
    id: 'hist-1',
    type: 'term-definition',
    front: 'When did World War II begin?',
    back: 'September 1, 1939 - when Germany invaded Poland',
    topic: 'World War II',
    difficulty: 'easy',
    sourceFile: 'wwii-timeline.pdf',
    hint: 'Late 1930s, Germany invaded Poland',
    explanation: 'World War II officially began on September 1, 1939, when Nazi Germany invaded Poland. This prompted Britain and France to declare war on Germany two days later.',
    masteryScore: 88,
    reviewCount: 4,
    correctStreak: 4,
    confidenceLevel: 4,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'hist-2',
    type: 'mcq',
    front: 'Which battle is considered the turning point of WWII in Europe?',
    back: 'Battle of Stalingrad',
    options: ['Battle of Britain', 'Battle of Stalingrad', 'D-Day', 'Battle of the Bulge'],
    correctOption: 1,
    topic: 'World War II',
    difficulty: 'medium',
    sourceFile: 'wwii-battles.pdf',
    hint: 'Think about the Eastern Front and Soviet victories',
    explanation: 'The Battle of Stalingrad (1942-1943) was a major turning point. The Soviet victory marked the beginning of Germany\'s retreat from the Eastern Front and shifted momentum toward the Allies.',
    masteryScore: 72,
    reviewCount: 3,
    correctStreak: 2,
    confidenceLevel: 3,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'hist-3',
    type: 'true-false',
    front: 'The United States entered WWII after the attack on Pearl Harbor.',
    back: 'True',
    options: ['True', 'False'],
    correctOption: 0,
    topic: 'World War II',
    difficulty: 'easy',
    sourceFile: 'wwii-timeline.pdf',
    explanation: 'The United States formally entered WWII on December 8, 1941, one day after the Japanese attack on Pearl Harbor on December 7, 1941.',
    masteryScore: 95,
    reviewCount: 5,
    correctStreak: 5,
    confidenceLevel: 5,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Chemistry Set
  {
    id: 'chem-1',
    type: 'term-definition',
    front: 'What is a mole in chemistry?',
    back: 'A mole is Avogadro\'s number (6.022 × 10²³) of particles (atoms, molecules, or ions). It\'s the SI unit for amount of substance.',
    topic: 'Chemistry',
    difficulty: 'medium',
    sourceFile: 'chemistry-stoichiometry.pdf',
    hint: 'Think about Avogadro\'s number',
    explanation: 'One mole contains 6.022 × 10²³ particles. This number is chosen so that the mass of one mole of a substance in grams equals its atomic or molecular mass.',
    masteryScore: 68,
    reviewCount: 3,
    correctStreak: 1,
    confidenceLevel: 2,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastReviewed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextReview: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Due in 2 days
    interval: 5,
    easeFactor: 1.8
  },
  {
    id: 'chem-2',
    type: 'mcq',
    front: 'What is the atomic number of Carbon?',
    back: '6',
    options: ['4', '6', '8', '12'],
    correctOption: 1,
    topic: 'Chemistry',
    difficulty: 'easy',
    sourceFile: 'periodic-table.pdf',
    hint: 'It\'s the number of protons in the nucleus',
    explanation: 'Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus. The atomic number defines the element and determines its position in the periodic table.',
    masteryScore: 100,
    reviewCount: 6,
    correctStreak: 6,
    confidenceLevel: 5,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'chem-3',
    type: 'cloze',
    front: 'The pH scale measures the concentration of ___ ions in a solution.',
    back: 'Hydrogen (H⁺)',
    topic: 'Chemistry',
    difficulty: 'medium',
    sourceFile: 'acids-bases.pdf',
    hint: 'The symbol is H⁺',
    explanation: 'pH measures the concentration of hydrogen ions (H⁺) in a solution. A lower pH (0-6) indicates more H⁺ ions (acidic), pH 7 is neutral, and higher pH (8-14) indicates fewer H⁺ ions (basic/alkaline).',
    masteryScore: 75,
    reviewCount: 4,
    correctStreak: 2,
    confidenceLevel: 3,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Physics Set
  {
    id: 'phys-1',
    type: 'term-definition',
    front: 'State Newton\'s First Law of Motion',
    back: 'An object at rest stays at rest and an object in motion stays in motion with the same speed and direction unless acted upon by an external force.',
    topic: 'Physics',
    difficulty: 'easy',
    sourceFile: 'physics-mechanics.pdf',
    hint: 'Also known as the law of inertia',
    explanation: 'Newton\'s First Law, also called the Law of Inertia, states that objects resist changes in their motion. This is why you feel pushed back in your seat when a car accelerates and forward when it brakes.',
    masteryScore: 82,
    reviewCount: 4,
    correctStreak: 3,
    confidenceLevel: 4,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'phys-2',
    type: 'mcq',
    front: 'What is the formula for kinetic energy?',
    back: 'KE = ½mv²',
    options: ['KE = mv', 'KE = ½mv²', 'KE = mgh', 'KE = ma'],
    correctOption: 1,
    topic: 'Physics',
    difficulty: 'medium',
    sourceFile: 'physics-energy.pdf',
    hint: 'It involves mass and velocity squared',
    explanation: 'Kinetic energy (KE) equals one-half the mass times the velocity squared: KE = ½mv². The energy increases with the square of velocity, which is why speed has such a dramatic effect on kinetic energy.',
    masteryScore: 70,
    reviewCount: 3,
    correctStreak: 2,
    confidenceLevel: 3,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },

  // Literature Set
  {
    id: 'lit-1',
    type: 'term-definition',
    front: 'What is a metaphor?',
    back: 'A metaphor is a figure of speech that directly compares two unlike things without using "like" or "as". It states that one thing IS another thing.',
    topic: 'Literature',
    difficulty: 'easy',
    sourceFile: 'literary-devices.pdf',
    hint: 'It\'s a comparison but not using "like" or "as"',
    explanation: 'Unlike a simile which uses "like" or "as", a metaphor makes a direct comparison. Example: "Time is money" or "Her eyes were stars."',
    masteryScore: 90,
    reviewCount: 5,
    correctStreak: 4,
    confidenceLevel: 4,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'lit-2',
    type: 'mcq',
    front: 'Who wrote "Romeo and Juliet"?',
    back: 'William Shakespeare',
    options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
    correctOption: 1,
    topic: 'Literature',
    difficulty: 'easy',
    sourceFile: 'shakespeare-plays.pdf',
    explanation: 'William Shakespeare wrote "Romeo and Juliet" around 1594-1596. It\'s one of his most famous tragedies about two young lovers from feuding families.',
    masteryScore: 100,
    reviewCount: 3,
    correctStreak: 3,
    confidenceLevel: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
];

// Group flashcards by topic for easier access
export const flashcardsByTopic = mockFlashcards.reduce((acc, card) => {
  if (!acc[card.topic]) {
    acc[card.topic] = [];
  }
  acc[card.topic].push(card);
  return acc;
}, {} as Record<string, Flashcard[]>);

// Get flashcards that need review (low mastery score or haven't been reviewed recently)
export const getFlashcardsNeedingReview = (): Flashcard[] => {
  return mockFlashcards.filter(card => 
    card.masteryScore < 80 || card.correctStreak < 3
  );
};

// Get mastered flashcards
export const getMasteredFlashcards = (): Flashcard[] => {
  return mockFlashcards.filter(card => 
    card.masteryScore >= 90 && card.correctStreak >= 4
  );
};

// Get flashcards due for review (Spaced Repetition)
export const getFlashcardsDueForReview = (): Flashcard[] => {
  const now = new Date();
  return mockFlashcards.filter(card => {
    if (!card.nextReview) return true; // Never reviewed
    const dueDate = new Date(card.nextReview);
    return now >= dueDate;
  }).sort((a, b) => {
    // Prioritize older due dates
    const aDate = a.nextReview ? new Date(a.nextReview).getTime() : 0;
    const bDate = b.nextReview ? new Date(b.nextReview).getTime() : 0;
    return aDate - bDate;
  });
};

