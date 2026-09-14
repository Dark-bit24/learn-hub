const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const { convert } = require('html-to-text');

/**
 * Extract text from a local file based on its extension
 * @param {string} filePath Absolute or relative path to the file
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromFile = async (filePath) => {
  try {
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, '..', filePath.startsWith('/') ? filePath.slice(1) : filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`[TextExtractor] File not found at path: ${absolutePath}`);
      return '';
    }

    const ext = path.extname(absolutePath).toLowerCase();

    // 1. Text file
    if (ext === '.txt') {
      const text = await fs.promises.readFile(absolutePath, 'utf8');
      return text.substring(0, 60000);
    }

    // 2. PDF file — pdf-parse exports a function, NOT a class
    if (ext === '.pdf') {
      try {
        const dataBuffer = await fs.promises.readFile(absolutePath);
        const data = await pdfParse(dataBuffer);
        const text = (data.text || '').trim();
        console.log(`[TextExtractor] PDF extracted ${text.length} chars from ${path.basename(absolutePath)}`);
        return text.substring(0, 60000);
      } catch (pdfErr) {
        console.error('[TextExtractor] PDF parse error:', pdfErr.message);
        return '';
      }
    }

    // 3. Markdown / code / configuration files treated as plain text
    if (['.md', '.json', '.csv', '.js', '.ts', '.py', '.html', '.css', '.c', '.cpp', '.java', '.sh', '.xml', '.yaml', '.yml', '.rtf', '.txt', '.log'].includes(ext)) {
      const text = await fs.promises.readFile(absolutePath, 'utf8');
      return text.substring(0, 60000);
    }

    // 4. Fallback for other file types (images, word files, etc.)
    console.log(`[TextExtractor] Unsupported local file format: ${ext}. Skipping text extraction.`);
    return '';
  } catch (error) {
    console.error('[TextExtractor] Error extracting text from file:', error.message);
    return '';
  }
};

/**
 * Extract main text/markdown content from a URL
 * @param {string} url The target website URL
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromUrl = async (url) => {
  if (!url) return '';
  try {
    console.log(`[TextExtractor] Fetching content from URL: ${url}`);
    
    // Fetch page with a 6-second timeout and custom User-Agent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    if (typeof html !== 'string') {
      return '';
    }

    // Convert HTML to clean text
    const text = convert(html, {
      wordwrap: 130,
      selectors: [
        { selector: 'a', options: { ignoreHref: true } },
        { selector: 'img', format: 'skip' },
        { selector: 'nav', format: 'skip' },
        { selector: 'footer', format: 'skip' },
        { selector: 'header', format: 'skip' }
      ]
    });

    return text;
  } catch (error) {
    console.error('[TextExtractor] Error extracting text from URL:', error.message);
    return `[Could not fetch link content automatically: ${error.message}]`;
  }
};

/**
 * Orchestrate and compile extracted text content for a resource
 * @param {Object} resource The Resource mongoose model instance
 * @returns {Promise<string>} Combined extracted content
 */
const extractResourceContent = async (resource) => {
  let extractedParts = [];

  // 1. Extract from local uploaded file if present
  if (resource.file) {
    console.log(`[TextExtractor] Extracting from file: ${resource.file}`);
    const fileText = await extractTextFromFile(resource.file);
    if (fileText.trim()) {
      extractedParts.push(`--- File Content (${path.basename(resource.file)}) ---\n${fileText.trim()}`);
    }
  }

  // 2. Extract from external link if present and resource type suggests web content (Article, Link, Tutorial)
  if (resource.url && ['Article', 'Link', 'Tutorial', 'Notes'].includes(resource.type)) {
    const urlText = await extractTextFromUrl(resource.url);
    if (urlText.trim()) {
      extractedParts.push(`--- URL Content (${resource.url}) ---\n${urlText.trim()}`);
    }
  }

  // Combine and enforce a limit of 60,000 characters to keep context size manageable
  const combined = extractedParts.join('\n\n');
  if (combined.length > 60000) {
    return combined.substring(0, 60000) + '\n\n... [Content Truncated for AI Tutor Optimization]';
  }

  return combined;
};

module.exports = {
  extractTextFromFile,
  extractTextFromUrl,
  extractResourceContent
};
