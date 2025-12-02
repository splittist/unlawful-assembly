/**
 * Test utilities for Document Assembly Tool
 * Common functions and helpers for testing
 */

import PizZip from 'pizzip';

/**
 * Create a mock File object for testing file uploads
 */
export function createMockFile(
  content: string,
  filename: string, 
  mimeType: string = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
): File {
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], filename, { type: mimeType });
}

/**
 * Create a mock ArrayBuffer for DOCX content
 * This creates a valid minimal DOCX ZIP structure that docxtemplater can process
 */
export function createMockDocxBuffer(
  content: string = 'Mock template with {employee_name} and {company_name}'
): ArrayBuffer {
  const zip = new PizZip();

  // Create the minimal DOCX structure
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`
  );

  // Create document.xml with the mock content including placeholders
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:t>${content}</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`
  );

  // Generate the ZIP as a Uint8Array and return its buffer
  const uint8Array = zip.generate({ type: 'uint8array' });
  return uint8Array.buffer;
}

/**
 * Create mock survey responses for testing
 */
export function createMockSurveyResponses(): Record<string, any> {
  return {
    employee_name: 'John Doe',
    company_name: 'Tech Corp',
    job_title: 'Software Engineer',
    start_date: '2024-01-15',
    annual_salary: 75000,
    is_salary_based: true,
    department: 'Engineering',
    manager_name: 'Jane Smith',
    employment_type: 'Full-time',
    pay_frequency: 'Monthly',
    has_benefits: true,
    benefit_list: ['Health Insurance', 'Dental Coverage', '401k'],
    has_health_insurance: true,
    job_responsibilities: [
      { title: 'Software Development', description: 'Write clean, maintainable code' },
      { title: 'Code Review', description: 'Review team member code contributions' }
    ],
    is_remote: false,
    office_address: '123 Tech Street, San Francisco, CA',
    working_hours: '9:00 AM - 5:00 PM',
    response_deadline: '2024-02-01',
    hr_manager_name: 'Alice Johnson'
  };
}

/**
 * Create minimal survey responses for testing edge cases
 */
export function createMinimalSurveyResponses(): Record<string, any> {
  return {
    employee_name: 'John Doe',
    company_name: 'Tech Corp'
  };
}

/**
 * Mock field mappings for testing
 */
export function createMockFieldMappings() {
  return [
    {
      id: '1',
      surveyField: 'employee_name',
      placeholder: '{employee_name}',
      placeholderType: 'simple' as const,
      isRequired: true,
      isValid: true
    },
    {
      id: '2', 
      surveyField: 'company_name',
      placeholder: '{company_name}',
      placeholderType: 'simple' as const,
      isRequired: true,
      isValid: true
    },
    {
      id: '3',
      surveyField: 'job_title',
      placeholder: '{job_title}',
      placeholderType: 'simple' as const,
      isRequired: true,
      isValid: true
    },
    {
      id: '4',
      surveyField: 'annual_salary',
      placeholder: '{annual_salary}',
      placeholderType: 'simple' as const,
      isRequired: false,
      isValid: true
    }
  ];
}

/**
 * Mock package content for testing
 */
export function createMockPackageContent() {
  return {
    metadata: {
      id: 'test-package-1',
      title: 'Employment Contract Package',
      description: 'Test package for employment contracts',
      version: '1.0.0',
      createdDate: '2024-01-01',
      createdBy: 'Test User',
      lastUpdated: '2024-01-01',
      templates: [
        {
          id: 'template-1',
          name: 'Employment Contract',
          file: 'employment-contract.docx',
          mapping: 'employment-mapping.json'
        }
      ],
      survey: 'employment-survey.json'
    },
    survey: {
      title: 'Employment Information',
      description: 'Collect employee information for contract generation',
      pages: [
        {
          name: 'page1',
          title: 'Basic Information',
          elements: [
            {
              type: 'text',
              name: 'employee_name',
              title: 'Employee Name',
              isRequired: true
            },
            {
              type: 'text', 
              name: 'company_name',
              title: 'Company Name',
              isRequired: true
            },
            {
              type: 'text',
              name: 'job_title', 
              title: 'Job Title',
              isRequired: true
            }
          ]
        }
      ]
    },
    template: {
      filename: 'employment-contract.docx',
      content: createMockDocxBuffer('Employment contract template with {employee_name} and {company_name}')
    },
    mappings: createMockFieldMappings()
  };
}

/**
 * Wait for async operations in tests
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper to check if an object is a valid ArrayBuffer
 */
export function isValidArrayBuffer(buffer: any): buffer is ArrayBuffer {
  return buffer instanceof ArrayBuffer && buffer.byteLength > 0;
}

/**
 * Create a mock DOCX placeholder for testing
 */
export function createMockDocxPlaceholder(name: string, type: 'simple' | 'conditional' | 'loop' = 'simple') {
  return {
    name,
    type,
    fullMatch: `{${name}}`,
    isRequired: true,
    context: `Sample text with {${name}} placeholder`
  };
}

/**
 * Load real DOCX template file if available
 * Returns null if file doesn't exist or can't be loaded
 */
export function loadRealTemplate(filename: string = 'employment-contract-template.docx'): ArrayBuffer | null {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const templatePath = path.join(__dirname, '../fixtures', filename);
    
    if (!fs.existsSync(templatePath)) {
      return null;
    }
    
    const templateData = fs.readFileSync(templatePath);
    return templateData.buffer.slice(
      templateData.byteOffset, 
      templateData.byteOffset + templateData.byteLength
    );
  } catch (error) {
    console.warn(`Could not load template ${filename}:`, error);
    return null;
  }
}

/**
 * Check if real template file exists
 */
export function hasRealTemplate(filename: string = 'employment-contract-template.docx'): boolean {
  try {
    const fs = require('fs');
    const path = require('path');
    const templatePath = path.join(__dirname, '../fixtures', filename);
    return fs.existsSync(templatePath);
  } catch {
    return false;
  }
}