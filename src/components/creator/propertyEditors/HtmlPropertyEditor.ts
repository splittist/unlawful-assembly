import { SurveyCreatorService } from '@/services/surveyCreator';
import type { SurveyElement } from '@/types';
import { MarkdownParser } from '@/utils/markdownParser';

/**
 * HTML Property Editor
 * Handles HTML element properties with markdown support
 */
export class HtmlPropertyEditor {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render HTML-specific properties with markdown toggle
   */
  render(element: SurveyElement): string {
    return `
      <div class="space-y-4">
        <div>
          <div class="mb-2 flex items-center justify-between">
            <label class="text-sm font-medium text-gray-700">Content</label>
            <div class="flex items-center space-x-2">
              <span class="text-xs text-gray-500" id="mode-label">Markdown</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="markdown-toggle" class="sr-only peer" checked data-element-name="${element.name}">
                <div class="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <textarea
            id="element-html"
            rows="8"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-sans resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="# Heading&#10;**Bold** *Italic*&#10;- List item&#10;> Blockquote"
            data-element-name="${element.name}"
          >${this.escapeHtml(MarkdownParser.toMarkdown(element.html || ''))}</textarea>
          <p class="mt-1 text-xs text-gray-500" id="help-text">Supports: # Headings, **bold**, *italic*, - lists, > blockquotes</p>
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
  setupEvents(container: HTMLElement, _element: SurveyElement): void {
    const htmlInput = container.querySelector('#element-html') as HTMLTextAreaElement;
    const htmlPreview = container.querySelector('#html-preview') as HTMLDivElement;
    const markdownToggle = container.querySelector('#markdown-toggle') as HTMLInputElement;
    const modeLabel = container.querySelector('#mode-label') as HTMLSpanElement;
    const helpText = container.querySelector('#help-text') as HTMLParagraphElement;

    if (htmlInput && htmlPreview && markdownToggle && modeLabel && helpText) {
      const elementName = htmlInput.dataset.elementName!;
      
      // Update textarea appearance and placeholder based on mode
      const updateTextareaForMode = (isMarkdownMode: boolean) => {
        if (isMarkdownMode) {
          htmlInput.placeholder = '# Heading\n**Bold** *Italic*\n- List item\n> Blockquote';
          htmlInput.classList.remove('font-mono');
          htmlInput.classList.add('font-sans');
          modeLabel.textContent = 'Markdown';
          helpText.textContent = 'Supports: # Headings, **bold**, *italic*, - lists, > blockquotes';
        } else {
          htmlInput.placeholder = '<h1>Heading</h1>\n<strong>Bold</strong> <em>Italic</em>\n<ul><li>List item</li></ul>';
          htmlInput.classList.remove('font-sans');
          htmlInput.classList.add('font-mono');
          modeLabel.textContent = 'HTML';
          helpText.textContent = 'Raw HTML mode - use standard HTML tags';
        }
      };

      // Toggle between markdown and HTML
      markdownToggle.addEventListener('change', () => {
        const currentValue = htmlInput.value;
        
        if (markdownToggle.checked) {
          // Switching to markdown mode
          htmlInput.value = MarkdownParser.toMarkdown(currentValue);
        } else {
          // Switching to HTML mode
          htmlInput.value = MarkdownParser.toHtml(currentValue);
        }
        
        updateTextareaForMode(markdownToggle.checked);
      });
      
      // Update preview on input for immediate feedback
      htmlInput.addEventListener('input', () => {
        const htmlContent = markdownToggle.checked ? 
          MarkdownParser.toHtml(htmlInput.value) : 
          htmlInput.value;
        // Update preview only (no property update)
        // Note: innerHTML is intentional here - creators need to preview HTML content
        // This is in the creator interface (trusted users), not end-user facing
        htmlPreview.innerHTML = htmlContent || '<p class="text-gray-400">No content</p>';
      });
      
      // Update element property on blur
      htmlInput.addEventListener('blur', () => {
        const htmlContent = markdownToggle.checked ? 
          MarkdownParser.toHtml(htmlInput.value) : 
          htmlInput.value;
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
