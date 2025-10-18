import { SurveyCreatorService } from '@/services/surveyCreator';

/**
 * Survey Property Editor
 * Handles editing of survey-level properties
 */
export class SurveyPropertyEditor {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render survey property editor
   */
  render(): string {
    const survey = this.surveyCreatorService.getSurveyJson();

    return `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Survey Title</label>
          <input
            type="text"
            id="survey-title"
            value="${this.escapeHtml(survey.title || '')}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter survey title"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Survey Description</label>
          <textarea
            id="survey-description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter survey description"
          >${this.escapeHtml(survey.description || '')}</textarea>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">Survey-level properties</p>
        </div>
      </div>
    `;
  }

  /**
   * Set up event handlers after rendering
   */
  setupEvents(container: HTMLElement): void {
    const titleInput = container.querySelector('#survey-title') as HTMLInputElement;
    const descriptionInput = container.querySelector('#survey-description') as HTMLTextAreaElement;

    if (titleInput) {
      titleInput.addEventListener('blur', () => {
        this.surveyCreatorService.updateSurveyProperty('title', titleInput.value);
      });
    }

    if (descriptionInput) {
      descriptionInput.addEventListener('blur', () => {
        this.surveyCreatorService.updateSurveyProperty('description', descriptionInput.value);
      });
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
