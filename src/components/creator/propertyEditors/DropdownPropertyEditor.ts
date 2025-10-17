import { SurveyCreatorService } from '@/services/surveyCreator';
import type { SurveyElement } from '@/types';

/**
 * Dropdown Property Editor
 * Handles dropdown element properties
 */
export class DropdownPropertyEditor {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render dropdown-specific properties
   */
  render(element: SurveyElement): string {
    const choices = element.choices || [];

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
          <p class="mt-1 text-xs text-gray-500">Placeholder text for empty dropdown</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Choices</label>
          <div id="choices-container" class="space-y-2 mb-2">
            ${this.renderChoicesList(element)}
          </div>
          <button
            id="add-choice-btn"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
            data-element-name="${element.name}"
          >
            + Add Choice
          </button>
          <p class="mt-1 text-xs text-gray-500">Options for the dropdown</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Default Value</label>
          <select
            id="element-default-value"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-element-name="${element.name}"
          >
            <option value="">None</option>
            ${choices.map(c => {
              const value = typeof c === 'string' ? c : c.value;
              const text = typeof c === 'string' ? c : c.text || c.value;
              return `<option value="${this.escapeHtml(value)}" ${element.defaultValue === value ? 'selected' : ''}>${this.escapeHtml(text)}</option>`;
            }).join('')}
          </select>
          <p class="mt-1 text-xs text-gray-500">Pre-selected choice</p>
        </div>
      </div>
    `;
  }

  /**
   * Render choices list with add/remove buttons
   */
  private renderChoicesList(element: SurveyElement): string {
    const choices = element.choices || [];
    
    return choices.map((choice, index) => {
      const value = typeof choice === 'string' ? choice : choice.value;
      return `
        <div class="flex items-center space-x-2">
          <input
            type="text"
            value="${this.escapeHtml(value)}"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 choice-input"
            data-element-name="${element.name}"
            data-choice-index="${index}"
          />
          <button
            class="text-red-600 hover:text-red-800 remove-choice-btn"
            data-element-name="${element.name}"
            data-choice-index="${index}"
            title="Remove choice"
          >
            ×
          </button>
        </div>
      `;
    }).join('');
  }

  /**
   * Set up event handlers after rendering
   */
  setupEvents(container: HTMLElement, element: SurveyElement): void {
    const placeholderInput = container.querySelector('#element-placeholder') as HTMLInputElement;
    const defaultValueSelect = container.querySelector('#element-default-value') as HTMLSelectElement;
    const addChoiceBtn = container.querySelector('#add-choice-btn') as HTMLButtonElement;
    const choiceInputs = container.querySelectorAll('.choice-input') as NodeListOf<HTMLInputElement>;
    const removeButtons = container.querySelectorAll('.remove-choice-btn') as NodeListOf<HTMLButtonElement>;

    if (placeholderInput) {
      const elementName = placeholderInput.dataset.elementName!;
      placeholderInput.addEventListener('input', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'placeholder', placeholderInput.value);
      });
    }

    if (defaultValueSelect) {
      const elementName = defaultValueSelect.dataset.elementName!;
      defaultValueSelect.addEventListener('change', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'defaultValue', defaultValueSelect.value || undefined);
      });
    }

    if (addChoiceBtn) {
      const elementName = addChoiceBtn.dataset.elementName!;
      addChoiceBtn.addEventListener('click', () => {
        const el = this.surveyCreatorService.getElementByName(elementName);
        if (el) {
          const choices = el.choices || [];
          const newChoice = `Option ${choices.length + 1}`;
          this.surveyCreatorService.updateElementProperty(elementName, 'choices', [...choices, newChoice]);
        }
      });
    }

    choiceInputs.forEach((input) => {
      const elementName = input.dataset.elementName!;
      const choiceIndex = parseInt(input.dataset.choiceIndex || '0');
      
      input.addEventListener('input', () => {
        const el = this.surveyCreatorService.getElementByName(elementName);
        if (el && el.choices) {
          const newChoices = [...el.choices];
          newChoices[choiceIndex] = input.value;
          this.surveyCreatorService.updateElementProperty(elementName, 'choices', newChoices);
        }
      });
    });

    removeButtons.forEach((button) => {
      const elementName = button.dataset.elementName!;
      const choiceIndex = parseInt(button.dataset.choiceIndex || '0');
      
      button.addEventListener('click', () => {
        const el = this.surveyCreatorService.getElementByName(elementName);
        if (el && el.choices) {
          const newChoices = [...el.choices];
          newChoices.splice(choiceIndex, 1);
          this.surveyCreatorService.updateElementProperty(elementName, 'choices', newChoices);
        }
      });
    });
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
