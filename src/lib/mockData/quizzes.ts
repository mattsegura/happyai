import { Quiz, QuizAttempt } from '../types/studyPlan';

export const mockQuizzes: Quiz[] = [
  // Biology Quiz
  {
    id: 'quiz-bio-1',
    title: 'Cell Biology Fundamentals',
    sourceFile: 'biology-chapter-3.pdf',
    settings: {
      numberOfQuestions: 10,
      difficulty: 'medium',
      questionTypes: ['mcq', 'true-false'],
      timerEnabled: true,
      timerDuration: 600,
      instantFeedback: false,
      shuffleQuestions: true,
      shuffleOptions: true
    },
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'Which organelle is responsible for protein synthesis?',
        options: ['Mitochondria', 'Ribosome', 'Golgi apparatus', 'Lysosome'],
        correctAnswer: 1,
        explanation: 'Ribosomes are the cellular structures responsible for protein synthesis. They read mRNA and translate it into amino acid chains that fold into proteins.',
        topic: 'Cell Biology',
        difficulty: 'easy',
        hint: 'Think about where translation occurs',
        points: 1
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'What is the main function of the cell membrane?',
        options: [
          'Energy production',
          'Genetic information storage',
          'Regulating what enters and exits the cell',
          'Protein synthesis'
        ],
        correctAnswer: 2,
        explanation: 'The cell membrane is selectively permeable and regulates the passage of substances in and out of the cell, maintaining homeostasis.',
        topic: 'Cell Biology',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q3',
        type: 'true-false',
        question: 'Plant cells have cell walls but animal cells do not.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'Plant cells have rigid cell walls made of cellulose that provide structure and support. Animal cells only have a flexible cell membrane.',
        topic: 'Cell Biology',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'Which process do chloroplasts perform?',
        options: ['Cellular respiration', 'Photosynthesis', 'Fermentation', 'Protein synthesis'],
        correctAnswer: 1,
        explanation: 'Chloroplasts are the sites of photosynthesis, where light energy is converted into chemical energy (glucose) using CO₂ and water.',
        topic: 'Cell Biology',
        difficulty: 'medium',
        hint: 'What do plants do with sunlight?',
        points: 1
      },
      {
        id: 'q5',
        type: 'mcq',
        question: 'What is the primary function of mitochondria?',
        options: [
          'Photosynthesis',
          'ATP production',
          'DNA replication',
          'Waste disposal'
        ],
        correctAnswer: 1,
        explanation: 'Mitochondria are the powerhouses of the cell, producing ATP through cellular respiration.',
        topic: 'Cell Biology',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q6',
        type: 'true-false',
        question: 'DNA is found only in the nucleus.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'While most DNA is in the nucleus, mitochondria and chloroplasts also contain small amounts of their own DNA.',
        topic: 'Cell Biology',
        difficulty: 'hard',
        points: 1
      },
      {
        id: 'q7',
        type: 'mcq',
        question: 'Which organelle modifies and packages proteins?',
        options: ['Rough ER', 'Smooth ER', 'Golgi apparatus', 'Ribosome'],
        correctAnswer: 2,
        explanation: 'The Golgi apparatus receives proteins from the ER, modifies them, and packages them into vesicles for transport.',
        topic: 'Cell Biology',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q8',
        type: 'mcq',
        question: 'What do lysosomes contain?',
        options: ['DNA', 'Digestive enzymes', 'Chlorophyll', 'Hemoglobin'],
        correctAnswer: 1,
        explanation: 'Lysosomes contain digestive enzymes that break down cellular waste, old organelles, and foreign materials.',
        topic: 'Cell Biology',
        difficulty: 'medium',
        hint: 'Think about cellular waste management',
        points: 1
      },
      {
        id: 'q9',
        type: 'true-false',
        question: 'All cells have a nucleus.',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'Prokaryotic cells (bacteria and archaea) do not have a nucleus. Only eukaryotic cells have a membrane-bound nucleus.',
        topic: 'Cell Biology',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q10',
        type: 'mcq',
        question: 'What is the function of the endoplasmic reticulum (ER)?',
        options: [
          'Energy production',
          'Synthesis and transport of proteins and lipids',
          'Cell division',
          'Photosynthesis'
        ],
        correctAnswer: 1,
        explanation: 'The ER is a network of membranes involved in synthesizing and transporting proteins (rough ER) and lipids (smooth ER).',
        topic: 'Cell Biology',
        difficulty: 'medium',
        points: 1
      }
    ],
    attempts: [
      {
        id: 'attempt-1',
        attemptNumber: 1,
        startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 1000).toISOString(),
        score: 70,
        totalQuestions: 10,
        correctAnswers: 7,
        timeSpent: 480,
        questionResults: [],
        topicBreakdown: {
          'Cell Biology': { correct: 7, total: 10 }
        }
      },
      {
        id: 'attempt-2',
        attemptNumber: 2,
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 7 * 60 * 1000).toISOString(),
        score: 85,
        totalQuestions: 10,
        correctAnswers: 9,
        timeSpent: 420,
        questionResults: [],
        topicBreakdown: {
          'Cell Biology': { correct: 9, total: 10 }
        }
      }
    ],
    questionTypes: ['mcq', 'true-false'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastAttempted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    bestScore: 85
  },

  // Calculus Quiz
  {
    id: 'quiz-math-1',
    title: 'Derivatives Practice Quiz',
    sourceFile: 'calculus-derivatives.pdf',
    settings: {
      numberOfQuestions: 8,
      difficulty: 'medium',
      questionTypes: ['mcq', 'fill-in'],
      timerEnabled: true,
      timerDuration: 900,
      instantFeedback: true,
      shuffleQuestions: false,
      shuffleOptions: true
    },
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'What is the derivative of x³?',
        options: ['x²', '3x²', '3x³', '3x'],
        correctAnswer: 1,
        explanation: 'Using the power rule: d/dx(x^n) = n·x^(n-1). For x³: d/dx(x³) = 3·x^(3-1) = 3x².',
        topic: 'Derivatives',
        difficulty: 'easy',
        hint: 'Use the power rule',
        points: 1
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'What is the derivative of sin(x)?',
        options: ['-cos(x)', 'cos(x)', '-sin(x)', 'tan(x)'],
        correctAnswer: 1,
        explanation: 'The derivative of sin(x) is cos(x). This is one of the fundamental trigonometric derivatives.',
        topic: 'Derivatives',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q3',
        type: 'mcq',
        question: 'What rule do you use to find the derivative of f(x) · g(x)?',
        options: ['Chain rule', 'Product rule', 'Quotient rule', 'Power rule'],
        correctAnswer: 1,
        explanation: 'The product rule states: d/dx[f(x)·g(x)] = f\'(x)·g(x) + f(x)·g\'(x).',
        topic: 'Derivatives',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'What is the derivative of e^x?',
        options: ['e^x', 'xe^(x-1)', 'e^x/x', 'ln(x)'],
        correctAnswer: 0,
        explanation: 'The derivative of e^x is e^x. The exponential function is unique in that it is its own derivative.',
        topic: 'Derivatives',
        difficulty: 'medium',
        hint: 'This function is special - it equals its own derivative',
        points: 1
      },
      {
        id: 'q5',
        type: 'mcq',
        question: 'If f(x) = 5x² + 3x - 2, what is f\'(x)?',
        options: ['10x + 3', '5x + 3', '10x² + 3x', '10x - 2'],
        correctAnswer: 0,
        explanation: 'Differentiate term by term: d/dx(5x²) = 10x, d/dx(3x) = 3, d/dx(-2) = 0. So f\'(x) = 10x + 3.',
        topic: 'Derivatives',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q6',
        type: 'mcq',
        question: 'What is the derivative of ln(x)?',
        options: ['1/x', '1/x²', 'x', 'e^x'],
        correctAnswer: 0,
        explanation: 'The derivative of the natural logarithm ln(x) is 1/x.',
        topic: 'Derivatives',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q7',
        type: 'mcq',
        question: 'What does the second derivative tell you about a function?',
        options: [
          'The slope at a point',
          'The concavity and inflection points',
          'The area under the curve',
          'The maximum value'
        ],
        correctAnswer: 1,
        explanation: 'The second derivative f\'\'(x) indicates concavity: if f\'\'(x) > 0, the function is concave up; if f\'\'(x) < 0, it\'s concave down. Where f\'\'(x) = 0, there may be inflection points.',
        topic: 'Derivatives',
        difficulty: 'hard',
        points: 1
      },
      {
        id: 'q8',
        type: 'mcq',
        question: 'Using the chain rule, what is the derivative of (2x+1)³?',
        options: ['6(2x+1)²', '3(2x+1)²', '6x²', '2(2x+1)²'],
        correctAnswer: 0,
        explanation: 'Chain rule: d/dx[f(g(x))] = f\'(g(x))·g\'(x). Here: 3(2x+1)² · 2 = 6(2x+1)².',
        topic: 'Derivatives',
        difficulty: 'hard',
        hint: 'Don\'t forget to multiply by the derivative of the inside function',
        points: 1
      }
    ],
    attempts: [
      {
        id: 'attempt-1',
        attemptNumber: 1,
        startedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(),
        score: 62.5,
        totalQuestions: 8,
        correctAnswers: 5,
        timeSpent: 720,
        questionResults: [],
        topicBreakdown: {
          'Derivatives': { correct: 5, total: 8 }
        }
      }
    ],
    questionTypes: ['mcq', 'fill-in'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastAttempted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    bestScore: 62.5
  },

  // History Quiz
  {
    id: 'quiz-hist-1',
    title: 'World War II Timeline',
    sourceFile: 'wwii-timeline.pdf',
    settings: {
      numberOfQuestions: 12,
      difficulty: 'medium',
      questionTypes: ['mcq', 'true-false'],
      timerEnabled: false,
      instantFeedback: false,
      shuffleQuestions: true,
      shuffleOptions: true
    },
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'What year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correctAnswer: 2,
        explanation: 'World War II ended in 1945: Germany surrendered in May, and Japan surrendered in September after the atomic bombings.',
        topic: 'WWII',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'The D-Day invasion occurred on June 6, 1944.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'D-Day, also known as Operation Overlord, took place on June 6, 1944, when Allied forces landed on the beaches of Normandy, France.',
        topic: 'WWII',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q3',
        type: 'mcq',
        question: 'Which country was NOT part of the Axis Powers?',
        options: ['Germany', 'Japan', 'Italy', 'Soviet Union'],
        correctAnswer: 3,
        explanation: 'The Soviet Union was part of the Allied Powers. The main Axis Powers were Germany, Japan, and Italy.',
        topic: 'WWII',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'What event prompted the United States to enter WWII?',
        options: [
          'German invasion of Poland',
          'Fall of France',
          'Attack on Pearl Harbor',
          'Battle of Britain'
        ],
        correctAnswer: 2,
        explanation: 'The Japanese attack on Pearl Harbor on December 7, 1941, prompted the United States to enter World War II.',
        topic: 'WWII',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q5',
        type: 'true-false',
        question: 'The Holocaust was the systematic persecution and murder of six million Jews by the Nazi regime.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'The Holocaust was the state-sponsored persecution and murder of six million Jews by the Nazi regime and its collaborators.',
        topic: 'WWII',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q6',
        type: 'mcq',
        question: 'Who was the leader of Nazi Germany during WWII?',
        options: ['Benito Mussolini', 'Adolf Hitler', 'Joseph Stalin', 'Winston Churchill'],
        correctAnswer: 1,
        explanation: 'Adolf Hitler was the Führer (leader) of Nazi Germany from 1934 to 1945.',
        topic: 'WWII',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q7',
        type: 'mcq',
        question: 'What was the code name for the German invasion of the Soviet Union?',
        options: ['Operation Overlord', 'Operation Barbarossa', 'Operation Market Garden', 'Operation Torch'],
        correctAnswer: 1,
        explanation: 'Operation Barbarossa was the code name for Nazi Germany\'s invasion of the Soviet Union, which began on June 22, 1941.',
        topic: 'WWII',
        difficulty: 'medium',
        hint: 'Named after a Holy Roman Emperor',
        points: 1
      },
      {
        id: 'q8',
        type: 'true-false',
        question: 'The Battle of Midway was a decisive victory for the United States in the Pacific Theater.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'The Battle of Midway (June 1942) was a turning point in the Pacific. The U.S. Navy decisively defeated the Japanese fleet.',
        topic: 'WWII',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q9',
        type: 'mcq',
        question: 'Which conference divided Germany into occupation zones after WWII?',
        options: ['Yalta Conference', 'Potsdam Conference', 'Tehran Conference', 'Munich Conference'],
        correctAnswer: 1,
        explanation: 'The Potsdam Conference (July-August 1945) decided how to administer defeated Germany, dividing it into four occupation zones.',
        topic: 'WWII',
        difficulty: 'hard',
        points: 1
      },
      {
        id: 'q10',
        type: 'mcq',
        question: 'What was the main purpose of the Manhattan Project?',
        options: [
          'Develop radar technology',
          'Develop the atomic bomb',
          'Break German codes',
          'Build fighter aircraft'
        ],
        correctAnswer: 1,
        explanation: 'The Manhattan Project was a secret U.S. program to develop the atomic bomb during WWII.',
        topic: 'WWII',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q11',
        type: 'true-false',
        question: 'Italy switched sides during World War II.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'After Mussolini was deposed in 1943, Italy signed an armistice with the Allies and declared war on Germany.',
        topic: 'WWII',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q12',
        type: 'mcq',
        question: 'Which battle is considered the largest tank battle in history?',
        options: ['Battle of the Bulge', 'Battle of Kursk', 'Battle of El Alamein', 'Battle of Normandy'],
        correctAnswer: 1,
        explanation: 'The Battle of Kursk (July-August 1943) on the Eastern Front is considered the largest tank battle in history.',
        topic: 'WWII',
        difficulty: 'hard',
        hint: 'It took place on the Eastern Front',
        points: 1
      }
    ],
    attempts: [],
    questionTypes: ['mcq', 'true-false'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    bestScore: undefined
  },

  // Chemistry Quiz
  {
    id: 'quiz-chem-1',
    title: 'Chemical Reactions and Stoichiometry',
    sourceFile: 'chemistry-stoichiometry.pdf',
    settings: {
      numberOfQuestions: 10,
      difficulty: 'hard',
      questionTypes: ['mcq', 'fill-in'],
      timerEnabled: true,
      timerDuration: 1200,
      instantFeedback: false,
      shuffleQuestions: false,
      shuffleOptions: true
    },
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'What type of reaction is: 2H₂ + O₂ → 2H₂O?',
        options: ['Decomposition', 'Synthesis', 'Single replacement', 'Double replacement'],
        correctAnswer: 1,
        explanation: 'This is a synthesis reaction where two or more substances combine to form a single product.',
        topic: 'Chemical Reactions',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q2',
        type: 'mcq',
        question: 'How many moles of O₂ are needed to react with 4 moles of H₂?',
        options: ['1 mole', '2 moles', '4 moles', '8 moles'],
        correctAnswer: 1,
        explanation: 'According to the equation 2H₂ + O₂ → 2H₂O, the mole ratio of H₂ to O₂ is 2:1. So 4 moles of H₂ needs 2 moles of O₂.',
        topic: 'Stoichiometry',
        difficulty: 'medium',
        hint: 'Look at the coefficients in the balanced equation',
        points: 1
      },
      {
        id: 'q3',
        type: 'mcq',
        question: 'What is Avogadro\'s number?',
        options: ['6.022 × 10²³', '6.626 × 10⁻³⁴', '3.00 × 10⁸', '1.602 × 10⁻¹⁹'],
        correctAnswer: 0,
        explanation: 'Avogadro\'s number is 6.022 × 10²³, representing the number of particles in one mole of a substance.',
        topic: 'Stoichiometry',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'In the equation CaCO₃ → CaO + CO₂, what is the limiting reactant if you start with 1 mole of CaCO₃?',
        options: ['CaCO₃', 'CaO', 'CO₂', 'There is no limiting reactant'],
        correctAnswer: 0,
        explanation: 'CaCO₃ is the only reactant in this decomposition reaction, so it is the limiting reactant.',
        topic: 'Stoichiometry',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q5',
        type: 'mcq',
        question: 'What is the molar mass of H₂O?',
        options: ['16 g/mol', '18 g/mol', '20 g/mol', '22 g/mol'],
        correctAnswer: 1,
        explanation: 'Molar mass of H₂O = 2(1) + 16 = 18 g/mol, where H has atomic mass ~1 and O has atomic mass ~16.',
        topic: 'Stoichiometry',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q6',
        type: 'mcq',
        question: 'Which of the following is a balanced equation?',
        options: [
          'H₂ + O₂ → H₂O',
          '2H₂ + O₂ → 2H₂O',
          'H₂ + 2O₂ → H₂O',
          '4H₂ + O₂ → 2H₂O'
        ],
        correctAnswer: 1,
        explanation: '2H₂ + O₂ → 2H₂O is balanced with 4 H atoms and 2 O atoms on each side.',
        topic: 'Chemical Reactions',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q7',
        type: 'mcq',
        question: 'What is the percent composition of oxygen in H₂O?',
        options: ['50%', '67%', '89%', '11%'],
        correctAnswer: 2,
        explanation: 'Oxygen makes up 16/(2+16) = 16/18 ≈ 89% of the mass of H₂O.',
        topic: 'Stoichiometry',
        difficulty: 'hard',
        hint: 'Calculate: (mass of O / total mass) × 100',
        points: 1
      },
      {
        id: 'q8',
        type: 'mcq',
        question: 'In an exothermic reaction, energy is:',
        options: ['Absorbed', 'Released', 'Neither absorbed nor released', 'Converted to mass'],
        correctAnswer: 1,
        explanation: 'Exothermic reactions release energy, usually in the form of heat, to the surroundings.',
        topic: 'Chemical Reactions',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q9',
        type: 'mcq',
        question: 'How many grams are in 2 moles of NaCl (molar mass = 58.5 g/mol)?',
        options: ['29.25 g', '58.5 g', '117 g', '234 g'],
        correctAnswer: 2,
        explanation: 'Mass = moles × molar mass = 2 mol × 58.5 g/mol = 117 g.',
        topic: 'Stoichiometry',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q10',
        type: 'mcq',
        question: 'What is a catalyst?',
        options: [
          'A substance that is consumed in a reaction',
          'A substance that speeds up a reaction without being consumed',
          'A product of a chemical reaction',
          'A substance that slows down a reaction'
        ],
        correctAnswer: 1,
        explanation: 'A catalyst speeds up a chemical reaction by lowering the activation energy, but it is not consumed in the process.',
        topic: 'Chemical Reactions',
        difficulty: 'medium',
        points: 1
      }
    ],
    attempts: [
      {
        id: 'attempt-1',
        attemptNumber: 1,
        startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000).toISOString(),
        score: 75,
        totalQuestions: 10,
        correctAnswers: 8,
        timeSpent: 900,
        questionResults: [],
        topicBreakdown: {
          'Chemical Reactions': { correct: 4, total: 5 },
          'Stoichiometry': { correct: 4, total: 5 }
        }
      }
    ],
    questionTypes: ['mcq', 'fill-in'],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    lastAttempted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    bestScore: 75
  },

  // Literature Quiz
  {
    id: 'quiz-lit-1',
    title: 'Shakespeare\'s Plays',
    sourceFile: 'shakespeare-plays.pdf',
    settings: {
      numberOfQuestions: 8,
      difficulty: 'medium',
      questionTypes: ['mcq', 'true-false'],
      timerEnabled: false,
      instantFeedback: true,
      shuffleQuestions: true,
      shuffleOptions: true
    },
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'Which play features the characters Othello, Desdemona, and Iago?',
        options: ['Macbeth', 'Othello', 'Hamlet', 'King Lear'],
        correctAnswer: 1,
        explanation: 'Othello is the title character, Desdemona is his wife, and Iago is the antagonist who manipulates events.',
        topic: 'Shakespeare',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q2',
        type: 'true-false',
        question: 'Romeo and Juliet are from the Montague and Capulet families.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'Romeo is a Montague and Juliet is a Capulet, and their families are sworn enemies.',
        topic: 'Shakespeare',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q3',
        type: 'mcq',
        question: 'In which play does the character say "To be or not to be"?',
        options: ['Macbeth', 'King Lear', 'Hamlet', 'The Tempest'],
        correctAnswer: 2,
        explanation: 'This famous soliloquy is from Hamlet, Act 3, Scene 1, where Hamlet contemplates life and death.',
        topic: 'Shakespeare',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q4',
        type: 'mcq',
        question: 'Who is the king that Macbeth murders?',
        options: ['Duncan', 'Malcolm', 'Banquo', 'Macduff'],
        correctAnswer: 0,
        explanation: 'Macbeth murders King Duncan to take the throne, spurred on by his wife Lady Macbeth.',
        topic: 'Shakespeare',
        difficulty: 'medium',
        hint: 'He is the current king at the start of the play',
        points: 1
      },
      {
        id: 'q5',
        type: 'true-false',
        question: 'The Tempest is believed to be Shakespeare\'s last play.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'The Tempest is generally considered to be Shakespeare\'s final solo-authored play, written around 1610-1611.',
        topic: 'Shakespeare',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q6',
        type: 'mcq',
        question: 'Which play features three witches who make prophecies?',
        options: ['Hamlet', 'Macbeth', 'Julius Caesar', 'A Midsummer Night\'s Dream'],
        correctAnswer: 1,
        explanation: 'In Macbeth, three witches prophesy that Macbeth will become King of Scotland.',
        topic: 'Shakespeare',
        difficulty: 'easy',
        points: 1
      },
      {
        id: 'q7',
        type: 'mcq',
        question: 'In A Midsummer Night\'s Dream, who is the king of the fairies?',
        options: ['Puck', 'Oberon', 'Titania', 'Bottom'],
        correctAnswer: 1,
        explanation: 'Oberon is the king of the fairies, and Titania is the queen. Puck is Oberon\'s mischievous servant.',
        topic: 'Shakespeare',
        difficulty: 'medium',
        points: 1
      },
      {
        id: 'q8',
        type: 'true-false',
        question: 'Julius Caesar was assassinated on the Ides of March in Shakespeare\'s play.',
        options: ['True', 'False'],
        correctAnswer: 0,
        explanation: 'In Julius Caesar, Caesar is warned to "Beware the Ides of March" (March 15th), the day he is assassinated.',
        topic: 'Shakespeare',
        difficulty: 'easy',
        points: 1
      }
    ],
    attempts: [],
    questionTypes: ['mcq', 'true-false'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    bestScore: undefined
  }
];

// Get quizzes by topic
export const getQuizzesByTopic = (topic: string): Quiz[] => {
  return mockQuizzes.filter(quiz => 
    quiz.questions.some(q => q.topic === topic)
  );
};

// Get user's quiz performance stats
export const getQuizStats = () => {
  const totalAttempts = mockQuizzes.reduce((sum, quiz) => sum + quiz.attempts.length, 0);
  const totalQuizzes = mockQuizzes.length;
  const averageScore = mockQuizzes
    .filter(quiz => quiz.bestScore !== undefined)
    .reduce((sum, quiz, _, arr) => sum + (quiz.bestScore || 0) / arr.length, 0);
  
  return {
    totalQuizzes,
    totalAttempts,
    averageScore: Math.round(averageScore),
    quizzesCompleted: mockQuizzes.filter(q => q.attempts.length > 0).length
  };
};

