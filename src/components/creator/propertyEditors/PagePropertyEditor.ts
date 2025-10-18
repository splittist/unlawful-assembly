import { SurveyCreatorService } from '@/services/surveyCreator';

/**
 * Page Property Editor
 * Handles editing of page-level properties
 */
export class PagePropertyEditor {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render page property editor
   */
  render(pageIndex: number): string {
    const page = this.surveyCreatorService.getPageByIndex(pageIndex);
    if (!page) {
      return '<div class="text-red-500">Page not found</div>';
    }

    return `
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
          <input
            type="text"
            id="page-name"
            value="${this.escapeHtml(page.name || '')}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter page name"
            data-page-index="${pageIndex}"
          />
          <p class="mt-1 text-xs text-gray-500">Unique identifier for the page</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
          <input
            type="text"
            id="page-title"
            value="${this.escapeHtml(page.title || '')}"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter page title"
            data-page-index="${pageIndex}"
          />
          <p class="mt-1 text-xs text-gray-500">Display title shown to users</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Page Description</label>
          <textarea
            id="page-description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter page description"
            data-page-index="${pageIndex}"
          >${this.escapeHtml(page.description || '')}</textarea>
          <p class="mt-1 text-xs text-gray-500">Optional description or instructions</p>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <h4 class="text-sm font-medium text-gray-900 mb-3">Visibility</h4>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Visible If
              <span class="text-xs text-gray-500 ml-1">(optional)</span>
            </label>
            <input
              type="text"
              id="page-visible-if"
              value="${this.escapeHtml((page as any).visibleIf || '')}"
              placeholder="e.g., {is_married} or {age} == 18"
              class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              data-page-index="${pageIndex}"
            />
            <p class="text-xs text-gray-500 mt-1">
              Use {variable_name} to reference survey answers. Leave empty to always show this page.
            </p>
            <div class="mt-2">
              <p class="text-xs font-medium text-gray-700 mb-1">Examples:</p>
              <ul class="text-xs text-gray-600 space-y-1">
                <li><code class="bg-gray-100 px-1 rounded">{is_married}</code> - Show if married</li>
                <li><code class="bg-gray-100 px-1 rounded">!{has_children}</code> - Show if no children</li>
                <li><code class="bg-gray-100 px-1 rounded">{age} == 18</code> - Show if age is 18</li>
                <li><code class="bg-gray-100 px-1 rounded">{status} != single</code> - Show if not single</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-gray-200">
          <p class="text-xs text-gray-500">Page ${pageIndex + 1} properties</p>
        </div>
      </div>
    `;
  }

  /**
   * Set up event handlers after rendering
   */
  setupEvents(container: HTMLElement): void {
    const nameInput = container.querySelector('#page-name') as HTMLInputElement;
    const titleInput = container.querySelector('#page-title') as HTMLInputElement;
    const descriptionInput = container.querySelector('#page-description') as HTMLTextAreaElement;
    const visibleIfInput = container.querySelector('#page-visible-if') as HTMLInputElement;

    if (nameInput) {
      const pageIndex = parseInt(nameInput.dataset.pageIndex || '0');
      nameInput.addEventListener('blur', () => {
        this.surveyCreatorService.updatePageProperty(pageIndex, 'name', nameInput.value);
      });
    }

    if (titleInput) {
      const pageIndex = parseInt(titleInput.dataset.pageIndex || '0');
      titleInput.addEventListener('blur', () => {
        this.surveyCreatorService.updatePageProperty(pageIndex, 'title', titleInput.value);
      });
    }

    if (descriptionInput) {
      const pageIndex = parseInt(descriptionInput.dataset.pageIndex || '0');
      descriptionInput.addEventListener('blur', () => {
        this.surveyCreatorService.updatePageProperty(pageIndex, 'description', descriptionInput.value);
      });
    }

    if (visibleIfInput) {
      const pageIndex = parseInt(visibleIfInput.dataset.pageIndex || '0');
      visibleIfInput.addEventListener('blur', () => {
        this.surveyCreatorService.updatePageProperty(pageIndex, 'visibleIf', visibleIfInput.value.trim());
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
