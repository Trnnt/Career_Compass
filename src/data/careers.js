/**
 * Mock career database and recommendation engine (high-level logic).
 * In production this would call a backend API.
 */

export const STREAMS = [
  { value: 'science', label: 'Science (PCM/PCB)' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'arts', label: 'Arts / Humanities' },
];

export const STREAMS_BY_GRADE = {
  '10': [
    { value: 'undecided', label: 'Not decided yet', normalized: 'undecided' },
    { value: 'science', label: 'Science (PCM/PCB)', normalized: 'science' },
    { value: 'commerce', label: 'Commerce', normalized: 'commerce' },
    { value: 'arts', label: 'Arts / Humanities', normalized: 'arts' },
  ],
  '12': STREAMS.map((s) => ({ ...s, normalized: s.value })),
  grad: [
    { value: 'grad_cs', label: 'Engineering / Computer Science', normalized: 'science' },
    { value: 'grad_bcom', label: 'B.Com / Business / Finance', normalized: 'commerce' },
    { value: 'grad_ba', label: 'BA / Humanities / Design', normalized: 'arts' },
    { value: 'grad_life', label: 'Life Science / Medical (Non-Clinical)', normalized: 'science' },
    { value: 'grad_law', label: 'Law / Governance', normalized: 'arts' },
  ],
};

export function getStreamsForGrade(grade) {
  return STREAMS_BY_GRADE[String(grade)] || STREAMS.map((s) => ({ ...s, normalized: s.value }));
}

export function normalizeStream(value, grade) {
  const v = String(value || '').trim();
  if (!v) return 'undecided';
  if (v === 'science' || v === 'commerce' || v === 'arts' || v === 'undecided') return v;
  const options = getStreamsForGrade(grade);
  const found = options.find((o) => o.value === v);
  return found?.normalized || 'undecided';
}

export const INTERESTS = [
  { value: 'tech', label: 'Technology & Coding' },
  { value: 'design', label: 'Creative Arts & Design' },
  { value: 'business', label: 'Management & Business' },
  { value: 'health', label: 'Healthcare & Research' },
  { value: 'law', label: 'Law & Governance' },
];

export const APTITUDE_QUESTIONS = [
  { id: 'q1', text: 'I enjoy solving puzzles and logical problems.', category: 'logic' },
  { id: 'q2', text: 'I prefer working in a team rather than alone.', category: 'team' },
  { id: 'q3', text: 'I like creating things (designs, content, code).', category: 'creative' },
  { id: 'q4', text: 'I am comfortable with numbers and analysis.', category: 'analytical' },
  { id: 'q5', text: 'I want to help people directly (e.g. health, teaching).', category: 'helping' },
  { id: 'q6', text: 'I am interested in how businesses and markets work.', category: 'business' },
];

export const CAREERS = [
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    description: 'Build web and mobile applications end-to-end. Strong fit for logic and technology interest with Science/Commerce background.',
    matchTraits: ['tech', 'logic', 'creative'],
    streamFit: ['science', 'commerce'],
    matchPercentage: 92,
    difficulty: 'Intermediate',
    skills: ['Programming (Java/JavaScript)', 'Data Structures & Algorithms', 'React / Frontend', 'APIs & Databases', 'Problem Solving'],
    steps: [
      { title: 'Master Logic & DSA', details: 'Study Data Structures and Algorithms. Practice on LeetCode/HackerRank.', resource: 'LeetCode', resourceUrl: 'https://leetcode.com' },
      { title: 'Learn Core Language', details: 'Deep dive into Java or JavaScript, OOP, and frameworks (Spring Boot / Node).', resource: 'Baeldung / MDN', resourceUrl: 'https://developer.mozilla.org' },
      { title: 'Frontend Mastery', details: 'Build projects using React, HTML/CSS, and responsive design.', resource: 'FreeCodeCamp', resourceUrl: 'https://www.freecodecamp.org' },
      { title: 'Backend & Databases', details: 'Learn REST APIs, SQL/NoSQL, and deployment basics.', resource: 'Coursera', resourceUrl: 'https://www.coursera.org' },
    ],
    resources: [
      { name: 'LeetCode', type: 'Practice', url: 'https://leetcode.com' },
      { name: 'FreeCodeCamp', type: 'Course', url: 'https://www.freecodecamp.org' },
      { name: 'MDN Web Docs', type: 'Reference', url: 'https://developer.mozilla.org' },
    ],
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    description: 'Turn data into insights using statistics and machine learning. Ideal for analytical minds and strong math background.',
    matchTraits: ['tech', 'analytical', 'logic'],
    streamFit: ['science', 'commerce'],
    matchPercentage: 88,
    difficulty: 'Intermediate to Advanced',
    skills: ['Statistics & Math', 'Python / R', 'Machine Learning', 'Data Visualization', 'SQL'],
    steps: [
      { title: 'Strengthen Math & Stats', details: 'Focus on probability, linear algebra, and statistics.', resource: 'Khan Academy', resourceUrl: 'https://www.khanacademy.org' },
      { title: 'Learn Python / R', details: 'Get comfortable with data manipulation (pandas, numpy).', resource: 'DataCamp', resourceUrl: 'https://www.datacamp.com' },
      { title: 'Introduction to ML', details: 'Study supervised/unsupervised learning and model evaluation.', resource: 'Coursera ML', resourceUrl: 'https://www.coursera.org' },
      { title: 'Portfolio Projects', details: 'Build end-to-end projects with real datasets.', resource: 'Kaggle', resourceUrl: 'https://www.kaggle.com' },
    ],
    resources: [
      { name: 'Kaggle', type: 'Practice', url: 'https://www.kaggle.com' },
      { name: 'DataCamp', type: 'Course', url: 'https://www.datacamp.com' },
      { name: 'Coursera', type: 'Course', url: 'https://www.coursera.org' },
    ],
  },
  {
    id: 'ux-designer',
    name: 'UX / UI Designer',
    description: 'Design user-friendly digital products. Great for creative and tech interest, any stream.',
    matchTraits: ['design', 'creative', 'tech'],
    streamFit: ['science', 'commerce', 'arts'],
    matchPercentage: 85,
    difficulty: 'Beginner to Intermediate',
    skills: ['User Research', 'Wireframing & Prototyping', 'Figma / Adobe XD', 'Visual Design', 'Usability Testing'],
    steps: [
      { title: 'Learn Design Principles', details: 'Typography, color theory, layout, and accessibility.', resource: 'Interaction Design Foundation', resourceUrl: 'https://www.interaction-design.org' },
      { title: 'Master Figma', details: 'Create wireframes and high-fidelity prototypes.', resource: 'Figma Learn', resourceUrl: 'https://www.figma.com' },
      { title: 'Build a Portfolio', details: '3–5 case studies showing research to final design.', resource: 'Behance', resourceUrl: 'https://www.behance.net' },
    ],
    resources: [
      { name: 'Figma', type: 'Tool', url: 'https://www.figma.com' },
      { name: 'IDF', type: 'Course', url: 'https://www.interaction-design.org' },
      { name: 'Nielsen Norman Group', type: 'Reference', url: 'https://www.nngroup.com' },
    ],
  },
  {
    id: 'product-manager',
    name: 'Product Manager',
    description: 'Define what to build and why. Combines business sense, teamwork, and understanding of users and tech.',
    matchTraits: ['business', 'team', 'tech'],
    streamFit: ['science', 'commerce', 'arts'],
    matchPercentage: 82,
    difficulty: 'Intermediate',
    skills: ['Stakeholder Management', 'Prioritization', 'User Stories & Roadmaps', 'Data Basics', 'Agile/Scrum'],
    steps: [
      { title: 'Understand Product Lifecycle', details: 'Learn discovery, development, and launch phases.', resource: 'Product School', resourceUrl: 'https://productschool.com' },
      { title: 'Practice Prioritization', details: 'Frameworks like RICE, MoSCoW, and OKRs.', resource: 'Reforge', resourceUrl: 'https://www.reforge.com' },
      { title: 'Build a Side Project', details: 'Ship a small product end-to-end to show ownership.', resource: 'Your own idea', resourceUrl: '#' },
    ],
    resources: [
      { name: 'Product School', type: 'Course', url: 'https://productschool.com' },
      { name: 'Lenny\'s Newsletter', type: 'Reading', url: 'https://www.lennysnewsletter.com' },
    ],
  },
  {
    id: 'doctor',
    name: 'Medical Professional (Doctor)',
    description: 'Diagnose and treat patients. Requires strong Science background and dedication to long education.',
    matchTraits: ['health', 'helping', 'analytical'],
    streamFit: ['science'],
    matchPercentage: 90,
    difficulty: 'Advanced',
    skills: ['Biology & Chemistry', 'Clinical Reasoning', 'Empathy & Communication', 'Continuous Learning'],
    steps: [
      { title: 'NEET / AIIMS Preparation', details: 'Strong focus on PCB and consistent practice.', resource: 'Coaching / NCERT', resourceUrl: '#' },
      { title: 'MBBS & Specialization', details: 'Medical school followed by PG in chosen specialty.', resource: 'MCI-recognized colleges', resourceUrl: '#' },
    ],
    resources: [
      { name: 'NCERT Biology/Chemistry', type: 'Study', url: '#' },
      { name: 'Marrow / Prepladder', type: 'PG Prep', url: '#' },
    ],
  },
  {
    id: 'ca-cfa',
    name: 'Chartered Accountant / CFA',
    description: 'Finance, auditing, and compliance. Suits Commerce stream and interest in numbers and business.',
    matchTraits: ['business', 'analytical', 'logic'],
    streamFit: ['commerce', 'science'],
    matchPercentage: 88,
    difficulty: 'Intermediate to Advanced',
    skills: ['Accounting', 'Taxation', 'Financial Analysis', 'Regulations', 'Excel & Tools'],
    steps: [
      { title: 'Foundation (CA/CFA)', details: 'Clear entrance and foundation exams.', resource: 'ICAI / CFA Institute', resourceUrl: 'https://www.icai.org' },
      { title: 'Intermediate & Articleship', details: 'Advanced subjects and practical training.', resource: 'Coaching + Firm', resourceUrl: '#' },
      { title: 'Final & Certification', details: 'Final exams and certification.', resource: 'ICAI', resourceUrl: '#' },
    ],
    resources: [
      { name: 'ICAI', type: 'Official', url: 'https://www.icai.org' },
      { name: 'CFA Institute', type: 'Official', url: 'https://www.cfainstitute.org' },
    ],
  },
];

const LEARNING_HUB = {
  fullstack: {
    title: 'Full Stack Learning Sprint',
    outcome: 'Build and deploy one production-ready app with frontend, backend, and database.',
    weeklyPlan: [
      'Week 1-2: JavaScript + DSA practice (1 hour daily)',
      'Week 3-4: React fundamentals and reusable UI components',
      'Week 5-6: Node.js APIs, auth, and SQL/NoSQL basics',
      'Week 7-8: Deploy project and prepare portfolio case study',
    ],
    videos: [
      { label: 'Udemy: The Web Developer Bootcamp', url: 'https://www.udemy.com/course/the-web-developer-bootcamp/' },
      { label: 'YouTube: Full Stack MERN Course', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M' },
    ],
  },
  'data-scientist': {
    title: 'Data Science Foundation Track',
    outcome: 'Complete one end-to-end machine learning project with a dashboard.',
    weeklyPlan: [
      'Week 1-2: Statistics + probability and Python basics',
      'Week 3-4: pandas, numpy, and data cleaning workflow',
      'Week 5-6: ML models, evaluation, and feature engineering',
      'Week 7-8: Publish notebook + dashboard on Kaggle or GitHub',
    ],
    videos: [
      { label: 'Udemy: Python for Data Science and ML Bootcamp', url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/' },
      { label: 'YouTube: Data Science Full Course', url: 'https://www.youtube.com/watch?v=-ETQ97mXXF0' },
    ],
  },
  'ux-designer': {
    title: 'UX and Product Design Studio',
    outcome: 'Ship 3 portfolio case studies from user research to high-fidelity prototype.',
    weeklyPlan: [
      'Week 1-2: UX fundamentals, heuristics, and accessibility',
      'Week 3-4: Figma components, design systems, and wireframes',
      'Week 5-6: User testing and iteration loops',
      'Week 7-8: Case-study writing and portfolio publishing',
    ],
    videos: [
      { label: 'Udemy: User Experience Design Essentials', url: 'https://www.udemy.com/course/ui-ux-web-design-using-adobe-xd/' },
      { label: 'YouTube: Figma UI UX Crash Course', url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8' },
    ],
  },
  'product-manager': {
    title: 'Product Management Execution Plan',
    outcome: 'Build one product strategy doc, PRD, and launch plan for a real feature.',
    weeklyPlan: [
      'Week 1-2: Product thinking, user interviews, and JTBD',
      'Week 3-4: Prioritization frameworks and roadmap building',
      'Week 5-6: Metrics, funnels, and experimentation',
      'Week 7-8: PRD writing and stakeholder communication',
    ],
    videos: [
      { label: 'Udemy: Become a Product Manager', url: 'https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/' },
      { label: 'YouTube: Product Management Course', url: 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ' },
    ],
  },
  doctor: {
    title: 'Medical Preparation Roadmap',
    outcome: 'Build a NEET-ready study cycle with revision and mock analysis.',
    weeklyPlan: [
      'Week 1-2: Biology high-yield topics and NCERT mapping',
      'Week 3-4: Chemistry concept blocks + question drills',
      'Week 5-6: Physics problem-solving routines',
      'Week 7-8: Mock tests, weak-area revision, and notes compression',
    ],
    videos: [
      { label: 'Udemy: Human Anatomy and Physiology Basics', url: 'https://www.udemy.com/course/human-anatomy-and-physiology/' },
      { label: 'YouTube: NEET Strategy and Biology Revision', url: 'https://www.youtube.com/watch?v=nYQfL4L5YJQ' },
    ],
  },
  'ca-cfa': {
    title: 'Finance and Certification Track',
    outcome: 'Develop a consistent prep system for CA/CFA exams and practical finance skills.',
    weeklyPlan: [
      'Week 1-2: Accounting foundations and ratio analysis',
      'Week 3-4: Corporate finance and valuation basics',
      'Week 5-6: Audit, taxation, and compliance concepts',
      'Week 7-8: Mock tests and formula revision sheets',
    ],
    videos: [
      { label: 'Udemy: The Complete Financial Analyst Course', url: 'https://www.udemy.com/course/the-complete-financial-analyst-course/' },
      { label: 'YouTube: CFA Level 1 Intro Concepts', url: 'https://www.youtube.com/watch?v=JxgmHe2NyeY' },
    ],
  },
};

const ADAPTIVE_TRACKS = {
  fullstack: {
    foundation: {
      label: 'Foundation track',
      goal: 'Build coding fundamentals before full projects.',
      courses: [
        { label: 'Udemy: JavaScript Basics for Beginners', url: 'https://www.udemy.com/course/javascript-basics-for-beginners/' },
        { label: 'YouTube: JavaScript Full Course (Beginner)', url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg' },
      ],
    },
    intermediate: {
      label: 'Intermediate track',
      goal: 'Strengthen React + backend and ship mini projects.',
      courses: [
        { label: 'Udemy: React - The Complete Guide', url: 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/' },
        { label: 'YouTube: MERN Stack Course', url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M' },
      ],
    },
    advanced: {
      label: 'Advanced track',
      goal: 'Production-level architecture, testing, and deployment.',
      courses: [
        { label: 'Udemy: Node.js API Masterclass', url: 'https://www.udemy.com/course/nodejs-api-masterclass/' },
        { label: 'YouTube: Full Stack System Design for Developers', url: 'https://www.youtube.com/watch?v=bUHFg8CZFws' },
      ],
    },
  },
  'data-scientist': {
    foundation: {
      label: 'Foundation track',
      goal: 'Build stats + Python base with guided datasets.',
      courses: [
        { label: 'Udemy: Python for Data Science Intro', url: 'https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/' },
        { label: 'YouTube: Python for Data Analysis', url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8' },
      ],
    },
    intermediate: {
      label: 'Intermediate track',
      goal: 'Model training, evaluation, and practical ML projects.',
      courses: [
        { label: 'Udemy: Machine Learning A-Z', url: 'https://www.udemy.com/course/machinelearning/' },
        { label: 'YouTube: Machine Learning Full Course', url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg' },
      ],
    },
    advanced: {
      label: 'Advanced track',
      goal: 'Deep learning pipelines and deployment skills.',
      courses: [
        { label: 'Udemy: Deep Learning A-Z', url: 'https://www.udemy.com/course/deeplearning/' },
        { label: 'YouTube: MLOps and Model Deployment', url: 'https://www.youtube.com/watch?v=06-AZXmwHjo' },
      ],
    },
  },
  'ux-designer': {
    foundation: {
      label: 'Foundation track',
      goal: 'Understand UX basics and visual hierarchy.',
      courses: [
        { label: 'Udemy: UI UX Design Essentials', url: 'https://www.udemy.com/course/ui-ux-web-design-using-adobe-xd/' },
        { label: 'YouTube: UX Design for Beginners', url: 'https://www.youtube.com/watch?v=3Yc4fCw0A7E' },
      ],
    },
    intermediate: {
      label: 'Intermediate track',
      goal: 'Create full case studies and improve design systems.',
      courses: [
        { label: 'Udemy: Figma UI UX Masterclass', url: 'https://www.udemy.com/course/figma-ux-ui-design-user-experience-tutorial-course/' },
        { label: 'YouTube: Figma Complete Course', url: 'https://www.youtube.com/watch?v=FTFaQWZBqQ8' },
      ],
    },
    advanced: {
      label: 'Advanced track',
      goal: 'Master research-driven product design and advanced prototyping.',
      courses: [
        { label: 'Udemy: UX Research and Strategy', url: 'https://www.udemy.com/course/ux-web-design-master-course-strategy-design-development/' },
        { label: 'YouTube: UX Portfolio and Case Study Deep Dive', url: 'https://www.youtube.com/watch?v=6q0M4_8vv4A' },
      ],
    },
  },
  'product-manager': {
    foundation: {
      label: 'Foundation track',
      goal: 'Learn PM basics: users, problem statements, and roadmaps.',
      courses: [
        { label: 'Udemy: Product Management 101', url: 'https://www.udemy.com/course/become-a-product-manager-learn-the-skills-get-a-job/' },
        { label: 'YouTube: Product Management for Beginners', url: 'https://www.youtube.com/watch?v=yUOC-Y0f5ZQ' },
      ],
    },
    intermediate: {
      label: 'Intermediate track',
      goal: 'Drive feature execution with metrics and prioritization.',
      courses: [
        { label: 'Udemy: Product Manager Interview and Execution', url: 'https://www.udemy.com/course/product-management-interview/' },
        { label: 'YouTube: Product Metrics and Prioritization', url: 'https://www.youtube.com/watch?v=2F4s7nq7Fdw' },
      ],
    },
    advanced: {
      label: 'Advanced track',
      goal: 'Own strategy, experimentation, and growth roadmap.',
      courses: [
        { label: 'Udemy: Advanced Product Management', url: 'https://www.udemy.com/course/advanced-product-management-vision-strategy-metrics/' },
        { label: 'YouTube: Senior PM Strategy Sessions', url: 'https://www.youtube.com/watch?v=KjV4M0Vfh7w' },
      ],
    },
  },
  doctor: {
    foundation: {
      label: 'Foundation track',
      goal: 'Rebuild PCB basics with structured revision.',
      courses: [
        { label: 'Udemy: Biology Basics Masterclass', url: 'https://www.udemy.com/course/biology-basics/' },
        { label: 'YouTube: NEET Biology Basics', url: 'https://www.youtube.com/watch?v=fm4A4vM-LmQ' },
      ],
    },
    intermediate: {
      label: 'Intermediate track',
      goal: 'Boost weak chapters and solve higher-difficulty questions.',
      courses: [
        { label: 'Udemy: Human Anatomy and Physiology', url: 'https://www.udemy.com/course/human-anatomy-and-physiology/' },
        { label: 'YouTube: NEET Strategy for Mid Scorers', url: 'https://www.youtube.com/watch?v=nYQfL4L5YJQ' },
      ],
    },
    advanced: {
      label: 'Advanced track',
      goal: 'Maximize test accuracy and speed for top ranks.',
      courses: [
        { label: 'Udemy: Medical Terminology for Advanced Learners', url: 'https://www.udemy.com/course/medical-terminology/' },
        { label: 'YouTube: Advanced NEET Mock Analysis', url: 'https://www.youtube.com/watch?v=Hh3XbRj9dXQ' },
      ],
    },
  },
  'ca-cfa': {
    foundation: {
      label: 'Foundation track',
      goal: 'Strengthen accounting and finance fundamentals.',
      courses: [
        { label: 'Udemy: Accounting and Finance Basics', url: 'https://www.udemy.com/course/accounting-finance-beginners/' },
        { label: 'YouTube: Finance Fundamentals for Beginners', url: 'https://www.youtube.com/watch?v=WEDIj9JBTC8' },
      ],
    },
    intermediate: {
      label: 'Intermediate track',
      goal: 'Practice valuation, reporting, and analysis.',
      courses: [
        { label: 'Udemy: Complete Financial Analyst Course', url: 'https://www.udemy.com/course/the-complete-financial-analyst-course/' },
        { label: 'YouTube: CFA Level 1 Study Plan', url: 'https://www.youtube.com/watch?v=JxgmHe2NyeY' },
      ],
    },
    advanced: {
      label: 'Advanced track',
      goal: 'Exam-focused preparation with intensive mock strategy.',
      courses: [
        { label: 'Udemy: Advanced Financial Modeling', url: 'https://www.udemy.com/course/advanced-financial-modeling/' },
        { label: 'YouTube: CFA/CA Advanced Problem Solving', url: 'https://www.youtube.com/watch?v=s7Aoy7Jxw9A' },
      ],
    },
  },
};

export function getScoreBand(scorePercent) {
  const score = Number(scorePercent) || 0;
  if (score < 40) return 'foundation';
  if (score < 75) return 'intermediate';
  return 'advanced';
}

export function buildExamDrivenLearningPlan(career, latestAttempt) {
  if (!career || !latestAttempt) return null;
  const byCareer = ADAPTIVE_TRACKS[career.id];
  if (!byCareer) return null;
  const band = getScoreBand(latestAttempt.percent);
  const track = byCareer[band];
  if (!track) return null;

  return {
    band,
    score: latestAttempt.percent,
    label: track.label,
    goal: track.goal,
    courses: track.courses,
    attemptType: latestAttempt.type,
  };
}

/**
 * Build aptitude scores (category -> avg score 1-5) from answers.
 * answers: array of numbers 1-5 in same order as APTITUDE_QUESTIONS.
 */
export function buildAptitudeScores(answers) {
  const scores = {};
  APTITUDE_QUESTIONS.forEach((q, i) => {
    const val = answers[i] ?? 0;
    if (!scores[q.category]) scores[q.category] = [];
    scores[q.category].push(val);
  });
  return Object.fromEntries(
    Object.entries(scores).map(([k, arr]) => [k, arr.reduce((a, b) => a + b, 0) / arr.length])
  );
}

/**
 * Deterministic scoring: interest match + stream fit + trait alignment.
 * Returns top 3 careers sorted by match.
 */
export function getRecommendations(profile, aptitudeScores, traitSignals = {}) {
  const { interest } = profile;
  const stream = normalizeStream(profile.stream, profile.grade);

  const normApt = (v) => {
    if (typeof v !== 'number') return null;
    // 1..5 -> 0..1
    return Math.max(0, Math.min(1, (v - 1) / 4));
  };

  const avg = (arr) => {
    const xs = arr.filter((n) => typeof n === 'number' && !Number.isNaN(n));
    if (!xs.length) return 0;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  };

  const scored = CAREERS.map((career) => {
    const interestHit = career.matchTraits.includes(interest) ? 1 : 0;
    const streamHit = stream === 'undecided' ? 0 : career.streamFit.includes(stream) ? 1 : 0;

    const traitAptitudes = career.matchTraits.map((t) => normApt(aptitudeScores[t]));
    const traitSignalsArr = career.matchTraits.map((t) =>
      typeof traitSignals[t] === 'number' ? Math.max(0, Math.min(1, traitSignals[t])) : 0
    );

    const aptAvg = avg(traitAptitudes);
    const sigAvg = avg(traitSignalsArr);
    const traitAlignment = 0.65 * aptAvg + 0.35 * sigAvg;

    const score01 = 0.33 * interestHit + 0.22 * streamHit + 0.45 * traitAlignment;
    const score = Math.round(score01 * 100);
    const matchPercentage = Math.max(20, Math.min(98, score));

    return {
      ...career,
      matchPercentage,
      learningHub: LEARNING_HUB[career.id] || null,
    };
  });
  scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
  return scored.slice(0, 3);
}
