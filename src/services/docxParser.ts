import PizZip from 'pizzip';

/**
 * Interface for parsed DOCX placeholder information
 */
export interface DocxPlaceholder {
  name: string;
  type: 'simple' | 'conditional' | 'loop';
  fullMatch: string;
  isRequired?: boolean;
  context?: string; // surrounding text for context
}

/**
 * Interface for DOCX parsing results
 */
export interface DocxParseResult {
  placeholders: DocxPlaceholder[];
  fileName: string;
  fileSize: number;
  parseErrors: string[];
  documentContent: string;
}

/**
 * DOCX Parser Service using pizzip
 * Extracts placeholders from DOCX files for mapping interface
 */
export class DocxParserService {
  private static readonly PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g;
  private static readonly CONDITIONAL_REGEX = /\{\{#([^}]+)\}\}(.*?)\{\{\/\1\}\}/gs;
  private static readonly INVERTED_CONDITIONAL_REGEX = /\{\{\^([^}]+)\}\}(.*?)\{\{\/\1\}\}/gs;

  /**
   * Parse a DOCX file and extract placeholders
   */
  static async parseDocx(file: File): Promise<DocxParseResult> {
    const result: DocxParseResult = {
      placeholders: [],
      fileName: file.name,
      fileSize: file.size,
      parseErrors: [],
      documentContent: ''
    };

    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith('.docx')) {
        result.parseErrors.push('File must be a .docx format');
        return result;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        result.parseErrors.push('File size must be less than 10MB');
        return result;
      }

      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse with PizZip
      const zip = new PizZip(arrayBuffer);
      
      // Extract document.xml content
      const documentXml = zip.file('word/document.xml');
      if (!documentXml) {
        result.parseErrors.push('Invalid DOCX file: missing document.xml');
        return result;
      }

      const xmlContent = documentXml.asText();
      result.documentContent = xmlContent;

      // Extract text content from XML
      const textContent = this.extractTextFromXml(xmlContent);
      
      // Find all placeholders
      result.placeholders = this.extractPlaceholders(textContent);

      console.log(`Parsed DOCX: found ${result.placeholders.length} placeholders`);
      
    } catch (error) {
      console.error('Error parsing DOCX:', error);
      result.parseErrors.push(`Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Extract text content from DOCX XML, preserving placeholder syntax
   */
  private static extractTextFromXml(xmlContent: string): string {
    try {
      // Remove XML tags but preserve text content
      // This is a simplified approach - in production, you might want to use a proper XML parser
      let text = xmlContent
        .replace(/<w:p[^>]*>/g, '\n')  // Paragraphs become newlines
        .replace(/<w:br[^>]*\/?>/g, '\n')  // Line breaks
        .replace(/<w:tab[^>]*\/?>/g, '\t')  // Tabs
        .replace(/<[^>]+>/g, '')  // Remove all other XML tags
        .replace(/&lt;/g, '<')  // Decode entities
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      // Clean up extra whitespace
      text = text
        .replace(/\n\s*\n/g, '\n')  // Multiple newlines to single
        .replace(/\t+/g, ' ')  // Multiple tabs to space
        .trim();

      return text;
    } catch (error) {
      console.error('Error extracting text from XML:', error);
      return xmlContent; // Fallback to raw XML
    }
  }

  /**
   * Extract and categorize placeholders from text content
   */
  private static extractPlaceholders(textContent: string): DocxPlaceholder[] {
    const placeholders: DocxPlaceholder[] = [];
    const found = new Set<string>(); // Track unique placeholders

    // Find conditional statements first (they contain nested placeholders)
    this.findConditionalPlaceholders(textContent, placeholders, found);
    
    // Find simple placeholders
    this.findSimplePlaceholders(textContent, placeholders, found);

    // Sort by name for consistent ordering
    return placeholders.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Find conditional and loop placeholders
   */
  private static findConditionalPlaceholders(
    textContent: string, 
    placeholders: DocxPlaceholder[], 
    found: Set<string>
  ): void {
    // Find regular conditionals {{#field}}...{{/field}}
    let match;
    const conditionalRegex = new RegExp(this.CONDITIONAL_REGEX.source, 'gs');
    
    while ((match = conditionalRegex.exec(textContent)) !== null) {
      const fieldName = match[1].trim();
      const content = match[2];
      
      if (!found.has(fieldName)) {
        const context = this.getContext(textContent, match.index, match[0].length);
        
        placeholders.push({
          name: fieldName,
          type: this.isLoopField(content) ? 'loop' : 'conditional',
          fullMatch: match[0],
          context: context,
          isRequired: false
        });
        found.add(fieldName);
      }
    }

    // Find inverted conditionals {{^field}}...{{/field}}
    const invertedRegex = new RegExp(this.INVERTED_CONDITIONAL_REGEX.source, 'gs');
    
    while ((match = invertedRegex.exec(textContent)) !== null) {
      const fieldName = match[1].trim();
      
      if (!found.has(fieldName)) {
        const context = this.getContext(textContent, match.index, match[0].length);
        
        placeholders.push({
          name: fieldName,
          type: 'conditional',
          fullMatch: match[0],
          context: context,
          isRequired: false
        });
        found.add(fieldName);
      }
    }
  }

  /**
   * Find simple placeholders {{field}}
   */
  private static findSimplePlaceholders(
    textContent: string, 
    placeholders: DocxPlaceholder[], 
    found: Set<string>
  ): void {
    let match;
    const regex = new RegExp(this.PLACEHOLDER_REGEX.source, 'g');
    
    while ((match = regex.exec(textContent)) !== null) {
      const fullMatch = match[1].trim();
      
      // Skip if it's part of a conditional/loop syntax
      if (fullMatch.startsWith('#') || fullMatch.startsWith('^') || fullMatch.startsWith('/') || fullMatch === '.') {
        continue;
      }
      
      // Skip if already found
      if (found.has(fullMatch)) {
        continue;
      }
      
      const context = this.getContext(textContent, match.index, match[0].length);
      
      placeholders.push({
        name: fullMatch,
        type: 'simple',
        fullMatch: match[0],
        context: context,
        isRequired: true
      });
      found.add(fullMatch);
    }
  }

  /**
   * Determine if a field is likely a loop based on its content
   */
  private static isLoopField(content: string): boolean {
    // Check if content contains array-like patterns
    const arrayIndicators = [
      /\{\{\.\}\}/, // {{.}} indicates current item in loop
      /\{\{@index\}\}/, // {{@index}} indicates loop index
      /\{\{[^}]+\.[^}]+\}\}/, // {{item.property}} indicates object loop
    ];
    
    return arrayIndicators.some(pattern => pattern.test(content));
  }

  /**
   * Get surrounding context for a placeholder
   */
  private static getContext(text: string, index: number, length: number): string {
    const contextLength = 50;
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + length + contextLength);
    
    let context = text.substring(start, end);
    
    // Clean up context
    context = context.replace(/\s+/g, ' ').trim();
    
    // Add ellipsis if truncated
    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';
    
    return context;
  }

  /**
   * Validate placeholder names against survey fields
   */
  static validatePlaceholders(
    placeholders: DocxPlaceholder[], 
    surveyFields: string[]
  ): { valid: DocxPlaceholder[]; invalid: DocxPlaceholder[]; missing: string[] } {
    const valid: DocxPlaceholder[] = [];
    const invalid: DocxPlaceholder[] = [];
    const surveyFieldSet = new Set(surveyFields);
    const foundFields = new Set<string>();

    placeholders.forEach(placeholder => {
      if (surveyFieldSet.has(placeholder.name)) {
        valid.push(placeholder);
        foundFields.add(placeholder.name);
      } else {
        invalid.push(placeholder);
      }
    });

    // Find survey fields that don't have corresponding placeholders
    const missing = surveyFields.filter(field => !foundFields.has(field));

    return { valid, invalid, missing };
  }

  /**
   * Generate placeholder statistics
   */
  static getPlaceholderStats(placeholders: DocxPlaceholder[]): {
    total: number;
    byType: Record<string, number>;
    required: number;
    optional: number;
  } {
    const stats = {
      total: placeholders.length,
      byType: {
        simple: 0,
        conditional: 0,
        loop: 0
      },
      required: 0,
      optional: 0
    };

    placeholders.forEach(placeholder => {
      stats.byType[placeholder.type]++;
      if (placeholder.isRequired) {
        stats.required++;
      } else {
        stats.optional++;
      }
    });

    return stats;
  }
}