import type { SurveyDefinition, SurveyElement } from '@/types';
import { VisibilityManager } from './visibilityManager';

/**
 * Survey.js Runtime integration service
 * Handles survey rendering and data collection for users and preview mode
 */
export class SurveyRuntimeService {
  private container: HTMLElement | null = null;
  private onCompleteCallback: ((data: any) => void) | null = null;
  private visibilityManager: VisibilityManager | null = null;
  private surveyDefinition: SurveyDefinition | null = null;

  /**
   * Initialize the Survey.js runtime
   * @param container - HTML element to render the survey in
   * @param surveyJson - Survey definition to render
   * @param onComplete - Optional callback when survey is completed (ignored in preview mode)
   * @param mode - 'user' for normal completion mode, 'preview' for read-only preview mode
   */
  initialize(
    container: HTMLElement,
    surveyJson: SurveyDefinition,
    onComplete?: (data: any) => void,
    mode: 'user' | 'preview' = 'user'
  ): void {
    this.container = container;
    this.onCompleteCallback = onComplete || null;
    this.surveyDefinition = surveyJson;

    // Render form based on mode
    if (mode === 'preview') {
      this.renderPreviewForm(container, surveyJson);
    } else {
      this.renderSimpleForm(container, surveyJson);
    }

    // Initialize visibility manager for conditional logic
    this.visibilityManager = new VisibilityManager(surveyJson, container);
    this.visibilityManager.setupFormWatching(container);
    this.visibilityManager.initializeVisibility();
  }

  /**
   * Render survey in preview mode (read-only, no submission)
   */
  private renderPreviewForm(container: HTMLElement, survey: SurveyDefinition): void {
    const formHtml = this.generateFormHtml(survey, true);
    
    container.innerHTML = `
      <div class="bg-white">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">${survey.title || 'Survey Preview'}</h2>
          ${survey.description ? `<p class="mt-1 text-sm text-gray-600">${survey.description}</p>` : ''}
        </div>
        <div class="p-6 space-y-6">
          ${formHtml}
        </div>
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            <strong>Preview Mode:</strong> This is a read-only preview of how the survey will appear to users.
          </p>
        </div>
      </div>
    `;
  }

  /**
   * Simple form renderer for Phase 1 (before full Survey.js integration)
   */
  private renderSimpleForm(container: HTMLElement, survey: SurveyDefinition): void {
    const formHtml = this.generateFormHtml(survey);
    
    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">${survey.title || 'Survey'}</h2>
          ${survey.description ? `<p class="mt-1 text-sm text-gray-600">${survey.description}</p>` : ''}
        </div>
        <form id="survey-form" class="p-6 space-y-6">
          ${formHtml}
          <div class="flex justify-end space-x-3">
            <button type="button" id="save-draft-btn" class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Save Draft
            </button>
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Complete Survey
            </button>
          </div>
        </form>
      </div>
      <div class="mt-4 p-4 bg-blue-50 rounded-lg">
        <p class="text-sm text-blue-700">
          <strong>Phase 1 Preview:</strong> This is a simple form renderer. 
          Full Survey.js integration with conditional logic and advanced features will be available in Phase 2.
        </p>
      </div>
    `;

    this.setupFormHandlers();
  }

  /**
   * Generate HTML for form fields based on survey definition
   * @param survey - Survey definition
   * @param isPreview - Whether this is a preview (read-only) rendering
   */
  private generateFormHtml(survey: SurveyDefinition, isPreview: boolean = false): string {
    let html = '';
    
    survey.pages?.forEach((page, pageIndex) => {
      html += `<div class="survey-page" data-page="${pageIndex}">`;
      
      if (survey.pages!.length > 1) {
        html += `<h3 class="text-md font-medium text-gray-900 mb-4">Page ${pageIndex + 1}</h3>`;
      }
      
      page.elements?.forEach((element: SurveyElement) => {
        html += this.renderFormElement(element, isPreview);
      });
      
      html += `</div>`;
    });
    
    return html;
  }

  /**
   * Render individual form elements
   * @param element - Survey element to render
   * @param isPreview - Whether this is a preview (read-only) rendering
   */
  private renderFormElement(element: SurveyElement, isPreview: boolean = false): string {
    const isRequired = element.isRequired && !isPreview ? 'required' : '';
    const requiredMark = element.isRequired ? '<span class="text-red-500">*</span>' : '';
    const disabledAttr = isPreview ? 'disabled' : '';
    const disabledClass = isPreview ? 'bg-gray-50 cursor-not-allowed' : '';
    
    switch (element.type) {
      case 'text':
        return `
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${element.title || element.name} ${requiredMark}
            </label>
            <input 
              type="text" 
              name="${element.name}" 
              id="${element.name}"
              class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${disabledClass}"
              ${isRequired}
              ${disabledAttr}
              placeholder="${element.placeholder || ''}"
            />
          </div>
        `;
        
      case 'comment':
        return `
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${element.title || element.name} ${requiredMark}
            </label>
            <textarea 
              name="${element.name}" 
              id="${element.name}"
              rows="3"
              class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${disabledClass}"
              ${isRequired}
              ${disabledAttr}
              placeholder="${element.placeholder || ''}"
            ></textarea>
          </div>
        `;
        
      case 'boolean':
        return `
          <div class="form-group">
            <label class="flex items-center">
              <input 
                type="checkbox" 
                name="${element.name}" 
                id="${element.name}"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                ${isRequired}
                ${disabledAttr}
              />
              <span class="ml-2 text-sm font-medium text-gray-700">
                ${element.title || element.name} ${requiredMark}
              </span>
            </label>
          </div>
        `;
        
      case 'radiogroup':
        const choices = element.choices || [];
        return `
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${element.title || element.name} ${requiredMark}
            </label>
            <div class="space-y-2">
              ${choices.map((choice) => {
                const value = typeof choice === 'string' ? choice : choice.value;
                const text = typeof choice === 'string' ? choice : choice.text;
                return `
                <label class="flex items-center">
                  <input 
                    type="radio" 
                    name="${element.name}" 
                    value="${value}"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    ${isRequired}
                    ${disabledAttr}
                  />
                  <span class="ml-2 text-sm text-gray-700">${text}</span>
                </label>
              `;
              }).join('')}
            </div>
          </div>
        `;
        
      case 'checkbox':
        const checkboxChoices = element.choices || [];
        return `
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${element.title || element.name} ${requiredMark}
            </label>
            <div class="space-y-2">
              ${checkboxChoices.map((choice) => {
                const value = typeof choice === 'string' ? choice : choice.value;
                const text = typeof choice === 'string' ? choice : choice.text;
                return `
                <label class="flex items-center">
                  <input 
                    type="checkbox" 
                    name="${element.name}" 
                    value="${value}"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    ${disabledAttr}
                  />
                  <span class="ml-2 text-sm text-gray-700">${text}</span>
                </label>
              `;
              }).join('')}
            </div>
          </div>
        `;
        
      case 'dropdown':
        const dropdownChoices = element.choices || [];
        return `
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${element.title || element.name} ${requiredMark}
            </label>
            <select 
              name="${element.name}" 
              id="${element.name}"
              class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${disabledClass}"
              ${isRequired}
              ${disabledAttr}
            >
              <option value="">Select an option...</option>
              ${dropdownChoices.map((choice) => {
                const value = typeof choice === 'string' ? choice : choice.value;
                const text = typeof choice === 'string' ? choice : choice.text;
                return `<option value="${value}">${text}</option>`;
              }).join('')}
            </select>
          </div>
        `;
        
      case 'html':
        return `
          <div class="form-group">
            <div class="text-sm text-gray-700">
              ${element.html || ''}
            </div>
          </div>
        `;
        
      default:
        return `
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ${element.title || element.name} ${requiredMark}
            </label>
            <input 
              type="text" 
              name="${element.name}" 
              id="${element.name}"
              class="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${disabledClass}"
              placeholder="Unsupported field type: ${element.type}"
              ${isRequired}
              ${disabledAttr}
            />
          </div>
        `;
    }
  }

  /**
   * Set up form event handlers
   */
  private setupFormHandlers(): void {
    const form = this.container?.querySelector('#survey-form') as HTMLFormElement;
    const saveDraftBtn = this.container?.querySelector('#save-draft-btn');
    
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit(form);
      });
    }
    
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        this.saveDraft(form);
      });
    }
  }

  /**
   * Handle form submission
   */
  private handleFormSubmit(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        // Handle multiple values (checkboxes)
        if (Array.isArray(data[key])) {
          data[key].push(value);
        } else {
          data[key] = [data[key], value];
        }
      } else {
        data[key] = value;
      }
    }
    
    console.log('Survey completed with data:', data);
    
    // Call completion callback if provided (Phase 2)
    if (this.onCompleteCallback) {
      this.onCompleteCallback(data);
    } else {
      // For Phase 1, just show a success message
      this.showCompletionMessage(data);
    }
  }

  /**
   * Save draft functionality
   */
  private saveDraft(form: HTMLFormElement): void {
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Save to localStorage
    const draftKey = `docassembly_draft_${Date.now()}`;
    localStorage.setItem(draftKey, JSON.stringify({
      surveyData: data,
      lastSaved: new Date().toISOString(),
      packageId: 'sample-package'
    }));
    
    // Show confirmation
    this.showDraftSavedMessage();
  }

  /**
   * Show completion message
   */
  private showCompletionMessage(data: Record<string, any>): void {
    if (this.container) {
      this.container.innerHTML = `
        <div class="bg-white shadow rounded-lg p-6">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Survey Completed!</h3>
            <p class="mt-2 text-sm text-gray-600">Your responses have been recorded.</p>
            
            <div class="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Your Responses:</h4>
              <div class="text-left space-y-1">
                ${Object.entries(data).map(([key, value]) => `
                  <div class="text-sm">
                    <span class="font-medium text-gray-700">${key}:</span> 
                    <span class="text-gray-600">${Array.isArray(value) ? value.join(', ') : value}</span>
                  </div>
                `).join('')}
              </div>
            </div>
            
            <div class="mt-6">
              <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Start Over
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Show draft saved message
   */
  private showDraftSavedMessage(): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50';
    notification.textContent = 'Draft saved!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  /**
   * Get current survey data
   */
  getCurrentData(): Record<string, any> {
    const form = this.container?.querySelector('#survey-form') as HTMLFormElement;
    if (!form) return {};
    
    const formData = new FormData(form);
    const data: Record<string, any> = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    return data;
  }

  /**
   * Load data into the form
   */
  loadData(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      const fields = this.container?.querySelectorAll(`[name="${key}"]`) as NodeListOf<HTMLInputElement>;
      
      if (fields.length === 0) return;
      
      // Handle checkbox groups (multiple fields with same name)
      if (fields.length > 1 && fields[0].type === 'checkbox') {
        const values = Array.isArray(value) ? value : [value];
        fields.forEach(field => {
          field.checked = values.includes(field.value);
        });
      }
      // Handle radio groups
      else if (fields.length > 1 && fields[0].type === 'radio') {
        fields.forEach(field => {
          field.checked = field.value === value;
        });
      }
      // Handle single field (text, select, etc.)
      else if (fields.length === 1) {
        const field = fields[0];
        if (field.type === 'checkbox') {
          field.checked = !!value;
        } else {
          field.value = value as string;
        }
      }
    });
  }

  /**
   * Cleanup
   */
  dispose(): void {
    this.container = null;
    this.onCompleteCallback = null;
    this.visibilityManager = null;
    this.surveyDefinition = null;
  }
}