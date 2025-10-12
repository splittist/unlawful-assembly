# GitHub Copilot Instructions for Document Assembly MVP

## Project Overview

This is a client-side document assembly application that enables legal professionals to create surveys and document templates, which end users can then use to generate customized DOCX documents. The application is built with TypeScript, Vite, and uses Survey.js for form creation and docxtemplater for document generation.

## Architecture Principles

### Service-Oriented Architecture
- The application follows a modular service-based design
- Each service is a static class with focused responsibilities
- Services are located in `src/services/` directory
- Services should be stateless where possible; state management happens at the UI layer

### Key Services
- **SurveyCreatorService**: Survey.js Creator integration for survey design
- **SurveyRuntimeService**: Survey.js runtime for end-user form rendering
- **DocxParserService**: DOCX template parsing and placeholder extraction
- **FieldMappingService**: Manages survey-to-template field mappings
- **PackageServiceService**: Package creation and import/export
- **DocumentGeneratorService**: Document generation pipeline using docxtemplater

## TypeScript Conventions

### Strict Type Safety
- Use TypeScript strict mode (enabled in tsconfig.json)
- Avoid `any` type; use explicit types or generics
- Define interfaces for all data structures in `src/types/index.ts`
- Use `Record<string, any>` for dynamic objects only when necessary

### Code Style
- Use Prettier for formatting (configuration in `.prettierrc.json`)
- Follow ESLint rules (configuration in `.eslintrc.json`)
- Use single quotes for strings
- Use 2-space indentation
- Prefer `const` over `let`, never use `var`
- Use arrow functions for callbacks

### Path Aliases
TypeScript path aliases are configured in `tsconfig.json`:
- `@/*` maps to `src/*`
- `@/types/*` maps to `src/types/*`
- `@/services/*` maps to `src/services/*`
- `@/utils/*` maps to `src/utils/*`

Use these aliases for cleaner imports:
```typescript
import { DocumentGeneratorService } from '@/services/documentGenerator';
import type { PackageContent } from '@/types';
```

## Coding Patterns

### Error Handling
- Use try-catch blocks for async operations
- Always log errors with context using `console.error()`
- Throw descriptive error messages
- Display user-friendly error messages in the UI

Example:
```typescript
try {
  // operation
  console.log('Operation started:', context);
} catch (error) {
  console.error('Error during operation:', error);
  throw new Error(`Failed to complete operation: ${error instanceof Error ? error.message : 'Unknown error'}`);
}
```

### Async/Await
- Use async/await for asynchronous operations
- Avoid callback-based patterns
- Handle errors with try-catch blocks

### Service Methods
- Service methods should be static
- Use JSDoc comments for public methods
- Include parameter and return type documentation

Example:
```typescript
/**
 * Generate document from survey responses and package content
 * @param surveyResponses - User's survey responses
 * @param packageContent - Package with template and mappings
 * @param templateFilename - Optional specific template to use
 */
static async generateDocument(
  surveyResponses: Record<string, any>,
  packageContent: PackageContent,
  templateFilename?: string
): Promise<void> {
  // implementation
}
```

## File Structure

### Entry Points
- `src/main.ts` - User interface entry point (index.html)
- `src/creator-main.ts` - Creator interface entry point (creator.html)

### Service Layer
- Place all business logic in `src/services/`
- Each service handles one domain area
- Keep services focused and cohesive

### Utilities
- Shared utility functions in `src/utils/common.ts`
- DOM manipulation helpers
- Date formatting utilities
- File handling helpers

### Types
- All TypeScript interfaces and types in `src/types/index.ts`
- Export types for use across the application
- Use descriptive interface names (e.g., `PackageContent`, `FieldMapping`, `TemplateFile`)

## Dependencies

### Core Libraries
- **Survey.js**: Use `survey-core` for runtime, `survey-creator-core` for creator interface
- **docxtemplater**: For processing DOCX templates with placeholder replacement
- **PizZip**: For ZIP file manipulation (DOCX is a ZIP archive)
- **FileSaver.js**: For downloading generated documents

### Build Tools
- **Vite**: Build system and dev server
- **TypeScript**: Type checking and compilation
- **Tailwind CSS**: Utility-first CSS framework

## UI Development

### Styling
- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and color schemes
- Reference existing UI patterns in `index.html` and `creator.html`

### Multi-Page Application
- The app has two main entry points: user interface and creator interface
- Each has its own HTML file and TypeScript entry point
- Shared code is in services and utilities

## Document Processing

### Template Placeholders
Templates use `{fieldName}` syntax for simple placeholders:
```
{employeeName}
{position}
{startDate}
```

### Field Mappings
- Mappings connect survey question IDs to template placeholders
- Support data transformations (e.g., uppercase, date formatting)
- Auto-suggestion based on name similarity

### Survey.js Integration
- Survey definitions are JSON-based (Survey.js format)
- Support various question types: text, radio, checkbox, dropdown
- Runtime validation and conditional logic

## Testing and Quality

### Development Workflow
- Use `npm run dev` for local development with hot reload
- Use `npm run lint` to check code quality
- Use `npm run format` to auto-format code
- Use `npm run build` to create production bundle

### Manual Testing
- Test both creator and user interfaces
- Verify package creation and loading
- Test document generation with sample data
- Check error handling and edge cases

## Documentation

### Code Comments
- Add JSDoc comments for all public methods and complex logic
- Explain "why" not "what" for non-obvious code
- Keep comments concise and up-to-date

### README and Guides
- User-facing documentation in `USER-GUIDE.md`
- Technical documentation in `TECHNICAL-DOCS.md`
- Testing procedures in `TESTING-CHECKLIST.md`
- Keep documentation synchronized with code changes

## Common Patterns

### Loading Files
Use the HTML5 File API for user file uploads:
```typescript
const file = await fileInput.files?.[0];
const content = await file.text();
const data = JSON.parse(content);
```

### Generating Downloads
Use FileSaver.js for downloading generated files:
```typescript
import { saveAs } from 'file-saver';
saveAs(blob, filename);
```

### Working with DOCX
DOCX files are ZIP archives. Use PizZip to read/write:
```typescript
const zip = new PizZip(templateContent);
const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
doc.render(data);
const output = doc.getZip().generate({ type: 'blob' });
```

## Best Practices

### Performance
- Lazy load Survey.js libraries (they are large)
- Use Vite's code splitting for optimal bundle sizes
- Minimize DOM manipulations

### Security
- All processing is client-side; no server communication
- Validate user inputs before processing
- Sanitize file contents before parsing

### Maintainability
- Keep functions small and focused (single responsibility)
- Use descriptive variable and function names
- Extract magic numbers and strings to constants
- Avoid deep nesting; prefer early returns

### Accessibility
- Use semantic HTML elements
- Provide meaningful alt text for images
- Ensure keyboard navigation works
- Test with screen readers when possible

## Deployment

### Build Process
- Run `npm run build` to generate production bundle
- Output goes to `dist/` directory
- Deploy as static files to web server, SharePoint, or OneDrive

### Browser Compatibility
- Target modern browsers (ES2020)
- Test in Chrome, Firefox, Safari, Edge
- Mobile browsers should work but experience may vary

## Additional Resources

- **Survey.js Documentation**: https://surveyjs.io/documentation
- **docxtemplater Documentation**: https://docxtemplater.com/docs
- **Vite Documentation**: https://vitejs.dev/guide
- **TypeScript Documentation**: https://www.typescriptlang.org/docs

## Project-Specific Notes

### Package Structure
A "package" is a ZIP file containing:
- Survey definition (JSON)
- DOCX template(s)
- Field mappings (JSON)
- Metadata (JSON)

### Workflow
1. **Creator**: Design survey → Upload template → Map fields → Export package
2. **User**: Load package → Complete survey → Generate document → Download

### File Naming Conventions
- Surveys: `survey-[name]-v[version].json`
- Templates: `template-[name]-v[version].docx`
- Mappings: `mapping-[template]-[survey].json`
- Packages: `package-[name].json`

When contributing code or suggesting changes, follow these guidelines to maintain consistency and quality across the codebase.
