/**
 * Chatbase Mock Provider
 *
 * Simulates Chatbase API responses for development/testing without API keys.
 * Switch to real provider by setting VITE_USE_MOCK_AI=false in .env
 */

import type {
  CompletionRequest,
  CompletionResponse,
  StreamChunk,
  AIModel,
} from '../aiTypes';

// =====================================================
// MOCK RESPONSE TEMPLATES
// =====================================================

const MOCK_RESPONSES = {
  // Biology-related questions
  cellular_respiration: `Cellular respiration is the process by which cells convert glucose into ATP (energy). It happens in three main stages:

1. **Glycolysis** (in cytoplasm)
   - Breaks down glucose into pyruvate
   - Produces 2 ATP molecules
   - Doesn't require oxygen

2. **Krebs Cycle** (in mitochondria)
   - Processes pyruvate into CO2
   - Produces electron carriers (NADH, FADH2)
   - Generates small amount of ATP

3. **Electron Transport Chain** (inner mitochondrial membrane)
   - Uses electron carriers to pump protons
   - Creates ATP through chemiosmosis
   - Produces most of the ATP (about 34 molecules)

**Total yield:** About 36-38 ATP molecules per glucose!

Think of it like a factory assembly line - each stage processes the materials further to extract maximum energy.`,

  dna_replication: `DNA replication is the process of copying DNA before cell division. Here's how it works:

**Key Steps:**

1. **Unwinding**
   - Helicase enzyme unzips the double helix
   - Creates a replication fork
   - Single-strand binding proteins keep strands apart

2. **Primer Addition**
   - Primase adds short RNA primers
   - Primers provide starting point for DNA polymerase
   - Required because DNA polymerase can't start from scratch

3. **Elongation**
   - DNA polymerase III adds nucleotides
   - Leading strand: continuous synthesis (5' to 3')
   - Lagging strand: discontinuous (Okazaki fragments)

4. **Finishing**
   - DNA polymerase I replaces RNA primers with DNA
   - Ligase seals gaps between fragments
   - Result: two identical DNA molecules

**Why it matters:** Ensures genetic information passes accurately to new cells. Errors can lead to mutations!`,

  // Economics-related
  supply_demand: `Supply and demand is the fundamental economic model that determines prices in a market economy.

**Supply:**
- Quantity producers are willing to sell at different prices
- As price increases, supply increases (Law of Supply)
- Affected by: production costs, technology, number of sellers

**Demand:**
- Quantity consumers are willing to buy at different prices
- As price increases, demand decreases (Law of Demand)
- Affected by: income, preferences, prices of related goods

**Market Equilibrium:**
- Point where supply = demand
- Determines market price and quantity
- If price is too high: surplus → price falls
- If price is too low: shortage → price rises

**Real-world example:**
When a new iPhone releases, high demand + limited supply = high prices. As supply increases over time and demand normalizes, prices typically drop.

**Application:** Understanding this helps predict price changes, analyze markets, and make business decisions.`,

  // Computer Science
  binary_search_tree: `A Binary Search Tree (BST) is a data structure where each node has at most two children, with a special ordering property:

**Structure:**
- Left child < Parent
- Right child > Parent
- This property applies recursively to all subtrees

**Key Operations:**

1. **Search - O(log n) average**
   - Start at root
   - Go left if target < current
   - Go right if target > current
   - Repeat until found or reach null

2. **Insert - O(log n) average**
   - Find correct position (like search)
   - Add new node as leaf
   - Maintain BST property

3. **Delete - O(log n) average**
   - Case 1: No children → remove node
   - Case 2: One child → replace with child
   - Case 3: Two children → replace with inorder successor

**Advantages:**
- Fast search, insert, delete
- Maintains sorted order
- Efficient range queries

**Disadvantages:**
- Can become unbalanced → O(n) worst case
- Solution: Use balanced BSTs (AVL, Red-Black)

**Use cases:** Databases, file systems, autocomplete, priority queues`,

  // English Literature
  victorian_poetry: `Victorian poetry (1837-1901) reflects the dramatic social changes of the Industrial Revolution era.

**Key Characteristics:**

1. **Themes**
   - Social reform and criticism
   - Doubt and faith (religious questioning)
   - Nature vs. industrialization
   - Gender roles and constraints

2. **Major Poets**
   - **Alfred Tennyson**: Lyrical, explores doubt ("In Memoriam")
   - **Robert Browning**: Dramatic monologues, psychological depth
   - **Elizabeth Barrett Browning**: Love, social issues ("Sonnets from the Portuguese")
   - **Christina Rossetti**: Religious themes, symbolism

3. **Literary Techniques**
   - Dramatic monologue (Browning's innovation)
   - Elaborate metaphors
   - Musical quality and rhythm
   - Classical and biblical allusions

**Historical Context:**
The Victorian era saw massive change - railways, factories, urbanization. Poets grappled with how to reconcile traditional values with modernity.

**Example Analysis:**
Tennyson's "The Lady of Shalott" uses a medieval setting to explore themes of artistic isolation vs. real-world engagement - a metaphor for Victorian anxieties about art's role in industrial society.`,

  // Default response
  default: `Great question! Let me help you understand this concept better.

Based on your question, here are the key points to consider:

1. **Core Concept**: [This would be tailored to your specific question]
2. **Why It Matters**: Understanding this helps you [practical application]
3. **Common Misconceptions**: Many students confuse [related concepts]
4. **Study Tips**:
   - Focus on understanding, not memorization
   - Try explaining it to someone else
   - Look for real-world examples
   - Practice with problems

**Related Topics You Should Review:**
- [Topic 1 from your course]
- [Topic 2 that builds on this]
- [Topic 3 for deeper understanding]

Would you like me to:
- Generate practice questions on this topic?
- Create flashcards for key terms?
- Provide more detailed examples?

**Note:** This is a simulated response. In production, I'll use real AI to provide more specific, context-aware answers based on your actual course materials!`,
};

// =====================================================
// MOCK QUIZ TEMPLATES
// =====================================================

const MOCK_QUIZZES: Record<string, any> = {
  biology: {
    quizTitle: "Practice Quiz: Cellular Respiration",
    estimatedTime: "15 minutes",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "Where in the cell does glycolysis occur?",
        options: [
          "Mitochondrial matrix",
          "Cytoplasm",
          "Inner mitochondrial membrane",
          "Nucleus"
        ],
        correctAnswer: "Cytoplasm",
        explanation: "Glycolysis occurs in the cytoplasm and doesn't require mitochondria. This is why it can happen in both aerobic and anaerobic conditions."
      },
      {
        id: 2,
        type: "multiple_choice",
        question: "What is the total ATP yield from one glucose molecule during cellular respiration?",
        options: ["2 ATP", "4 ATP", "36-38 ATP", "100 ATP"],
        correctAnswer: "36-38 ATP",
        explanation: "The complete breakdown of one glucose molecule yields approximately 36-38 ATP molecules through glycolysis, Krebs cycle, and electron transport chain."
      },
      {
        id: 3,
        type: "true_false",
        question: "The Krebs cycle produces the majority of ATP in cellular respiration.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "False. The electron transport chain produces the most ATP (about 34 molecules), while the Krebs cycle only produces 2 ATP directly."
      },
      {
        id: 4,
        type: "multiple_choice",
        question: "What is the role of oxygen in cellular respiration?",
        options: [
          "It is the final electron acceptor",
          "It provides energy for ATP synthesis",
          "It breaks down glucose",
          "It creates the pH gradient"
        ],
        correctAnswer: "It is the final electron acceptor",
        explanation: "Oxygen acts as the final electron acceptor in the electron transport chain, combining with electrons and hydrogen to form water."
      },
      {
        id: 5,
        type: "short_answer",
        question: "Explain why cellular respiration is considered an aerobic process.",
        correctAnswer: "Because it requires oxygen as the final electron acceptor in the electron transport chain.",
        explanation: "Cellular respiration needs oxygen to function efficiently. While glycolysis can occur without oxygen, the Krebs cycle and electron transport chain require oxygen to accept electrons and produce the majority of ATP."
      }
    ]
  },
  economics: {
    quizTitle: "Practice Quiz: Supply and Demand",
    estimatedTime: "12 minutes",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "What happens to demand when the price of a good increases?",
        options: [
          "Demand increases",
          "Demand decreases",
          "Demand stays the same",
          "Demand becomes perfectly elastic"
        ],
        correctAnswer: "Demand decreases",
        explanation: "According to the Law of Demand, as price increases, quantity demanded decreases (inverse relationship)."
      },
      {
        id: 2,
        type: "multiple_choice",
        question: "At market equilibrium, what is true?",
        options: [
          "Supply exceeds demand",
          "Demand exceeds supply",
          "Quantity supplied equals quantity demanded",
          "Price is at its maximum"
        ],
        correctAnswer: "Quantity supplied equals quantity demanded",
        explanation: "Market equilibrium occurs where the supply and demand curves intersect, meaning quantity supplied equals quantity demanded at that price."
      },
      {
        id: 3,
        type: "true_false",
        question: "A surplus occurs when the market price is below equilibrium.",
        options: ["True", "False"],
        correctAnswer: "False",
        explanation: "False. A surplus occurs when price is ABOVE equilibrium (quantity supplied > quantity demanded). Below equilibrium creates a shortage."
      }
    ]
  },
  computer_science: {
    quizTitle: "Practice Quiz: Data Structures",
    estimatedTime: "18 minutes",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "What is the average time complexity for searching in a balanced BST?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(log n)",
        explanation: "In a balanced BST, we eliminate half the remaining nodes with each comparison, giving us logarithmic time complexity."
      },
      {
        id: 2,
        type: "multiple_choice",
        question: "In a BST, where should you look to find the minimum value?",
        options: [
          "Root node",
          "Rightmost node",
          "Leftmost node",
          "Middle node"
        ],
        correctAnswer: "Leftmost node",
        explanation: "Since left children are always smaller than their parents in a BST, the minimum value is found by going left until you can't go any further."
      }
    ]
  },
  default: {
    quizTitle: "Practice Quiz: Module Concepts",
    estimatedTime: "15 minutes",
    questions: [
      {
        id: 1,
        type: "multiple_choice",
        question: "Which of the following is a key concept from this module?",
        options: ["Concept A", "Concept B", "Concept C", "All of the above"],
        correctAnswer: "All of the above",
        explanation: "All three concepts are fundamental to understanding this module's material."
      },
      {
        id: 2,
        type: "true_false",
        question: "Understanding the fundamentals is important before moving to advanced topics.",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "Building a strong foundation ensures better comprehension of more complex material later."
      },
      {
        id: 3,
        type: "short_answer",
        question: "Name one practical application of this module's concepts.",
        correctAnswer: "Various applications exist depending on the field",
        explanation: "The concepts from this module have numerous real-world applications in industry and research."
      }
    ]
  }
};

// =====================================================
// MOCK REVIEW MATERIALS
// =====================================================

const MOCK_REVIEW_MATERIALS = {
  summary: "This review covers the key concepts from the selected modules. Focus on understanding the relationships between concepts rather than pure memorization.",
  keyPoints: [
    "Master the fundamental principles before moving to advanced topics",
    "Understand how different concepts connect and build on each other",
    "Practice applying concepts to solve problems",
    "Review examples and work through practice problems",
    "Don't hesitate to ask questions about confusing topics"
  ],
  flashcards: [
    {
      front: "What is the main purpose of this concept?",
      back: "To provide a framework for understanding how different components interact in the system."
    },
    {
      front: "Key term: Define the primary principle",
      back: "The primary principle states that all components must work together systematically to achieve the desired outcome."
    },
    {
      front: "How do you apply this in practice?",
      back: "Start with the basics, identify the components, analyze their relationships, and test your understanding with examples."
    },
    {
      front: "What's a common mistake students make?",
      back: "Trying to memorize without understanding the underlying logic and relationships between concepts."
    },
    {
      front: "What's the best way to study this material?",
      back: "Active recall, practice problems, teaching others, and relating concepts to real-world examples."
    }
  ],
  practiceProblems: [
    {
      problem: "Given a scenario where [condition], what would be the expected outcome?",
      solution: "The expected outcome would be [result] because [explanation of reasoning]."
    },
    {
      problem: "How would you approach a problem involving [specific concept]?",
      solution: "First, identify the key components. Then, analyze their relationships. Finally, apply the relevant principles to reach a solution."
    },
    {
      problem: "Compare and contrast [concept A] and [concept B].",
      solution: "Both concepts share [similarities], but differ in [key differences]. Understanding these distinctions is crucial for proper application."
    }
  ]
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function findBestResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase();

  // Biology topics
  if (lowerPrompt.includes('cellular respiration') || lowerPrompt.includes('cell respiration') ||
      lowerPrompt.includes('glycolysis') || lowerPrompt.includes('krebs') ||
      lowerPrompt.includes('electron transport')) {
    return MOCK_RESPONSES.cellular_respiration;
  }

  if (lowerPrompt.includes('dna') || lowerPrompt.includes('replication') ||
      lowerPrompt.includes('helicase') || lowerPrompt.includes('polymerase')) {
    return MOCK_RESPONSES.dna_replication;
  }

  // Economics topics
  if (lowerPrompt.includes('supply') || lowerPrompt.includes('demand') ||
      lowerPrompt.includes('equilibrium') || lowerPrompt.includes('market')) {
    return MOCK_RESPONSES.supply_demand;
  }

  // Computer Science topics
  if (lowerPrompt.includes('binary search tree') || lowerPrompt.includes('bst') ||
      lowerPrompt.includes('tree') || lowerPrompt.includes('data structure')) {
    return MOCK_RESPONSES.binary_search_tree;
  }

  // Literature topics
  if (lowerPrompt.includes('victorian') || lowerPrompt.includes('poetry') ||
      lowerPrompt.includes('tennyson') || lowerPrompt.includes('browning')) {
    return MOCK_RESPONSES.victorian_poetry;
  }

  return MOCK_RESPONSES.default;
}

function findBestQuiz(context: any): any {
  const courseName = (context.courseName || '').toLowerCase();
  const moduleName = (context.moduleName || '').toLowerCase();

  if (courseName.includes('biology') || moduleName.includes('respiration') || moduleName.includes('dna')) {
    return MOCK_QUIZZES.biology;
  }

  if (courseName.includes('economics') || courseName.includes('econ') ||
      moduleName.includes('supply') || moduleName.includes('demand')) {
    return MOCK_QUIZZES.economics;
  }

  if (courseName.includes('computer') || courseName.includes('cs') ||
      moduleName.includes('data structure') || moduleName.includes('algorithm')) {
    return MOCK_QUIZZES.computer_science;
  }

  return MOCK_QUIZZES.default;
}

function simulateDelay(min: number = 800, max: number = 1500): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// =====================================================
// MOCK COMPLETION
// =====================================================

export async function complete(request: CompletionRequest): Promise<CompletionResponse> {
  const startTime = Date.now();

  // Simulate API delay
  await simulateDelay(800, 1500);

  // Generate mock response based on prompt
  const content = findBestResponse(request.prompt);

  const estimatedInputTokens = Math.ceil(request.prompt.length / 4);
  const estimatedOutputTokens = Math.ceil(content.length / 4);
  const totalTokens = estimatedInputTokens + estimatedOutputTokens;
  const executionTimeMs = Date.now() - startTime;

  return {
    content,
    tokensUsed: {
      input: estimatedInputTokens,
      output: estimatedOutputTokens,
      total: totalTokens,
    },
    costCents: 0,
    model: 'chatbase-mock' as AIModel,
    provider: 'local',
    cacheHit: false,
    executionTimeMs,
  };
}

// =====================================================
// MOCK STREAMING
// =====================================================

export async function* streamComplete(
  request: CompletionRequest
): AsyncIterableIterator<StreamChunk> {
  await simulateDelay(300, 600);

  const content = findBestResponse(request.prompt);
  const words = content.split(' ');

  // Stream word by word
  for (let i = 0; i < words.length; i++) {
    await simulateDelay(50, 150);
    yield {
      content: words[i] + ' ',
      done: false,
    };
  }

  yield {
    content: '',
    done: true,
  };
}

// =====================================================
// MOCK CHAT WITH CONTEXT
// =====================================================

export async function chatWithContext(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  temperature = 0.7
): Promise<CompletionResponse> {
  const startTime = Date.now();
  await simulateDelay(800, 1500);

  // Get the last user message
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  const content = lastUserMessage ? findBestResponse(lastUserMessage.content) : MOCK_RESPONSES.default;

  const allMessages = messages.map(m => m.content).join(' ');
  const estimatedInputTokens = Math.ceil(allMessages.length / 4);
  const estimatedOutputTokens = Math.ceil(content.length / 4);

  return {
    content,
    tokensUsed: {
      input: estimatedInputTokens,
      output: estimatedOutputTokens,
      total: estimatedInputTokens + estimatedOutputTokens,
    },
    costCents: 0,
    model: 'chatbase-mock' as AIModel,
    provider: 'local',
    cacheHit: false,
    executionTimeMs: Date.now() - startTime,
  };
}

// =====================================================
// MOCK QUIZ GENERATION
// =====================================================

export async function generateMockQuiz(context: any): Promise<any> {
  await simulateDelay(1500, 2500);
  return findBestQuiz(context);
}

// =====================================================
// MOCK REVIEW GENERATION
// =====================================================

export async function generateMockReview(): Promise<any> {
  await simulateDelay(2000, 3000);
  return MOCK_REVIEW_MATERIALS;
}

// =====================================================
// CONFIGURATION CHECK
// =====================================================

export function isChatbaseConfigured(): boolean {
  // Always return true for mock provider
  return true;
}

export default {
  complete,
  streamComplete,
  chatWithContext,
  generateMockQuiz,
  generateMockReview,
  isChatbaseConfigured,
};
