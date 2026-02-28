export const TEST_BANK = [
  // Programming / Logic
  {
    id: 'prog_1',
    domain: 'programming',
    trait: 'tech',
    prompt: 'Which data structure is best for implementing a queue?',
    options: ['Stack', 'Linked list', 'Tree', 'Graph'],
    answerIndex: 1,
  },
  {
    id: 'prog_2',
    domain: 'programming',
    trait: 'logic',
    prompt: 'Time complexity of binary search on a sorted array is…',
    options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
    answerIndex: 1,
  },
  {
    id: 'prog_3',
    domain: 'programming',
    trait: 'logic',
    prompt: 'In OOP, “encapsulation” primarily means…',
    options: [
      'Using many classes',
      'Hiding internal state and exposing behavior via methods',
      'Inheriting from a base class',
      'Creating only static methods',
    ],
    answerIndex: 1,
  },
  {
    id: 'prog_4',
    domain: 'programming',
    trait: 'tech',
    prompt: 'Which HTTP method is typically used to create a new resource?',
    options: ['GET', 'POST', 'PUT', 'DELETE'],
    answerIndex: 1,
  },
  {
    id: 'prog_5',
    domain: 'programming',
    trait: 'tech',
    prompt: 'Which of these is a JavaScript library for building UIs?',
    options: ['React', 'Django', 'Flask', 'Laravel'],
    answerIndex: 0,
  },

  // Math / Analytical
  {
    id: 'math_1',
    domain: 'math',
    trait: 'analytical',
    prompt: 'If 3x + 2 = 11, what is x?',
    options: ['1', '2', '3', '4'],
    answerIndex: 2,
  },
  {
    id: 'math_2',
    domain: 'math',
    trait: 'analytical',
    prompt: 'Mean of 2, 4, 6, 8 is…',
    options: ['4', '5', '6', '7'],
    answerIndex: 1,
  },

  // Communication / Team
  {
    id: 'comm_1',
    domain: 'communication',
    trait: 'team',
    prompt: 'In a team disagreement, the best first step is…',
    options: [
      'Ignore and continue',
      'Listen to all viewpoints and clarify the goal',
      'Escalate immediately',
      'Vote without discussion',
    ],
    answerIndex: 1,
  },
  {
    id: 'comm_2',
    domain: 'communication',
    trait: 'team',
    prompt: 'A clear status update should include…',
    options: ['Only problems', 'Only successes', 'Progress + blockers + next steps', 'Nothing if late'],
    answerIndex: 2,
  },

  // Business / Markets
  {
    id: 'biz_1',
    domain: 'business',
    trait: 'business',
    prompt: '“Revenue” is best described as…',
    options: ['Profit after expenses', 'Total money earned from sales', 'Money in the bank only', 'Tax paid'],
    answerIndex: 1,
  },
  {
    id: 'biz_2',
    domain: 'business',
    trait: 'business',
    prompt: 'A product’s “target audience” means…',
    options: [
      'All people',
      'Only competitors',
      'The group most likely to benefit and buy',
      'Only investors',
    ],
    answerIndex: 2,
  },

  // Tech basics
  {
    id: 'tech_1',
    domain: 'tech',
    trait: 'tech',
    prompt: '“Git” is primarily used for…',
    options: ['Image editing', 'Version control', 'Video rendering', 'Database hosting'],
    answerIndex: 1,
  },
  {
    id: 'tech_2',
    domain: 'tech',
    trait: 'tech',
    prompt: 'What does “API” stand for?',
    options: [
      'Application Programming Interface',
      'Applied Program Integration',
      'Advanced Protocol Internet',
      'Automated Public Interaction',
    ],
    answerIndex: 0,
  },
  {
    id: 'tech_3',
    domain: 'tech',
    trait: 'tech',
    prompt: 'Which is a database?',
    options: ['PostgreSQL', 'Photoshop', 'Figma', 'Chrome'],
    answerIndex: 0,
  },

  // Helping / Health mindset (non-medical)
  {
    id: 'help_1',
    domain: 'helping',
    trait: 'helping',
    prompt: 'Empathy in a helping profession means…',
    options: [
      'Agreeing with everything',
      'Understanding feelings and perspective',
      'Ignoring emotions',
      'Giving advice quickly',
    ],
    answerIndex: 1,
  },
];

export const TEST_CATALOG = [
  {
    id: 'skill_core',
    name: 'Core Skills Test',
    description: 'A short test across programming, math, communication, and business basics.',
    questionCount: 8,
    domains: ['programming', 'math', 'communication', 'business'],
  },
  {
    id: 'coding_tech',
    name: 'Coding + Tech Basics',
    description: 'Computer knowledge check: coding fundamentals, web/HTTP, and tools (Git/APIs).',
    questionCount: 10,
    domains: ['programming', 'tech'],
  },
];

