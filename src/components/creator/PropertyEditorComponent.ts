import { SurveyCreatorService } from '@/services/surveyCreator';
import type { PropertyEditorSelection } from '@/types';
import { SurveyPropertyEditor } from './propertyEditors/SurveyPropertyEditor';
import { PagePropertyEditor } from './propertyEditors/PagePropertyEditor';
import { ElementPropertyEditor } from './propertyEditors/ElementPropertyEditor';

/**
 * Main Property Editor Component
 * Displays appropriate property editor based on current selection
 */
export class PropertyEditorComponent {
  private surveyCreatorService: SurveyCreatorService;
  private container: HTMLElement | null = null;
  private currentSelection: PropertyEditorSelection = { type: null };

  // Sub-editors
  private surveyPropertyEditor: SurveyPropertyEditor;
  private pagePropertyEditor: PagePropertyEditor;
  private elementPropertyEditor: ElementPropertyEditor;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
    this.surveyPropertyEditor = new SurveyPropertyEditor(surveyCreatorService);
    this.pagePropertyEditor = new PagePropertyEditor(surveyCreatorService);
    this.elementPropertyEditor = new ElementPropertyEditor(surveyCreatorService);

    // Listen to selection changes
    this.surveyCreatorService.onSelectionChange((selection) => {
      this.currentSelection = selection;
      this.render();
    });

    // Listen to property updates
    this.surveyCreatorService.onPropertyUpdate(() => {
      this.render();
    });
  }

  /**
   * Initialize the property editor in a container
   */
  initialize(container: HTMLElement): void {
    this.container = container;
    this.render();
  }

  /**
   * Render the property editor
   */
  render(): void {
    if (!this.container) return;

    // Save scroll position before re-rendering
    const contentArea = this.container.querySelector('#property-editor-content');
    const scrollTop = contentArea?.scrollTop || 0;

    this.container.innerHTML = `
      <div class="h-full flex flex-col bg-white border-l border-gray-200">
        <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 class="text-sm font-semibold text-gray-900">Properties</h3>
        </div>
        <div id="property-editor-content" class="flex-1 overflow-y-auto p-4">
          ${this.renderContent()}
        </div>
      </div>
    `;

    // Set up event handlers after rendering
    this.setupEvents();

    // Restore scroll position after re-rendering
    // Use requestAnimationFrame to ensure DOM is fully rendered
    const newContentArea = this.container.querySelector('#property-editor-content');
    if (newContentArea && scrollTop > 0) {
      requestAnimationFrame(() => {
        newContentArea.scrollTop = scrollTop;
      });
    }
  }

  /**
   * Set up event handlers for the property editor
   */
  private setupEvents(): void {
    if (!this.container) return;

    const contentArea = this.container.querySelector('#property-editor-content');
    if (!contentArea) return;

    switch (this.currentSelection.type) {
      case 'survey':
        this.surveyPropertyEditor.setupEvents(contentArea as HTMLElement);
        break;
      case 'page':
        this.pagePropertyEditor.setupEvents(contentArea as HTMLElement);
        break;
      case 'element':
        this.elementPropertyEditor.setupEvents(contentArea as HTMLElement);
        break;
    }
  }

  /**
   * Render appropriate content based on selection
   */
  private renderContent(): string {
    if (!this.currentSelection.type) {
      return `
        <div class="text-center text-gray-500 py-8">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <p class="mt-2 text-sm">Select an element to edit its properties</p>
          <p class="text-xs text-gray-400 mt-1">Click on survey background, page, or element</p>
        </div>
      `;
    }

    switch (this.currentSelection.type) {
      case 'survey':
        return this.surveyPropertyEditor.render();
      case 'page':
        return this.pagePropertyEditor.render(this.currentSelection.pageIndex!);
      case 'element':
        return this.elementPropertyEditor.render(this.currentSelection.elementName!);
      default:
        return '<div class="text-gray-500">Unknown selection type</div>';
    }
  }
}
