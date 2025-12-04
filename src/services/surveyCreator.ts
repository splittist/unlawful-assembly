import type { SurveyDefinition, SurveyElement, SurveyPage, PropertyEditorSelection } from '@/types';
import { FileUtils, DateUtils } from '@/utils/common';
import { SurveyRuntimeService } from './surveyRuntime';

/**
 * Lightweight survey creator service
 * Handles survey design and JSON generation without the heavy SurveyCreatorModel
 * Supports: text, comment, boolean, radiogroup, dropdown, html element types
 */
export class SurveyCreatorService {
  private container: HTMLElement | null = null;
  private currentSurvey: SurveyDefinition | null = null;
  private currentPageIndex: number = 0;
  private selectedElement: PropertyEditorSelection = { type: null };
  private onSelectionChangeCallback: ((selection: PropertyEditorSelection) => void) | null = null;
  private onPropertyUpdateCallback: (() => void) | null = null;

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
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="checkbox">
                ☑️ Checkboxes
              </button>
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="dropdown">
                📋 Dropdown List
              </button>
              <button class="add-question-btn w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50" data-type="html">
                ℹ️ Information Text
              </button>
            </div>
            
            <div class="mt-6 pt-4 border-t border-gray-300">
              <h4 class="font-medium text-gray-900 mb-3">Pages</h4>
              <div id="page-list" class="space-y-2 mb-3">
                <!-- Page list will be rendered here -->
              </div>
              <button id="add-page-btn" class="w-full text-left px-3 py-2 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50">
                ➕ Add Page
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
    this.renderPageList();
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
    
    // Add page button
    container.querySelector('#add-page-btn')?.addEventListener('click', () => {
      this.handleAddPage();
    });
  }

  /**
   * Set up global functions for HTML event handlers
   */
  private setupGlobalFunctions(): void {
    // Make functions available globally for HTML onclick handlers
    (window as any).selectSurvey = () => {
      this.selectSurvey();
    };

    (window as any).selectPageHeader = (pageIndex: number) => {
      this.selectPage(pageIndex);
      this.refreshDesignerArea();
    };

    (window as any).selectElement = (elementName: string) => {
      this.selectElement(elementName);
      this.refreshDesignerArea();
    };

    (window as any).updateQuestion = (index: number, field: string, value: string) => {
      const survey = this.getSurveyJson();
      if (survey.pages && survey.pages[this.currentPageIndex] && survey.pages[this.currentPageIndex].elements && survey.pages[this.currentPageIndex].elements[index]) {
        if (field === 'title') {
          survey.pages[this.currentPageIndex].elements[index].title = value;
        } else if (field === 'html') {
          survey.pages[this.currentPageIndex].elements[index].html = value;
        }
        const savedPageIndex = this.currentPageIndex;
        this.loadSurvey(survey);
        this.currentPageIndex = savedPageIndex;
      }
    };

    (window as any).updateQuestionChoices = (index: number, choicesText: string) => {
      const survey = this.getSurveyJson();
      if (survey.pages && survey.pages[this.currentPageIndex] && survey.pages[this.currentPageIndex].elements && survey.pages[this.currentPageIndex].elements[index]) {
        const choices = choicesText.split('\n').filter(choice => choice.trim() !== '');
        survey.pages[this.currentPageIndex].elements[index].choices = choices;
        const savedPageIndex = this.currentPageIndex;
        this.loadSurvey(survey);
        this.currentPageIndex = savedPageIndex;
      }
    };

    (window as any).removeQuestion = (index: number) => {
      const survey = this.getSurveyJson();
      if (survey.pages && survey.pages[this.currentPageIndex] && survey.pages[this.currentPageIndex].elements) {
        survey.pages[this.currentPageIndex].elements.splice(index, 1);
        const savedPageIndex = this.currentPageIndex;
        this.loadSurvey(survey);
        this.currentPageIndex = savedPageIndex;
        this.refreshDesignerArea();
      }
    };

    (window as any).selectPage = (pageIndex: number) => {
      this.currentPageIndex = pageIndex;
      this.selectPage(pageIndex);
      this.refreshDesignerArea();
      this.renderPageList();
    };

    (window as any).deletePage = (pageIndex: number) => {
      try {
        this.removePage(pageIndex);
        if (this.currentPageIndex >= pageIndex && this.currentPageIndex > 0) {
          this.currentPageIndex--;
        }
        this.refreshDesignerArea();
        this.renderPageList();
      } catch (error) {
        alert((error as Error).message);
      }
    };

    (window as any).updatePageTitle = (pageIndex: number, title: string) => {
      try {
        this.updatePageMetadata(pageIndex, title, undefined);
        this.renderPageList();
      } catch (error) {
        console.error('Error updating page title:', error);
      }
    };

    (window as any).moveQuestion = (index: number, direction: 'up' | 'down') => {
      try {
        this.moveQuestion(index, direction);
        this.refreshDesignerArea();
      } catch (error) {
        console.error('Error moving question:', error);
      }
    };

    (window as any).movePage = (pageIndex: number, direction: 'up' | 'down') => {
      try {
        this.movePage(pageIndex, direction);
        this.refreshDesignerArea();
        this.renderPageList();
      } catch (error) {
        console.error('Error moving page:', error);
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
      this.currentPageIndex = 0;
    }
    
    const currentPage = survey.pages[this.currentPageIndex];
    const questionCount = currentPage.elements?.length || 0;
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
      case 'checkbox':
        newQuestion.title = 'Checkbox Question';
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
    
    currentPage.elements = currentPage.elements || [];
    currentPage.elements.push(newQuestion);
    
    // Preserve the current page index when reloading the survey
    const savedPageIndex = this.currentPageIndex;
    this.loadSurvey(survey);
    this.currentPageIndex = savedPageIndex;
    this.refreshDesignerArea();
  }

  /**
   * Refresh the designer area display
   */
  private refreshDesignerArea(): void {
    const designerArea = this.container?.querySelector('#survey-designer-area');
    if (!designerArea) return;
    
    const survey = this.getSurveyJson();
    
    // Survey header is always shown to allow editing survey-level properties
    const isSurveySelected = this.selectedElement.type === 'survey';
    const surveyHeaderClass = isSurveySelected ? 'bg-blue-50 border-blue-300' : 'bg-gray-100 border-transparent';
    const surveyHeaderHtml = `
      <div class="mb-4 p-3 border-2 ${surveyHeaderClass} rounded-lg cursor-pointer hover:border-blue-200 transition-colors" onclick="selectSurvey()">
        <div class="flex items-center">
          <span class="text-gray-500 mr-2">📋</span>
          <h3 class="text-lg font-semibold text-gray-900">${this.escapeHtml(survey.title || 'Untitled Survey')}</h3>
        </div>
        ${survey.description ? `<p class="text-sm text-gray-600 mt-1 ml-6">${this.escapeHtml(survey.description)}</p>` : '<p class="text-xs text-gray-400 mt-1 ml-6">Click to edit survey name and description</p>'}
      </div>
    `;
    
    if (!survey.pages || survey.pages.length === 0) {
      designerArea.innerHTML = `
        <div class="space-y-4">
          ${surveyHeaderHtml}
          <div class="text-center text-gray-500 mt-20">
            <p>No pages in survey</p>
            <p class="text-sm mt-2">Add a page to get started</p>
          </div>
        </div>
      `;
      return;
    }
    
    const currentPage = survey.pages[this.currentPageIndex];
    const questions = currentPage?.elements || [];
    
    const isPageSelected = this.selectedElement.type === 'page' && this.selectedElement.pageIndex === this.currentPageIndex;
    const pageHeaderClass = isPageSelected ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-transparent';
    
    if (questions.length === 0) {
      designerArea.innerHTML = `
        <div class="space-y-4">
          ${surveyHeaderHtml}
          <div class="mb-6 p-3 border-2 ${pageHeaderClass} rounded-lg cursor-pointer hover:border-blue-200 transition-colors" onclick="selectPageHeader(${this.currentPageIndex})">
            <h3 class="text-lg font-medium text-gray-900 mb-2">${this.escapeHtml(currentPage.title || currentPage.name)}</h3>
            ${currentPage.description ? `<p class="text-gray-600">${this.escapeHtml(currentPage.description)}</p>` : ''}
          </div>
          <div class="text-center text-gray-500 mt-20">
            <p>No questions on this page</p>
            <p class="text-sm mt-2">Add questions using the buttons on the left</p>
          </div>
        </div>
      `;
      return;
    }
    
    designerArea.innerHTML = `
      <div class="space-y-4">
        ${surveyHeaderHtml}
        <div class="mb-6 p-3 border-2 ${pageHeaderClass} rounded-lg cursor-pointer hover:border-blue-200 transition-colors" onclick="selectPageHeader(${this.currentPageIndex})">
          <h3 class="text-lg font-medium text-gray-900 mb-2">${this.escapeHtml(currentPage.title || currentPage.name)}</h3>
          ${currentPage.description ? `<p class="text-gray-600">${this.escapeHtml(currentPage.description)}</p>` : ''}
        </div>
        ${questions.map((q: any, index: number) => this.renderQuestionEditor(q, index)).join('')}
      </div>
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
      checkbox: '☑️ Checkboxes',
      dropdown: '📋 Dropdown List',
      html: 'ℹ️ Information Text'
    };
    
    const isSelected = this.selectedElement.type === 'element' && this.selectedElement.elementName === question.name;
    const selectedClass = isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white';
    
    // Get total count of questions on current page
    const survey = this.getSurveyJson();
    const currentPage = survey.pages?.[this.currentPageIndex];
    const totalQuestions = currentPage?.elements?.length || 0;
    const canMoveUp = index > 0;
    const canMoveDown = index < totalQuestions - 1;
    
    return `
      <div class="border ${selectedClass} rounded-lg p-4 cursor-pointer hover:border-blue-300 transition-colors" 
           onclick="selectElement('${question.name}')"
           data-element-name="${question.name}">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-medium text-gray-500">${typeLabels[question.type] || question.type}</span>
          <div class="flex items-center space-x-2">
            <button 
              class="text-gray-${canMoveUp ? '600 hover:text-gray-800' : '300 cursor-not-allowed'} text-sm px-1" 
              onclick="event.stopPropagation(); ${canMoveUp ? `moveQuestion(${index}, 'up')` : ''}"
              title="Move up"
              ${canMoveUp ? '' : 'disabled'}
            >↑</button>
            <button 
              class="text-gray-${canMoveDown ? '600 hover:text-gray-800' : '300 cursor-not-allowed'} text-sm px-1" 
              onclick="event.stopPropagation(); ${canMoveDown ? `moveQuestion(${index}, 'down')` : ''}"
              title="Move down"
              ${canMoveDown ? '' : 'disabled'}
            >↓</button>
            <button class="text-red-600 hover:text-red-800 text-sm" onclick="event.stopPropagation(); removeQuestion(${index})">Remove</button>
          </div>
        </div>
        <div class="space-y-3">
          <input 
            type="text" 
            value="${question.title || question.html || ''}" 
            placeholder="Question title or content"
            class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            onchange="updateQuestion(${index}, 'title', this.value)"
            onclick="event.stopPropagation()"
          />
          ${question.type === 'radiogroup' || question.type === 'dropdown' || question.type === 'checkbox' ? `
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Choices (one per line):</label>
              <textarea 
                rows="3" 
                class="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                onchange="updateQuestionChoices(${index}, this.value)"
                onclick="event.stopPropagation()"
              >${(question.choices || []).join('\\n')}</textarea>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render the page list in the toolbox
   */
  private renderPageList(): void {
    const pageListContainer = this.container?.querySelector('#page-list');
    if (!pageListContainer) return;
    
    const survey = this.getSurveyJson();
    const pages = survey.pages || [];
    
    if (pages.length === 0) {
      pageListContainer.innerHTML = `
        <div class="text-xs text-gray-500 px-2 py-1">No pages</div>
      `;
      return;
    }
    
    pageListContainer.innerHTML = pages.map((page, index) => {
      const isActive = index === this.currentPageIndex;
      const pageTitle = page.title || page.name;
      const canMoveUp = index > 0;
      const canMoveDown = index < pages.length - 1;
      return `
        <div class="flex items-center space-x-1 ${isActive ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-300'} border rounded px-2 py-1">
          <button 
            class="flex-1 text-left text-sm ${isActive ? 'font-medium text-blue-700' : 'text-gray-700'} hover:text-blue-600 truncate"
            onclick="selectPage(${index})"
            title="${this.escapeHtml(pageTitle)}"
          >
            ${this.escapeHtml(pageTitle)}
          </button>
          ${pages.length > 1 ? `
            <button 
              class="text-gray-${canMoveUp ? '600 hover:text-gray-800' : '300 cursor-not-allowed'} text-xs px-0.5"
              onclick="event.stopPropagation(); ${canMoveUp ? `movePage(${index}, 'up')` : ''}"
              title="Move page up"
              ${canMoveUp ? '' : 'disabled'}
            >↑</button>
            <button 
              class="text-gray-${canMoveDown ? '600 hover:text-gray-800' : '300 cursor-not-allowed'} text-xs px-0.5"
              onclick="event.stopPropagation(); ${canMoveDown ? `movePage(${index}, 'down')` : ''}"
              title="Move page down"
              ${canMoveDown ? '' : 'disabled'}
            >↓</button>
            <button 
              class="text-red-500 hover:text-red-700 text-xs"
              onclick="deletePage(${index})"
              title="Delete page"
            >
              ×
            </button>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Handle adding a new page
   */
  private handleAddPage(): void {
    try {
      const survey = this.getSurveyJson();
      const pageCount = survey.pages?.length || 0;
      this.addPage();
      this.currentPageIndex = pageCount; // Switch to the new page
      this.refreshDesignerArea();
      this.renderPageList();
    } catch (error) {
      console.error('Error adding page:', error);
      alert('Failed to add page');
    }
  }

  /**
   * Load an existing survey into the creator
   */
  loadSurvey(surveyJson: SurveyDefinition): void {
    try {
      this.currentSurvey = JSON.parse(JSON.stringify(surveyJson)); // Deep clone
      this.currentPageIndex = 0; // Reset to first page
      this.refreshDesignerArea();
      this.renderPageList();
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
    modalContent.className = 'bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-xl';
    
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-semibold text-gray-900';
    title.textContent = 'Survey Preview';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none';
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
    
    // Render survey using SurveyRuntimeService in preview mode
    const runtimeService = new SurveyRuntimeService();
    runtimeService.initialize(surveyContainer, survey, undefined, 'preview');
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
    const savedPageIndex = this.currentPageIndex;
    this.loadSurvey(survey);
    this.currentPageIndex = savedPageIndex;
  }

  /**
   * Get all pages in the survey
   */
  getPages(): SurveyPage[] {
    const survey = this.getSurveyJson();
    return survey.pages || [];
  }

  /**
   * Add a new page to the survey
   */
  addPage(name?: string, title?: string, description?: string): void {
    const survey = this.getSurveyJson();
    if (!survey.pages) {
      survey.pages = [];
    }
    
    const pageCount = survey.pages.length;
    const pageName = name || `page${pageCount + 1}`;
    const pageTitle = title || `Page ${pageCount + 1}`;
    
    const newPage: SurveyPage = {
      name: pageName,
      title: pageTitle,
      description: description,
      elements: []
    };
    
    survey.pages.push(newPage);
    this.loadSurvey(survey);
  }

  /**
   * Remove a page from the survey by index
   */
  removePage(pageIndex: number): void {
    const survey = this.getSurveyJson();
    if (!survey.pages || pageIndex < 0 || pageIndex >= survey.pages.length) {
      throw new Error('Invalid page index');
    }
    
    if (survey.pages.length === 1) {
      throw new Error('Cannot remove the last page. Survey must have at least one page.');
    }
    
    survey.pages.splice(pageIndex, 1);
    this.loadSurvey(survey);
  }

  /**
   * Update page metadata (title, description)
   */
  updatePageMetadata(pageIndex: number, title?: string, description?: string): void {
    const survey = this.getSurveyJson();
    if (!survey.pages || pageIndex < 0 || pageIndex >= survey.pages.length) {
      throw new Error('Invalid page index');
    }
    
    if (title !== undefined) {
      survey.pages[pageIndex].title = title;
    }
    if (description !== undefined) {
      survey.pages[pageIndex].description = description;
    }
    
    const savedPageIndex = this.currentPageIndex;
    this.loadSurvey(survey);
    this.currentPageIndex = savedPageIndex;
  }

  /**
   * Move a question within the current page
   * @param questionIndex - The index of the question to move
   * @param direction - 'up' to move the question earlier, 'down' to move it later
   */
  moveQuestion(questionIndex: number, direction: 'up' | 'down'): void {
    const survey = this.getSurveyJson();
    const currentPage = survey.pages?.[this.currentPageIndex];
    
    if (!currentPage?.elements) {
      throw new Error('No elements on current page');
    }
    
    const elements = currentPage.elements;
    const newIndex = direction === 'up' ? questionIndex - 1 : questionIndex + 1;
    
    if (newIndex < 0 || newIndex >= elements.length) {
      throw new Error('Cannot move question in that direction');
    }
    
    // Swap the elements
    [elements[questionIndex], elements[newIndex]] = [elements[newIndex], elements[questionIndex]];
    
    const savedPageIndex = this.currentPageIndex;
    this.loadSurvey(survey);
    this.currentPageIndex = savedPageIndex;
  }

  /**
   * Move a page within the survey
   * @param pageIndex - The index of the page to move
   * @param direction - 'up' to move the page earlier, 'down' to move it later
   */
  movePage(pageIndex: number, direction: 'up' | 'down'): void {
    const survey = this.getSurveyJson();
    
    if (!survey.pages) {
      throw new Error('No pages in survey');
    }
    
    const pages = survey.pages;
    const newIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1;
    
    if (newIndex < 0 || newIndex >= pages.length) {
      throw new Error('Cannot move page in that direction');
    }
    
    // Swap the pages
    [pages[pageIndex], pages[newIndex]] = [pages[newIndex], pages[pageIndex]];
    
    // Update current page index if we're moving the currently selected page
    if (this.currentPageIndex === pageIndex) {
      this.currentPageIndex = newIndex;
    } else if (this.currentPageIndex === newIndex) {
      this.currentPageIndex = pageIndex;
    }
    
    this.loadSurvey(survey);
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.container = null;
    this.currentSurvey = null;
    this.currentPageIndex = 0;
    this.selectedElement = { type: null };
    this.onSelectionChangeCallback = null;
    this.onPropertyUpdateCallback = null;
  }

  /**
   * Set callback for selection changes
   */
  onSelectionChange(callback: (selection: PropertyEditorSelection) => void): void {
    this.onSelectionChangeCallback = callback;
  }

  /**
   * Set callback for property updates
   */
  onPropertyUpdate(callback: () => void): void {
    this.onPropertyUpdateCallback = callback;
  }

  /**
   * Get current selection
   */
  getSelection(): PropertyEditorSelection {
    return { ...this.selectedElement };
  }

  /**
   * Select an element by name
   */
  selectElement(elementName: string | null): void {
    if (elementName === null) {
      this.selectedElement = { type: null };
    } else {
      this.selectedElement = { type: 'element', elementName };
    }
    this.notifySelectionChange();
  }

  /**
   * Select a page by index
   */
  selectPage(pageIndex: number): void {
    this.selectedElement = { type: 'page', pageIndex };
    this.notifySelectionChange();
  }

  /**
   * Select survey-level properties
   */
  selectSurvey(): void {
    this.selectedElement = { type: 'survey' };
    this.notifySelectionChange();
  }

  /**
   * Update element property
   */
  updateElementProperty(elementName: string, property: string, value: any): void {
    const survey = this.getSurveyJson();
    if (!survey.pages) return;

    let element: SurveyElement | null = null;
    let pageIndex = -1;
    let elementIndex = -1;

    // Find the element across all pages
    for (let i = 0; i < survey.pages.length; i++) {
      const page = survey.pages[i];
      const idx = page.elements?.findIndex(e => e.name === elementName);
      if (idx !== undefined && idx !== -1) {
        pageIndex = i;
        elementIndex = idx;
        element = page.elements![idx];
        break;
      }
    }

    if (!element || pageIndex === -1 || elementIndex === -1) {
      console.error('Element not found:', elementName);
      return;
    }

    // Update the property
    if (property === 'choices' && Array.isArray(value)) {
      element.choices = value;
    } else {
      (element as any)[property] = value;
    }

    const savedPageIndex = this.currentPageIndex;
    let savedSelection = { ...this.selectedElement };
    
    // If the name property was changed, update the selection to use the new name
    const nameWasChanged = property === 'name' && savedSelection.type === 'element' && savedSelection.elementName === elementName;
    if (nameWasChanged) {
      savedSelection = { ...savedSelection, elementName: value as string };
    }
    
    this.loadSurvey(survey);
    this.currentPageIndex = savedPageIndex;
    this.selectedElement = savedSelection;
    this.refreshDesignerArea();
    
    // When name is changed, notify as selection change so the property editor updates with new name
    if (nameWasChanged) {
      this.notifySelectionChange();
    } else {
      this.notifyPropertyUpdate();
    }
  }

  /**
   * Update page property
   */
  updatePageProperty(pageIndex: number, property: string, value: any): void {
    const survey = this.getSurveyJson();
    if (!survey.pages || pageIndex < 0 || pageIndex >= survey.pages.length) {
      throw new Error('Invalid page index');
    }

    (survey.pages[pageIndex] as any)[property] = value;

    const savedPageIndex = this.currentPageIndex;
    const savedSelection = { ...this.selectedElement };
    this.loadSurvey(survey);
    this.currentPageIndex = savedPageIndex;
    this.selectedElement = savedSelection;
    this.refreshDesignerArea();
    this.notifyPropertyUpdate();
  }

  /**
   * Update survey property
   */
  updateSurveyProperty(property: string, value: any): void {
    const survey = this.getSurveyJson();
    (survey as any)[property] = value;

    const savedPageIndex = this.currentPageIndex;
    const savedSelection = { ...this.selectedElement };
    this.loadSurvey(survey);
    this.currentPageIndex = savedPageIndex;
    this.selectedElement = savedSelection;
    this.refreshDesignerArea();
    this.notifyPropertyUpdate();
  }

  /**
   * Get element by name
   */
  getElementByName(elementName: string): SurveyElement | null {
    const survey = this.getSurveyJson();
    if (!survey.pages) return null;

    for (const page of survey.pages) {
      const element = page.elements?.find(e => e.name === elementName);
      if (element) return element;
    }

    return null;
  }

  /**
   * Get page by index
   */
  getPageByIndex(pageIndex: number): SurveyPage | null {
    const survey = this.getSurveyJson();
    if (!survey.pages || pageIndex < 0 || pageIndex >= survey.pages.length) {
      return null;
    }
    return survey.pages[pageIndex];
  }

  /**
   * Notify selection change listeners
   */
  private notifySelectionChange(): void {
    if (this.onSelectionChangeCallback) {
      this.onSelectionChangeCallback(this.getSelection());
    }
  }

  /**
   * Notify property update listeners
   */
  private notifyPropertyUpdate(): void {
    if (this.onPropertyUpdateCallback) {
      this.onPropertyUpdateCallback();
    }
  }
}