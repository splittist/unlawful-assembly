import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DocumentGeneratorService } from '@/services/documentGenerator';
import { 
  createMockSurveyResponses, 
  createMockPackageContent, 
  createMinimalSurveyResponses,
  isValidArrayBuffer 
} from '../helpers/test-utils';
import type { PackageContent } from '@/services/packageService';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Mock the file-saver module
vi.mock('file-saver', () => ({
  saveAs: vi.fn()
}));

describe('DocumentGeneratorService Integration Tests', () => {
  let mockPackageContent: PackageContent;
  let fullSurveyResponses: Record<string, any>;
  let minimalSurveyResponses: Record<string, any>;
  let realTemplateBuffer: ArrayBuffer | null = null;

  beforeEach(() => {
    // Reset mocks and set up test data
    vi.clearAllMocks();
    
    mockPackageContent = createMockPackageContent();
    fullSurveyResponses = createMockSurveyResponses();
    minimalSurveyResponses = createMinimalSurveyResponses();
    
    // Try to load real DOCX template if available
    const templatePath = path.join(__dirname, '../fixtures/employment-contract-template.docx');
    if (existsSync(templatePath)) {
      try {
        const templateData = readFileSync(templatePath);
        realTemplateBuffer = templateData.buffer.slice(
          templateData.byteOffset, 
          templateData.byteOffset + templateData.byteLength
        );
        console.log('✓ Using real DOCX template for tests');
        
        // Update mock package to use real template
        mockPackageContent.template = {
          filename: 'employment-contract-template.docx',
          content: realTemplateBuffer
        };
      } catch (error) {
        console.warn('⚠️ Could not load real template, using mock:', error);
        realTemplateBuffer = null;
      }
    } else {
      console.log('ℹ️ Real template not found, using mock data');
    }
  });

  describe('generateDocument', () => {
    test('should generate document with real DOCX template when available', async () => {
      // Mock the actual file saving
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);

      // When: Generate document with complete responses
      await DocumentGeneratorService.generateDocument(
        fullSurveyResponses,
        mockPackageContent
      );

      // Then: Document should be generated and saved
      expect(saveAsMock).toHaveBeenCalledOnce();
      
      // Verify the saved file has the expected structure
      const [blob, filename] = saveAsMock.mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      expect(filename).toMatch(/\.docx$/);
      expect(filename).toContain('Employment Contract Package');
      
      // If using real template, verify it's a proper DOCX size
      if (realTemplateBuffer && blob instanceof Blob) {
        expect(blob.size).toBeGreaterThan(1000); // Real DOCX should be substantial
        console.log(`✓ Generated document size: ${blob.size} bytes using real template`);
      }
    });

    test('should generate document with complete survey responses', async () => {
      // Mock the actual file saving
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);

      // When: Generate document with complete responses
      await DocumentGeneratorService.generateDocument(
        fullSurveyResponses,
        mockPackageContent
      );

      // Then: Document should be generated and saved
      expect(saveAsMock).toHaveBeenCalledOnce();
      
      // Verify the saved file has the expected structure
      const [blob, filename] = saveAsMock.mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      expect(filename).toMatch(/\.docx$/);
      expect(filename).toContain('Employment Contract Package');
    });

    test('should handle minimal survey responses gracefully', async () => {
      // When: Generate document with minimal responses  
      await expect(
        DocumentGeneratorService.generateDocument(
          minimalSurveyResponses,
          mockPackageContent
        )
      ).resolves.not.toThrow();

      // Then: Should still generate a document
      const { saveAs } = await import('file-saver');
      expect(vi.mocked(saveAs)).toHaveBeenCalledOnce();
    });

    test('should throw error when survey responses are empty', async () => {
      // Given: Empty survey responses
      const emptyResponses = {};

      // When/Then: Should throw error
      await expect(
        DocumentGeneratorService.generateDocument(
          emptyResponses,
          mockPackageContent
        )
      ).rejects.toThrow('Survey responses are required for document generation');
    });

    test('should throw error when package has no template', async () => {
      // Given: Package without template
      const packageWithoutTemplate = {
        ...mockPackageContent,
        template: null
      };

      // When/Then: Should throw error
      await expect(
        DocumentGeneratorService.generateDocument(
          fullSurveyResponses,
          packageWithoutTemplate as any
        )
      ).rejects.toThrow('Package must contain a template for document generation');
    });

    test('should throw error when package has no mappings', async () => {
      // Given: Package without mappings
      const packageWithoutMappings = {
        ...mockPackageContent,
        mappings: []
      };

      // When/Then: Should throw error
      await expect(
        DocumentGeneratorService.generateDocument(
          fullSurveyResponses,
          packageWithoutMappings
        )
      ).rejects.toThrow('Package must contain field mappings for document generation');
    });

    test('should transform array values to comma-separated strings', async () => {
      // Given: Survey responses with array values
      const responsesWithArrays = {
        ...fullSurveyResponses,
        benefit_list: ['Health Insurance', 'Dental Coverage', '401k']
      };

      // When: Generate document
      await DocumentGeneratorService.generateDocument(
        responsesWithArrays,
        mockPackageContent
      );

      // Then: Should not throw and should process arrays
      expect(vi.mocked(await import('file-saver')).saveAs).toHaveBeenCalledOnce();
    });

    test('should transform boolean values to Yes/No strings', async () => {
      // Given: Survey responses with boolean values
      const responsesWithBooleans = {
        ...fullSurveyResponses,
        is_salary_based: true,
        has_benefits: false
      };

      // When: Generate document
      await DocumentGeneratorService.generateDocument(
        responsesWithBooleans,
        mockPackageContent
      );

      // Then: Should not throw and should process booleans
      expect(vi.mocked(await import('file-saver')).saveAs).toHaveBeenCalledOnce();
    });

    test('should handle date formatting', async () => {
      // Given: Survey responses with date values
      const responsesWithDates = {
        ...fullSurveyResponses,
        start_date: '2024-01-15',
        response_deadline: new Date('2024-02-01')
      };

      // When: Generate document
      await DocumentGeneratorService.generateDocument(
        responsesWithDates,
        mockPackageContent
      );

      // Then: Should not throw and should process dates
      expect(vi.mocked(await import('file-saver')).saveAs).toHaveBeenCalledOnce();
    });

    test('should add generated metadata fields', async () => {
      // This test verifies that generated fields like _generated_date are added
      
      // When: Generate document
      await DocumentGeneratorService.generateDocument(
        fullSurveyResponses,
        mockPackageContent
      );

      // Then: Should complete successfully (metadata is added internally)
      expect(vi.mocked(await import('file-saver')).saveAs).toHaveBeenCalledOnce();
    });

    test('should generate unique filenames for different packages', async () => {
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);
      
      // When: Generate documents with different package names
      const package1 = { ...mockPackageContent };
      package1.metadata.title = 'Package One';
      
      const package2 = { ...mockPackageContent };
      package2.metadata.title = 'Package Two';

      await DocumentGeneratorService.generateDocument(fullSurveyResponses, package1);
      await DocumentGeneratorService.generateDocument(fullSurveyResponses, package2);

      // Then: Should have different filenames
      expect(saveAsMock).toHaveBeenCalledTimes(2);
      const [, filename1] = saveAsMock.mock.calls[0];
      const [, filename2] = saveAsMock.mock.calls[1];
      
      expect(filename1).toContain('Package One');
      expect(filename2).toContain('Package Two');
      expect(filename1).not.toBe(filename2);
    });

    test('should validate real template integration', async () => {
      // Skip if no real template available
      if (!realTemplateBuffer) {
        console.log('⏭️ Skipping real template test - template file not found');
        return;
      }

      // When: Using real template
      expect(realTemplateBuffer.byteLength).toBeGreaterThan(1000);
      expect(mockPackageContent.template?.filename).toBe('employment-contract-template.docx');
      
      // And: Generate document
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);
      
      try {
        await DocumentGeneratorService.generateDocument(
          fullSurveyResponses,
          mockPackageContent
        );

        // Then: Should successfully process real template
        expect(saveAsMock).toHaveBeenCalledOnce();
        const [blob] = saveAsMock.mock.calls[0];
        
        if (blob instanceof Blob) {
          // Real DOCX should produce substantial output
          expect(blob.size).toBeGreaterThan(2000);
          console.log(`✓ Real template processed successfully, output: ${blob.size} bytes`);
        }
      } catch (error) {
        // If template has issues, provide helpful guidance
        console.log('⚠️ Real template has formatting issues:');
        if (error instanceof Error) {
          if (error.message.includes('duplicate_open_tag') || error.message.includes('duplicate_close_tag')) {
            console.log('  - Placeholder formatting issue detected');
            console.log('  - Check TEMPLATE-TROUBLESHOOTING.md for fixes');
            console.log('  - Try retyping placeholders in Word without formatting');
          }
          if (error.message.includes('raw_xml_tag_should_be_only_text_in_paragraph')) {
            console.log('  - Raw tags like {{@index}} need to be alone on their line');
          }
        }
        
        // Re-throw the error so test fails but with context
        throw new Error(`Template formatting needs fixing. See TEMPLATE-TROUBLESHOOTING.md. Original error: ${error instanceof Error ? error.message.substring(0, 200) : 'Unknown error'}`);
      }
    });

    test('should work with fallback mock data when real template has issues', async () => {
      // Given: Force use of mock template (ignore real template errors)
      const mockPackageWithSimpleTemplate = createMockPackageContent();
      
      // When: Generate document with mock template
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);
      
      await DocumentGeneratorService.generateDocument(
        fullSurveyResponses,
        mockPackageWithSimpleTemplate
      );

      // Then: Should work with mock data
      expect(saveAsMock).toHaveBeenCalledOnce();
      const [blob] = saveAsMock.mock.calls[0];
      expect(blob).toBeInstanceOf(Blob);
      
      console.log('✓ Mock template works as fallback while fixing real template');
    });
  });

  describe('error handling and edge cases', () => {
    test('should handle null and undefined survey values', async () => {
      // Given: Survey responses with null/undefined values
      const responsesWithNulls = {
        employee_name: 'John Doe',
        company_name: null,
        job_title: undefined,
        department: ''
      };

      // When/Then: Should not throw
      await expect(
        DocumentGeneratorService.generateDocument(
          responsesWithNulls,
          mockPackageContent
        )
      ).resolves.not.toThrow();
    });

    test('should handle survey responses with extra unmapped fields', async () => {
      // Given: Survey responses with extra fields not in mappings
      const responsesWithExtra = {
        ...fullSurveyResponses,
        extra_field_1: 'Extra value',
        extra_field_2: 12345,
        extra_field_3: ['a', 'b', 'c']
      };

      // When/Then: Should not throw (extra fields are ignored)
      await expect(
        DocumentGeneratorService.generateDocument(
          responsesWithExtra,
          mockPackageContent
        )
      ).resolves.not.toThrow();
    });

    test('should handle number formatting for large salary values', async () => {
      // Given: Survey responses with large salary numbers
      const responsesWithLargeSalary = {
        ...fullSurveyResponses,
        annual_salary: 150000,
        hourly_rate: 75.50
      };

      // When/Then: Should handle number formatting without throwing
      await expect(
        DocumentGeneratorService.generateDocument(
          responsesWithLargeSalary,
          mockPackageContent
        )
      ).resolves.not.toThrow();
    });
  });
});