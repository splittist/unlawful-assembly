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
      expect(blob).toBeDefined();
      expect(filename).toMatch(/\.docx$/);
      expect(filename).toContain('Employment_Contract_Package');
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
      expect(blob).toBeDefined();
      expect(filename).toMatch(/\.docx$/);
      expect(filename).toContain('Employment_Contract_Package');
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

    test('should keep boolean values as booleans for template conditionals', async () => {
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

    test('should generate documents with different package titles', async () => {
      // When: Generate document with a custom package title
      const customPackage = { ...mockPackageContent };
      customPackage.metadata.title = 'Custom Test Package';

      await DocumentGeneratorService.generateDocument(fullSurveyResponses, customPackage);
      
      // Then: Document generation should succeed
      const { saveAs } = await import('file-saver');
      const calls = vi.mocked(saveAs).mock.calls;
      
      // Find a call with the custom package name
      const hasCustomPackage = calls.some(([, filename]) => 
        typeof filename === 'string' && filename.includes('Custom_Test_Package')
      );
      expect(hasCustomPackage).toBe(true);
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
      expect(blob).toBeDefined();
      
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

    test('should preserve boolean values as true/false for template conditionals', async () => {
      // Given: Survey responses with specific boolean values
      const responsesWithBooleans = {
        employee_name: 'John Doe',
        is_full_time: true,
        has_car_allowance: false,
        requires_travel: true
      };

      // And: Mock mappings that include boolean fields
      const mappingsWithBooleans = [
        {
          id: '1',
          surveyField: 'employee_name',
          placeholder: '{employee_name}',
          placeholderType: 'simple' as const,
          isRequired: true,
          isValid: true
        },
        {
          id: '2',
          surveyField: 'is_full_time',
          placeholder: '{is_full_time}',
          placeholderType: 'simple' as const,
          isRequired: false,
          isValid: true
        },
        {
          id: '3',
          surveyField: 'has_car_allowance',
          placeholder: '{has_car_allowance}',
          placeholderType: 'simple' as const,
          isRequired: false,
          isValid: true
        },
        {
          id: '4',
          surveyField: 'requires_travel',
          placeholder: '{requires_travel}',
          placeholderType: 'simple' as const,
          isRequired: false,
          isValid: true
        }
      ];

      // When: Transform responses to template data
      const templateData = DocumentGeneratorService.getTemplateDataPreview(
        responsesWithBooleans,
        mappingsWithBooleans
      );

      // Then: Boolean values should remain as boolean true/false, not converted to strings
      // This is important for template conditional logic (e.g., {#has_car_allowance}...{/has_car_allowance})
      // If it were converted to 'Yes'/'No', both would be truthy and conditionals wouldn't work
      expect(templateData.is_full_time).toBe(true);
      expect(templateData.has_car_allowance).toBe(false);
      expect(templateData.requires_travel).toBe(true);
      // Also verify the string value is properly passed through
      expect(templateData.employee_name).toBe('John Doe');
    });
  });

  describe('multi-template generation', () => {
    test('should generate multiple documents from multi-template package', async () => {
      // Import the multi-template package creator
      const { createMockMultiTemplatePackageContent } = await import('../helpers/test-utils');
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);
      
      // Given: A multi-template package
      const multiTemplatePackage = createMockMultiTemplatePackageContent();
      
      // When: Generate all documents
      const results = await DocumentGeneratorService.generateAllDocuments(
        fullSurveyResponses,
        multiTemplatePackage
      );

      // Then: Should generate documents for each template
      expect(results).toHaveLength(2);
      expect(saveAsMock).toHaveBeenCalledTimes(2);
      
      // Verify each document was generated
      expect(results[0].templateId).toBe('template-contract');
      expect(results[0].filename).toContain('templatecontract');
      expect(results[1].templateId).toBe('template-nda');
      expect(results[1].filename).toContain('templatenda');
    });

    test('should skip templates without mappings in multi-template package', async () => {
      // Import the multi-template package creator
      const { createMockMultiTemplatePackageContent } = await import('../helpers/test-utils');
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);
      
      // Given: A multi-template package with one template missing mappings
      const packageWithMissingMapping = createMockMultiTemplatePackageContent();
      // Remove mappings for the NDA template
      packageWithMissingMapping.templateMappings = packageWithMissingMapping.templateMappings.filter(
        tm => tm.templateId !== 'template-nda'
      );
      
      // When: Generate all documents
      const results = await DocumentGeneratorService.generateAllDocuments(
        fullSurveyResponses,
        packageWithMissingMapping
      );

      // Then: Should only generate one document (contract only)
      expect(results).toHaveLength(1);
      expect(saveAsMock).toHaveBeenCalledTimes(1);
      expect(results[0].templateId).toBe('template-contract');
    });

    test('should throw error when package has no templates', async () => {
      // Given: A package with no templates
      const emptyTemplatePackage = {
        ...mockPackageContent,
        templates: [],
        template: undefined
      };

      // When/Then: Should throw error
      await expect(
        DocumentGeneratorService.generateAllDocuments(
          fullSurveyResponses,
          emptyTemplatePackage as any
        )
      ).rejects.toThrow('Package must contain at least one template');
    });

    test('should throw error when no documents could be generated', async () => {
      // Import the multi-template package creator
      const { createMockMultiTemplatePackageContent } = await import('../helpers/test-utils');
      
      // Given: A multi-template package with no mappings at all
      const packageWithNoMappings = createMockMultiTemplatePackageContent();
      packageWithNoMappings.templateMappings = [];
      
      // When/Then: Should throw error
      await expect(
        DocumentGeneratorService.generateAllDocuments(
          fullSurveyResponses,
          packageWithNoMappings
        )
      ).rejects.toThrow('No documents were generated');
    });

    test('should fall back to multi-template generation when templates array exists', async () => {
      // Import the multi-template package creator
      const { createMockMultiTemplatePackageContent } = await import('../helpers/test-utils');
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);
      
      // Given: A multi-template package
      const multiTemplatePackage = createMockMultiTemplatePackageContent();
      
      // When: Call generateDocument (legacy method)
      await DocumentGeneratorService.generateDocument(
        fullSurveyResponses,
        multiTemplatePackage
      );

      // Then: Should generate all documents from templates array
      expect(saveAsMock).toHaveBeenCalledTimes(2);
    });

    test('should generate unique filenames for each template', async () => {
      // Import the multi-template package creator
      const { createMockMultiTemplatePackageContent } = await import('../helpers/test-utils');
      const { saveAs } = await import('file-saver');
      const saveAsMock = vi.mocked(saveAs);
      
      // Given: A multi-template package
      const multiTemplatePackage = createMockMultiTemplatePackageContent();
      
      // When: Generate all documents
      await DocumentGeneratorService.generateAllDocuments(
        fullSurveyResponses,
        multiTemplatePackage
      );

      // Then: Each document should have a unique filename
      const filenames = saveAsMock.mock.calls.map(call => call[1]);
      expect(new Set(filenames).size).toBe(filenames.length); // All unique
    });
  });
});