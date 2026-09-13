const mongoose = require('mongoose');
const Resource = require('../models/Resource');

/**
 * Check if a query targets confidential or sensitive system/user data
 * @param {string} text
 * @returns {boolean}
 */
const isConfidentialQuery = (text) => {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();

  const sensitiveKeywords = [
    'password', 'passwd', 'credential', 'jwt_secret', 'jwt secret',
    'api_key', 'apikey', 'api key', 'secret_key', 'secret key',
    'mongo_uri', 'mongodb://', 'database uri', 'connection string',
    'db password', 'db uri', 'private key', 'token secret',
    '.env', 'dotenv', 'environment variable', 'env var',
    'admin hash', 'hash password', 'user email list', 'user database',
    'shadow file', 'etc/passwd', 'system secret', 'confidential data',
    'leak secret', 'reveal secret', 'show secret', 'give me passwords',
    'give me credentials', 'dump database', 'internal token'
  ];

  return sensitiveKeywords.some(keyword => lower.includes(keyword));
};

/**
 * Sanitize AI output to guarantee no leaked environment secrets or keys
 * @param {string} text
 * @returns {string}
 */
const sanitizeOutput = (text) => {
  if (!text) return '';

  const secretsToMask = [
    process.env.JWT_SECRET,
    process.env.GEMINI_API_KEY,
    process.env.OPENAI_API_KEY,
    process.env.ELEVENLABS_API_KEY,
    process.env.MONGO_URI
  ].filter(s => s && s.length > 5);

  let sanitized = text;
  for (const secret of secretsToMask) {
    if (sanitized.includes(secret)) {
      return "Sorry sir, I can't help with that.";
    }
  }

  // Regex checks for leaked tokens or connection strings
  if (/mongodb(\+srv)?:\/\/[^\s]+/i.test(sanitized) || /AIzaSy[A-Za-z0-9_-]{33}/i.test(sanitized)) {
    return "Sorry sir, I can't help with that.";
  }

  return sanitized;
};

/**
 * Call Google Gemini API using native fetch
 * @param {string} systemPrompt
 * @param {Array} messagesList
 * @returns {Promise<string>}
 */
const callGemini = async (systemPrompt, messagesList) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Map conversation history to Gemini format
  const contents = messagesList.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: 1000
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const response = await fetch(url, {
    method: 'POST',
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    throw new Error(`Gemini API returned status ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!candidateText) {
    throw new Error('Gemini response did not contain text parts');
  }

  return candidateText;
};

/**
 * Academic Knowledge Base for Self-Contained Offline / Backend Answering
 * Covers Computer Science, Mathematics, Science, Engineering, Business, and Study Skills.
 */
const ACADEMIC_TOPICS = [
  // 1. Computer Science & Software
  {
    keywords: ['data structure', 'array', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash table', 'hashmap', 'binary search tree'],
    title: 'Data Structures Fundamentals',
    subject: 'Programming',
    answer: `### 🌲 Data Structures Explained\n\n` +
      `Data structures organize and store data for efficient access and modification:\n\n` +
      `- **Array**: Contiguous memory allocation with $O(1)$ random access by index, but $O(n)$ insertion/deletion.\n` +
      `- **Linked List**: Nodes linked by pointers. Efficient $O(1)$ insertions/deletions at known positions; $O(n)$ access.\n` +
      `- **Stack**: Last-In, First-Out (LIFO). Key operations: \`push()\` and \`pop()\` in $O(1)$. Used in function call stacks, undo mechanisms, and expression parsing.\n` +
      `- **Queue**: First-In, First-Out (FIFO). Key operations: \`enqueue()\` and \`dequeue()\` in $O(1)$. Used in task scheduling and breadth-first search (BFS).\n` +
      `- **Hash Table / Map**: Maps keys to values using hash functions for average $O(1)$ lookup, insert, and delete.\n` +
      `- **Binary Search Tree (BST)**: Hierarchical structure where left child < parent < right child. Offers average $O(\\log n)$ search and insertion.\n\n` +
      `💡 *Explore materials on this topic under **[Programming Resources](/resources?subject=Programming)**!*`
  },
  {
    keywords: ['algorithm', 'sorting', 'bubble sort', 'merge sort', 'quicksort', 'binary search', 'big o', 'time complexity'],
    title: 'Algorithms & Complexity Analysis',
    subject: 'Programming',
    answer: `### ⚡ Algorithms & Time Complexity ($O$ Notation)\n\n` +
      `Algorithms are step-by-step procedures for solving problems. Efficiency is measured using Big-O notation:\n\n` +
      `- **Binary Search**: Searches a sorted array by repeatedly halving the search interval. Time complexity: **$O(\\log n)$**.\n` +
      `- **Merge Sort**: Divide-and-conquer algorithm that divides the array into halves, sorts them, and merges back. Guaranteed **$O(n \\log n)$**.\n` +
      `- **Quick Sort**: Selects a pivot element and partitions the array around the pivot. Average: **$O(n \\log n)$**; worst case: $O(n^2)$.\n` +
      `- **Bubble / Insertion Sort**: Simple comparison sorts with **$O(n^2)$** average/worst case.\n\n` +
      `**Common Complexity Hierarchy (Fastest to Slowest):**\n` +
      `$$O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2) < O(2^n) < O(n!)$$\n\n` +
      `💡 *Check out algorithm study guides under **[Programming Resources](/resources?subject=Programming)**.*`
  },
  {
    keywords: ['python', 'learn python', 'python code', 'python basics', 'def ', 'list comprehension'],
    title: 'Python Programming Essentials',
    subject: 'Programming',
    answer: `### 🐍 Python Programming Essentials\n\n` +
      `Python is a high-level, interpreted language renowned for clean readability and massive ecosystem:\n\n` +
      `- **Core Data Types**: \`int\`, \`float\`, \`str\`, \`bool\`, \`list\` (mutable), \`tuple\` (immutable), \`dict\` (key-value), \`set\` (unique values).\n` +
      `- **Functions**: Defined with \`def my_func(param):\`, supports default args, \`*args\`, and \`**kwargs\`.\n` +
      `- **List Comprehensions**: Elegant syntax for mapping & filtering: \`[x**2 for x in nums if x % 2 == 0]\`.\n` +
      `- **Object-Oriented Programming**: Defined using \`class MyClass:\` with constructor \`__init__(self, ...)\`.\n` +
      `- **Libraries**: NumPy & Pandas (Data Science), FastAPI & Flask (Web APIs), PyTorch & TensorFlow (Machine Learning).\n\n` +
      `💡 *Want hands-on Python guides? Search for **Python** on our **[Resources Page](/resources?search=Python)**!*`
  },
  {
    keywords: ['javascript', 'js', 'react', 'vue', 'node', 'typescript', 'frontend', 'web development', 'html', 'css'],
    title: 'Modern Web Development & JavaScript',
    subject: 'Technology',
    answer: `### 🌐 Modern Web Development (Frontend & Backend)\n\n` +
      `Modern web architectures integrate responsive clients with robust REST/GraphQL backends:\n\n` +
      `- **HTML5 & CSS3**: Semantic structure (\`<main>\`, \`<article>\`, \`<nav>\`) with modern CSS Grid, Flexbox, and Tailwind CSS.\n` +
      `- **JavaScript / TypeScript**: Event-driven, single-threaded asynchronous execution using Promises and \`async/await\`.\n` +
      `- **Frontend Frameworks (Vue.js / React)**: Component-based architectures with reactive state management (Pinia / Redux) and virtual DOM diffing.\n` +
      `- **Backend (Node.js & Express)**: Lightweight, non-blocking I/O event loops ideal for JSON REST APIs and microservices.\n` +
      `- **Database Layer**: Relational (PostgreSQL, MySQL) or Document-oriented (MongoDB with Mongoose).\n\n` +
      `💡 *Browse web development resources under **[Technology Resources](/resources?subject=Technology)**!*`
  },

  // 2. Mathematics
  {
    keywords: ['calculus', 'derivative', 'integral', 'differentiation', 'integration', 'limit', 'chain rule'],
    title: 'Calculus: Derivatives & Integrals',
    subject: 'Mathematics',
    answer: `### 📐 Calculus Principles & Applications\n\n` +
      `Calculus studies continuous change through two complementary branches connected by the **Fundamental Theorem of Calculus**:\n\n` +
      `1. **Differential Calculus (Derivatives)**:\n` +
      `   - Measures the instantaneous rate of change (the slope of a tangent line).\n` +
      `   - **Power Rule**: $\\frac{d}{dx}[x^n] = n x^{n-1}$\n` +
      `   - **Product Rule**: $(uv)' = u'v + uv'$\n` +
      `   - **Chain Rule**: $\\frac{d}{dx}[f(g(x))] = f'(g(x)) \\cdot g'(x)$\n\n` +
      `2. **Integral Calculus (Integrals)**:\n` +
      `   - Computes accumulation, total change, and area under curves.\n` +
      `   - **Power Rule of Integration**: $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$ (for $n \\neq -1$)\n` +
      `   - **Fundamental Theorem**: $\\int_a^b f'(x) dx = f(b) - f(a)$\n\n` +
      `💡 *Need math exercises? Browse **[Mathematics Resources](/resources?subject=Mathematics)**!*`
  },
  {
    keywords: ['linear algebra', 'matrix', 'vector', 'eigenvalue', 'eigenvector', 'determinant', 'dot product'],
    title: 'Linear Algebra & Vector Spaces',
    subject: 'Mathematics',
    answer: `### 🔢 Linear Algebra & Vector Spaces\n\n` +
      `Linear Algebra forms the mathematical bedrock for computer graphics, physics simulations, and machine learning:\n\n` +
      `- **Vectors**: Geometric objects with magnitude and direction; represented algebraically as coordinate tuples.\n` +
      `- **Dot Product**: $\\mathbf{u} \\cdot \\mathbf{v} = |\\mathbf{u}||\\mathbf{v}| \\cos(\\theta)$. Evaluates projection and orthogonality.\n` +
      `- **Matrices**: Represent linear transformations between vector spaces. Matrix multiplication transforms coordinates.\n` +
      `- **Determinant**: A scalar representing the scaling factor of the transformation (volume change); $\\det(A) = 0$ implies singular/non-invertible matrix.\n` +
      `- **Eigenvalues & Eigenvectors**: Satisfy $A\\mathbf{v} = \\lambda\\mathbf{v}$. Vectors that only scale during the transformation without changing direction.\n\n` +
      `💡 *Access mathematical course notes on our **[Mathematics Resources](/resources?subject=Mathematics)**.*`
  },

  // 3. Science
  {
    keywords: ['physics', 'newton', 'gravity', 'thermodynamics', 'force', 'energy', 'momentum', 'velocity', 'acceleration'],
    title: 'Classical Physics & Mechanics',
    subject: 'Science',
    answer: `### 🚀 Fundamental Laws of Physics\n\n` +
      `Classical mechanics models the physical interaction of mass, energy, and forces:\n\n` +
      `- **Newton's First Law (Inertia)**: An object remains at rest or in uniform linear motion unless acted on by an external net force.\n` +
      `- **Newton's Second Law**: Net force equals the rate of change of momentum: **$F = ma$**.\n` +
      `- **Newton's Third Law**: For every action, there is an equal and opposite reaction.\n` +
      `- **Work & Energy**: Work done $W = \\mathbf{F} \\cdot \\mathbf{d}$. The total energy in an isolated system is strictly conserved: $E_k + E_p = \\text{constant}$.\n` +
      `- **Universal Gravitation**: Two masses attract each other with force $F = G \\frac{m_1 m_2}{r^2}$.\n\n` +
      `💡 *Explore physics lecture notes on our **[Science Resources](/resources?subject=Science)**!*`
  },
  {
    keywords: ['chemistry', 'atom', 'periodic table', 'chemical bond', 'molecule', 'acid', 'base', 'reaction'],
    title: 'Chemistry Principles',
    subject: 'Science',
    answer: `### 🧪 Chemistry: Matter, Bonding & Reactions\n\n` +
      `Chemistry investigates the composition, structure, and changes of matter:\n\n` +
      `- **Atomic Structure**: Protons and neutrons reside in the nucleus; electrons occupy quantized orbitals.\n` +
      `- **Chemical Bonds**:\n` +
      `  - *Covalent*: Mutual sharing of electron pairs between nonmetals (e.g., $H_2O$, $CO_2$).\n` +
      `  - *Ionic*: Electrostatic attraction between oppositely charged ions formed by electron transfer (e.g., $NaCl$).\n` +
      `  - *Metallic*: Delocalized "sea of electrons" shared across metal cations.\n` +
      `- **Thermodynamics & Kinetics**: Reactions occur spontaneously when change in Gibbs Free Energy $\\Delta G = \\Delta H - T\\Delta S < 0$.\n` +
      `- **pH Scale**: Measures hydronium concentration: $\\text{pH} = -\\log[H^+]$. Acidic ($< 7$), Neutral ($7$), Basic ($> 7$).\n\n` +
      `💡 *Review chemistry study guides under **[Science Resources](/resources?subject=Science)**.*`
  },
  {
    keywords: ['biology', 'photosynthesis', 'dna', 'cell', 'mitosis', 'genetics', 'rna', 'protein synthesis', 'evolution'],
    title: 'Biology & Life Sciences',
    subject: 'Science',
    answer: `### 🧬 Biological Systems & Cell Biology\n\n` +
      `Biology explores living organisms, cellular mechanisms, and genetic inheritance:\n\n` +
      `- **The Cell**: Basic unit of life. Prokaryotes lack a membrane-bound nucleus; Eukaryotes possess organelles (nucleus, mitochondria, ribosomes).\n` +
      `- **Photosynthesis**: Sunlight, carbon dioxide, and water are converted into glucose and oxygen in chloroplasts:\n` +
      `  $$6CO_2 + 6H_2O + \\text{light} \\rightarrow C_6H_{12}O_6 + 6O_2$$\n` +
      `- **Cellular Respiration**: Glucose breakdown in mitochondria producing ATP: $C_6H_{12}O_6 + 6O_2 \\rightarrow 6CO_2 + 6H_2O + 36\\text{ATP}$.\n` +
      `- **Central Dogma of Molecular Biology**: DNA replicates $\\rightarrow$ transcribed into mRNA $\\rightarrow$ translated into functional proteins at ribosomes.\n` +
      `- **Mitosis vs. Meiosis**: Mitosis produces 2 identical somatic cells; Meiosis produces 4 genetically diverse haploid gametes.\n\n` +
      `💡 *Check out biology guides on **[Science Resources](/resources?subject=Science)**.*`
  },

  // 4. Study Skills & Exam Strategy
  {
    keywords: ['study tip', 'how to study', 'exam prep', 'remember', 'memorize', 'feynman', 'active recall', 'spaced repetition'],
    title: 'Effective Evidence-Based Study Methods',
    subject: 'Other',
    answer: `### 🎯 High-Impact Learning Techniques\n\n` +
      `Cognitive science highlights three top methods for deep retention and mastery:\n\n` +
      `1. **Active Recall**: Test your memory rather than passively re-reading notes. After reading a section, close the book and write down everything you remember.\n` +
      `2. **Spaced Repetition**: Review key concepts across increasing intervals (e.g., Day 1, Day 3, Day 7, Day 14, Day 30) to flatten Ebbinghaus's forgetting curve.\n` +
      `3. **The Feynman Technique**:\n` +
      `   - Choose a complex concept.\n` +
      `   - Explain it in simple terms as if teaching a 10-year-old.\n` +
      `   - Identify gaps where your explanation broke down.\n` +
      `   - Revisit the source notes until you can explain it seamlessly without jargon.\n\n` +
      `💡 *You can click **Quiz Me** on any resource to practice active recall immediately!*`
  }
];

/**
 * Deterministic local intelligent knowledge, database search & navigation engine (offline / self-contained)
 * Operates without requiring paid external APIs for ChatGPT or Claude.
 * @param {Object} params
 * @returns {Promise<string>}
 */
const generateLocalTutorResponse = async ({ message = '', action, resource, user, systemStats }) => {
  const msgLower = (message || '').toLowerCase().trim();

  // 1. If viewing a specific resource, provide dedicated contextual answers
  if (resource) {
    const title = resource.title || 'this resource';
    const subject = resource.subject || 'General Study';
    const shortDesc = resource.shortDescription || resource.description || '';
    const topics = (resource.keyTopics && resource.keyTopics.length > 0) 
      ? resource.keyTopics.join(', ') 
      : `${subject}, ${title}`;
    const fileLink = resource.file ? `[Download File](/api/resources/${resource._id}/download)` : '';

    if (action === 'explain' || msgLower.includes('explain') || msgLower.includes('what is this') || msgLower.includes('how does')) {
      return `### 💡 Concept Breakdown: ${title}\n\n` +
        `Here is an intuitive, structured breakdown of **${title}** in **${subject}**:\n\n` +
        `> **Overview**: ${shortDesc}\n\n` +
        `#### 🎯 Key Topics & Pillars:\n` +
        `- **Core Subject Area**: ${subject} (${resource.type || 'Document'})\n` +
        `- **Concepts Covered**: ${topics}\n` +
        `- **Practical Relevance**: Connects theoretical foundations with practical exercises and course syllabi.\n\n` +
        `✨ *Need to test yourself? Use the **Quiz Me** button above to take a 3-question knowledge check!*`;
    }

    if (action === 'summarize' || msgLower.includes('summary') || msgLower.includes('takeaway') || msgLower.includes('main point')) {
      return `### 🧠 Key Takeaways: ${title}\n\n` +
        `Here is an executive summary of the essential points:\n\n` +
        `1. **Focus Area**: ${shortDesc}\n` +
        `2. **Classification**: Official **${subject}** study material in **${resource.type || 'Study Guide'}** format.\n` +
        `3. **Key Subject Matter**: ${topics}.\n` +
        `4. **Exam Application**: Review the definitions, formulas, and practical examples before exams.\n` +
        (fileLink ? `5. **Attached Material**: ${fileLink} for offline reading.\n\n` : '\n\n') +
        `📌 *Tip: Bookmark this resource to your [Profile Library](/profile) for fast retrieval!*`;
    }

    if (action === 'quiz' || msgLower.includes('quiz') || msgLower.includes('test me')) {
      const topicList = (resource.keyTopics && resource.keyTopics.length >= 2)
        ? resource.keyTopics
        : [subject, 'Fundamentals', 'Application'];

      return `### 📝 Knowledge Check: ${title}\n\n` +
        `Test your understanding of the concepts in this material:\n\n` +
        `**Question 1**: What primary objective is addressed by "${title}"?\n` +
        `- A) Unrelated external topics\n` +
        `- B) Core concepts and practical frameworks in ${subject}\n` +
        `- C) Entertainment only\n` +
        `- D) None of the above\n\n` +
        `**Question 2**: Which key subject domain does this resource cover?\n` +
        `- A) ${topicList[0] || 'Fundamentals'}\n` +
        `- B) Ancient metallurgy only\n` +
        `- C) Fictional linguistics\n` +
        `- D) Cooking recipes\n\n` +
        `**Question 3**: What is the most effective way to retain the information in this guide?\n` +
        `- A) Discard notes immediately\n` +
        `- B) Active recall, self-testing, and connecting principles to ${subject} exercises\n` +
        `- C) Passive skim without practice\n` +
        `- D) Memorizing arbitrary terms without comprehension\n\n` +
        `---\n` +
        `*▼ Answers (Scroll to check):*\n` +
        `*1: B | 2: A | 3: B*`;
    }

    // Default chat on specific resource
    return `### 📚 Study Notes: ${title}\n\n` +
      `**Subject**: ${subject} | **Format**: ${resource.type || 'Resource'}\n\n` +
      `**Summary**: ${shortDesc}\n\n` +
      `**Key Topics**: ${topics}\n\n` +
      `How can I assist your study session? You can ask:\n` +
      `- *"Explain this concept simply"*\n` +
      `- *"Summarize the top 5 takeaways"*\n` +
      `- *"Generate a quiz based on these notes"*`;
  }

  // 2. Search Database for Matching Resources
  try {
    if (mongoose.connection?.readyState === 1 && msgLower.length > 2) {
      const words = msgLower.split(/\s+/).filter(w => w.length > 2 && !['the', 'and', 'for', 'are', 'what', 'how', 'who', 'where', 'can', 'you', 'give', 'show'].includes(w));
      if (words.length > 0) {
        const regexQueries = words.map(w => ({
          $or: [
            { title: { $regex: w, $options: 'i' } },
            { subject: { $regex: w, $options: 'i' } },
            { description: { $regex: w, $options: 'i' } },
            { keyTopics: { $regex: w, $options: 'i' } }
          ]
        }));

        const matchingResources = await Resource.find({ $or: regexQueries })
          .select('title subject type shortDescription description')
          .limit(4);

        if (matchingResources.length > 0) {
          let dbSearchResult = `### 📚 Found ${matchingResources.length} Matching Resource(s) on LearnHub:\n\n`;
          matchingResources.forEach((res, i) => {
            dbSearchResult += `${i + 1}. **[${res.title}](/resources/${res._id})** — *${res.subject}* (${res.type})\n` +
              `   > ${res.shortDescription || res.description?.substring(0, 100) || 'Study guide'}\n\n`;
          });
          dbSearchResult += `💡 *Click any title above to open the full resource, download files, or take interactive quizzes!*`;

          // If the query is specifically a search, return DB results right away
          if (msgLower.includes('find') || msgLower.includes('search') || msgLower.includes('show me') || msgLower.includes('looking for') || msgLower.includes('do you have')) {
            return dbSearchResult;
          }
        }
      }
    }
  } catch (dbSearchErr) {
    console.warn('[AI Tutor] DB Search error:', dbSearchErr.message);
  }

  // 3. Match against Academic Knowledge Base (Computer Science, Math, Science, Study Skills)
  for (const item of ACADEMIC_TOPICS) {
    const isMatch = item.keywords.some(k => msgLower.includes(k));
    if (isMatch) {
      return item.answer;
    }
  }

  // 4. Platform Navigation & Administration Guidance
  if (msgLower.includes('upload') || msgLower.includes('how to share') || msgLower.includes('add file')) {
    return `### 📤 How to Upload Learning Resources on LearnHub\n\n` +
      `Sharing notes, guides, and documentation is straightforward:\n` +
      `1. **Sign In**: Ensure you are logged into your account.\n` +
      `2. **Navigate to Upload**: Click **[Upload](/upload)** in the navigation bar.\n` +
      `3. **Document Details**: Enter a clear Title and meaningful Description covering what the material teaches.\n` +
      `4. **Categorization**: Select one of the 9 Subjects (e.g., Programming, Mathematics, Science) and the resource Type (PDF, Notes, Tutorial, Video, etc.).\n` +
      `5. **Attach File**: Upload your PDF, DOCX, TXT, or Image (up to 10MB) or provide an external URL.\n` +
      `6. **Publish**: Click **Upload Resource**. The backend indexes and prepares the material for instant study!\n\n` +
      `💡 *Descriptive notes enable other learners and our AI tutor to find and break down your material accurately.*`;
  }

  if (msgLower.includes('admin') || msgLower.includes('teacher approval') || msgLower.includes('educator status')) {
    return `### 🛡️ Institutional Administration & Teacher Approvals\n\n` +
      `- **Admin Portal**: Administrators can manage the platform at **[Admin Dashboard](/admin)**.\n` +
      `- **Teacher Applications**: When an educator registers on LearnHub, their account enters pending status until approved by an administrator.\n` +
      `- **User Management**: Administrators can provision accounts directly, activate educator clearances, and manage user access.\n` +
      `- **Document Management**: Administrators can audit repository materials, preview documents, and permanently remove outdated files.\n` +
      `- **Admin Credentials**: Institutional administrators sign in using their designated administrator account.`;
  }

  if (msgLower.includes('download') || msgLower.includes('save') || msgLower.includes('like') || msgLower.includes('guest')) {
    return `### 💾 Downloading & Saving Resources on LearnHub\n\n` +
      `- **Direct Download**: On any resource with an attached file, click **Download** to save the PDF, document, or code file directly to your device.\n` +
      `- **Public / Guest Access**: You can browse, read, download, and like documents even without creating an account!\n` +
      `- **Saved Library**: Logged-in users can click the **Bookmark / Save** button on any resource to keep it organized in their personal **[Profile Library](/profile)**.\n` +
      `- **Interactive Previews**: Click **Preview** on supported documents to inspect and study them directly in the browser.`;
  }

  if (msgLower.includes('quiz') || msgLower.includes('test')) {
    return `### 📝 General Knowledge Quiz\n\n` +
      `Test your foundational knowledge across key subjects:\n\n` +
      `**Question 1**: Which data structure follows the First-In, First-Out (FIFO) principle?\n` +
      `- A) Stack\n` +
      `- B) Queue\n` +
      `- C) Binary Search Tree\n` +
      `- D) Max Heap\n\n` +
      `**Question 2**: What is the derivative of $x^3$ with respect to $x$?\n` +
      `- A) $3x^2$\n` +
      `- B) $x^2$\n` +
      `- C) $3x$\n` +
      `- D) $6x$\n\n` +
      `**Question 3**: What organelle is responsible for generating cellular energy (ATP)?\n` +
      `- A) Ribosome\n` +
      `- B) Endoplasmic Reticulum\n` +
      `- C) Mitochondria\n` +
      `- D) Golgi Apparatus\n\n` +
      `---\n` +
      `*▼ Answers (Scroll to check):*\n` +
      `*1: B | 2: A | 3: C*`;
  }

  // 5. General Fallback & Platform Overview
  return `### 🎓 Welcome to LearnHub — Your Academic Study Partner!\n\n` +
    `I am your built-in AI learning assistant, operating directly on the LearnHub platform.\n\n` +
    `**Here are some things you can ask me:**\n` +
    `- **Academic Explanations**: Ask me about *Calculus, Big-O Notation, Binary Search, Python, Classical Mechanics, Photosynthesis, or Chemistry*.\n` +
    `- **Resource Discovery**: Ask me to find notes on *Programming, Mathematics, Science, Technology*, and more.\n` +
    `- **Platform Navigation**: Ask how to *upload notes, download materials, manage your profile*, or use *educator approval features*.\n` +
    `- **Knowledge Quizzes**: Ask me to test your understanding with interactive study questions!\n\n` +
    `Currently, LearnHub hosts **${systemStats?.totalResources || 'multiple'} learning documents**. What would you like to explore today?`;
};

/**
 * @desc    Ask the AI Tutor & Website Navigator
 * @route   POST /api/ai/ask
 * @access  Public / Optional Auth
 */
const askTutor = async (req, res) => {
  try {
    const { resourceId, message = '', chatHistory = [], action = 'chat', voiceEnabled = false } = req.body;

    // 1. Check Confidentiality Guardrail FIRST
    if (isConfidentialQuery(message)) {
      console.warn(`[Security Alert] Confidential data query intercepted: "${message.substring(0, 80)}"`);
      return res.json({
        success: true,
        text: "Sorry sir, I can't help with that.",
        audio: null,
        modelUsed: 'SecurityGuardrail'
      });
    }

    if (!message && action === 'chat') {
      return res.status(400).json({ message: 'Please provide a message or choose an action' });
    }

    // 2. Fetch resource context if studying a specific resource
    let resource = null;
    let resourceTitle = '';
    let resourceContext = '';

    if (resourceId && mongoose.connection?.readyState === 1) {
      resource = await Resource.findById(resourceId);
      if (resource) {
        resourceTitle = resource.title;
        const verifiedSummary = resource.shortDescription || resource.description;
        const keyTopicsStr = resource.keyTopics?.length > 0 ? resource.keyTopics.join(', ') : 'Not specified';

        resourceContext = `
The student is currently viewing/studying the following learning resource:
- Title: ${resource.title}
- Subject: ${resource.subject}
- Format: ${resource.type}
- Verified Short Description: ${verifiedSummary}
- Key Topics: ${keyTopicsStr}
${resource.url ? `- External Link: ${resource.url}` : ''}

--- EXTRACTED CONTENT FROM ATTACHED MATERIAL ---
${(resource.content || '').substring(0, 20000) || '(No attached text content extracted)'}
------------------------------------------------
IMPORTANT INSTRUCTION FOR RESOURCE:
Base your explanation strictly on the verified short description, key topics, and extracted material.
`;
      }
    }

    // 3. Collect platform statistics for website navigation context
    let totalResources = 0;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        totalResources = await Resource.countDocuments();
      }
    } catch (dbErr) {
      console.warn('[AI Tutor] Could not count resources:', dbErr.message);
    }

    const systemStats = { totalResources };

    let responseText = '';
    let usedModel = 'LocalKnowledgeEngine';

    // 4. Try Google Gemini if configured, otherwise immediately use Local Knowledge Engine
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10) {
      try {
        const systemPrompt = `
You are "LearnHub AI Assistant & Tutor", an intelligent, encouraging, and highly knowledgeable study companion and platform navigator.
PLATFORM NAVIGATION:
- Home ('/'), Resources ('/resources'), Upload ('/upload'), Profile ('/profile'), Admin ('/admin').
Total resources on platform: ${totalResources}.
${resourceContext ? resourceContext : 'The student is asking a general learning or platform navigation question.'}
`;
        const messages = [
          ...chatHistory.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        ];
        if (action === 'explain') {
          messages.push({ role: 'user', content: `Can you explain the main concepts of this resource "${resourceTitle}" in simple terms?` });
        } else if (action === 'summarize') {
          messages.push({ role: 'user', content: `Please provide a structured summary of "${resourceTitle}" listing 5 key takeaways.` });
        } else if (action === 'quiz') {
          messages.push({ role: 'user', content: `Please generate a fun, interactive 3-question multiple-choice quiz based on "${resourceTitle}". Write answers at the bottom.` });
        } else {
          messages.push({ role: 'user', content: message });
        }

        responseText = await callGemini(systemPrompt, messages);
        usedModel = 'Gemini';
      } catch (geminiError) {
        console.warn('[AI Tutor] Gemini unavailable (' + geminiError.message + '). Using Local Knowledge Engine...');
        responseText = await generateLocalTutorResponse({
          message,
          action,
          resource,
          user: req.user,
          systemStats
        });
      }
    } else {
      // Direct Local Knowledge & Search Engine without needing any external APIs
      responseText = await generateLocalTutorResponse({
        message,
        action,
        resource,
        user: req.user,
        systemStats
      });
    }

    // 5. Security Output Sanitization
    responseText = sanitizeOutput(responseText);

    // 6. Optional ElevenLabs Voice Synthesis (if enabled and key present)
    let audioBase64 = null;
    if (voiceEnabled && process.env.ELEVENLABS_API_KEY) {
      try {
        const cleanSpeechText = responseText.replace(/[*#_`~]/g, '').substring(0, 300);
        const elevenLabsUrl = 'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM';
        const voiceRes = await fetch(elevenLabsUrl, {
          method: 'POST',
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: cleanSpeechText,
            model_id: 'eleven_monolingual_v1',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        });

        if (voiceRes.ok) {
          const buffer = await voiceRes.arrayBuffer();
          audioBase64 = Buffer.from(buffer).toString('base64');
        }
      } catch (voiceError) {
        console.warn('[AI Tutor] Voice generation failed:', voiceError.message);
      }
    }

    console.log(`[AI Tutor] Responded successfully using ${usedModel}`);

    res.json({
      success: true,
      text: responseText,
      audio: audioBase64,
      modelUsed: usedModel
    });

  } catch (error) {
    console.error('AI Tutor Unexpected Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI Tutor experienced an error',
      error: error.message
    });
  }
};

module.exports = {
  askTutor,
  isConfidentialQuery,
  sanitizeOutput
};
