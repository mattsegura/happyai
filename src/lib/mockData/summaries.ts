import { Summary } from '../types/studyPlan';

export const mockSummaries: Summary[] = [
  {
    id: 'sum-1',
    title: 'Cell Biology Chapter 3 Summary',
    content: 'Comprehensive overview of cellular structures and their functions.',
    keyPoints: [
      'Cells are the basic unit of life',
      'Mitochondria produce ATP through cellular respiration',
      'Chloroplasts perform photosynthesis in plant cells',
      'The cell membrane is selectively permeable',
      'The nucleus contains genetic material (DNA)'
    ],
    sourceFiles: ['biology-chapter-3.pdf'],
    structure: 'key-concepts',
    length: 'detailed',
    sections: [
      {
        id: 's1',
        title: 'Introduction to Cells',
        content: 'Cells are the fundamental units of life. All living organisms are composed of one or more cells, and all cells arise from pre-existing cells. This principle, established by cell theory, forms the foundation of modern biology. Cells can be broadly classified into two types: prokaryotic cells (bacteria and archaea) which lack a membrane-bound nucleus, and eukaryotic cells (animals, plants, fungi) which have a true nucleus and membrane-bound organelles.',
        expanded: true,
        type: 'concept'
      },
      {
        id: 's2',
        title: 'Cell Membrane',
        content: 'The cell membrane, also called the plasma membrane, is a thin, flexible barrier that surrounds all cells. It is selectively permeable, meaning it controls what substances enter and exit the cell. The membrane is composed of a phospholipid bilayer with embedded proteins. This structure is described by the fluid mosaic model, where the membrane components can move laterally, giving the membrane flexibility.',
        expanded: true,
        type: 'concept'
      },
      {
        id: 's3',
        title: 'Nucleus',
        content: 'The nucleus is the control center of eukaryotic cells. It contains the cell\'s genetic material (DNA) organized into chromosomes. The nucleus is surrounded by a double membrane called the nuclear envelope, which has pores that allow materials to move in and out. Inside the nucleus is the nucleolus, where ribosomes are assembled.',
        expanded: true,
        type: 'concept'
      },
      {
        id: 's4',
        title: 'Mitochondria',
        content: 'Mitochondria are often called the "powerhouses" of the cell because they generate most of the cell\'s supply of ATP through cellular respiration. They have a double membrane: a smooth outer membrane and a highly folded inner membrane (cristae) that increases surface area for energy production. Mitochondria have their own DNA and ribosomes, suggesting they originated from ancient prokaryotes.',
        expanded: false,
        type: 'concept'
      },
      {
        id: 's5',
        title: 'Chloroplasts (Plant Cells Only)',
        content: 'Chloroplasts are organelles found in plant cells and some protists. They are the sites of photosynthesis, where light energy is converted into chemical energy (glucose). Chloroplasts contain chlorophyll, the green pigment that captures light energy. Like mitochondria, they have their own DNA and double membranes.',
        expanded: false,
        type: 'concept'
      },
      {
        id: 's6',
        title: 'Endoplasmic Reticulum',
        content: 'The endoplasmic reticulum (ER) is an extensive network of membranes that extends throughout the cytoplasm. There are two types: Rough ER (with ribosomes attached) synthesizes and processes proteins, while Smooth ER (without ribosomes) synthesizes lipids and detoxifies harmful substances.',
        expanded: false,
        type: 'concept'
      },
      {
        id: 's7',
        title: 'Golgi Apparatus',
        content: 'The Golgi apparatus modifies, packages, and distributes proteins and lipids. It receives vesicles from the ER, modifies their contents, and then packages them into new vesicles for transport to their final destinations—either inside or outside the cell.',
        expanded: false,
        type: 'concept'
      },
      {
        id: 's8',
        title: 'Lysosomes',
        content: 'Lysosomes are membrane-bound organelles containing digestive enzymes. They break down cellular waste, old organelles, and foreign materials. Lysosomes help maintain cellular health by recycling components and defending against pathogens.',
        expanded: false,
        type: 'concept'
      }
    ],
    highlights: [
      {
        id: 'h1',
        text: 'Mitochondria are often called the "powerhouses" of the cell',
        color: '#fbbf24',
        startIndex: 0,
        endIndex: 60,
        sectionId: 's4'
      }
    ],
    annotations: [
      {
        id: 'a1',
        text: 'Important for exam!',
        position: 150,
        sectionId: 's2',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastEdited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },

  {
    id: 'sum-2',
    title: 'Calculus: Derivatives - Terms & Definitions',
    content: 'Key terms and definitions for understanding derivatives in calculus.',
    keyPoints: [
      'Derivative measures rate of change',
      'Power rule: d/dx(x^n) = n·x^(n-1)',
      'Chain rule for composite functions',
      'Product rule for products of functions',
      'Quotient rule for divisions of functions'
    ],
    sourceFiles: ['calculus-derivatives.pdf'],
    structure: 'terms-definitions',
    length: 'medium',
    sections: [
      {
        id: 's1',
        title: 'Derivative',
        content: 'Definition: The derivative of a function measures the rate at which the function\'s value changes with respect to changes in its input. Geometrically, it represents the slope of the tangent line to the function\'s graph at a given point. Notation: f\'(x), dy/dx, or df/dx.',
        expanded: true,
        type: 'definition'
      },
      {
        id: 's2',
        title: 'Power Rule',
        content: 'Definition: For any function f(x) = x^n where n is a real number, the derivative is f\'(x) = n·x^(n-1). Example: If f(x) = x³, then f\'(x) = 3x². This is one of the most fundamental rules in differentiation.',
        expanded: true,
        type: 'definition'
      },
      {
        id: 's3',
        title: 'Chain Rule',
        content: 'Definition: Used to find the derivative of composite functions. If y = f(g(x)), then dy/dx = f\'(g(x)) · g\'(x). In words: differentiate the outer function, keep the inner function unchanged, then multiply by the derivative of the inner function. Example: d/dx[sin(x²)] = cos(x²) · 2x.',
        expanded: true,
        type: 'definition'
      },
      {
        id: 's4',
        title: 'Product Rule',
        content: 'Definition: For the product of two functions, d/dx[f(x)·g(x)] = f\'(x)·g(x) + f(x)·g\'(x). In words: the derivative of the first times the second, plus the first times the derivative of the second. Example: d/dx[x²·sin(x)] = 2x·sin(x) + x²·cos(x).',
        expanded: false,
        type: 'definition'
      },
      {
        id: 's5',
        title: 'Quotient Rule',
        content: 'Definition: For the quotient of two functions, d/dx[f(x)/g(x)] = [f\'(x)·g(x) - f(x)·g\'(x)] / [g(x)]². In words: low d-high minus high d-low, all over low squared. Example: d/dx[x²/sin(x)] = [2x·sin(x) - x²·cos(x)] / sin²(x).',
        expanded: false,
        type: 'definition'
      },
      {
        id: 's6',
        title: 'Limit Definition of Derivative',
        content: 'Definition: The formal definition using limits: f\'(x) = lim(h→0) [f(x+h) - f(x)] / h. This definition shows that the derivative is the instantaneous rate of change, found by taking the limit as the change in x approaches zero.',
        expanded: false,
        type: 'definition'
      }
    ],
    highlights: [],
    annotations: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },

  {
    id: 'sum-3',
    title: 'WWII Timeline: Chronological Summary',
    content: 'A chronological overview of major events in World War II.',
    keyPoints: [
      '1939: Germany invades Poland, WWII begins',
      '1941: Pearl Harbor attack, U.S. enters war',
      '1942: Battle of Stalingrad, turning point in Europe',
      '1944: D-Day invasion of Normandy',
      '1945: Germany and Japan surrender, war ends'
    ],
    sourceFiles: ['wwii-timeline.pdf', 'wwii-battles.pdf'],
    structure: 'chronological',
    length: 'detailed',
    sections: [
      {
        id: 's1',
        title: '1939: The War Begins',
        content: 'September 1, 1939: Germany invades Poland using blitzkrieg ("lightning war") tactics. September 3, 1939: Britain and France declare war on Germany. The Polish campaign lasted only a month, demonstrating the effectiveness of combined air and ground assault. September 17: Soviet Union invades Poland from the east. By early October, Poland was divided between Germany and the Soviet Union.',
        expanded: true,
        type: 'process'
      },
      {
        id: 's2',
        title: '1940: Western Europe Falls',
        content: 'April-June 1940: Germany invades and conquers Denmark, Norway, Belgium, Netherlands, and France. The Fall of France in June shocked the world—France surrendered after just six weeks. July-October 1940: Battle of Britain—Germany\'s air force (Luftwaffe) attempts to gain air superiority over Britain but fails. Britain\'s successful defense prevented a German invasion.',
        expanded: true,
        type: 'process'
      },
      {
        id: 's3',
        title: '1941: The War Goes Global',
        content: 'June 22, 1941: Operation Barbarossa—Germany invades the Soviet Union with over 3 million troops, breaking the Nazi-Soviet pact. December 7, 1941: Japan attacks Pearl Harbor, Hawaii, killing over 2,400 Americans. December 8, 1941: United States declares war on Japan. December 11, 1941: Germany and Italy declare war on the United States.',
        expanded: true,
        type: 'process'
      },
      {
        id: 's4',
        title: '1942: Turning Points',
        content: 'June 1942: Battle of Midway—U.S. Navy defeats Japanese fleet, turning point in Pacific. August 1942-February 1943: Battle of Stalingrad—Soviet victory marks beginning of German retreat from Eastern Front. October-November 1942: Battle of El Alamein—British victory in North Africa. These battles shifted momentum toward the Allies.',
        expanded: false,
        type: 'process'
      },
      {
        id: 's5',
        title: '1943: Allied Offensives',
        content: 'July 1943: Allies invade Sicily, leading to fall of Mussolini. September 1943: Italy surrenders to Allies. November 1943: Tehran Conference—Churchill, Roosevelt, and Stalin plan invasion of France.',
        expanded: false,
        type: 'process'
      },
      {
        id: 's6',
        title: '1944: Liberation of Europe Begins',
        content: 'June 6, 1944: D-Day—Allied forces land on Normandy beaches, largest amphibious invasion in history. August 1944: Paris liberated from German occupation. December 1944: Battle of the Bulge—Germany\'s last major offensive in the West fails.',
        expanded: false,
        type: 'process'
      },
      {
        id: 's7',
        title: '1945: The War Ends',
        content: 'April 1945: Soviet forces reach Berlin. April 30: Hitler commits suicide. May 7-8, 1945: Germany surrenders unconditionally (V-E Day). August 6: U.S. drops atomic bomb on Hiroshima. August 9: U.S. drops atomic bomb on Nagasaki. August 15: Japan announces surrender (V-J Day). September 2: Japan formally surrenders, ending WWII.',
        expanded: false,
        type: 'process'
      }
    ],
    highlights: [
      {
        id: 'h1',
        text: 'June 6, 1944: D-Day',
        color: '#ef4444',
        startIndex: 0,
        endIndex: 20,
        sectionId: 's6'
      }
    ],
    annotations: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },

  {
    id: 'sum-4',
    title: 'Chemical Reactions Q&A',
    content: 'Common questions and answers about chemical reactions and stoichiometry.',
    keyPoints: [
      'Balanced equations show conservation of mass',
      'Mole ratios come from equation coefficients',
      'Limiting reactant determines product amount',
      'Stoichiometry converts between moles, mass, and volume',
      'Catalysts speed reactions without being consumed'
    ],
    sourceFiles: ['chemistry-stoichiometry.pdf'],
    structure: 'qa-format',
    length: 'medium',
    sections: [
      {
        id: 's1',
        title: 'What is a balanced chemical equation?',
        content: 'A balanced chemical equation has equal numbers of each type of atom on both sides of the equation. This reflects the law of conservation of mass—matter cannot be created or destroyed in a chemical reaction. Example: 2H₂ + O₂ → 2H₂O is balanced (4 H atoms and 2 O atoms on each side).',
        expanded: true,
        type: 'example'
      },
      {
        id: 's2',
        title: 'What is stoichiometry?',
        content: 'Stoichiometry is the calculation of quantities in chemical reactions based on balanced equations. It allows us to predict how much product will form from given amounts of reactants, or how much reactant is needed to produce a desired amount of product. The key is using mole ratios from the balanced equation.',
        expanded: true,
        type: 'concept'
      },
      {
        id: 's3',
        title: 'What is a limiting reactant?',
        content: 'The limiting reactant (or limiting reagent) is the reactant that is completely consumed first in a chemical reaction, limiting the amount of product that can form. The other reactants are in excess. To find the limiting reactant, calculate how much product each reactant could theoretically produce—the one that produces the least is limiting.',
        expanded: true,
        type: 'concept'
      },
      {
        id: 's4',
        title: 'How do you convert between moles and grams?',
        content: 'Use the molar mass (g/mol) as a conversion factor. To convert moles to grams: multiply moles by molar mass. To convert grams to moles: divide grams by molar mass. Example: 2 moles of H₂O × 18 g/mol = 36 grams. Or: 36 grams ÷ 18 g/mol = 2 moles.',
        expanded: false,
        type: 'example'
      },
      {
        id: 's5',
        title: 'What is percent yield?',
        content: 'Percent yield compares actual yield (what you actually get from an experiment) to theoretical yield (what you should get based on stoichiometry). Formula: Percent Yield = (Actual Yield / Theoretical Yield) × 100%. Reactions rarely give 100% yield due to side reactions, incomplete reactions, or loss during transfer.',
        expanded: false,
        type: 'concept'
      }
    ],
    highlights: [],
    annotations: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Get summaries by structure type
export const getSummariesByStructure = (structure: string) => {
  return mockSummaries.filter(s => s.structure === structure);
};

// Get summaries by length
export const getSummariesByLength = (length: string) => {
  return mockSummaries.filter(s => s.length === length);
};

// Get recently created summaries
export const getRecentSummaries = (limit: number = 5) => {
  return [...mockSummaries]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

