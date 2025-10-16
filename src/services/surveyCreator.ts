import 'survey-core/defaultV2.min.css';

import { Model } from 'survey-core';
import type { SurveyDefinition, SurveyElement } from '@/types';
import { FileUtils, DateUtils } from '@/utils/common';

/**
 * Lightweight survey creator service
 * Handles survey design and JSON generation without the heavy SurveyCreatorModel
 * Supports: text, comment, boolean, radiogroup, dropdown, html element types
 */
export class SurveyCreatorService {
  private container: HTMLElement | null = null;
  private currentSurvey: SurveyDefinition | null = null;

  /**
   * Initialize the lightweight Survey Creator component
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    
    // Configure default survey for new creations
    this.setupDefaultSurvey();
    
    // Render the creator using the container's innerHTML approach
    this.renderCreator(container);
    
    console.log('Survey Creator initialized (lightweight version)');
  }

  /**
   * Set up default survey configuration
   */
  private setupDefaultSurvey(): void {
    const defaultSurvey: SurveyDefinition = {
      title: 'New Legal Document Survey',
      description: 'Collect information for document generation',
      pages: [
        {
          name: 'page1',
          elements: [
            {
              type: 'html',
              name: 'info',
              html: '<p><b>Instructions:</b> Please fill out this survey to generate your legal document.</p>'
            }
          ]
        }
      ]
    };
    
    this.loadSurvey(defaultSurvey);
  }

  /**
   * Render the Survey Creator in the container
   */
  private renderCreator(container: HTMLElement): void {
    // Clear container
    container.innerHTML = '';
    
    // Create creator container
    const creatorDiv = document.createElement('div');
    creatorDiv.id = 'survey-creator-container';
    creatorDiv.style.height = '600px';
    container.appendChild(creatorDiv);
    
    // Render our simplified creator interface
    this.renderSimplifiedCreator(creatorDiv);
  }

  /**
   * Render a simplified creator interface
   */
  private renderSimplifiedCreator(container: HTMLElement): void {
    container.innerHTML = `
      <div class="border border-gray-300 rounded-lg h-full flex flex-col">
        <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Survey Designer</h3>
          <p class="text-sm text-gray-600">Create your questionnaire using the tools below</p>
        </div>
        
        <div class="flex-1 flex">
          <!-- Toolbox -->
          <div class="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <h4 class="font-medium text-gray-900 mb-3">Question Types</h4>
            <div class="space-y-2">
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="text">
                📝 Text Input
              </button>
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="comment">
                📄 Multi-line Text
              </button>
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="boolean">
                ☑️ Yes/No Checkbox
              </button>
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="radiogroup">
                🔘 Radio Buttons
              </button>
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="dropdown">
                📋 Dropdown List
              </button>
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="html">
                ℹ️ Information Text
              </button>
            </div>
          </div>
          
          <!-- Designer Area -->
          <div class="flex-1 p-4">
            <div id="survey-designer-area" class="h-full">
              <div class="text-center text-gray-500 mt-20">
                <p>Drag question types from the left to build your survey</p>
                <p class="text-sm mt-2">Or use the buttons to add questions</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-between">
          <button id="preview-survey" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
            👁️ Preview
          </button>
          <button id="download-survey" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
            💾 Download Survey JSON
          </button>
        </div>
      </div>
    `;
    
    this.setupCreatorEvents(container);
    this.setupGlobalFunctions();
  }

  /**
   * Set up events for the simplified creator
   */
  private setupCreatorEvents(container: HTMLElement): void {
    // Add question buttons
    container.querySelectorAll('.add-question-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = (e.target as HTMLElement).dataset.type;
        this.addQuestion(type!);
      });
    });
    
    // Preview button
    container.querySelector('#preview-survey')?.addEventListener('click', () => {
      this.previewSurvey();
    });
    
    // Download button
    container.querySelector('#download-survey')?.addEventListener('click', () => {
      this.downloadSurveyJson();
    });
  }

  /**
   * Set up global functions for HTML event handlers
   */
  private setupGlobalFunctions(): void {
    // Make functions available globally for HTML onclick handlers
    (window as any).updateQuestion = (index: number, field: string, value: string) => {
      const survey = this.getSurveyJson();
      if (survey.pages && survey.pages[0] && survey.pages[0].elements && survey.pages[0].elements[index]) {
        if (field === 'title') {
          survey.pages[0].elements[index].title = value;
        } else if (field === 'html') {
          survey.pages[0].elements[index].html = value;
        }
        this.loadSurvey(survey);
      }
    };

    (window as any).updateQuestionChoices = (index: number, choicesText: string) => {
      const survey = this.getSurveyJson();
      if (survey.pages && survey.pages[0] && survey.pages[0].elements && survey.pages[0].elements[index]) {
        const choices = choicesText.split('\n').filter(choice => choice.trim() !== '');
        survey.pages[0].elements[index].choices = choices;
        this.loadSurvey(survey);
      }
    };

    (window as any).removeQuestion = (index: number) => {
      const survey = this.getSurveyJson();
      if (survey.pages && survey.pages[0] && survey.pages[0].elements) {
        survey.pages[0].elements.splice(index, 1);
        this.loadSurvey(survey);
        this.refreshDesignerArea();
      }
    };
  }

  /**
   * Add a question to the current survey
   */
  private addQuestion(type: string): void {
    const survey = this.getSurveyJson();
    if (!survey.pages || survey.pages.length === 0) {
      survey.pages = [{ name: 'page1', elements: [] }];
    }
    
    const questionCount = survey.pages[0].elements?.length || 0;
    const questionName = `question_${questionCount + 1}`;
    
    let newQuestion: SurveyElement = {
      type: type as SurveyElement['type'],
      name: questionName,
      title: `Question ${questionCount + 1}`
    };
    
    // Configure based on question type
    switch (type) {
      case 'text':
        newQuestion.title = 'Text Input Question';
        newQuestion.isRequired = true;
        break;
      case 'comment':
        newQuestion.title = 'Multi-line Text Question';
        newQuestion.isRequired = true;
        break;
      case 'boolean':
        newQuestion.title = 'Yes/No Question';
        newQuestion.isRequired = true;
        break;
      case 'radiogroup':
        newQuestion.title = 'Radio Button Question';
        newQuestion.choices = ['Option 1', 'Option 2', 'Option 3'];
        newQuestion.isRequired = true;
        break;
      case 'dropdown':
        newQuestion.title = 'Dropdown Question';
        newQuestion.choices = ['Option 1', 'Option 2', 'Option 3'];
        newQuestion.isRequired = true;
        break;
      case 'html':
        newQuestion.html = '<p><b>Information:</b> Add your explanatory text here.</p>';
        break;
    }
    
    survey.pages[0].elements = survey.pages[0].elements || [];
    survey.pages[0].elements.push(newQuestion);
    
    this.loadSurvey(survey);
    this.refreshDesignerArea();
  }

  /**
   * Refresh the designer area display
   */
  private refreshDesignerArea(): void {
    const designerArea = this.container?.querySelector('#survey-designer-area');
    if (!designerArea) return;
    
    const survey = this.getSurveyJson();
    const questions = survey.pages?.[0]?.elements || [];
    
    if (questions.length === 0) {
      designerArea.innerHTML = `
        <div class="text-center text-gray-500 mt-20">
          <p>Drag question types from the left to build your survey</p>
          <p class="text-sm mt-2">Or use the buttons to add questions</p>
        </div>
      `;
      return;
    }
    
    designerArea.innerHTML = `
      <div class="space-y-4">
        <div class="mb-6">
          <h3 class="text-lg font-medium text-gray-900 mb-2">${survey.title}</h3>
          <p class="text-gray-600">${survey.description || ''}</p>
        </div>
        ${questions.map((q: any, index: number) => this.renderQuestionEditor(q, index)).join('')}
      </div>
    `;
  }

  /**
   * Render a question editor
   */
  private renderQuestionEditor(question: SurveyElement, index: number): string {
    const typeLabels: Record<string, string> = {
      text: '📝 Text Input',
      comment: '📄 Multi-line Text',
      boolean: '☑️ Yes/No Checkbox',
      radiogroup: '🔘 Radio Buttons',
      dropdown: '📋 Dropdown List',
      html: 'ℹ️ Information Text'
    };
    
    return `
      <div class="border border-gray-200 rounded-lg p-4 bg-white">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-medium text-gray-500">${typeLabels[question.type] || question.type}</span>
          <button class="text-red-600 hover:text-red-800 text-sm" onclick="removeQuestion(${index})">Remove</button>
        </div>
        <div class="space-y-3">
          <input 
            type="text" 
            value="${question.title || question.html || ''}" 
            placeholder="Question title or content"
            class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            onchange="updateQuestion(${index}, 'title', this.value)"
          />
          ${question.type === 'radiogroup' || question.type === 'dropdown' ? `
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Choices (one per line):</label>
              <textarea 
                rows="3" 
                class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                onchange="updateQuestionChoices(${index}, this.value)"
              >${(question.choices || []).join('\\n')}</textarea>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Load an existing survey into the creator
   */
  loadSurvey(surveyJson: SurveyDefinition): void {
    try {
      this.currentSurvey = JSON.parse(JSON.stringify(surveyJson)); // Deep clone
      this.refreshDesignerArea();
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
    if (!this.currentSurvey) {
      throw new Error('No survey loaded');
    }
    
    return JSON.parse(JSON.stringify(this.currentSurvey)); // Return a deep clone
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
    try {
      this.previewSurvey();
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
   * Preview current survey in a modal
   */
  private previewSurvey(): void {
    const survey = this.getSurveyJson();
    
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto relative';
    
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-4 border-b pb-4';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold text-gray-900';
    title.textContent = 'Survey Preview';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'text-gray-400 hover:text-gray-600 text-xl';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => modal.remove());
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    const surveyContainer = document.createElement('div');
    surveyContainer.id = 'preview-survey-container';
    
    modalContent.appendChild(header);
    modalContent.appendChild(surveyContainer);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Render survey
    const surveyModel = new Model(survey);
    surveyModel.render(surveyContainer);
  }

  /**
   * Download survey as JSON file
   */
  private downloadSurveyJson(): void {
    try {
      const survey = this.getSurveyJson();
      const jsonString = JSON.stringify(survey, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `survey-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading survey:', error);
    }
  }

  /**
   * Get survey field names for mapping
   */
  getSurveyFields(): string[] {
    try {
      const survey = this.getSurveyJson();
      const fields: string[] = [];
      
      survey.pages?.forEach(page => {
        page.elements?.forEach((element: SurveyElement) => {
          if (element.name && element.type !== 'html') {
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
   * Get current survey for cross-tab sharing
   */
  getCurrentSurvey(): SurveyDefinition | null {
    return this.currentSurvey;
  }

  /**
   * Set survey title and description
   */
  updateSurveyMetadata(title: string, description?: string): void {
    const survey = this.getSurveyJson();
    survey.title = title;
    if (description !== undefined) {
      survey.description = description;
    }
    this.loadSurvey(survey);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.container = null;
    this.currentSurvey = null;
  }
}