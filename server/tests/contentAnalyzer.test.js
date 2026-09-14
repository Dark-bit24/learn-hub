const { validateMeaningfulDescription, extractKeywords, analyzeAndBreakdownResource } = require('../utils/contentAnalyzer');

describe('Content Analyzer Utility', () => {
  describe('validateMeaningfulDescription', () => {
    it('should reject empty, missing, or non-string descriptions', () => {
      expect(validateMeaningfulDescription('')).toEqual({ valid: false, reason: expect.any(String) });
      expect(validateMeaningfulDescription(null)).toEqual({ valid: false, reason: expect.any(String) });
      expect(validateMeaningfulDescription(undefined)).toEqual({ valid: false, reason: expect.any(String) });
    });

    it('should reject descriptions shorter than 20 characters', () => {
      const res = validateMeaningfulDescription('Too short text');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('at least 20 characters');
    });

    it('should reject descriptions with fewer than 4 words', () => {
      const res = validateMeaningfulDescription('Superlongsinglewordthatexceedstwentycharacters');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('at least 4 words');
    });

    it('should reject repetitive key-smash descriptions', () => {
      const res = validateMeaningfulDescription('aaaaaaaaaaaaaaaaaaaaaaaaaa');
      expect(res.valid).toBe(false);
      expect(res.reason).toContain('repetitive');
    });

    it('should reject placeholder spam text', () => {
      expect(validateMeaningfulDescription('asdfasdfasdfasdfasdfasdf').valid).toBe(false);
      expect(validateMeaningfulDescription('test test test test test test').valid).toBe(false);
      expect(validateMeaningfulDescription('lorem ipsum lorem ipsum lorem ipsum').valid).toBe(false);
    });

    it('should accept valid, meaningful descriptions', () => {
      const validDesc = 'This comprehensive study guide covers fundamental concepts in computer science algorithms and data structures.';
      const res = validateMeaningfulDescription(validDesc);
      expect(res.valid).toBe(true);
    });
  });

  describe('extractKeywords', () => {
    it('should return top keywords excluding stopwords', () => {
      const text = 'Data structures and algorithms in Python programming. Algorithms and data structures are essential.';
      const keywords = extractKeywords(text, 3);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords.map(k => k.toLowerCase())).toContain('algorithms');
    });

    it('should return empty array for empty input', () => {
      expect(extractKeywords('')).toEqual([]);
    });
  });

  describe('analyzeAndBreakdownResource', () => {
    it('should generate a short description and key topics using fallback when Gemini is unavailable', async () => {
      const originalKey = process.env.GEMINI_API_KEY;
      delete process.env.GEMINI_API_KEY;

      const params = {
        title: 'Introduction to Python Data Science',
        subject: 'Programming',
        type: 'Notes',
        content: 'Python is a high-level programming language used extensively in data science and machine learning. Pandas and NumPy are core libraries.',
        description: 'Comprehensive notes covering Python basics for data analysis and visualization.'
      };

      const result = await analyzeAndBreakdownResource(params);
      expect(result.shortDescription).toBeTruthy();
      expect(typeof result.shortDescription).toBe('string');
      expect(Array.isArray(result.keyTopics)).toBe(true);
      expect(result.keyTopics.length).toBeGreaterThan(0);

      process.env.GEMINI_API_KEY = originalKey;
    });
  });
});
