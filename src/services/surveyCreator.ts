import 'survey-core/defaultV2.min.css';
import 'survey-creator-core/survey-creator-core.min.css';

import { SurveyCreatorModel } from 'survey-creator-core';
import { surveyLocalization } from 'survey-core';
import type { SurveyDefinition } from '@/types';
import { FileUtils, DateUtils } from '@/utils/common';

/**
 * Survey.js Creator integration service
 * Handles the survey designer interface and JSON generation
 */
export class SurveyCreatorService {
  private creatorModel: SurveyCreatorModel | null = null;
  private container: HTMLElement | null = null;

  /**
   * Initialize the Survey.js Creator component
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    
    // Set up Survey.js localization
    surveyLocalization.defaultLocale = 'en';
    
    // Create the Survey Creator model
    this.creatorModel = new SurveyCreatorModel({
      showLogicTab: true,
      showTranslationTab: false,
      showThemeTab: false,
      isAutoSave: false,
    });
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Render the creator
    this.creatorModel.render(container);
    
    console.log('Survey Creator initialized');
  }

  /**
   * Set up event handlers for the creator
   */
  private setupEventHandlers(): void {
    if (!this.creatorModel) return;
    
    // Handle survey changes (for auto-save functionality later)
    this.creatorModel.onModified.add(() => {
      console.log('Survey modified');
    });
    
    // Handle survey JSON changes
    this.creatorModel.onTextChanged.add(() => {
      console.log('Survey JSON changed');
    });
  }

  /**
   * Load an existing survey into the creator
   */
  loadSurvey(surveyJson: SurveyDefinition): void {
    if (!this.creatorModel) {
      throw new Error('Creator not initialized');
    }
    
    try {
      this.creatorModel.text = JSON.stringify(surveyJson, null, 2);
      console.log('Survey loaded into creator');
    } catch (error) {
      console.error('Error loading survey:', error);
      throw new Error('Failed to load survey. Please check the JSON format.');
    }
  }

  /**
   * Get the current survey JSON
   */
  getSurveyJson(): SurveyDefinition {
    if (!this.creatorModel) {
      throw new Error('Creator not initialized');
    }
    
    try {
      return JSON.parse(this.creatorModel.text);
    } catch (error) {
      throw new Error('Invalid survey JSON. Please check your survey configuration.');
    }
  }

  /**
   * Validate the current survey
   */
  validateSurvey(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      const survey = this.getSurveyJson();
      
      // Basic validation
      if (!survey.title || survey.title.trim() === '') {
        errors.push('Survey title is required');
      }
      
      if (!survey.pages || survey.pages.length === 0) {
        errors.push('Survey must have at least one page');
      }
      
      // Check for questions
      const hasQuestions = survey.pages?.some(page => 
        page.elements && page.elements.length > 0
      );
      
      if (!hasQuestions) {
        errors.push('Survey must have at least one question');
      }
      
    } catch (error) {
      errors.push('Invalid JSON format');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Preview the survey in runtime mode
   */
  showPreview(): void {
    if (!this.creatorModel) {
      throw new Error('Creator not initialized');
    }
    
    try {
      // This will open the preview tab in Survey.js Creator
      this.creatorModel.showPreview();
    } catch (error) {
      console.error('Error showing preview:', error);
      throw new Error('Could not show preview. Please check your survey configuration.');
    }
  }

  /**
   * Download the survey as JSON file
   */
  downloadSurvey(surveyName?: string): void {
    const validation = this.validateSurvey();
    
    if (!validation.isValid) {
      throw new Error(`Cannot download invalid survey:\\n${validation.errors.join('\\n')}`);
    }
    
    const survey = this.getSurveyJson();
    const name = surveyName || survey.title || 'untitled';
    const sanitizedName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    const filename = `survey-${sanitizedName}-${DateUtils.getDateString()}.json`;
    
    FileUtils.downloadJson(survey, filename);
  }

  /**
   * Create a new blank survey
   */
  createNewSurvey(): void {
    if (!this.creatorModel) {
      throw new Error('Creator not initialized');
    }
    
    const blankSurvey: SurveyDefinition = {
      title: 'New Survey',
      description: '',
      pages: [
        {
          name: 'page1',
          elements: []
        }
      ]
    };
    
    this.loadSurvey(blankSurvey);
  }

  /**
   * Get survey field names for mapping
   */
  getSurveyFields(): string[] {
    try {
      const survey = this.getSurveyJson();
      const fields: string[] = [];
      
      survey.pages?.forEach(page => {
        page.elements?.forEach((element: any) => {
          if (element.name) {
            fields.push(element.name);
          }
        });
      });
      
      return fields;
    } catch (error) {
      console.error('Error extracting survey fields:', error);
      return [];
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.creatorModel) {
      this.creatorModel.dispose();
      this.creatorModel = null;
    }
    this.container = null;
  }
}