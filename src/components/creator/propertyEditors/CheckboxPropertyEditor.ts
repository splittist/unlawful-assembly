import { SurveyCreatorService } from '@/services/surveyCreator';
import type { SurveyElement } from '@/types';

/**
 * Checkbox Property Editor
 * Handles checkbox element properties
 */
export class CheckboxPropertyEditor {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render checkbox-specific properties
   */
  render(element: SurveyElement): string {
    const choices = element.choices || [];

    return `
      <div class="space-y-4">
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
          <p class="mt-1 text-xs text-gray-500">Options for the checkbox group</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Default Values</label>
          <div class="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
            ${choices.map(c => {
              const value = typeof c === 'string' ? c : c.value;
              const text = typeof c === 'string' ? c : c.text || c.value;
              const defaultValues = Array.isArray(element.defaultValue) ? element.defaultValue : (element.defaultValue ? [element.defaultValue] : []);
              const isChecked = defaultValues.includes(value);
              return `
                <label class="flex items-center">
                  <input
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded default-value-checkbox"
                    value="${this.escapeHtml(value)}"
                    ${isChecked ? 'checked' : ''}
                    data-element-name="${element.name}"
                  />
                  <span class="ml-2 text-sm text-gray-700">${this.escapeHtml(text)}</span>
                </label>
              `;
            }).join('')}
          </div>
          <p class="mt-1 text-xs text-gray-500">Pre-selected checkboxes (optional)</p>
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
  setupEvents(container: HTMLElement): void {
    const addChoiceBtn = container.querySelector('#add-choice-btn') as HTMLButtonElement;
    const choiceInputs = container.querySelectorAll('.choice-input') as NodeListOf<HTMLInputElement>;
    const removeButtons = container.querySelectorAll('.remove-choice-btn') as NodeListOf<HTMLButtonElement>;
    const defaultValueCheckboxes = container.querySelectorAll('.default-value-checkbox') as NodeListOf<HTMLInputElement>;

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

    defaultValueCheckboxes.forEach((checkbox) => {
      const elementName = checkbox.dataset.elementName!;
      
      checkbox.addEventListener('change', () => {
        const el = this.surveyCreatorService.getElementByName(elementName);
        if (el) {
          const allCheckboxes = Array.from(defaultValueCheckboxes);
          const selectedValues = allCheckboxes
            .filter(cb => cb.checked)
            .map(cb => cb.value);
          
          this.surveyCreatorService.updateElementProperty(
            elementName, 
            'defaultValue', 
            selectedValues.length > 0 ? selectedValues : undefined
          );
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
