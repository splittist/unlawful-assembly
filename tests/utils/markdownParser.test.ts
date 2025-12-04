import { describe, test, expect } from 'vitest';
import { MarkdownParser } from '@/utils/markdownParser';

describe('MarkdownParser', () => {
  describe('toHtml', () => {
    test('should return empty string for empty input', () => {
      expect(MarkdownParser.toHtml('')).toBe('');
    });

    test('should wrap plain text in paragraph tags', () => {
      expect(MarkdownParser.toHtml('Simple text')).toBe('<p>Simple text</p>');
    });

    test('should convert single newline to br tag', () => {
      expect(MarkdownParser.toHtml('Line 1\nLine 2')).toBe(
        '<p>Line 1<br>Line 2</p>'
      );
    });

    test('should convert double newline to separate paragraphs', () => {
      expect(MarkdownParser.toHtml('Line 1\n\nLine 2')).toBe(
        '<p>Line 1</p><p>Line 2</p>'
      );
    });

    describe('headings', () => {
      test('should convert h1 markdown to h1 tag', () => {
        expect(MarkdownParser.toHtml('# Heading')).toBe('<h1>Heading</h1>');
      });

      test('should convert h2 markdown to h2 tag', () => {
        expect(MarkdownParser.toHtml('## Heading')).toBe('<h2>Heading</h2>');
      });

      test('should convert h6 markdown to h6 tag', () => {
        expect(MarkdownParser.toHtml('###### Heading')).toBe(
          '<h6>Heading</h6>'
        );
      });

      test('should handle heading followed by text without extra linebreaks', () => {
        expect(MarkdownParser.toHtml('# Heading\nSome text')).toBe(
          '<h1>Heading</h1><p>Some text</p>'
        );
      });

      test('should handle heading followed by paragraph with blank line', () => {
        expect(MarkdownParser.toHtml('# Heading\n\nSome text')).toBe(
          '<h1>Heading</h1><p>Some text</p>'
        );
      });
    });

    describe('bold and italic', () => {
      test('should convert **text** to strong', () => {
        expect(MarkdownParser.toHtml('**bold** text')).toBe(
          '<p><strong>bold</strong> text</p>'
        );
      });

      test('should convert __text__ to strong', () => {
        expect(MarkdownParser.toHtml('__bold__ text')).toBe(
          '<p><strong>bold</strong> text</p>'
        );
      });

      test('should convert *text* to em', () => {
        expect(MarkdownParser.toHtml('*italic* text')).toBe(
          '<p><em>italic</em> text</p>'
        );
      });

      test('should convert _text_ to em', () => {
        expect(MarkdownParser.toHtml('_italic_ text')).toBe(
          '<p><em>italic</em> text</p>'
        );
      });
    });

    describe('lists', () => {
      test('should convert unordered list items to ul/li', () => {
        expect(MarkdownParser.toHtml('- Item 1\n- Item 2')).toBe(
          '<ul><li>Item 1</li><li>Item 2</li></ul>'
        );
      });

      test('should support asterisk and plus for unordered lists', () => {
        expect(MarkdownParser.toHtml('* Item 1\n+ Item 2')).toBe(
          '<ul><li>Item 1</li><li>Item 2</li></ul>'
        );
      });

      test('should convert ordered list items to ol/li', () => {
        expect(MarkdownParser.toHtml('1. Item 1\n2. Item 2')).toBe(
          '<ol><li>Item 1</li><li>Item 2</li></ol>'
        );
      });

      test('should not add extra br tags inside lists', () => {
        const result = MarkdownParser.toHtml('- Item 1\n- Item 2\n- Item 3');
        expect(result).not.toContain('<br>');
        expect(result).toBe(
          '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>'
        );
      });
    });

    describe('blockquotes', () => {
      test('should convert > to blockquote', () => {
        expect(MarkdownParser.toHtml('> Quote here')).toBe(
          '<blockquote>Quote here</blockquote>'
        );
      });
    });

    describe('complex content', () => {
      test('should handle mixed content without malformed HTML', () => {
        const markdown = '# Welcome\n\nThis is **bold** text.\n\n- Item 1\n- Item 2';
        const html = MarkdownParser.toHtml(markdown);

        expect(html).toBe(
          '<h1>Welcome</h1><p>This is <strong>bold</strong> text.</p><ul><li>Item 1</li><li>Item 2</li></ul>'
        );
        // Ensure no stray paragraph tags
        expect(html).not.toContain('</p><p>-');
        expect(html).not.toContain('<br><li>');
      });
    });
  });

  describe('toMarkdown', () => {
    test('should return empty string for empty input', () => {
      expect(MarkdownParser.toMarkdown('')).toBe('');
    });

    test('should convert paragraph to plain text', () => {
      expect(MarkdownParser.toMarkdown('<p>Simple text</p>')).toBe(
        'Simple text'
      );
    });

    test('should convert br to single newline', () => {
      expect(MarkdownParser.toMarkdown('<p>Line 1<br>Line 2</p>')).toBe(
        'Line 1\nLine 2'
      );
    });

    test('should convert multiple paragraphs to double newlines', () => {
      expect(
        MarkdownParser.toMarkdown('<p>First</p><p>Second</p>')
      ).toBe('First\n\nSecond');
    });

    describe('headings', () => {
      test('should convert h1 to # markdown', () => {
        expect(MarkdownParser.toMarkdown('<h1>Heading</h1>')).toBe(
          '# Heading'
        );
      });

      test('should convert h2 to ## markdown', () => {
        expect(MarkdownParser.toMarkdown('<h2>Heading</h2>')).toBe(
          '## Heading'
        );
      });
    });

    describe('bold and italic', () => {
      test('should convert strong to **text**', () => {
        expect(
          MarkdownParser.toMarkdown('<p><strong>bold</strong> text</p>')
        ).toBe('**bold** text');
      });

      test('should convert b to **text**', () => {
        expect(MarkdownParser.toMarkdown('<p><b>bold</b> text</p>')).toBe(
          '**bold** text'
        );
      });

      test('should convert em to *text*', () => {
        expect(MarkdownParser.toMarkdown('<p><em>italic</em> text</p>')).toBe(
          '*italic* text'
        );
      });

      test('should convert i to *text*', () => {
        expect(MarkdownParser.toMarkdown('<p><i>italic</i> text</p>')).toBe(
          '*italic* text'
        );
      });
    });

    describe('lists', () => {
      test('should convert ul/li to markdown list', () => {
        expect(
          MarkdownParser.toMarkdown('<ul><li>Item 1</li><li>Item 2</li></ul>')
        ).toBe('- Item 1\n- Item 2');
      });
    });

    describe('blockquotes', () => {
      test('should convert blockquote to > markdown', () => {
        expect(
          MarkdownParser.toMarkdown('<blockquote>Quote here</blockquote>')
        ).toBe('> Quote here');
      });
    });
  });

  describe('round-trip conversion', () => {
    test('should preserve simple text through round-trip', () => {
      const original = 'Simple text here';
      const html = MarkdownParser.toHtml(original);
      const markdown = MarkdownParser.toMarkdown(html);
      const htmlAgain = MarkdownParser.toHtml(markdown);

      expect(htmlAgain).toBe(html);
    });

    test('should preserve bold text through round-trip', () => {
      const original = '**Instructions:** Please fill out this survey.';
      const html = MarkdownParser.toHtml(original);
      const markdown = MarkdownParser.toMarkdown(html);
      const htmlAgain = MarkdownParser.toHtml(markdown);

      expect(htmlAgain).toBe(html);
      expect(markdown).toBe(original);
    });

    test('should preserve complex content through round-trip', () => {
      const original =
        '# Welcome\n\nThis is **bold** text.\n\n- Item 1\n- Item 2';
      const html = MarkdownParser.toHtml(original);
      const markdown = MarkdownParser.toMarkdown(html);
      const htmlAgain = MarkdownParser.toHtml(markdown);

      expect(htmlAgain).toBe(html);
    });

    test('should not accumulate extra linebreaks through multiple round-trips', () => {
      let content = '**Instructions:** Please fill out this survey.';

      // Simulate multiple edit/save cycles
      for (let i = 0; i < 5; i++) {
        const html = MarkdownParser.toHtml(content);
        content = MarkdownParser.toMarkdown(html);
      }

      expect(content).toBe('**Instructions:** Please fill out this survey.');
    });
  });
});
