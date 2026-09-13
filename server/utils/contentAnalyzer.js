/**
 * Content Analyzer & Breakdown Utility
 * - Validates that uploaded resource descriptions are meaningful and substantive.
 * - Analyzes notes, documents, and project materials to create verified short descriptions and key topics.
 * - Prevents AI from blindly trusting or parroting raw user-submitted descriptions.
 */

/**
 * Validate that a user-provided resource description is meaningful
 * @param {string} description
 * @returns {{ valid: boolean, reason?: string }}
 */
const validateMeaningfulDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { valid: false, reason: 'Description is required.' };
  }

  const trimmed = description.trim();

  // 1. Minimum character length (at least 20 characters)
  if (trimmed.length < 20) {
    return {
      valid: false,
      reason: 'Description is too brief. Please provide at least 20 characters explaining what concepts or topics this resource covers.'
    };
  }

  // 2. Minimum word count (at least 4 distinct or relevant words)
  const words = trimmed.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 4) {
    return {
      valid: false,
      reason: 'Description must contain at least 4 words describing the study materials or project contents.'
    };
  }

  // 3. Check for obvious keyboard smashing or repetitive single characters (e.g., "aaaaaaaaa", "asdfasdfasdf")
  if (/(.)\1{4,}/i.test(trimmed)) {
    return {
      valid: false,
      reason: 'Description appears to contain repetitive keystrokes. Please provide a clear, readable summary.'
    };
  }

  const lower = trimmed.toLowerCase();
  const spamPatterns = [
    /^asdf+$/i,
    /^(test\s*)+$/i,
    /^(lorem\s*ipsum\s*)+$/i,
    /^[1234567890\s]+$/,
    /^([a-z])\1+$/i
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(lower)) {
      return {
        valid: false,
        reason: 'Please provide a genuine description of the learning materials rather than placeholder text.'
      };
    }
  }

  return { valid: true };
};

/**
 * Clean and extract prominent topics/keywords from text
 * @param {string} text
 * @param {number} maxTopics
 * @returns {string[]}
 */
const extractKeywords = (text, maxTopics = 5) => {
  if (!text) return [];

  const stopWords = new Set([
    'about', 'above', 'after', 'again', 'against', 'all', 'and', 'any', 'are', 'because',
    'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did',
    'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had',
    'has', 'have', 'having', 'here', 'how', 'into', 'itself', 'just', 'more', 'most',
    'not', 'off', 'once', 'only', 'other', 'ought', 'our', 'ours', 'out', 'over',
    'own', 'same', 'should', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs',
    'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through',
    'too', 'under', 'until', 'very', 'was', 'were', 'what', 'when', 'where', 'which',
    'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'will',
    'can', 'also', 'file', 'content', 'notes', 'resource', 'learning', 'chapter', 'page'
  ]);

  const cleanWords = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopWords.has(w));

  const freq = {};
  for (const word of cleanWords) {
    freq[word] = (freq[word] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTopics)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));
};

/**
 * Algorithmic extractive breakdown (offline fallback)
 * Generates an objective, factual short description and extracts key topics.
 * @param {string} title
 * @param {string} subject
 * @param {string} content
 * @param {string} rawDescription
 * @returns {{ shortDescription: string, keyTopics: string[] }}
 */
const algorithmicBreakdown = (title, subject, content, rawDescription) => {
  const sourceText = (content && content.trim().length > 50) ? content : rawDescription;
  
  // Extract sentences
  const sentences = sourceText
    .replace(/\r\n/g, '\n')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length >= 25 && s.length <= 250 && !s.includes('--- File Content') && !s.includes('--- URL Content'));

  let shortDescription = '';
  if (sentences.length > 0) {
    // Pick first 1-2 informative sentences
    shortDescription = sentences.slice(0, 2).join(' ');
  } else {
    shortDescription = `Comprehensive study materials on ${title} covering fundamental principles in ${subject}.`;
  }

  // Ensure short description is concise (max 300 chars)
  if (shortDescription.length > 300) {
    shortDescription = shortDescription.substring(0, 297) + '...';
  }

  const keyTopics = extractKeywords(`${title} ${subject} ${sourceText}`, 5);

  return {
    shortDescription,
    keyTopics: keyTopics.length > 0 ? keyTopics : [subject, title]
  };
};

/**
 * Synthesize breakdown using Google Gemini if available
 * @param {string} title
 * @param {string} subject
 * @param {string} content
 * @param {string} rawDescription
 * @returns {Promise<{ shortDescription: string, keyTopics: string[] }>}
 */
const breakDownWithGemini = async (title, subject, content, rawDescription) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('No Gemini API key configured');
  }

  const sampleContent = (content || rawDescription || '').substring(0, 4000);
  const prompt = `Analyze this educational resource and provide an objective, factual breakdown.
Resource Title: "${title}"
Subject: "${subject}"
Content Sample:
${sampleContent}

Respond strictly with valid JSON in this format:
{
  "shortDescription": "1 to 2 factual, objective sentences summarizing what this project/document covers.",
  "keyTopics": ["Topic1", "Topic2", "Topic3", "Topic4"]
}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 300,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini');
  }

  const parsed = JSON.parse(text);
  return {
    shortDescription: parsed.shortDescription || '',
    keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : []
  };
};

/**
 * Analyze and break down uploaded resource materials
 * @param {Object} params
 * @param {string} params.title
 * @param {string} params.subject
 * @param {string} params.type
 * @param {string} params.content
 * @param {string} params.description
 * @returns {Promise<{ shortDescription: string, keyTopics: string[] }>}
 */
const analyzeAndBreakdownResource = async ({ title, subject, type, content, description }) => {
  // Try cloud Gemini breakdown first
  try {
    const result = await breakDownWithGemini(title, subject, content, description);
    if (result.shortDescription && result.keyTopics.length > 0) {
      console.log(`[ContentAnalyzer] Successfully broke down resource "${title}" using Gemini`);
      return result;
    }
  } catch (err) {
    console.log(`[ContentAnalyzer] Cloud synthesis unavailable (${err.message}). Using local extractive analyzer.`);
  }

  // Fallback to algorithmic extractive breakdown (works offline / standalone)
  return algorithmicBreakdown(title, subject, content, description);
};

module.exports = {
  validateMeaningfulDescription,
  analyzeAndBreakdownResource,
  extractKeywords
};
