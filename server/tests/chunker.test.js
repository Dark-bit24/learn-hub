const { chunkText, generateChunkSummary, findRelevantChunks } = require('../utils/chunker');

describe('Chunker Utility', () => {
  describe('chunkText', () => {
    it('should return an empty array for empty or non-string input', () => {
      expect(chunkText('')).toEqual([]);
      expect(chunkText(null)).toEqual([]);
      expect(chunkText(undefined)).toEqual([]);
      expect(chunkText(123)).toEqual([]);
    });

    it('should return a single chunk for text within maxChunkSize', () => {
      const text = 'This is a short sample text for testing chunking.';
      const result = chunkText(text, { maxChunkSize: 800 });
      expect(result).toHaveLength(1);
      expect(result[0].index).toBe(0);
      expect(result[0].text).toBe(text);
      expect(result[0].wordCount).toBe(9);
    });

    it('should split text exceeding maxChunkSize into multiple chunks', () => {
      const paragraph1 = 'Paragraph 1 '.repeat(40).trim();
      const paragraph2 = 'Paragraph 2 '.repeat(40).trim();
      const text = `${paragraph1}\n\n${paragraph2}`;
      
      const result = chunkText(text, { maxChunkSize: 200, minChunkSize: 50 });
      expect(result.length).toBeGreaterThan(1);
      result.forEach((chunk, i) => {
        expect(chunk.index).toBe(i);
        expect(chunk.text).toBeTruthy();
        expect(chunk.wordCount).toBeGreaterThan(0);
      });
    });

    it('should split long sentences by words when sentence length exceeds maxChunkSize', () => {
      const longSentence = 'word '.repeat(200).trim();
      const result = chunkText(longSentence, { maxChunkSize: 100 });
      expect(result.length).toBeGreaterThan(1);
    });
  });

  describe('generateChunkSummary', () => {
    it('should return empty string if no chunks are provided', async () => {
      const summary = await generateChunkSummary([], 'Title', 'Subject');
      expect(summary).toBe('');
    });

    it('should generate an algorithmic summary fallback when GEMINI_API_KEY is not set', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const chunks = [
        { index: 0, text: 'Linear algebra is the branch of mathematics concerning linear equations. It uses matrices and vectors.', wordCount: 15 },
        { index: 1, text: 'Vector spaces are central to modern mathematics. Linear transformations map vectors to vectors.', wordCount: 13 }
      ];

      const summary = await generateChunkSummary(chunks, 'Linear Algebra Notes', 'Mathematics');
      expect(summary).toBeTruthy();
      expect(typeof summary).toBe('string');
      expect(summary.length).toBeLessThanOrEqual(300);

      process.env.GEMINI_API_KEY = originalKey;
    });
  });

  describe('findRelevantChunks', () => {
    const chunks = [
      { index: 0, text: 'Photosynthesis occurs in plants using sunlight and chlorophyll to produce glucose.', wordCount: 11 },
      { index: 1, text: 'Calculus derivatives measure the rate of change and slope of curves.', wordCount: 11 },
      { index: 2, text: 'Data structures such as arrays, stacks, and binary trees organize information.', wordCount: 11 }
    ];

    it('should return topK chunks matching query terms', () => {
      const relevant = findRelevantChunks(chunks, 'Tell me about plants and photosynthesis', 2);
      expect(relevant.length).toBeGreaterThan(0);
      expect(relevant[0].index).toBe(0);
    });

    it('should return fallback topK chunks when query has no matching terms', () => {
      const relevant = findRelevantChunks(chunks, 'unrelated quantum mechanics', 2);
      expect(relevant).toHaveLength(2);
      expect(relevant[0].index).toBe(0);
    });

    it('should return fallback topK chunks when query is empty or invalid', () => {
      const relevant = findRelevantChunks(chunks, '', 2);
      expect(relevant).toHaveLength(2);
    });

    it('should return empty array if chunks array is empty', () => {
      expect(findRelevantChunks([], 'query')).toEqual([]);
    });
  });
});
