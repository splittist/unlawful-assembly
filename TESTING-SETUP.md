# Testing Infrastructure Guide

## 🧪 Testing Setup Complete

Your Document Assembly MVP now has a comprehensive testing infrastructure set up with Vitest. Here's what was installed and configured:

## 📁 Directory Structure

```
tests/
├── integration/           # End-to-end workflow tests
│   └── document-generation.test.ts
├── services/             # Service layer unit tests  
│   └── fieldMapping.test.ts
├── fixtures/             # Sample data for tests
│   ├── sample-survey.json
│   ├── sample-mappings.json
│   └── sample-package.json
├── helpers/              # Test utilities and mocks
│   └── test-utils.ts
└── setup.ts             # Global test configuration
```

## 🛠️ Installed Dependencies

**Testing Framework:**
- `vitest` - Fast, TypeScript-native test runner
- `@vitest/ui` - Web-based test runner interface
- `@vitest/coverage-v8` - Code coverage reporting

**Testing Environment:**
- `jsdom` - DOM simulation for browser-like testing
- `happy-dom` - Alternative lightweight DOM simulation
- `@testing-library/dom` - DOM testing utilities
- `@testing-library/user-event` - User interaction simulation

## 🎯 Available Commands

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once and exit
npm run test:run

# Run tests with web UI
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## 📝 Test Examples Created

### 1. Document Generation Integration Test
**File:** `tests/integration/document-generation.test.ts`

Tests the complete document generation pipeline:
- ✅ Full survey responses → document generation
- ✅ Minimal responses handling  
- ✅ Error scenarios (empty responses, missing template, no mappings)
- ✅ Data transformation (arrays, booleans, dates)
- ✅ File naming and saving

### 2. Field Mapping Service Test
**File:** `tests/services/fieldMapping.test.ts`

Tests field mapping logic:
- ✅ Service initialization
- ✅ Auto-suggestion algorithms (placeholder for implementation)
- ✅ Mapping validation
- ✅ CRUD operations (placeholder for implementation)

## 🔧 Configuration Files

### `vitest.config.ts`
- TypeScript path aliases (`@/`, `@/services/`, etc.)
- JSdom environment for DOM testing
- Test file patterns and exclusions
- Coverage reporting setup

### `tests/setup.ts`
- Global test setup and teardown
- File system mocks for browser environment
- FileSaver.js mocking
- Custom expect matchers

## 🧰 Test Utilities

### `tests/helpers/test-utils.ts`
Ready-to-use helper functions:
- `createMockFile()` - Mock file uploads
- `createMockSurveyResponses()` - Complete survey data
- `createMinimalSurveyResponses()` - Edge case data
- `createMockFieldMappings()` - Field mapping data
- `createMockPackageContent()` - Package structures
- `createMockDocxBuffer()` - DOCX file simulation

## 📊 Sample Test Fixtures

**Survey Definition:** `tests/fixtures/sample-survey.json`
- Complete employment survey with all question types
- Conditional logic examples
- Validation rules

**Field Mappings:** `tests/fixtures/sample-mappings.json`  
- 20 example field mappings
- Different placeholder types (simple, conditional, loop)
- Confidence scores for auto-suggestions

**Package Configuration:** `tests/fixtures/sample-package.json`
- Complete package metadata structure
- Template and survey references

**DOCX Templates:** `tests/fixtures/*.docx` (Local only - not in git)
- Place your `employment-contract-template.docx` here
- All DOCX files are excluded from git for privacy
- See `tests/fixtures/README.md` for setup instructions

## 🚀 Getting Started with Testing

### 1. Run Your First Test
```bash
npm run test:run
```

### 2. Watch Tests During Development
```bash
npm run test
```

### 3. View Tests in Web UI
```bash
npm run test:ui
```
Then open the displayed URL in your browser.

### 4. Generate Coverage Report
```bash
npm run test:coverage
```
Coverage reports will be in the `coverage/` directory.

## ✅ What to Test Next

### High Priority (Integration Tests)
1. **Package Management Integration**
   - Package creation from survey + template
   - Package import/export
   - Package validation

2. **Survey Creator Workflow**
   - Survey creation and editing
   - Preview functionality
   - JSON export/import

3. **Template Processing**
   - DOCX parsing and placeholder extraction
   - Template validation
   - Error handling for malformed templates

### Medium Priority (Service Tests)
1. **DocxParserService**
   - Placeholder detection accuracy
   - Complex template structures
   - Error handling for corrupted files

2. **SurveyRuntimeService**
   - Survey rendering from JSON
   - Response collection and validation
   - Conditional logic execution

3. **FileLoaderService**
   - File upload handling
   - Type validation
   - Size limit checks

### Lower Priority (Unit Tests)
- Utility functions in `common.ts`
- Data transformation functions
- Validation helpers

## 🎯 Testing Best Practices

### DO:
- ✅ Focus on testing user workflows end-to-end
- ✅ Test error conditions and edge cases
- ✅ Use descriptive test names that explain the scenario
- ✅ Mock external dependencies (file system, network)
- ✅ Test data transformations and business logic

### DON'T:
- ❌ Test simple getters/setters without logic
- ❌ Test third-party library functionality  
- ❌ Write brittle tests that break on UI changes
- ❌ Test implementation details instead of behavior
- ❌ Ignore test failures or write tests that always pass

## 🔍 Debugging Tests

### Common Issues:
1. **Import Errors**: Check path aliases in `vitest.config.ts`
2. **DOM Not Available**: Ensure tests use `jsdom` environment
3. **File Operations**: Use mocked file operations from `setup.ts`
4. **Async Failures**: Use `await` with async operations
5. **Mock Issues**: Clear mocks with `vi.clearAllMocks()` in `beforeEach`

### Debugging Tips:
```javascript
// Add debugging output
console.log('Debug:', someValue);

// Use debugger in tests (works with --inspect)
debugger;

// Test specific files only
npm run test -- fieldMapping

// Run with verbose output
npm run test -- --reporter=verbose
```

## 📈 Next Steps

1. **Add More Integration Tests**: Focus on the core user workflows
2. **Implement Service Tests**: Add tests for services with complex logic  
3. **Set Up CI/CD**: Run tests automatically on commits/PRs
4. **Add E2E Tests**: Consider Playwright for full browser testing
5. **Performance Testing**: Add tests for large templates and surveys

Your testing infrastructure is now ready for high-value test development! 🎉