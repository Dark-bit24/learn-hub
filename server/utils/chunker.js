/**
 * RAG Chunking Utility
 */

const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
  'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
  'below', 'between', 'both', 'but', 'by', 'can\'t', 'cannot', 'could', 'couldn\'t',
  'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during',
  'each', 'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t',
  'have', 'haven\'t', 'having', 'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here',
  'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it',
  'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'mustn\'t', 'my',
  'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
  'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t',
  'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some',
  'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re',
  'they\'ve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up',
  'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were',
  'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which',
  'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would',
  'wouldn\'t', 'you', 'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours',
  'yourself', 'yourselves'
]);

function getWordCount(text) {
  return (text.match(/\S+/g) || []).length;
}

/**
 * Splits text into semantically meaningful chunks.
 * @param {string} text - The input text to chunk.
 * @param {Object} [options] - Chunking options.
 * @param {number} [options.maxChunkSize=800] - Maximum characters per chunk.
 * @param {number} [options.minChunkSize=100] - Minimum characters per chunk.
 * @param {number} [options.overlap=50] - Number of characters to overlap.
 * @returns {Array<{index: number, text: string, wordCount: number}>} Array of chunk objects.
 */
function chunkText(text, options = {}) {
  const { maxChunkSize = 800, minChunkSize = 100, overlap = 50 } = options;

  if (!text || typeof text !== 'string') return [];
  text = text.trim();
  if (!text) return [];

  if (text.length <= maxChunkSize) {
    return [{
      index: 0,
      text: text,
      wordCount: getWordCount(text)
    }];
  }

  const rawChunks = [];
  const paragraphs = text.split(/\n\n+/);

  for (const p of paragraphs) {
    const trimmedP = p.trim();
    if (!trimmedP) continue;

    if (trimmedP.length <= maxChunkSize) {
      rawChunks.push(trimmedP);
    } else {
      // Split by sentence boundaries
      const sentences = trimmedP.match(/[^.!?]+[.!?]+\s*/g) || [trimmedP];
      let currentChunk = '';

      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length <= maxChunkSize) {
          currentChunk += sentence;
        } else {
          if (currentChunk) {
            rawChunks.push(currentChunk.trim());
            currentChunk = '';
          }
          if (sentence.length > maxChunkSize) {
            // Split by words/maxChunkSize
            let remaining = sentence;
            while (remaining.length > 0) {
              if (remaining.length <= maxChunkSize) {
                currentChunk = remaining;
                break;
              }
              let splitIndex = remaining.lastIndexOf(' ', maxChunkSize);
              if (splitIndex === -1 || splitIndex === 0) {
                splitIndex = maxChunkSize;
              }
              rawChunks.push(remaining.substring(0, splitIndex).trim());
              remaining = remaining.substring(splitIndex).trim();
            }
          } else {
            currentChunk = sentence;
          }
        }
      }
      if (currentChunk) {
        rawChunks.push(currentChunk.trim());
      }
    }
  }

  // Merge small chunks
  const mergedChunks = [];
  let currentStr = '';

  for (let i = 0; i < rawChunks.length; i++) {
    const c = rawChunks[i];
    if (currentStr.length + c.length <= maxChunkSize) {
      currentStr += (currentStr ? ' ' : '') + c;
    } else {
      if (currentStr.length < minChunkSize && mergedChunks.length > 0) {
        const prev = mergedChunks.pop();
        if (prev.length + currentStr.length <= maxChunkSize) {
           mergedChunks.push(prev + ' ' + currentStr);
           currentStr = c;
        } else {
           mergedChunks.push(prev);
           mergedChunks.push(currentStr);
           currentStr = c;
        }
      } else {
        if (currentStr) mergedChunks.push(currentStr);
        currentStr = c;
      }
    }
  }
  if (currentStr) {
    if (currentStr.length < minChunkSize && mergedChunks.length > 0) {
      const prev = mergedChunks.pop();
      if (prev.length + currentStr.length <= maxChunkSize) {
         mergedChunks.push(prev + ' ' + currentStr);
      } else {
         mergedChunks.push(prev);
         mergedChunks.push(currentStr);
      }
    } else {
      mergedChunks.push(currentStr);
    }
  }

  return mergedChunks.map((chunkText, idx) => ({
    index: idx,
    text: chunkText,
    wordCount: getWordCount(chunkText)
  }));
}

/**
 * Generates a summary of the provided chunks.
 * @param {Array<{index: number, text: string, wordCount: number}>} chunks - Array of chunk objects.
 * @param {string} title - The title of the document.
 * @param {string} subject - The subject of the document.
 * @returns {Promise<string>} A generated summary string.
 */
async function generateChunkSummary(chunks, title, subject) {
  if (!chunks || chunks.length === 0) return '';
  
  const sampleChunks = chunks.slice(0, 5).map(c => c.text).join('\n\n');
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `Please provide a concise 2-3 sentence summary of what the following uploaded notes/document covers.\nTitle: ${title}\nSubject: ${subject}\n\nContent:\n${sampleChunks}`;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2
          }
        })
      });
      const data = await response.json();
      if (data && data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    } catch (error) {
      console.error('Error calling Gemini API for summary:', error);
      // Fallback
    }
  }

  // Fallback: Combine first 2 sentences from first 2 chunks, trimmed to 300 chars
  let sentences = [];
  for (let i = 0; i < Math.min(2, chunks.length); i++) {
    const chunkSentences = chunks[i].text.match(/[^.!?]+[.!?]+|\S+/g) || [chunks[i].text];
    sentences = sentences.concat(chunkSentences.slice(0, 2));
  }
  
  let summary = sentences.join(' ').replace(/\s+/g, ' ').trim();
  if (summary.length > 300) {
    summary = summary.substring(0, 297) + '...';
  }
  return summary;
}

/**
 * Finds the most relevant chunks based on a query using TF-based scoring.
 * @param {Array<{index: number, text: string, wordCount: number}>} chunks - Array of chunk objects.
 * @param {string} query - The search query.
 * @param {number} [topK=3] - Number of top chunks to return.
 * @returns {Array<{index: number, text: string, wordCount: number}>} Relevant chunk objects.
 */
function findRelevantChunks(chunks, query, topK = 3) {
  if (!chunks || chunks.length === 0) return [];
  if (!query || typeof query !== 'string') return chunks.slice(0, topK);

  const queryTerms = query.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(term => term && !STOP_WORDS.has(term));

  if (queryTerms.length === 0) {
    return chunks.slice(0, topK);
  }

  const scoredChunks = chunks.map(chunk => {
    const textLower = chunk.text.toLowerCase();
    let score = 0;
    
    // Count occurrences of each term
    for (const term of queryTerms) {
      const regex = new RegExp(`\\b${term}\\b`, 'g');
      const matches = textLower.match(regex);
      const termFreq = matches ? matches.length : 0;
      
      if (termFreq > 0 && chunk.wordCount > 0) {
        score += (termFreq / chunk.wordCount);
      }
    }

    return { chunk, score };
  });

  const matchedChunks = scoredChunks
    .filter(sc => sc.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(sc => sc.chunk)
    .slice(0, topK);

  if (matchedChunks.length === 0) {
    return chunks.slice(0, topK);
  }

  return matchedChunks;
}

module.exports = {
  chunkText,
  generateChunkSummary,
  findRelevantChunks
};
