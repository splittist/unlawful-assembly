import { SurveyCreatorService } from '@/services/surveyCreator';
import type { SurveyElement } from '@/types';
import { TextPropertyEditor } from './TextPropertyEditor';
import { RadioGroupPropertyEditor } from './RadioGroupPropertyEditor';
import { DropdownPropertyEditor } from './DropdownPropertyEditor';
import { CheckboxPropertyEditor } from './CheckboxPropertyEditor';
import { HtmlPropertyEditor } from './HtmlPropertyEditor';

/**
 * Element Property Editor
 * Base editor that dispatches to type-specific editors
 */
export class ElementPropertyEditor {
  private surveyCreatorService: SurveyCreatorService;
  private textPropertyEditor: TextPropertyEditor;
  private radioGroupPropertyEditor: RadioGroupPropertyEditor;
  private dropdownPropertyEditor: DropdownPropertyEditor;
  private checkboxPropertyEditor: CheckboxPropertyEditor;
  private htmlPropertyEditor: HtmlPropertyEditor;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
    this.textPropertyEditor = new TextPropertyEditor(surveyCreatorService);
    this.radioGroupPropertyEditor = new RadioGroupPropertyEditor(surveyCreatorService);
    this.dropdownPropertyEditor = new DropdownPropertyEditor(surveyCreatorService);
    this.checkboxPropertyEditor = new CheckboxPropertyEditor(surveyCreatorService);
    this.htmlPropertyEditor = new HtmlPropertyEditor(surveyCreatorService);
  }

  /**
   * Render element property editor
   */
  render(elementName: string): string {
    const element = this.surveyCreatorService.getElementByName(elementName);
    if (!element) {
      return '<div class="text-red-500">Element not found</div>';
    }

    // Common properties section
    const commonPropertiesHtml = this.renderCommonProperties(element);

    // Type-specific properties section
    const typeSpecificHtml = this.renderTypeSpecificProperties(element);

    return `
      <div class="space-y-6">
        <div>
          <h4 class="text-xs font-semibold text-gray-500 uppercase mb-3">Common Properties</h4>
          ${commonPropertiesHtml}
        </div>
        ${typeSpecificHtml ? `
          <div>
            <h4 class="text-xs font-semibold text-gray-500 uppercase mb-3">Type-Specific Properties</h4>
            ${typeSpecificHtml}
          </div>
        ` : ''}
        <div class="pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">Element type: ${element.type}</p>
        </div>
      </div>
    `;
  }

  /**
   * Render common properties for all element types
   */
  private renderCommonProperties(element: SurveyElement): string {
    return `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input
            type="text"
            id="element-name"
            value="${this.escapeHtml(element.name || '')}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter element name"
            data-element-name="${element.name}"
          />
          <p class="mt-1 text-xs text-gray-500">Unique identifier (required)</p>
        </div>

        ${element.type !== 'html' ? `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            id="element-title"
            value="${this.escapeHtml(element.title || '')}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter question title"
            data-element-name="${element.name}"
          />
          <p class="mt-1 text-xs text-gray-500">Display label for users</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            id="element-description"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter help text"
            data-element-name="${element.name}"
          >${this.escapeHtml(element.description || '')}</textarea>
          <p class="mt-1 text-xs text-gray-500">Help text shown below question</p>
        </div>

        <div class="flex items-center">
          <input
            type="checkbox"
            id="element-required"
            ${element.isRequired ? 'checked' : ''}
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            data-element-name="${element.name}"
          />
          <label for="element-required" class="ml-2 block text-sm text-gray-700">
            Required field
          </label>
        </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render type-specific properties
   */
  private renderTypeSpecificProperties(element: SurveyElement): string {
    switch (element.type) {
      case 'text':
      case 'comment':
        return this.textPropertyEditor.render(element);
      case 'radiogroup':
        return this.radioGroupPropertyEditor.render(element);
      case 'dropdown':
        return this.dropdownPropertyEditor.render(element);
      case 'checkbox':
        return this.checkboxPropertyEditor.render(element);
      case 'html':
        return this.htmlPropertyEditor.render(element);
      case 'boolean':
        // Boolean doesn't need type-specific properties
        return '';
      default:
        return '';
    }
  }

  /**
   * Set up event handlers after rendering
   */
  setupEvents(container: HTMLElement): void {
    const nameInput = container.querySelector('#element-name') as HTMLInputElement;
    const titleInput = container.querySelector('#element-title') as HTMLInputElement;
    const descriptionInput = container.querySelector('#element-description') as HTMLTextAreaElement;
    const requiredCheckbox = container.querySelector('#element-required') as HTMLInputElement;

    if (nameInput) {
      const elementName = nameInput.dataset.elementName!;
      nameInput.addEventListener('input', () => {
        // Note: Renaming elements requires special handling to update all references
        this.surveyCreatorService.updateElementProperty(elementName, 'name', nameInput.value);
      });
    }

    if (titleInput) {
      const elementName = titleInput.dataset.elementName!;
      titleInput.addEventListener('input', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'title', titleInput.value);
      });
    }

    if (descriptionInput) {
      const elementName = descriptionInput.dataset.elementName!;
      descriptionInput.addEventListener('input', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'description', descriptionInput.value);
      });
    }

    if (requiredCheckbox) {
      const elementName = requiredCheckbox.dataset.elementName!;
      requiredCheckbox.addEventListener('change', () => {
        this.surveyCreatorService.updateElementProperty(elementName, 'isRequired', requiredCheckbox.checked);
      });
    }

    // Set up type-specific event handlers
    const element = this.surveyCreatorService.getElementByName(nameInput?.dataset.elementName || '');
    if (element) {
      switch (element.type) {
        case 'text':
        case 'comment':
          this.textPropertyEditor.setupEvents(container, element);
          break;
        case 'radiogroup':
          this.radioGroupPropertyEditor.setupEvents(container, element);
          break;
        case 'dropdown':
          this.dropdownPropertyEditor.setupEvents(container, element);
          break;
        case 'checkbox':
          this.checkboxPropertyEditor.setupEvents(container);
          break;
        case 'html':
          this.htmlPropertyEditor.setupEvents(container, element);
          break;
      }
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
