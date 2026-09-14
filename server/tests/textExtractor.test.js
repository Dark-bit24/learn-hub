const path = require('path');
const fs = require('fs');
const { extractTextFromFile, extractResourceContent } = require('../utils/textExtractor');

describe('Text Extractor Utility', () => {
  const testFilePath = path.join(__dirname, 'test_sample.txt');

  beforeAll(async () => {
    await fs.promises.writeFile(testFilePath, 'Sample text content for testing text extraction utility.');
  });

  afterAll(async () => {
    if (fs.existsSync(testFilePath)) {
      await fs.promises.unlink(testFilePath);
    }
  });

  describe('extractTextFromFile', () => {
    it('should extract text from a plain text file', async () => {
      const text = await extractTextFromFile(testFilePath);
      expect(text).toContain('Sample text content');
    });

    it('should return empty string for non-existent file', async () => {
      const text = await extractTextFromFile('/path/does/not/exist.txt');
      expect(text).toBe('');
    });

    it('should return empty string for unsupported file extension', async () => {
      const text = await extractTextFromFile('/some/file.xyz');
      expect(text).toBe('');
    });
  });

  describe('extractResourceContent', () => {
    it('should extract content from attached file in resource object', async () => {
      const dummyResource = {
        file: testFilePath,
        url: '',
        type: 'Notes'
      };

      const combined = await extractResourceContent(dummyResource);
      expect(combined).toContain('File Content');
      expect(combined).toContain('Sample text content');
    });
  });
});
