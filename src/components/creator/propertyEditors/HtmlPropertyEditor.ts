import { SurveyCreatorService } from '@/services/surveyCreator';
import type { SurveyElement } from '@/types';

/**
 * HTML Property Editor
 * Handles HTML element properties
 */
export class HtmlPropertyEditor {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render HTML-specific properties
   */
  render(element: SurveyElement): string {
    return `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
          <textarea
            id="element-html"
            rows="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter HTML content"
            data-element-name="${element.name}"
          >${this.escapeHtml(element.html || '')}</textarea>
          <p class="mt-1 text-xs text-gray-500">HTML markup for information display</p>
        </div>

        <div class="border border-gray-200 rounded p-3">
          <p class="text-xs font-medium text-gray-700 mb-2">Preview:</p>
          <div id="html-preview" class="text-sm prose prose-sm max-w-none">
            ${element.html || '<p class="text-gray-400">No content</p>'}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Set up event handlers after rendering
   */
  setupEvents(container: HTMLElement, element: SurveyElement): void {
    const htmlInput = container.querySelector('#element-html') as HTMLTextAreaElement;
    const htmlPreview = container.querySelector('#html-preview') as HTMLDivElement;

    if (htmlInput && htmlPreview) {
      const elementName = htmlInput.dataset.elementName!;
      
      htmlInput.addEventListener('input', () => {
        const htmlContent = htmlInput.value;
        
        // Update preview
        htmlPreview.innerHTML = htmlContent || '<p class="text-gray-400">No content</p>';
        
        // Update element
        this.surveyCreatorService.updateElementProperty(elementName, 'html', htmlContent);
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
