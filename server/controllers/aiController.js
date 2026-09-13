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
 * Deterministic local intelligent knowledge & navigation engine (offline / fallback)
 * Provides comprehensive platform guidance, verified notes explanations, summaries, and quizzes.
 * @param {Object} params
 * @returns {string}
 */
const generateLocalTutorResponse = ({ message = '', action, resource, user, systemStats }) => {
  const msgLower = (message || '').toLowerCase();

  // 1. Navigation & Website Guidance
  const isNavQuery = 
    msgLower.includes('navigate') || 
    msgLower.includes('how do i') || 
    msgLower.includes('where is') || 
    msgLower.includes('where can') || 
    msgLower.includes('how to') || 
    msgLower.includes('upload') || 
    msgLower.includes('profile') || 
    msgLower.includes('resource') || 
    msgLower.includes('website') || 
    msgLower.includes('admin') ||
    msgLower.includes('help');

  if (!resource && (isNavQuery || !action || action === 'chat')) {
    if (msgLower.includes('upload')) {
      return `### 📤 How to Upload Notes & Projects on LearnHub\n\n` +
        `Sharing your learning resources is simple:\n` +
        `1. **Log in** to your account (or register if you're new).\n` +
        `2. Click **[Upload](/upload)** in the top navigation bar.\n` +
        `3. Provide a clear title and **meaningful description** covering the core topics of your material.\n` +
        `4. Select the **Subject** (e.g., Programming, Mathematics, Science) and **Type** (PDF, Notes, Tutorial, Video, etc.).\n` +
        `5. Attach your file (PDF, TXT, DOC, Image up to 10MB) or provide an external URL.\n` +
        `6. Click **Upload Resource**. Our backend automatically extracts and indexes the key concepts for the AI tutor!\n\n` +
        `💡 *Tip: High quality, descriptive notes help other learners find and study your material effectively!*`;
    }

    if (msgLower.includes('programming') || msgLower.includes('code') || msgLower.includes('software')) {
      return `### 💻 Programming & Tech Resources\n\n` +
        `You can explore all coding tutorials, notes, and guides on our **[Resources Page](/resources?subject=Programming)**.\n\n` +
        `**Quick Steps:**\n` +
        `- Go to **[Resources](/resources)**.\n` +
        `- In the **Subject** dropdown, pick **Programming** or **Technology**.\n` +
        `- Filter by **Type** (Notes, PDF, Tutorial, Link) or type keywords in the search bar.`;
    }

    if (msgLower.includes('math') || msgLower.includes('calculus') || msgLower.includes('algebra')) {
      return `### 📐 Mathematics Resources\n\n` +
        `Looking for Math notes or formulas? Browse our collection here: **[Mathematics Resources](/resources?subject=Mathematics)**.\n\n` +
        `You can filter by PDF, handwritten notes, or interactive tutorials directly from the search bar!`;
    }

    if (msgLower.includes('profile') || msgLower.includes('saved') || msgLower.includes('bookmark')) {
      return `### 👤 Managing Your Profile & Saved Library\n\n` +
        `You can manage your learning journey anytime:\n` +
        `- Visit your **[Profile Dashboard](/profile)**.\n` +
        `- View your **Total Uploads**, **Saved Library**, and **Total Views**.\n` +
        `- Click **Edit Profile** to update your display name, bio, and avatar.\n` +
        `- When viewing any resource, click the **Save / Bookmark** button to store it in your personal library!`;
    }

    if (msgLower.includes('admin') || msgLower.includes('teacher approval')) {
      return `### 🛡️ Admin Dashboard & Teacher Approvals\n\n` +
        `- If you are an administrator, access the **[Admin Dashboard](/admin)** from the top navigation.\n` +
        `- You can review and approve pending teacher accounts, manage community resources, and oversee users.\n` +
        `- If you are a teacher waiting for approval, our administration team reviews applications promptly.`;
    }

    // General website navigation guide
    return `### 🎓 Welcome to LearnHub — Your Interactive Study Platform!\n\n` +
      `Here is a quick guide to help you navigate and get the most out of the website:\n\n` +
      `- **🏠 [Home](/)**: Browse featured study materials and explore the 9 subject categories (Mathematics, Science, Programming, Technology, History, Language, Arts, Business, and Other).\n` +
      `- **📚 [Browse Resources](/resources)**: Search materials by keywords, filter by subject category, or filter by format (PDF, Notes, Article, Tutorial, Video, Link).\n` +
      `- **📤 [Upload Materials](/upload)**: Share study guides, lecture notes, or project documentation with the community.\n` +
      `- **🤖 AI Study Partner**: Available on every resource to provide simple explanations, key summaries, and interactive quizzes!\n` +
      `- **👤 [Profile & Library](/profile)**: Track your contributions, bookmarks, and account settings.\n\n` +
      `Currently, LearnHub hosts **${systemStats?.totalResources || 'many'} learning resources** across all subjects! Let me know what you'd like to study today.`;
  }

  // 2. Resource-Specific Queries (Notes & Project Explanations)
  if (resource) {
    const title = resource.title || 'the resource';
    const subject = resource.subject || 'general study';
    const shortDesc = resource.shortDescription || resource.description || '';
    const topics = (resource.keyTopics && resource.keyTopics.length > 0) 
      ? resource.keyTopics.join(', ') 
      : `${subject}, ${title}`;

    if (action === 'explain' || msgLower.includes('explain') || msgLower.includes('what is this')) {
      return `### 💡 Concept Breakdown: ${title}\n\n` +
        `Here is an intuitive, easy-to-understand explanation of **${title}** in **${subject}**:\n\n` +
        `> **Overview**: ${shortDesc}\n\n` +
        `#### 🎯 Core Concepts Covered:\n` +
        `- **Key Focus Areas**: ${topics}\n` +
        `- **The Big Idea**: Think of this material as a structured blueprint. Rather than memorizing every tiny detail, focus on how these core principles connect and build upon one another.\n` +
        `- **Real-World Application**: Mastering these concepts gives you practical problem-solving tools in ${subject}.\n\n` +
        `✨ *Need to test your knowledge? Click the **Quiz Me** button above to try 3 practice questions!*`;
    }

    if (action === 'summarize' || msgLower.includes('summary') || msgLower.includes('takeaway')) {
      return `### 🧠 Key Takeaways: ${title}\n\n` +
        `Here is a structured executive summary of this material:\n\n` +
        `1. **Central Objective**: ${shortDesc}\n` +
        `2. **Primary Domain**: Classified under **${subject}** (${resource.type || 'Study Material'}).\n` +
        `3. **Key Subject Areas**: Highlights fundamental principles across **${topics}**.\n` +
        `4. **Practical Relevance**: Provides foundational frameworks essential for assignments, projects, and exams.\n` +
        `5. **Next Steps**: Review the attached material or external references to deepen your conceptual understanding.\n\n` +
        `📌 *Bookmark this resource to your [Saved Library](/profile) for quick access before tests!*`;
    }

    if (action === 'quiz' || msgLower.includes('quiz') || msgLower.includes('test me')) {
      const topicList = (resource.keyTopics && resource.keyTopics.length >= 2)
        ? resource.keyTopics
        : [subject, 'Fundamentals', 'Application'];

      return `### 📝 Quick Knowledge Check: ${title}\n\n` +
        `Test your understanding of the key concepts covered in these notes:\n\n` +
        `**Question 1**: What is the primary focus of "${title}"?\n` +
        `- A) General entertainment\n` +
        `- B) Core principles and concepts in ${subject} (${topicList[0] || 'core concepts'})\n` +
        `- C) Unrelated background noise\n` +
        `- D) None of the above\n\n` +
        `**Question 2**: Which key topic is highlighted in this resource?\n` +
        `- A) ${topicList[1] || 'Foundational Principles'}\n` +
        `- B) Baking recipes\n` +
        `- C) Ancient metallurgy only\n` +
        `- D) Fictional astronomy\n\n` +
        `**Question 3**: How should a student best apply the ideas in this study guide?\n` +
        `- A) Ignore all principles\n` +
        `- B) Connect the conceptual frameworks to practical problem solving in ${subject}\n` +
        `- C) Memorize without understanding\n` +
        `- D) Discard after one reading\n\n` +
        `---\n` +
        `*▼ Answers (Scroll to check):*\n` +
        `*1: B | 2: A | 3: B*`;
    }

    // Default chat on resource
    return `### 📚 Study Notes: ${title}\n\n` +
      `**Subject**: ${subject} | **Category**: ${resource.type || 'Resource'}\n\n` +
      `**Verified Breakdown**: ${shortDesc}\n\n` +
      `**Key Topics**: ${topics}\n\n` +
      `I am ready to help you study! You can ask me:\n` +
      `- "Explain this concept in simple terms"\n` +
      `- "Summarize the 5 main points"\n` +
      `- "Generate a quiz to test my memory"`;
  }

  // General fallback
  return `### 🤖 LearnHub AI Assistant\n\n` +
    `I am here to help you learn and navigate through LearnHub!\n\n` +
    `You can ask me how to:\n` +
    `- **Upload notes or projects** with clear descriptions\n` +
    `- **Find and filter resources** by subject or format (PDF, Tutorial, etc.)\n` +
    `- **Study and break down concepts** from your courses\n` +
    `- **Access your profile and bookmarks**\n\n` +
    `How can I assist your learning today?`;
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
        // Use verified shortDescription and keyTopics from backend breakdown to prevent unverified user description manipulation
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
Do NOT blindly parrot or repeat subjective, irrelevant, or unverified claims that might have been written in the raw user description.
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

    // 4. Build System Prompt for Cloud Gemini
    const systemPrompt = `
You are "LearnHub AI Assistant & Tutor", an intelligent, encouraging, and highly knowledgeable study companion and platform navigator.

PLATFORM NAVIGATION & ARCHITECTURE:
- Home ('/'): Browse featured resources, subject categories, and platform overview.
- Resources ('/resources'): Search materials, filter by 9 subjects (Mathematics, Science, Technology, Programming, History, Language, Arts, Business, Other) and 6 types (PDF, Video, Article, Tutorial, Link, Notes).
- Upload ('/upload'): Upload study guides, lecture notes, or project documentation with a meaningful description (at least 20 characters). Requires login.
- Profile ('/profile'): View personal uploads, saved library (bookmarks), and account settings. Requires login.
- Admin ('/admin'): Teacher approval, resource management, user management. Requires admin role.
- Auth: Login ('/login'), Sign Up ('/register').
Total resources on platform: ${totalResources}.

SECURITY & CONFIDENTIALITY RULES (STRICT & ABSOLUTE):
- If the user asks for ANY confidential data, system secrets, passwords, password hashes, JWT secrets, database connection strings, MongoDB credentials, API keys, private user details, or environment variables, you MUST answer strictly:
  "Sorry sir, I can't help with that."
- Never disclose internal tokens, credentials, or private keys under any circumstance.

STUDY GUIDELINES:
- Explain complex topics with intuitive analogies, structured bullet points, and step-by-step clarity.
- Keep formatting clean and visually appealing using Markdown (bold text, bullet points, headers).
- If asked for a quiz, provide 3 multiple choice questions with answers hidden at the bottom.
${resourceContext ? resourceContext : 'The student is asking a general learning or platform navigation question.'}
`;

    // Map conversation history
    const messages = [
      ...chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    // Handle quick action shortcuts
    if (action === 'explain') {
      messages.push({ role: 'user', content: `Can you explain the main concepts of this resource "${resourceTitle}" in simple, intuitive terms, like I am 10 years old?` });
    } else if (action === 'summarize') {
      messages.push({ role: 'user', content: `Please provide a structured summary of "${resourceTitle}" listing 5 key takeaways and why they matter.` });
    } else if (action === 'quiz') {
      messages.push({ role: 'user', content: `Please generate a fun, interactive 3-question multiple-choice quiz based on "${resourceTitle}" to test my understanding. Write the answers at the very bottom.` });
    } else {
      messages.push({ role: 'user', content: message });
    }

    let responseText = '';
    let usedModel = 'Gemini';

    // 5. Try Google Gemini API via native fetch
    try {
      responseText = await callGemini(systemPrompt, messages);
    } catch (geminiError) {
      console.warn('[AI Tutor] Gemini Cloud call unavailable or failed (' + geminiError.message + '). Seamlessly using Local Intelligent Engine...');
      
      // 6. Seamless Local Intelligent Fallback Engine
      responseText = generateLocalTutorResponse({
        message,
        action,
        resource,
        user: req.user,
        systemStats
      });
      usedModel = 'LocalStudyEngine';
    }

    // 7. Security Output Sanitization
    responseText = sanitizeOutput(responseText);

    // 8. Optional ElevenLabs Voice Synthesis (if enabled, key present, and fetch succeeds)
    let audioBase64 = null;
    if (voiceEnabled && process.env.ELEVENLABS_API_KEY) {
      try {
        const cleanSpeechText = responseText
          .replace(/[*#_`~]/g, '')
          .substring(0, 300);

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
