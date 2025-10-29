# Test Fixtures

This directory contains sample data files for testing the Document Assembly MVP.

## 📁 Directory Contents

### Included in Repository
- `sample-survey.json` - Complete employment survey definition
- `sample-mappings.json` - Field mappings for employment template
- `sample-package.json` - Package configuration example

### Local Test Files (Not in Repository)
The following files should be created locally for testing but are excluded from git:

#### DOCX Template Files
- `employment-contract-template.docx` - Your employment contract template
- `*.docx` - Any other DOCX templates for testing

#### Personal/Private Test Data  
- `personal-*` - Files with personal information
- `*-private.*` - Any files marked as private

## 🔧 Setting Up Local Test Files

### 1. Add Your DOCX Template
Place your `employment-contract-template.docx` file in this directory:

```
tests/fixtures/employment-contract-template.docx
```

**Note:** This file will NOT be committed to git due to `.gitignore` rules.

**Quick Setup:**
1. Copy your DOCX file to `tests/fixtures/employment-contract-template.docx`
2. Run tests: `npm run test:run`
3. Look for "✓ Using real DOCX template for tests" in the output
4. Tests will automatically use your real template when available

### 2. Template Requirements
Your DOCX template should include placeholders that match the sample mappings:

**Required Placeholders:**
- `{employee_name}` - Employee full name
- `{company_name}` - Company name  
- `{job_title}` - Position title
- `{start_date}` - Employment start date

**Optional Placeholders:**
- `{department}` - Department name
- `{manager_name}` - Reporting manager
- `{employment_type}` - Full-time, Part-time, etc.
- `{annual_salary}` - Salary amount
- `{is_salary_based}` - Conditional for salary vs hourly
- `{pay_frequency}` - How often paid
- `{hourly_rate}` - Hourly rate
- `{weekly_hours}` - Expected hours per week
- `{has_benefits}` - Conditional for benefits section
- `{benefit_list}` - List of benefits
- `{has_health_insurance}` - Health insurance flag
- `{is_remote}` - Remote work flag
- `{office_address}` - Office location
- `{working_hours}` - Standard hours
- `{response_deadline}` - Contract response deadline
- `{hr_manager_name}` - HR contact person

### 3. Alternative Test Setup
If you don't want to use a real DOCX file, you can:

1. **Use Mock Data**: The test utilities create mock DOCX buffers automatically
2. **Create Minimal Template**: Create a simple DOCX with just a few placeholders
3. **Generate from Sample**: Use the `sample-template.html` to create a basic DOCX

## 🧪 Using Test Files

### In Integration Tests
```typescript
import { readFileSync } from 'fs';
import path from 'path';

// Load your actual DOCX template
const templatePath = path.join(__dirname, '../fixtures/employment-contract-template.docx');
const templateBuffer = readFileSync(templatePath);

// Use in tests
const result = await DocumentGeneratorService.generateDocument(
  surveyResponses,
  { ...packageContent, template: { filename: 'test.docx', content: templateBuffer } }
);
```

### Mock Alternative
```typescript
import { createMockDocxBuffer } from '../helpers/test-utils';

// Use mock data when real template isn't available
const mockTemplate = createMockDocxBuffer('Contract template with {employee_name}');
```

## 🔒 Security Notes

- **DOCX files are excluded** from git to prevent personal metadata exposure
- **Never commit** files with real personal information
- **Use placeholder data** in JSON fixtures (no real names/addresses)
- **Mark sensitive files** with `personal-` prefix or `-private` suffix

## 📝 Creating New Test Templates

When creating new DOCX templates for testing:

1. **Use placeholder data** (John Doe, Tech Corp, etc.)
2. **Save with generic filename**
3. **Check for personal metadata** in document properties
4. **Test with sample data** before using in automated tests

## 🚨 Troubleshooting

### File Not Found Errors
```typescript
// Check if file exists before using
import { existsSync } from 'fs';

const templateExists = existsSync(templatePath);
if (!templateExists) {
  // Fall back to mock data or skip test
  console.warn('Template file not found, using mock data');
}
```

### Permission Issues
- Ensure DOCX files are not read-only
- Close Word/LibreOffice before running tests
- Check file permissions if tests fail

This setup keeps your personal data secure while enabling comprehensive testing! 🔒