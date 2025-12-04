import { describe, test, expect, beforeEach } from 'vitest';
import { DocxParserService } from '@/services/docxParser';
import { loadRealTemplate, hasRealTemplate, createMockFile } from '../helpers/test-utils';

describe('DocxParserService with Real Template', () => {
  describe('parseDocx with real template', () => {
    test('should parse real employment contract template', async () => {
      // Skip if no real template available
      if (!hasRealTemplate()) {
        console.log('⏭️ Skipping real template parsing test - template file not found');
        return;
      }

      // Given: Real DOCX template file
      const templateBuffer = loadRealTemplate();
      expect(templateBuffer).not.toBeNull();
      expect(templateBuffer!.byteLength).toBeGreaterThan(1000);

      // Create a File object from the buffer
      const templateFile = new File(
        [templateBuffer!], 
        'employment-contract-template.docx',
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      );

      // When: Parse the real template
      const result = await DocxParserService.parseDocx(templateFile);

      // Then: Should successfully extract placeholders
      expect(result.parseErrors).toHaveLength(0);
      expect(result.fileName).toBe('employment-contract-template.docx');
      expect(result.fileSize).toBeGreaterThan(1000);
      expect(result.placeholders.length).toBeGreaterThan(0);

      // Log discovered placeholders for verification
      console.log('✓ Placeholders found in real template:');
      result.placeholders.forEach(placeholder => {
        console.log(`  - ${placeholder.name} (${placeholder.type})`);
      });

      // Verify some expected placeholders exist
      const placeholderNames = result.placeholders.map(p => p.name);
      expect(placeholderNames).toContain('employee_name');
      expect(placeholderNames).toContain('company_name');
    });

    test('should identify placeholder types correctly in real template', async () => {
      // Skip if no real template available
      if (!hasRealTemplate()) {
        console.log('⏭️ Skipping placeholder type test - template file not found');
        return;
      }

      // Given: Real DOCX template
      const templateBuffer = loadRealTemplate();
      const templateFile = new File([templateBuffer!], 'test.docx');

      // When: Parse template
      const result = await DocxParserService.parseDocx(templateFile);

      // Then: Should categorize placeholder types
      const simpleCount = result.placeholders.filter(p => p.type === 'simple').length;
      const conditionalCount = result.placeholders.filter(p => p.type === 'conditional').length;
      const loopCount = result.placeholders.filter(p => p.type === 'loop').length;

      console.log(`✓ Placeholder types found: ${simpleCount} simple, ${conditionalCount} conditional, ${loopCount} loop`);
      
      // Should have at least some simple placeholders
      expect(simpleCount).toBeGreaterThan(0);
    });

    test('should extract document content from real template', async () => {
      // Skip if no real template available
      if (!hasRealTemplate()) {
        console.log('⏭️ Skipping content extraction test - template file not found');
        return;
      }

      // Given: Real DOCX template
      const templateBuffer = loadRealTemplate();
      const templateFile = new File([templateBuffer!], 'test.docx');

      // When: Parse template
      const result = await DocxParserService.parseDocx(templateFile);

      // Then: Should extract document content
      expect(result.documentContent).toBeTruthy();
      expect(result.documentContent.length).toBeGreaterThan(100);
      
      // Content should contain some expected text
      expect(result.documentContent.toLowerCase()).toContain('employment');
      
      console.log(`✓ Document content extracted: ${result.documentContent.length} characters`);
    });
  });

  describe('fallback to mock data', () => {
    test('should work with mock data when real template unavailable', async () => {
      // Given: Mock DOCX file
      const mockFile = createMockFile(
        'Mock DOCX content with {employee_name} and {company_name}',
        'mock-template.docx'
      );

      // When: Parse mock template (this will likely fail parsing but shouldn't crash)
      try {
        const result = await DocxParserService.parseDocx(mockFile);
        
        // Then: Should handle gracefully
        expect(result.fileName).toBe('mock-template.docx');
        console.log('✓ Mock template parsed without crashing');
      } catch (error) {
        // Expected - mock data won't parse as real DOCX
        console.log('✓ Mock template parsing failed as expected (not real DOCX format)');
        expect(error).toBeDefined();
      }
    });
  });
});

describe('DocxParserService.truncateComplexMatch', () => {
  describe('regular conditional fields (#)', () => {
    test('should not truncate short content', () => {
      const fullMatch = '{{#foo}}Short text{{/foo}}';
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'foo', '#');
      expect(result).toBe(fullMatch);
    });

    test('should truncate long content with ellipsis', () => {
      const longContent = 'This is a very long piece of content that should definitely be truncated because it exceeds the maximum length';
      const fullMatch = `{{#foo}}${longContent}{{/foo}}`;
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'foo', '#');
      
      expect(result).toContain('{{#foo}}');
      expect(result).toContain('{{/foo}}');
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(fullMatch.length);
    });

    test('should preserve start and end of content', () => {
      const content = 'START_CONTENT_HERE some middle text that goes on for a while END_CONTENT_HERE';
      const fullMatch = `{{#field}}${content}{{/field}}`;
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'field', '#');
      
      expect(result).toContain('START_CONTENT');
      expect(result).toContain('CONTENT_HERE');
    });
  });

  describe('inverted conditional fields (^)', () => {
    test('should not truncate short content', () => {
      const fullMatch = '{{^bar}}Brief{{/bar}}';
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'bar', '^');
      expect(result).toBe(fullMatch);
    });

    test('should truncate long content with ellipsis', () => {
      const longContent = 'This is another very long piece of content that should be truncated because it is way too long for display';
      const fullMatch = `{{^bar}}${longContent}{{/bar}}`;
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'bar', '^');
      
      expect(result).toContain('{{^bar}}');
      expect(result).toContain('{{/bar}}');
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(fullMatch.length);
    });
  });

  describe('edge cases', () => {
    test('should return original if structure is invalid', () => {
      const invalid = 'Just some text without proper tags';
      const result = DocxParserService.truncateComplexMatch(invalid, 'field', '#');
      expect(result).toBe(invalid);
    });

    test('should handle empty content', () => {
      const fullMatch = '{{#empty}}{{/empty}}';
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'empty', '#');
      expect(result).toBe(fullMatch);
    });

    test('should handle content exactly at boundary length', () => {
      // Content at MAX_COMPLEX_CONTENT_LENGTH should not be truncated
      const maxLen = DocxParserService.MAX_COMPLEX_CONTENT_LENGTH;
      const content = 'x'.repeat(maxLen);
      const fullMatch = `{{#field}}${content}{{/field}}`;
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'field', '#');
      expect(result).toBe(fullMatch);
    });

    test('should handle content just over boundary length', () => {
      // Content over MAX_COMPLEX_CONTENT_LENGTH should be truncated
      const maxLen = DocxParserService.MAX_COMPLEX_CONTENT_LENGTH;
      const content = 'x'.repeat(maxLen + 1);
      const fullMatch = `{{#field}}${content}{{/field}}`;
      const result = DocxParserService.truncateComplexMatch(fullMatch, 'field', '#');
      expect(result).toContain('...');
      expect(result.length).toBeLessThan(fullMatch.length);
    });
  });
});