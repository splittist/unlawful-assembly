# Document Assembly MVP - User Guide

## 🎯 Overview

The Document Assembly MVP is a comprehensive system that allows legal professionals to create automated document generation workflows. The system consists of two main interfaces:

1. **Document Assembly Creator** (`creator.html`) - For creating surveys, managing templates, and building packages
2. **Document Assembly User Interface** (`index.html`) - For end users to complete surveys and generate documents

## 🚀 Quick Start Guide

### For Package Creators (Legal Professionals)

1. **Open the Creator Interface**: Navigate to `creator.html`
2. **Design Your Survey**: Use the Survey Designer tab to create questions
3. **Upload Templates**: Add DOCX templates in the Template Manager tab
4. **Map Fields**: Connect survey questions to template placeholders in the Mapping Interface
5. **Create Package**: Bundle everything together in the Package Definition tab
6. **Export**: Download your package as a ZIP file

### For End Users (Document Generators)

1. **Open the User Interface**: Navigate to `index.html` 
2. **Load Package**: Upload a ZIP package or try the demo
3. **Complete Survey**: Fill out all required fields
4. **Generate Document**: Click submit to automatically generate and download your document

## 📋 Detailed Workflows

### Creating a Document Package

#### Step 1: Survey Design
- **Purpose**: Create questions that will collect data for document generation
- **Features**:
  - Drag-and-drop question builder
  - Multiple question types (text, dropdown, checkbox, date, email)
  - Multi-page surveys with logical flow
  - Real-time preview of survey structure
- **Best Practices**:
  - Use clear, specific question titles
  - Mark required fields appropriately
  - Group related questions on the same page
  - Test your survey before proceeding

#### Step 2: Template Management  
- **Purpose**: Upload and manage DOCX templates with placeholders
- **Supported Formats**: .docx files only
- **Placeholder Syntax**: Use `{field_name}` format in your Word documents
- **Features**:
  - File upload with validation
  - Automatic placeholder detection and analysis
  - Template preview and placeholder listing
  - Template replacement and version management
- **Best Practices**:
  - Use descriptive placeholder names
  - Test placeholders manually in Word first
  - Keep templates simple and well-formatted
  - Avoid complex Word features that might not render properly

#### Step 3: Field Mapping
- **Purpose**: Connect survey questions to template placeholders
- **Features**:
  - Drag-and-drop mapping interface
  - Auto-suggestions based on field names
  - Visual connection indicators
  - Mapping validation and completeness checking
- **Mapping Process**:
  1. Survey questions appear on the left
  2. Template placeholders appear on the right
  3. Drag from survey field to matching placeholder
  4. Connections are validated automatically
  5. Review completeness percentage
- **Best Practices**:
  - Ensure all required placeholders are mapped
  - Use consistent naming conventions
  - Review auto-suggestions before accepting
  - Test mappings with sample data

#### Step 4: Package Creation
- **Purpose**: Bundle survey, template, and mappings into a distributable package
- **Package Contents**:
  - Survey definition (JSON)
  - DOCX template file
  - Field mapping configuration
  - Package metadata
- **Metadata Fields**:
  - Package title and description
  - Version information
  - Author details
  - Creation/modification dates
  - Tags for categorization
- **Export Options**:
  - ZIP download for distribution
  - Package validation before export
  - Error reporting and suggestions

### Using a Document Package

#### Step 1: Package Loading
- **Upload Methods**:
  - Drag-and-drop ZIP file upload
  - Click to browse and select file
  - Try demo employment contract package
- **Validation Process**:
  - File format verification (.zip required)
  - Size limit checking (50MB maximum)
  - Package structure validation
  - Content integrity verification
- **Error Handling**:
  - Clear error messages for invalid packages
  - Suggestions for fixing common issues
  - Recovery options and retry mechanisms

#### Step 2: Survey Completion
- **Survey Rendering**:
  - Dynamic form generation from package content
  - Progressive disclosure for multi-page surveys
  - Real-time validation and error checking
  - Auto-save draft functionality (coming in future version)
- **Data Collection**:
  - Multiple input types supported
  - Required field enforcement
  - Data validation before submission
  - Progress tracking through survey pages

#### Step 3: Document Generation
- **Processing Pipeline**:
  1. Survey response validation
  2. Field mapping application
  3. Data transformation (formatting, type conversion)
  4. Template population using docxtemplater
  5. Document compilation and download
- **Data Transformations**:
  - Arrays → Comma-separated lists
  - Booleans → "Yes"/"No" text
  - Numbers → Currency formatting (for salary fields)
  - Dates → Human-readable format
  - Auto-generated fields (creation date/time)
- **Output**:
  - Automatic DOCX download
  - Timestamped filename
  - Preserves original template formatting

## 🔧 Technical Specifications

### System Requirements
- **Browser**: Modern web browser with JavaScript enabled
- **File Support**: 
  - Upload: .zip packages, .docx templates
  - Download: .zip packages, .docx documents
- **Storage**: Client-side only, no server required
- **Performance**: 50MB package size limit

### Supported File Formats

#### DOCX Templates
- **Format**: Microsoft Word 2007+ (.docx)
- **Placeholders**: `{field_name}` syntax
- **Features**: Basic text replacement, maintains formatting
- **Limitations**: Complex Word features (tables, images) may not work reliably

#### Package ZIP Files
- **Structure**: 
  ```
  package.zip
  ├── metadata.json
  ├── survey.json  
  ├── template.docx
  └── mappings.json
  ```
- **Validation**: Automatic structure and content validation
- **Compression**: Standard ZIP format

### Data Processing

#### Survey Data Types
- **Text**: String values, no length limits
- **Email**: Validated email format
- **Number**: Integer and decimal support
- **Date**: ISO date format with user-friendly display
- **Dropdown**: Single selection from predefined options
- **Checkbox**: Multiple selection support
- **Boolean**: Yes/No questions

#### Field Mapping Rules
- **One-to-One**: Each survey field maps to one placeholder
- **Required Fields**: Must be mapped for successful generation
- **Optional Fields**: Can be left unmapped (will show empty in document)
- **Auto-Generated**: System fields like dates added automatically

## 🎛️ User Interface Guide

### Creator Interface (`creator.html`)

#### Navigation Tabs
1. **Survey Designer**: Create and edit survey questions
2. **Template Manager**: Upload and manage DOCX templates  
3. **Mapping Interface**: Connect survey fields to template placeholders
4. **Package Definition**: Configure package metadata and export

#### Key Features
- **Drag-and-Drop**: Survey questions and field mappings
- **Real-Time Validation**: Immediate feedback on errors and completeness
- **Visual Indicators**: Color-coded status for mappings and validation
- **Export Controls**: Package validation before download

### User Interface (`index.html`)

#### Main Sections
1. **Package Loading**: Upload area and demo packages
2. **Survey Rendering**: Dynamic form display
3. **Progress Tracking**: Survey completion status
4. **Results Display**: Success/error messages and download links

#### Interaction Features
- **File Drag-and-Drop**: Intuitive package upload
- **Form Validation**: Real-time error checking
- **Loading States**: Clear feedback during processing
- **Error Recovery**: Helpful error messages and retry options

## 🔍 Testing Guide

### Package Creator Testing

#### Test Case 1: Basic Package Creation
1. Create a simple 3-question survey
2. Upload a basic DOCX template with 3 placeholders
3. Map all fields correctly
4. Export package successfully
5. **Expected Result**: Valid ZIP package downloads

#### Test Case 2: Complex Survey
1. Create multi-page survey (10+ questions)
2. Include all question types (text, dropdown, checkbox, date)
3. Upload template with corresponding placeholders
4. Create complete field mappings
5. **Expected Result**: Complex package exports without errors

#### Test Case 3: Error Handling
1. Try uploading invalid file formats
2. Create survey without mapping template
3. Attempt export with incomplete mappings
4. **Expected Result**: Clear error messages and prevention of invalid exports

### End User Testing  

#### Test Case 1: Demo Package Flow
1. Load the demo employment contract package
2. Complete all survey questions
3. Submit to generate document
4. **Expected Result**: DOCX downloads with populated data

#### Test Case 2: File Upload Flow
1. Upload a custom package ZIP file
2. Complete the survey rendered from package
3. Generate and download document
4. **Expected Result**: Custom document generated successfully

#### Test Case 3: Error Scenarios
1. Upload invalid ZIP file
2. Try to complete survey with missing required fields
3. Test package without template or mappings
4. **Expected Result**: Appropriate error handling and user guidance

### Browser Compatibility Testing

#### Supported Browsers
- **Chrome 90+**: Full functionality
- **Firefox 88+**: Full functionality  
- **Safari 14+**: Full functionality
- **Edge 90+**: Full functionality

#### Test Matrix
| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| File Upload | ✅ | ✅ | ✅ | ✅ |
| Drag-and-Drop | ✅ | ✅ | ✅ | ✅ |
| ZIP Processing | ✅ | ✅ | ✅ | ✅ |
| DOCX Generation | ✅ | ✅ | ✅ | ✅ |
| File Download | ✅ | ✅ | ✅ | ✅ |

## 🐛 Troubleshooting

### Common Issues

#### Package Upload Failures
- **Issue**: "Invalid package format" error
- **Cause**: ZIP file structure doesn't match expected format
- **Solution**: Recreate package using Document Assembly Creator

#### Document Generation Errors  
- **Issue**: "Failed to generate document" error
- **Cause**: Missing field mappings or invalid template
- **Solution**: Verify all required fields are mapped in creator interface

#### Browser Compatibility Issues
- **Issue**: Features not working in older browsers
- **Cause**: Missing JavaScript APIs in older browser versions
- **Solution**: Update to a modern browser version

### Error Messages Guide

| Error Message | Cause | Solution |
|---------------|-------|----------|
| "Please select a .zip package file" | Wrong file type uploaded | Upload only .zip files |
| "Package file is too large" | File exceeds 50MB limit | Reduce package size or split content |
| "Failed to load package" | Corrupted or invalid ZIP | Recreate package with creator tool |
| "Package must contain a template" | No DOCX template in package | Add template in creator interface |
| "Field mappings required" | No mappings configured | Create mappings in creator interface |

### Performance Optimization

#### Large File Handling
- Keep DOCX templates under 10MB when possible
- Minimize number of placeholders for better performance
- Use simple formatting in templates

#### Browser Performance
- Close unused browser tabs during processing
- Clear browser cache if experiencing issues
- Ensure sufficient RAM available (4GB+ recommended)

## 📝 Best Practices

### For Package Creators

1. **Survey Design**:
   - Keep surveys concise and focused
   - Use clear, jargon-free language
   - Group related questions logically
   - Test survey flow before finalizing

2. **Template Creation**:
   - Use consistent placeholder naming
   - Keep formatting simple and clean
   - Test templates manually before uploading
   - Document placeholder purposes

3. **Field Mapping**:
   - Map all required placeholders
   - Use descriptive field names
   - Validate mappings before export
   - Document mapping decisions

4. **Package Distribution**:
   - Include clear package descriptions
   - Version packages appropriately
   - Test packages before distribution
   - Provide user instructions

### For End Users

1. **Package Loading**:
   - Verify package source and integrity
   - Check package requirements before starting
   - Ensure stable internet connection

2. **Survey Completion**:
   - Read questions carefully
   - Provide complete and accurate information
   - Save drafts if process is interrupted
   - Review responses before submission

3. **Document Review**:
   - Check generated documents for accuracy
   - Verify all placeholders were populated
   - Review formatting and layout
   - Keep copies of generated documents

## 🔮 Future Enhancements

### Planned Features
- Real-time collaboration on package creation
- Advanced survey logic (conditional questions, branching)
- Template gallery and sharing
- Integration with cloud storage services
- Mobile-responsive interface improvements

### Integration Possibilities  
- CRM system integration
- Document management system connectivity
- E-signature platform integration
- Automated email delivery of generated documents

---

*This user guide covers the Phase 2 MVP implementation. For technical documentation and API details, see the Technical Documentation.*