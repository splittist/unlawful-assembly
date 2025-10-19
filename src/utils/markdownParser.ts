/**
 * Lightweight markdown parser for Survey.js HTML elements
 * Supports only: headings, bold, italic, lists, and blockquotes
 * Bundle impact: ~2KB
 */
export class MarkdownParser {
  /**
   * Convert markdown to HTML for Survey.js elements
   * @param markdown - Input markdown string
   * @returns Converted HTML string
   */
  static toHtml(markdown: string): string {
    if (!markdown) return '';

    // Handle lists first (before line break processing)
    let html = this.parseLists(markdown);

    html = html
      // Headers (h1-h6) - process from h6 to h1 to avoid conflicts
      .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
      .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
      .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
      .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
      .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
      .replace(/^#{1}\s+(.+)$/gm, '<h1>$1</h1>')
      
      // Blockquotes
      .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
      
      // Bold and italic (process bold first to avoid conflicts)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      .replace(/_([^_]+)_/g, '<em>$1</em>')
      
      // Line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags if not already wrapped in block elements
    if (!html.match(/^<(h[1-6]|ul|ol|blockquote)/)) {
      html = `<p>${html}</p>`;
    }

    return html;
  }

  /**
   * Parse ordered and unordered lists
   * @param markdown - Markdown string potentially containing list markup
   * @returns Markdown with properly formatted HTML lists
   */
  private static parseLists(markdown: string): string {
    const lines = markdown.split('\n');
    const result: string[] = [];
    let inList = false;
    let listType = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Unordered list
      if (trimmedLine.match(/^[-*+]\s+(.+)/)) {
        const content = trimmedLine.replace(/^[-*+]\s+/, '');
        if (!inList || listType !== 'ul') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ul>');
          listType = 'ul';
          inList = true;
        }
        result.push(`<li>${content}</li>`);
      }
      // Ordered list
      else if (trimmedLine.match(/^\d+\.\s+(.+)/)) {
        const content = trimmedLine.replace(/^\d+\.\s+/, '');
        if (!inList || listType !== 'ol') {
          if (inList) result.push(`</${listType}>`);
          result.push('<ol>');
          listType = 'ol';
          inList = true;
        }
        result.push(`<li>${content}</li>`);
      }
      // Not a list item
      else {
        if (inList) {
          result.push(`</${listType}>`);
          inList = false;
        }
        if (line || !inList) result.push(line);
      }
    }

    if (inList) {
      result.push(`</${listType}>`);
    }

    return result.join('\n');
  }

  /**
   * Convert HTML back to markdown (for editing)
   * @param html - Input HTML string
   * @returns Converted markdown string
   */
  static toMarkdown(html: string): string {
    if (!html) return '';

    return html
      // Headers
      .replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, (_, level, text) => '#'.repeat(parseInt(level)) + ' ' + text)
      
      // Lists
      .replace(/<ul>/g, '').replace(/<\/ul>/g, '')
      .replace(/<ol>/g, '').replace(/<\/ol>/g, '')
      .replace(/<li>(.*?)<\/li>/g, '- $1')
      
      // Blockquotes
      .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1')
      
      // Bold and italic
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      
      // Paragraphs and breaks
      .replace(/<p>/g, '').replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
