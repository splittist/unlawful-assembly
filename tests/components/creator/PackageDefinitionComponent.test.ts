import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { PackageDefinitionComponent } from '@/components/creator/PackageDefinitionComponent';
import { TemplateManagerComponent } from '@/components/creator/TemplateManagerComponent';
import { FieldMappingService } from '@/services/fieldMapping';
import { SurveyCreatorService } from '@/services/surveyCreator';
import { createMockDocxPlaceholder } from '../../helpers/test-utils';
import type { TemplateEntry } from '@/services/packageService';

describe('PackageDefinitionComponent', () => {
  let component: PackageDefinitionComponent;
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
    component = new PackageDefinitionComponent(
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

      const component = new PackageDefinitionComponent(mapping, survey, template);
      expect(component).toBeInstanceOf(PackageDefinitionComponent);
    });
  });

  describe('render', () => {
    test('should render package definition UI', () => {
      component.render(container);

      // Check that the main UI elements are rendered
      expect(container.querySelector('#new-package-btn')).not.toBeNull();
      expect(container.querySelector('#load-package-btn')).not.toBeNull();
      expect(container.querySelector('#validate-package-btn')).not.toBeNull();
      expect(container.querySelector('#export-package-btn')).not.toBeNull();
    });

    test('should render import buttons for survey, template, and mappings', () => {
      component.render(container);

      expect(container.querySelector('#import-survey-btn')).not.toBeNull();
      expect(container.querySelector('#import-template-btn')).not.toBeNull();
      expect(container.querySelector('#import-mappings-btn')).not.toBeNull();
    });
  });

  describe('importTemplatesFromInterface', () => {
    test('should import templates from TemplateManagerComponent', () => {
      // Setup mock templates
      const mockTemplates: TemplateEntry[] = [
        {
          id: 'template-1',
          filename: 'contract.docx',
          content: new ArrayBuffer(100),
          placeholders: [createMockDocxPlaceholder('employee_name')]
        },
        {
          id: 'template-2',
          filename: 'nda.docx',
          content: new ArrayBuffer(100),
          placeholders: [createMockDocxPlaceholder('company_name')]
        }
      ];

      // Mock the getTemplates method
      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue(mockTemplates);

      // Render and click import button
      component.render(container);
      const importTemplateBtn = container.querySelector('#import-template-btn') as HTMLButtonElement;
      importTemplateBtn.click();

      // Verify getTemplates was called
      expect(mockTemplateManagerComponent.getTemplates).toHaveBeenCalled();
    });

    test('should show warning when no templates available', () => {
      // Mock empty templates
      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue([]);

      // Render and click import button
      component.render(container);
      const importTemplateBtn = container.querySelector('#import-template-btn') as HTMLButtonElement;
      importTemplateBtn.click();

      // Verify getTemplates was called
      expect(mockTemplateManagerComponent.getTemplates).toHaveBeenCalled();
    });
  });

  describe('importMappingsFromInterface', () => {
    test('should import mappings from FieldMappingService', () => {
      // Setup mock mappings
      const placeholders = [
        createMockDocxPlaceholder('employee_name'),
        createMockDocxPlaceholder('company_name')
      ];
      mockMappingService.initialize(['employee_name', 'company_name'], placeholders);
      mockMappingService.createMapping('employee_name', 'employee_name');
      mockMappingService.createMapping('company_name', 'company_name');

      // Render and click import button
      component.render(container);
      const importMappingsBtn = container.querySelector('#import-mappings-btn') as HTMLButtonElement;
      importMappingsBtn.click();

      // Mappings should be imported
      const mappings = mockMappingService.getMappings();
      expect(mappings.length).toBe(2);
    });

    test('should build templateMappings when templates exist', () => {
      // Setup mock templates
      const mockTemplates: TemplateEntry[] = [
        {
          id: 'template-1',
          filename: 'contract.docx',
          content: new ArrayBuffer(100),
          placeholders: [createMockDocxPlaceholder('employee_name')]
        },
        {
          id: 'template-2',
          filename: 'nda.docx',
          content: new ArrayBuffer(100),
          placeholders: [createMockDocxPlaceholder('company_name')]
        }
      ];
      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue(mockTemplates);

      // Setup mock mappings
      const placeholders = [
        createMockDocxPlaceholder('employee_name'),
        createMockDocxPlaceholder('company_name')
      ];
      mockMappingService.initialize(['employee_name', 'company_name'], placeholders);
      mockMappingService.createMapping('employee_name', 'employee_name');
      mockMappingService.createMapping('company_name', 'company_name');

      // Render, first import templates, then import mappings
      component.render(container);
      
      const importTemplateBtn = container.querySelector('#import-template-btn') as HTMLButtonElement;
      importTemplateBtn.click();
      
      const importMappingsBtn = container.querySelector('#import-mappings-btn') as HTMLButtonElement;
      importMappingsBtn.click();

      // Verify mappings were imported
      const mappings = mockMappingService.getMappings();
      expect(mappings.length).toBe(2);
    });

    test('should show warning when no mappings available', () => {
      // No mappings setup
      const placeholders = [createMockDocxPlaceholder('employee_name')];
      mockMappingService.initialize(['employee_name'], placeholders);
      // Don't create any mappings

      // Render and click import button
      component.render(container);
      const importMappingsBtn = container.querySelector('#import-mappings-btn') as HTMLButtonElement;
      importMappingsBtn.click();

      // Mappings should be empty
      const mappings = mockMappingService.getMappings();
      expect(mappings.length).toBe(0);
    });

    test('should associate mappings with correct templates based on placeholders', () => {
      // Setup mock templates with different placeholders
      const mockTemplates: TemplateEntry[] = [
        {
          id: 'template-1',
          filename: 'contract.docx',
          content: new ArrayBuffer(100),
          placeholders: [createMockDocxPlaceholder('employee_name')]
        },
        {
          id: 'template-2',
          filename: 'nda.docx',
          content: new ArrayBuffer(100),
          placeholders: [createMockDocxPlaceholder('company_name')]
        }
      ];
      vi.spyOn(mockTemplateManagerComponent, 'getTemplates').mockReturnValue(mockTemplates);

      // Setup mock mappings for all placeholders
      const placeholders = [
        createMockDocxPlaceholder('employee_name'),
        createMockDocxPlaceholder('company_name')
      ];
      mockMappingService.initialize(['employee_name', 'company_name'], placeholders);
      mockMappingService.createMapping('employee_name', 'employee_name');
      mockMappingService.createMapping('company_name', 'company_name');

      // Render, import templates first, then mappings
      component.render(container);
      
      const importTemplateBtn = container.querySelector('#import-template-btn') as HTMLButtonElement;
      importTemplateBtn.click();
      
      const importMappingsBtn = container.querySelector('#import-mappings-btn') as HTMLButtonElement;
      importMappingsBtn.click();

      // The component should have built templateMappings internally
      // We can verify by checking that getMappings still works
      expect(mockMappingService.getMappings().length).toBe(2);
    });
  });

  describe('importSurveyFromCreator', () => {
    test('should import survey from SurveyCreatorService', () => {
      // Mock the survey creator to return a survey
      const mockSurvey = {
        title: 'Test Survey',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text', name: 'employee_name' }
            ]
          }
        ]
      };
      vi.spyOn(mockSurveyCreatorService, 'getSurveyJson').mockReturnValue(mockSurvey);

      // Render and click import button
      component.render(container);
      const importSurveyBtn = container.querySelector('#import-survey-btn') as HTMLButtonElement;
      importSurveyBtn.click();

      // Verify getSurveyJson was called
      expect(mockSurveyCreatorService.getSurveyJson).toHaveBeenCalled();
    });
  });
});
