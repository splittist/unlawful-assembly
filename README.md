# Document Assembly Tool

A client-side web application that enables legal professionals to create surveys and document templates, which end users can then use to generate customized DOCX documents. Built with TypeScript, Vite, and modern web technologies.

## Features

### Document Assembly Creator (`creator.html`)
- **Survey Designer**: Drag-and-drop question builder using Survey.js Creator
- **Template Manager**: DOCX upload with automatic placeholder detection
- **Mapping Interface**: Visual field mapping with auto-suggestions
- **Package Definition**: Bundle surveys, templates, and mappings into ZIP packages

### Document Assembly User Interface (`index.html`)
- **Package Loading**: Upload ZIP packages with validation
- **Survey Completion**: Dynamic form rendering with validation
- **Document Generation**: Automatic DOCX creation using docxtemplater
- **Demo Package**: Sample employment contract for testing

## Quick Start

### For Package Creators
1. Open `creator.html` in your browser
2. Design survey using the Survey Designer tab
3. Upload DOCX template in Template Manager tab
4. Map survey fields to template placeholders
5. Export package as ZIP file

### For End Users
1. Open `index.html` in your browser
2. Load a package (ZIP file) or try the demo
3. Complete the survey form
4. Generate and download your customized document

## Technical Stack

- **Frontend**: TypeScript, Vite, Tailwind CSS
- **Survey Engine**: Survey.js Creator & Core
- **Document Processing**: docxtemplater, PizZip
- **File Handling**: FileSaver.js, HTML5 File API

## Development Setup

```bash
# Clone repository
git clone <repository-url>
cd unlawful-assembly

# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
# User interface: http://localhost:3000
# Creator interface: http://localhost:3000/creator.html
```

## Build and Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The application is client-side only and can be deployed to any static hosting service.

## Architecture

The application follows a modular service-oriented design:

- **Services** (`src/services/`): Core business logic for survey creation, template parsing, field mapping, and document generation
- **Components** (`src/components/`): Reusable UI components for the creator interface  
- **Utils** (`src/utils/`): Shared utilities and helper functions
- **Types** (`src/types/`): TypeScript type definitions

## Documentation

- **[USER-GUIDE.md](USER-GUIDE.md)**: Comprehensive user documentation
- **[TECHNICAL-DOCS.md](TECHNICAL-DOCS.md)**: Technical architecture details
- **[TESTING-CHECKLIST.md](TESTING-CHECKLIST.md)**: Testing procedures

## Browser Support

Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+) are supported.

## Security

All processing happens client-side - no data is transmitted to external servers. File uploads are validated for type and size (50MB max).

## License

AGPL-3.0-or-later - See [LICENSE](LICENSE) file for details.
