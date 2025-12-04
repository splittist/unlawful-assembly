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

    // Process line by line to handle block elements correctly
    const lines = markdown.split('\n');
    const blocks: string[] = [];
    let currentParagraph: string[] = [];
    let inList = false;
    let listType = '';
    let listItems: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const content = currentParagraph.join('<br>');
        blocks.push(`<p>${this.processInline(content)}</p>`);
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (inList && listItems.length > 0) {
        blocks.push(`<${listType}>${listItems.map((item) => `<li>${this.processInline(item)}</li>`).join('')}</${listType}>`);
        listItems = [];
        inList = false;
        listType = '';
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Empty line - paragraph break
      if (trimmedLine === '') {
        flushList();
        flushParagraph();
        continue;
      }

      // Headers (h1-h6)
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        flushList();
        flushParagraph();
        const level = headerMatch[1].length;
        blocks.push(`<h${level}>${this.processInline(headerMatch[2])}</h${level}>`);
        continue;
      }

      // Blockquotes
      const blockquoteMatch = trimmedLine.match(/^>\s+(.+)$/);
      if (blockquoteMatch) {
        flushList();
        flushParagraph();
        blocks.push(`<blockquote>${this.processInline(blockquoteMatch[1])}</blockquote>`);
        continue;
      }

      // Unordered list
      const ulMatch = trimmedLine.match(/^[-*+]\s+(.+)$/);
      if (ulMatch) {
        flushParagraph();
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(ulMatch[1]);
        continue;
      }

      // Ordered list
      const olMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
      if (olMatch) {
        flushParagraph();
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listItems.push(olMatch[1]);
        continue;
      }

      // Regular text - add to current paragraph
      flushList();
      currentParagraph.push(trimmedLine);
    }

    // Flush any remaining content
    flushList();
    flushParagraph();

    return blocks.join('');
  }

  /**
   * Process inline formatting (bold, italic)
   * @param text - Text to process for inline formatting
   * @returns HTML with inline formatting applied
   */
  private static processInline(text: string): string {
    return text
      // Bold (process first to avoid conflicts with italic)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_]+)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/_([^_]+)_/g, '<em>$1</em>');
  }

  /**
   * Convert HTML back to markdown (for editing)
   * @param html - Input HTML string
   * @returns Converted markdown string
   */
  static toMarkdown(html: string): string {
    if (!html) return '';

    return (
      html
        // Headers - add newline after closing tag
        .replace(/<h([1-6])>(.*?)<\/h\1>/g, (_, level, text) => '#'.repeat(parseInt(level)) + ' ' + text + '\n')

        // Lists - add newlines around list tags
        .replace(/<ul>/g, '')
        .replace(/<\/ul>/g, '\n')
        .replace(/<ol>/g, '')
        .replace(/<\/ol>/g, '\n')
        .replace(/<li>(.*?)<\/li>/g, '- $1\n')

        // Blockquotes - add newline after
        .replace(/<blockquote>(.*?)<\/blockquote>/g, '> $1\n')

        // Bold and italic (support both semantic and presentational tags)
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<b>(.*?)<\/b>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '*$1*')
        .replace(/<i>(.*?)<\/i>/g, '*$1*')

        // Paragraphs and breaks
        .replace(/<p>/g, '')
        .replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/g, '\n')

        // Clean up extra whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    );
  }
}
