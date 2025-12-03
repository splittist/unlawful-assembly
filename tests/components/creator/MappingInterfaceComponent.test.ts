import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { MappingInterfaceComponent } from '@/components/creator/MappingInterfaceComponent';
import { TemplateManagerComponent } from '@/components/creator/TemplateManagerComponent';
import { FieldMappingService } from '@/services/fieldMapping';
import { SurveyCreatorService } from '@/services/surveyCreator';
import { createMockDocxPlaceholder } from '../../helpers/test-utils';
import type { DocxPlaceholder } from '@/services/docxParser';
import type { TemplateEntry } from '@/services/packageService';

describe('MappingInterfaceComponent', () => {
  let component: MappingInterfaceComponent;
  let mockMappingService: FieldMappingService;
  let mockSurveyCreatorService: SurveyCreatorService;
  let mockTemplateManagerComponent: TemplateManagerComponent;
  let container: HTMLElement;

  beforeEach(() => {
    // Create mock services
    mockMappingService = new FieldMappingService();
    mockSurveyCreatorService = new SurveyCreatorService();
    mockTemplateManagerComponent = new TemplateManagerComponent(mockSurveyCreatorService);

    // Create component
    component = new MappingInterfaceComponent(
      mockMappingService,
      mockSurveyCreatorService,
      mockTemplateManagerComponent
    );

    // Create a container element for rendering
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clean up the container from the document
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    test('should accept all required dependencies', () => {
      const mapping = new FieldMappingService();
      const survey = new SurveyCreatorService();
      const template = new TemplateManagerComponent(survey);

      const component = new MappingInterfaceComponent(mapping, survey, template);
      expect(component).toBeInstanceOf(MappingInterfaceComponent);
    });
  });

  describe('loadMappingData - template placeholder aggregation', () => {
    test('should aggregate placeholders from all templates in the package', () => {
      // Given: A survey with fields
      const testSurvey = {
        title: 'Test Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'employee_name', title: 'Employee Name' },
              { type: 'text' as const, name: 'company_name', title: 'Company Name' },
              { type: 'text' as const, name: 'project_name', title: 'Project Name' }
            ]
          }
        ]
      };
      mockSurveyCreatorService.loadSurvey(testSurvey);

      // And: Multiple templates with different placeholders - mock getTemplates
      const mockTemplate1: TemplateEntry = {
        id: 'template-1',
        filename: 'contract.docx',
        content: new ArrayBuffer(100),
        placeholders: [
          createMockDocxPlaceholder('employee_name'),
          createMockDocxPlaceholder('company_name')
        ]
      };

      const mockTemplate2: TemplateEntry = {
        id: 'template-2',
        filename: 'nda.docx',
        content: new ArrayBuffer(100),
        placeholders: [
          createMockDocxPlaceholder('employee_name'), // duplicate - should be deduplicated
          createMockDocxPlaceholder('project_name') // unique to template 2
        ]
      };

      // Mock getTemplates to return our test templates
      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue([
        mockTemplate1,
        mockTemplate2
      ]);

      // And: No staging parse result (templates have been added to package)
      vi.spyOn(mockTemplateManagerComponent, 'getParseResult').mockReturnValue(null);

      // When: We spy on the mapping service to verify initialization
      const initializeSpy = vi.spyOn(mockMappingService, 'initialize');

      // And: Render and trigger load data
      component.render(container);
      const loadDataBtn = container.querySelector('#load-data-btn') as HTMLButtonElement;
      loadDataBtn.click();

      // Then: The mapping service should be initialized with aggregated placeholders
      expect(initializeSpy).toHaveBeenCalled();
      
      const [surveyFields, placeholders] = initializeSpy.mock.calls[0];
      
      // Should have 3 survey fields
      expect(surveyFields).toHaveLength(3);
      expect(surveyFields).toContain('employee_name');
      expect(surveyFields).toContain('company_name');
      expect(surveyFields).toContain('project_name');

      // Should have 3 unique placeholders (employee_name deduplicated)
      expect(placeholders).toHaveLength(3);
      const placeholderNames = placeholders.map((p: DocxPlaceholder) => p.name);
      expect(placeholderNames).toContain('employee_name');
      expect(placeholderNames).toContain('company_name');
      expect(placeholderNames).toContain('project_name');
    });

    test('should include staging parse result placeholders if available', () => {
      // Given: A survey with fields
      const testSurvey = {
        title: 'Test Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'employee_name', title: 'Employee Name' },
              { type: 'text' as const, name: 'salary', title: 'Salary' }
            ]
          }
        ]
      };
      mockSurveyCreatorService.loadSurvey(testSurvey);

      // And: One template already in the package
      const mockTemplate: TemplateEntry = {
        id: 'template-1',
        filename: 'contract.docx',
        content: new ArrayBuffer(100),
        placeholders: [createMockDocxPlaceholder('employee_name')]
      };

      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue([mockTemplate]);

      // And: A staging parse result with additional placeholder
      vi.spyOn(mockTemplateManagerComponent, 'getParseResult').mockReturnValue({
        placeholders: [createMockDocxPlaceholder('salary')],
        fileName: 'salary-doc.docx',
        fileSize: 1000,
        parseErrors: [],
        documentContent: ''
      });

      // When: We spy on the mapping service
      const initializeSpy = vi.spyOn(mockMappingService, 'initialize');

      // And: Trigger load data
      component.render(container);
      const loadDataBtn = container.querySelector('#load-data-btn') as HTMLButtonElement;
      loadDataBtn.click();

      // Then: Should have placeholders from both package templates and staging
      expect(initializeSpy).toHaveBeenCalled();
      const [, placeholders] = initializeSpy.mock.calls[0];
      
      expect(placeholders).toHaveLength(2);
      const placeholderNames = placeholders.map((p: DocxPlaceholder) => p.name);
      expect(placeholderNames).toContain('employee_name');
      expect(placeholderNames).toContain('salary');
    });

    test('should deduplicate placeholders between templates and staging', () => {
      // Given: A survey
      const testSurvey = {
        title: 'Test Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'employee_name', title: 'Employee Name' }
            ]
          }
        ]
      };
      mockSurveyCreatorService.loadSurvey(testSurvey);

      // And: A template in the package with employee_name
      const mockTemplate: TemplateEntry = {
        id: 'template-1',
        filename: 'contract.docx',
        content: new ArrayBuffer(100),
        placeholders: [createMockDocxPlaceholder('employee_name')]
      };

      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue([mockTemplate]);

      // And: Staging also has employee_name (duplicate)
      vi.spyOn(mockTemplateManagerComponent, 'getParseResult').mockReturnValue({
        placeholders: [createMockDocxPlaceholder('employee_name')],
        fileName: 'another.docx',
        fileSize: 1000,
        parseErrors: [],
        documentContent: ''
      });

      // When: We spy on the mapping service
      const initializeSpy = vi.spyOn(mockMappingService, 'initialize');

      // And: Trigger load data
      component.render(container);
      const loadDataBtn = container.querySelector('#load-data-btn') as HTMLButtonElement;
      loadDataBtn.click();

      // Then: Should only have one employee_name placeholder
      expect(initializeSpy).toHaveBeenCalled();
      const [, placeholders] = initializeSpy.mock.calls[0];
      
      expect(placeholders).toHaveLength(1);
      expect(placeholders[0].name).toBe('employee_name');
    });

    test('should handle empty templates array gracefully', () => {
      // Given: A survey with fields but no templates
      const testSurvey = {
        title: 'Test Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'employee_name', title: 'Employee Name' }
            ]
          }
        ]
      };
      mockSurveyCreatorService.loadSurvey(testSurvey);

      // And: No templates in the package
      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue([]);
      vi.spyOn(mockTemplateManagerComponent, 'getParseResult').mockReturnValue(null);

      // When: We trigger load data
      component.render(container);
      const loadDataBtn = container.querySelector('#load-data-btn') as HTMLButtonElement;
      
      // Then: Should not throw and should show warning (tested by UI state)
      expect(() => loadDataBtn.click()).not.toThrow();
    });
  });
});
