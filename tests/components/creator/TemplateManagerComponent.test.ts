import { describe, test, expect, beforeEach, vi } from 'vitest';
import { TemplateManagerComponent } from '@/components/creator/TemplateManagerComponent';
import { SurveyCreatorService } from '@/services/surveyCreator';
import { DocxParserService } from '@/services/docxParser';

describe('TemplateManagerComponent', () => {
  let component: TemplateManagerComponent;
  let mockSurveyCreatorService: SurveyCreatorService;
  let container: HTMLElement;

  beforeEach(() => {
    // Create a mock SurveyCreatorService
    mockSurveyCreatorService = new SurveyCreatorService();
    
    // Create component with the service
    component = new TemplateManagerComponent(mockSurveyCreatorService);
    
    // Create a container element for rendering
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('constructor', () => {
    test('should accept SurveyCreatorService as dependency', () => {
      const service = new SurveyCreatorService();
      const templateManager = new TemplateManagerComponent(service);
      expect(templateManager).toBeInstanceOf(TemplateManagerComponent);
    });
  });

  describe('validateWithSurvey', () => {
    test('should use real survey fields from SurveyCreatorService', () => {
      // Set up a survey with specific fields in the mock service
      const testSurvey = {
        title: 'Test Survey',
        description: 'Test',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'client_name', title: 'Client Name' },
              { type: 'text' as const, name: 'contract_date', title: 'Contract Date' },
              { type: 'text' as const, name: 'project_scope', title: 'Project Scope' }
            ]
          }
        ]
      };
      
      mockSurveyCreatorService.loadSurvey(testSurvey);
      
      // Verify the service returns the expected fields
      const surveyFields = mockSurveyCreatorService.getSurveyFields();
      expect(surveyFields).toContain('client_name');
      expect(surveyFields).toContain('contract_date');
      expect(surveyFields).toContain('project_scope');
      expect(surveyFields).not.toContain('employee_name'); // The old mock field should not be present
    });

    test('should validate template placeholders against current survey fields', () => {
      // Set up a survey with specific fields
      const testSurvey = {
        title: 'Employment Survey',
        description: 'Employment info',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'employee_name', title: 'Employee Name' },
              { type: 'text' as const, name: 'department', title: 'Department' },
              { type: 'text' as const, name: 'hire_date', title: 'Hire Date' }
            ]
          }
        ]
      };
      
      mockSurveyCreatorService.loadSurvey(testSurvey);
      
      // Create mock placeholders matching and not matching survey fields
      const placeholders = [
        { name: 'employee_name', type: 'simple' as const, fullMatch: '{employee_name}', isRequired: true, context: '' },
        { name: 'department', type: 'simple' as const, fullMatch: '{department}', isRequired: true, context: '' },
        { name: 'job_title', type: 'simple' as const, fullMatch: '{job_title}', isRequired: true, context: '' } // Not in survey
      ];
      
      // Get survey fields from the service
      const surveyFields = mockSurveyCreatorService.getSurveyFields();
      
      // Validate using the DocxParserService
      const validation = DocxParserService.validatePlaceholders(placeholders, surveyFields);
      
      // employee_name and department should be valid (matched)
      expect(validation.valid).toHaveLength(2);
      expect(validation.valid.map(p => p.name)).toContain('employee_name');
      expect(validation.valid.map(p => p.name)).toContain('department');
      
      // job_title should be invalid (not in survey)
      expect(validation.invalid).toHaveLength(1);
      expect(validation.invalid[0].name).toBe('job_title');
      
      // hire_date should be missing (in survey but not in template)
      expect(validation.missing).toHaveLength(1);
      expect(validation.missing).toContain('hire_date');
    });
  });

  describe('integration with SurveyCreatorService', () => {
    test('should get empty fields when survey has no questions', () => {
      const emptySurvey = {
        title: 'Empty Survey',
        description: '',
        pages: [
          {
            name: 'page1',
            elements: []
          }
        ]
      };
      
      mockSurveyCreatorService.loadSurvey(emptySurvey);
      const surveyFields = mockSurveyCreatorService.getSurveyFields();
      
      expect(surveyFields).toHaveLength(0);
    });

    test('should exclude html elements from survey fields', () => {
      const surveyWithHtml = {
        title: 'Survey with HTML',
        description: '',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'text_field', title: 'Text Field' },
              { type: 'html' as const, name: 'info_block', html: '<p>Information</p>' }
            ]
          }
        ]
      };
      
      mockSurveyCreatorService.loadSurvey(surveyWithHtml);
      const surveyFields = mockSurveyCreatorService.getSurveyFields();
      
      expect(surveyFields).toContain('text_field');
      expect(surveyFields).not.toContain('info_block');
    });

    test('should collect fields from multiple pages', () => {
      const multiPageSurvey = {
        title: 'Multi-page Survey',
        description: '',
        pages: [
          {
            name: 'page1',
            elements: [
              { type: 'text' as const, name: 'first_name', title: 'First Name' }
            ]
          },
          {
            name: 'page2',
            elements: [
              { type: 'text' as const, name: 'last_name', title: 'Last Name' }
            ]
          }
        ]
      };
      
      mockSurveyCreatorService.loadSurvey(multiPageSurvey);
      const surveyFields = mockSurveyCreatorService.getSurveyFields();
      
      expect(surveyFields).toContain('first_name');
      expect(surveyFields).toContain('last_name');
      expect(surveyFields).toHaveLength(2);
    });
  });
});
