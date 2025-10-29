import { SurveyCreatorService } from '@/services/surveyCreator';
import type { SurveyElement } from '@/types';

/**
 * Text Property Editor
 * Handles text and comment element properties
 */
export class TextPropertyEditor {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render text-specific properties
   */
  render(element: SurveyElement): string {
    return `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
          <input
            type="text"
            id="element-placeholder"
            value="${this.escapeHtml(element.placeholder || '')}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter placeholder text"
            data-element-name="${element.name}"
          />
          <p class="mt-1 text-xs text-gray-500">Placeholder text shown in empty field</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Default Value</label>
          <input
            type="text"
            id="element-default-value"
            value="${this.escapeHtml(element.defaultValue || '')}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter default value"
            data-element-name="${element.name}"
          />
          <p class="mt-1 text-xs text-gray-500">Pre-filled value</p>
        </div>

        ${element.type === 'text' ? `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
          <select
            id="element-input-type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-element-name="${element.name}"
          >
            <option value="text" ${element.inputType === 'text' || !element.inputType ? 'selected' : ''}>Text</option>
            <option value="email" ${element.inputType === 'email' ? 'selected' : ''}>Email</option>
            <option value="number" ${element.inputType === 'number' ? 'selected' : ''}>Number</option>
            <option value="date" ${element.inputType === 'date' ? 'selected' : ''}>Date</option>
            <option value="tel" ${element.inputType === 'tel' ? 'selected' : ''}>Telephone</option>
            <option value="url" ${element.inputType === 'url' ? 'selected' : ''}>URL</option>
          </select>
          <p class="mt-1 text-xs text-gray-500">HTML input type for validation</p>
        </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Set up event handlers after rendering
   */
  setupEvents(container: HTMLElement): void {
    const placeholderInput = container.querySelector('#element-placeholder') as HTMLInputElement;
    const defaultValueInput = container.querySelector('#element-default-value') as HTMLInputElement;
    const inputTypeSelect = container.querySelector('#element-input-type') as HTMLSelectElement;

    if (placeholderInput) {
      const elementName = placeholderInput.dataset.elementName!;
      placeholderInput.addEventListener('blur', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'placeholder', placeholderInput.value);
      });
    }

    if (defaultValueInput) {
      const elementName = defaultValueInput.dataset.elementName!;
      defaultValueInput.addEventListener('blur', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'defaultValue', defaultValueInput.value);
      });
    }

    if (inputTypeSelect) {
      const elementName = inputTypeSelect.dataset.elementName!;
      inputTypeSelect.addEventListener('change', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'inputType', inputTypeSelect.value);
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
