# Product Requirements Document: Document Assembly MVP

## 1. Executive Summary

**Product Name:** Document Assembly Tool (working title)

**Version:** 1.0 MVP

**Target Users:** Legal professionals within a single organization

**Core Value Proposition:** Enable lawyers to create reusable document templates with associated questionnaires, allowing other lawyers to generate customized legal documents through a simple form-filling process, all running securely within the organization's existing infrastructure.

---

## 2. Product Overview

### 2.1 Problem Statement
Legal professionals repeatedly create similar documents (contracts, agreements, letters) with minor variations. Current solutions either require expensive document management systems, complex Word macros, or manual copy-paste operations that are error-prone and time-consuming.

### 2.2 Solution
A browser-based static application that runs client-side, hosted on the organization's SharePoint/OneDrive infrastructure. The tool enables two workflows:
1. **Creators** design questionnaires and DOCX templates with placeholders
2. **Users** fill out questionnaires and receive populated DOCX documents

### 2.3 Key Constraints
- Static application only (no backend/database)
- All processing happens client-side in the browser
- Files hosted on SharePoint/OneDrive
- Data never leaves organization's infrastructure
- MVP scope - defer complex features for validation phase

---

## 3. User Roles & Personas

### 3.1 Creator Role
**Who:** Senior lawyers, legal operations staff, practice group leaders

**Goals:**
- Create reusable document templates
- Design questionnaires to collect necessary information
- Map questionnaire fields to template placeholders
- Distribute templates to colleagues

**Technical Comfort:** Moderate - comfortable with Word, SharePoint, basic file management

### 3.2 User Role
**Who:** All lawyers in the organization

**Goals:**
- Quickly generate standard legal documents
- Ensure accuracy and consistency
- Avoid manual document preparation

**Technical Comfort:** Basic - can use Word, fill out web forms

---

## 4. Functional Requirements

### 4.1 Application Structure

**Deployment Model:**
- Static files hosted in SharePoint/OneDrive folder
- Two HTML entry points:
  - `creator.html` - Creator interface
  - `index.html` - User interface
- Shared JavaScript bundle with lazy-loaded modules per role

**Folder Structure:**
```
/DocumentAssembly/
├── index.html              # User interface
├── creator.html            # Creator interface
├── app.bundle.js          # Application code
├── styles.css             # Styling
├── config.json            # Application configuration
├── /templates/            # DOCX template files
│   ├── index.json         # Template catalog
│   └── *.docx            # Individual templates
├── /surveys/              # Survey definitions
│   └── *.json            # Survey.js JSON definitions
├── /mappings/             # Field mappings
│   └── *.json            # Template-to-survey mappings
└── /packages/             # Package definitions
    └── *.json            # Package configurations
```

### 4.2 Creator Interface Features

#### 4.2.1 Survey Designer
**Requirements:**
- Integrate Survey.js Creator component
- Visual drag-and-drop questionnaire builder
- Support question types:
  - Text input (short and long)
  - Single choice (radio buttons)
  - Multiple choice (checkboxes)
  - Dropdown
  - Date picker
  - Number input
  - Yes/No boolean
- Support conditional logic (show question B if answer A = X)
- Support validation rules (required fields, format validation)
- Preview mode to test questionnaire as end-user would see it

**Output:**
- Survey definition as JSON file
- Download button triggers browser download
- Clear filename convention: `survey-[name]-[date].json`

#### 4.2.2 Template Manager
**Requirements:**
- Instructions for creating DOCX templates with placeholders
- Placeholder syntax documentation: `{fieldName}` for simple fields, `{#if field}...{/if}` for conditionals, `{#loop}...{/loop}` for repeating sections
- Template naming conventions and best practices
- No template upload interface (creators manually add to SharePoint folder)

#### 4.2.3 Mapping Interface
**Requirements:**
- Select a template file (from dropdown of available templates)
- Select a survey file (from dropdown of available surveys)
- Automatically generate mappings based on matching field names and placeholders
- Display all fields from the selected survey
- Display all placeholders detected in the template
- **Validation:**
  - Check that all template placeholders have corresponding survey fields (error if missing)
  - Warn about survey fields that don't map to any template placeholders
  - Validate template syntax to catch malformed placeholders
- Support simple field transformation: "All Caps" option for text fields
- Visual indicator showing mapping status (valid/invalid)

**Output:**
- Mapping JSON file linking survey fields to template placeholders
- Download button triggers browser download
- Filename convention: `mapping-[templatename]-[surveyname].json`

#### 4.2.4 Package Definition
**Requirements:**
- Create a "document package" that bundles:
  - **Multiple template file references** (support generating multiple documents from one survey)
  - Survey file reference
  - Mapping file reference(s) for each template
  - Display name for users
  - Description/instructions
  - Metadata: creator email, creation date, last updated date
- Save as JSON configuration file
- Download for manual upload to SharePoint

#### 4.2.5 Creator Wizard/Checklist
**Requirements:**
- Step-by-step wizard guiding creators through the process:
  1. Create or select survey
  2. Upload template(s) to SharePoint
  3. Generate and validate mappings
  4. Create package definition
  5. Update config.json
- Checklist showing completion status of each step
- Inline help text and tooltips throughout
- "What's Next" guidance after each step

### 4.3 User Interface Features

#### 4.3.1 Document Package Selection
**Requirements:**
- Display list of available document packages
- Read from `config.json` index file
- Show for each package:
  - Package name
  - Description
  - Metadata: Last updated date, Created by
  - Number of templates included
- Simple list view (no search/filter for MVP given 5-10 packages expected)

#### 4.3.2 Draft Management
**Requirements:**
- On startup, check for existing drafts
- If drafts exist, show modal: "Continue previous draft or start new?"
- List existing drafts with:
  - Package name
  - Date last modified
  - Progress indicator (% complete)
- Allow user to:
  - Continue existing draft
  - Delete draft
  - Start new submission
- Drafts stored in browser localStorage
- Auto-save every 30 seconds while user is filling form
- Draft persistence across browser sessions (should-have, not must-have)

#### 4.3.3 Questionnaire Rendering
**Requirements:**
- Load and display Survey.js questionnaire
- Support all question types defined in Creator
- Enforce validation rules
- Display conditional questions based on answers
- Progress indicator for multi-page surveys
- Auto-save draft functionality (every 30 seconds)
- Visual confirmation when draft is saved
- "Clear Draft" button to start over

#### 4.3.4 Matter/Project Name Input
**Requirements:**
- Before starting questionnaire, prompt user for "Matter Name" or "Project Name"
- This will be used in generated filename
- Optional description field
- Stored with draft for context

#### 4.3.5 Document Generation
**Requirements:**
- "Review Answers" button when survey is complete
- Summary page showing all answers in readable format
- "Edit" button to return to questionnaire
- "Generate Document(s)" button
- Clear indication of which template(s) will be generated
- Client-side processing with docxtemplater for each template
- Progress indicator during generation showing:
  - Current template being processed (if multiple)
  - Overall progress
- Error handling with user-friendly messages
- Automatic download of generated DOCX file(s)
- Filename convention: `[matter-name]-[templatename]-[date].docx`
- Success message listing all generated documents
- Option to generate again or return to package selection
- Clear draft after successful generation

---

## 5. Technical Requirements

### 5.1 Technology Stack

**Build System:**
- Vite (fast, simple TypeScript bundler)

**Core Libraries:**
- TypeScript 5.x
- docxtemplater (DOCX generation)
- pizzip (required by docxtemplater)
- Survey.js Core (runtime for users)
- Survey.js Creator (designer for creators)
- file-saver (trigger downloads)

**Browser Support:**
- Chrome 120+ (released Dec 2023)
- Edge 120+
- Firefox 121+
- Safari 17+
- No IE11 support
- No mobile browser support required

### 5.2 File Format Specifications

#### 5.2.1 Survey Definition (Survey.js JSON)
Standard Survey.js JSON format - no custom modifications needed.

#### 5.2.2 Mapping File Format
```json
{
  "version": "1.0",
  "templateId": "employment-agreement",
  "surveyId": "employment-survey-v1",
  "mappings": [
    {
      "surveyField": "employeeName",
      "templatePlaceholder": "employeeName",
      "transform": "allcaps"
    },
    {
      "surveyField": "startDate",
      "templatePlaceholder": "startDate",
      "transform": null
    }
  ]
}
```

**Supported Transforms:**
- `null` - No transformation
- `"allcaps"` - Convert text to uppercase

#### 5.2.3 Package Configuration Format
```json
{
  "id": "employment-pkg-001",
  "name": "Employment Agreement Package",
  "description": "Generate employment agreements and offer letters for new hires",
  "templates": [
    {
      "id": "employment-agreement",
      "name": "Employment Agreement",
      "file": "./templates/employment-agreement.docx",
      "mapping": "./mappings/employment-agreement-mapping.json"
    },
    {
      "id": "offer-letter",
      "name": "Offer Letter",
      "file": "./templates/offer-letter.docx",
      "mapping": "./mappings/offer-letter-mapping.json"
    }
  ],
  "survey": "./surveys/employment-survey.json",
  "version": "1.0",
  "createdDate": "2025-10-11",
  "createdBy": "john.doe@firm.com",
  "lastUpdated": "2025-10-11"
}
```

#### 5.2.4 Index/Catalog File Format
```json
{
  "version": "1.0",
  "lastUpdated": "2025-10-11T10:30:00Z",
  "packages": [
    {
      "id": "employment-pkg-001",
      "configFile": "./packages/employment-pkg-001.json"
    },
    {
      "id": "nda-pkg-002",
      "configFile": "./packages/nda-pkg-002.json"
    }
  ]
}
```

#### 5.2.5 Draft Storage Format (localStorage)
```json
{
  "packageId": "employment-pkg-001",
  "matterName": "Smith Hiring 2025",
  "surveyData": { /* Survey.js data object */ },
  "lastSaved": "2025-10-11T14:23:00Z",
  "progress": 65
}
```

**localStorage Key:** `docassembly_draft_{packageId}_{timestamp}`

### 5.3 Template Placeholder Syntax

Using docxtemplater standard syntax:
- Simple field: `{fieldName}`
- Conditional: `{#if fieldName}content{/if}`
- Loop: `{#items}Item: {name}{/items}`
- Inverted condition: `{^fieldName}content when false{/fieldName}`

**Documentation Requirements:**
- Provide comprehensive template creation guide for creators
- Example templates with common patterns
- Troubleshooting guide for common issues (e.g., Word splitting text runs)
- Best practices for placeholder naming conventions

**Template Syntax Validation:**
- Parse template DOCX in mapping interface
- Check for:
  - Malformed placeholders (unclosed tags, typos)
  - Placeholders without matching survey fields
  - Nested conditionals (warn about complexity)
- Display validation results before allowing mapping download

### 5.4 Browser Storage

**localStorage Usage:**
- Save in-progress questionnaire answers (draft functionality)
- Key format: `docassembly_draft_{packageId}_{timestamp}`
- Auto-save every 30 seconds
- No limit on number of drafts (user can manually delete)
- No automatic expiration (user manages their own drafts)
- Clear drafts after successful document generation (with confirmation)

**Draft Management Features:**
- List all saved drafts on startup
- Show draft metadata (package, date, progress)
- Allow deletion of individual drafts
- "Clear All Drafts" option in settings/menu

### 5.5 Error Handling

**User-Facing Errors:**
- Template file not found
- Survey file not found
- Mapping file not found
- Invalid JSON in configuration files
- Template generation errors
- Missing required survey fields
- Template placeholder not mapped
- Template syntax validation errors

**Error Display:**
- User-friendly error messages (avoid technical jargon)
- Specific guidance on how to fix the issue
- For creators: Option to download error details for troubleshooting
- Support contact information (email or internal help desk)
- Error logging to browser console for debugging

---

## 6. User Experience Requirements

### 6.1 Creator Workflow

**Step 1: Create Survey**
1. Open `creator.html` from SharePoint
2. Click "New Survey" or "Load Existing Survey"
3. Design questionnaire using drag-and-drop interface
4. Add questions, logic, validation
5. Test in preview mode
6. Click "Download Survey"
7. Save JSON file with clear naming: `survey-[name]-[date].json`
8. Upload to `/surveys/` folder in SharePoint

**Step 2: Create Template(s)**
1. Open Word
2. Create document with placeholders following documented syntax
3. Save as DOCX with clear naming: `template-[name]-[date].docx`
4. Upload to `/templates/` folder in SharePoint
5. Repeat for additional templates in the same package

**Step 3: Create Mapping(s)**
1. In creator.html, go to "Mappings" tab
2. Select template from dropdown
3. Select survey from dropdown
4. System auto-generates mappings based on matching names
5. Review validation results:
   - ✓ All placeholders mapped
   - ⚠ Warnings for unmapped survey fields
   - ✗ Errors for unmapped placeholders
6. Add transformations if needed (e.g., All Caps)
7. Fix any validation errors
8. Click "Download Mapping"
9. Save JSON file: `mapping-[template]-[survey].json`
10. Upload to `/mappings/` folder in SharePoint
11. Repeat for each template in the package

**Step 4: Create Package**
1. In creator.html, go to "Packages" tab
2. Enter package name and description
3. Select survey file
4. Add one or more templates with their mappings
5. System validates entire package configuration
6. Preview package as user would see it
7. Click "Download Package Config"
8. Save JSON file: `package-[name].json`
9. Upload to `/packages/` folder in SharePoint

**Step 5: Update Index**
1. Open `config.json` from SharePoint root
2. Add new package entry with ID and file path
3. Save and re-upload `config.json`
4. Test by opening `index.html` and verifying package appears

**Wizard Support:**
- Wizard tracks completion of each step
- Shows checklist with status indicators (✓ complete, ○ incomplete, ⚠ needs attention)
- "What's Next" section after each step
- Links to relevant documentation
- Validation checks at each step before proceeding

### 6.2 User Workflow

**Step 1: Check for Drafts**
1. Open `index.html` from SharePoint
2. If drafts exist, modal appears:
   - "Continue previous work or start new?"
   - List of existing drafts with dates and progress
   - Options: Continue, Delete, Start New

**Step 2: Select Document Package**
1. Browse available document packages
2. Read description and metadata
3. See which templates will be generated
4. Click "Start"

**Step 3: Enter Matter Information**
1. Enter matter/project name (required for filename)
2. Optional: Add description for context
3. Click "Begin Questionnaire"

**Step 4: Complete Questionnaire**
1. Fill out form fields
2. Answer conditional questions as they appear
3. System validates answers in real-time
4. Auto-save occurs every 30 seconds (visual confirmation)
5. Progress bar shows completion percentage
6. Can close browser and return later (draft saved)

**Step 5: Review & Generate**
1. Click "Review Answers" when complete
2. Review summary of all answers in organized format
3. Click "Edit" if changes needed (returns to form)
4. Click "Generate Document(s)"
5. Wait for processing with progress indicator
6. Document(s) download automatically
7. Success message shows:
   - List of generated documents
   - Filenames used
   - Location in Downloads folder
8. Options:
   - Generate again (keeps answers)
   - Start new document
   - Return to package selection

**Step 6: Draft Cleanup**
1. After successful generation, prompt: "Clear saved draft?"
2. User can choose to keep or delete draft

### 6.3 UI/UX Principles

**Design Goals:**
- **Simplicity:** Minimal interface, clear instructions
- **Guidance:** Tooltips, help text for complex fields, inline validation
- **Feedback:** Loading states, success/error messages, progress indicators
- **Efficiency:** Sensible defaults, keyboard navigation, auto-save
- **Trust:** Clear indication of what's happening, no surprises

**Accessibility:**
- WCAG 2.1 AA compliance
- Keyboard navigation throughout
- Screen reader support
- High contrast text
- Clear focus indicators
- Descriptive labels and ARIA attributes

**Responsive Design:**
- Desktop primary (1280x720 minimum)
- Tablet support (768px+)
- No mobile phone support required
- No dark mode for MVP

**Visual Design:**
- Clean, professional appearance
- Consistent with legal/corporate aesthetic
- Minimal use of color for status indicators (green=success, red=error, yellow=warning)
- Clear typography hierarchy
- Adequate white space

---

## 7. Non-Functional Requirements

### 7.1 Performance
- Initial page load: < 3 seconds on corporate network
- Survey load: < 1 second
- Document generation: < 5 seconds for typical template
- Auto-save operation: < 500ms (non-blocking)
- Smooth scrolling and interactions (60 fps)
- Multiple template generation: < 10 seconds for 3 templates

### 7.2 Browser Compatibility
- Chrome 120+ (December 2023)
- Edge 120+
- Firefox 121+
- Safari 17+
- Modern JavaScript features (ES2022+)
- No polyfills for legacy browsers

### 7.3 File Size Limits
- Template DOCX: < 5 MB (generous for initial drafts)
- Generated DOCX: < 10 MB
- Survey JSON: < 500 KB
- Package configuration: < 100 KB
- Total application bundle: < 2 MB

### 7.4 Scalability (MVP Scope)
- Support 5-10 document packages
- Support up to 100 questions per survey
- Support multiple templates per package (up to 5)
- Dozens of infrequent users (not high-concurrency design)
- SharePoint handles access control and file distribution

### 7.5 Security & Privacy
- No data transmission outside organization
- All processing client-side
- No analytics or tracking
- No external API calls (except loading files from SharePoint)
- Leverage SharePoint permissions for access control
- No credential storage
- No personal data collection
- Clear browser storage (localStorage) contains only draft form data

### 7.6 Maintenance & Support
- Comprehensive documentation:
  - Creator guide (step-by-step with screenshots)
  - User guide (simple, visual)
  - Template creation guide (syntax, examples, troubleshooting)
  - FAQ/troubleshooting guide
  - Installation/deployment guide
- Support contact information displayed in app footer
- Error messages include reference codes for support
- Version number displayed in UI

---

## 8. Out of Scope (Post-MVP)

The following features are explicitly excluded from MVP:

**Infrastructure:**
1. Backend/Database - No server-side processing or data storage
2. User Authentication - Relies on SharePoint authentication
3. Cloud storage beyond SharePoint/OneDrive

**Features:**
4. Version control of templates/surveys
5. Collaboration/multi-user editing
6. Usage analytics or reporting
7. Advanced template features:
   - Complex field transformations beyond "All Caps"
   - Field concatenation
   - Custom JavaScript in templates
   - Image insertion from survey
8. Document management:
   - Digital signatures
   - PDF generation
   - Email delivery
   - Integration with DMS/CRM
9. Advanced UI:
   - Document preview before download
   - Estimated completion time
   - Print/export answers separately
   - Search/filter for packages
   - Recently used packages
   - Categories/tags
10. Developer tools:
    - Word add-in for placeholder insertion
    - Template testing framework
    - Bulk document generation

**Platform:**
11. Mobile app or phone support
12. Offline mode (requires SharePoint connection)
13. Dark mode
14. Multi-language support (English only)

---

## 9. Success Criteria

### 9.1 MVP Success Metrics

**Adoption Metrics:**
- 3+ creators build complete packages within first month
- 10+ users successfully generate documents within first month
- 5-10 document packages created

**Quality Metrics:**
- < 5% error rate in document generation
- < 10% of users require support assistance
- 80%+ user satisfaction (brief post-generation survey)

**Validation Metrics:**
- **Primary Goal:** Does the template + questionnaire paradigm work for legal documents?
- Creator feedback: Can they build packages without extensive training?
- User feedback: Is the process faster/easier than current methods?
- Technical validation: Is client-side performance acceptable?

**Technical Health:**
- No critical security issues
- Average document generation < 5 seconds
- Zero data loss from auto-save failures

### 9.2 Go/No-Go Decision Criteria

**Proceed with Enhanced Version if:**
- ✓ Creators successfully build 5+ packages with minimal support
- ✓ Users consistently generate accurate documents
- ✓ Performance acceptable on organizational infrastructure
- ✓ Positive feedback from legal staff (>70% satisfaction)
- ✓ No critical security concerns
- ✓ Time savings demonstrated vs. current process

**Pivot or Reassess if:**
- ✗ Template creation process too complex for target creators
- ✗ Client-side performance unacceptable (>10s generation time)
- ✗ Security concerns prevent broader adoption
- ✗ Accuracy issues in generated documents
- ✗ Better commercial solutions identified
- ✗ Low adoption despite training/support

### 9.3 User Feedback Collection

**During Pilot:**
- Brief survey after first successful document generation (3-5 questions)
- Weekly check-ins with pilot creators
- Support ticket tracking
- Direct observation of 2-3 user sessions

**Questions to Answer:**
- What works well?
- What's confusing or difficult?
- What features are most needed?
- Would you use this regularly?
- How does this compare to current process?

---

## 10. Project Plan

### 10.1 MVP Development Phases

**Phase 1: Foundation (Weeks 1-2)**
- Project setup (Vite, TypeScript, linting)
- Install dependencies (Survey.js, docxtemplater, etc.)
- Basic file structure and routing
- Survey.js integration (Creator and runtime)
- Basic creator/user interface shells
- File loading from SharePoint folder structure

**Deliverable:** Can load survey JSON and display in both Creator and runtime

**Phase 2: Creator Interface (Weeks 3-4)**
- Full Survey.js Creator integration
- Template documentation page
- Mapping interface with auto-generation
- Template placeholder parser and validator
- Package creation interface
- File download functionality for all JSON types
- Creator wizard/checklist implementation

**Deliverable:** Creator can build complete package (survey + template + mapping + package config)

**Phase 3: User Interface (Weeks 5-6)**
- Package selection from config.json
- Draft management (save/load/delete)
- Matter name input
- Survey rendering with auto-save
- Review answers page
- Document generation with docxtemplater
- Multi-template support
- Progress indicators
- Error handling and user feedback

**Deliverable:** User can generate documents end-to-end

**Phase 4: Polish & Documentation (Week 7)**
- UI/UX refinements based on internal testing
- Error message improvements
- Accessibility audit and fixes
- Performance optimization
- Comprehensive documentation:
  - Creator guide with screenshots
  - User guide
  - Template syntax guide
  - Deployment guide
  - FAQ/troubleshooting
- Create 2-3 example packages for testing

**Deliverable:** Production-ready application with complete documentation

**Phase 5: Pilot Deployment (Week 8)**
- Deploy to SharePoint test site
- Onboard 2-3 pilot creators (training session)
- Creators build real packages for their practice areas
- Onboard 10+ pilot users
- Monitor usage and collect feedback
- Provide hands-on support
- Document issues and feature requests

**Deliverable:** Validated MVP with real-world usage data and feedback

### 10.2 Milestones & Demos

- **Week 2 (End of Phase 1):** Demo survey designer and basic file loading
- **Week 4 (End of Phase 2):** Demo complete package creation workflow
- **Week 6 (End of Phase 3):** Demo complete end-to-end user flow
- **Week 7 (End of Phase 4):** Documentation review and final testing
- **Week 8 (Pilot Launch):** Deploy and begin monitoring

### 10.3 Resource Requirements

**Development Team:**
- 1 Full-stack Developer (TypeScript, React/Vue experience)
- Part-time UX Designer (weeks 4-7)
- Part-time Technical Writer (week 7)

**Subject Matter Experts:**
- 2-3 Legal professionals for requirements validation (2-3 hours/week)
- 1 IT/SharePoint administrator (setup and deployment support)

**Pilot Participants:**
- 2-3 Creator pilots (10-15 hours over 2 weeks)
- 10-15 User pilots (2-3 hours each over 2 weeks)

### 10.4 Risks & Mitigations

**Risk: Template syntax too complex for creators**
- Mitigation: Comprehensive documentation, examples, wizard guidance
- Mitigation: Consider simplified placeholder syntax in post-MVP

**Risk: Client-side performance inadequate for large templates**
- Mitigation: Test with real templates early (week 3-4)
- Mitigation: File size limits, performance optimization
- Fallback: Move to backend processing post-MVP if needed

**Risk: SharePoint CORS or file access issues**
- Mitigation: Test deployment environment early (week 2)
- Mitigation: Work with IT on SharePoint configuration
- Fallback: Alternative hosting (internal web server)

**Risk: Low creator adoption due to complexity**
- Mitigation: Hands-on training, clear documentation
- Mitigation: Start with motivated early adopters
- Mitigation: Wizard/checklist to guide process

**Risk: Draft storage limitations in localStorage**
- Mitigation: Test with real survey sizes (week 5)
- Mitigation: Implement storage monitoring and warnings
- Fallback: Reduce auto-save frequency, add manual save

---

## 11. Definitions & Glossary

- **Package:** Bundle of survey + one or more templates + mappings, presented to users as a single document generation option
- **Creator:** User who designs surveys, creates templates, and publishes packages
- **User:** User who fills out surveys and generates documents
- **Template:** DOCX file with placeholders that get replaced with survey answers
- **Placeholder:** Variable in template using syntax like `{fieldName}` that gets replaced
- **Survey:** Questionnaire built with Survey.js that collects data from users
- **Mapping:** Configuration linking survey fields to template placeholders
- **Draft:** In-progress survey answers saved in browser for later completion
- **Matter Name:** User-provided identifier used in generated document filenames
- **Transform:** Simple data manipulation applied during mapping (e.g., "All Caps")

---

## 12. Appendices

### Appendix A: Example Use Cases

**Use Case 1: Employment Package**
- **Creator:** HR/employment law attorney
- **Templates:** Employment agreement, offer letter
- **Survey:** Collects employee name, position, salary, start date, benefits, work location
- **Result:** User generates both documents from single survey

**Use Case 2: NDA**
- **Creator:** Corporate attorney
- **Templates:** Mutual NDA, one-way NDA
- **Survey:** Parties, effective date, term, governing law, special provisions
- **Conditionals:** Different clauses based on NDA type
- **Result:** User generates appropriate NDA in < 2 minutes

**Use Case 3: Demand Letter**
- **Creator:** Litigation attorney
- **Templates:** Demand letter
- **Survey:** Client info, opposing party, claim type, damages, deadline
- **Conditionals:** Different paragraphs based on claim type
- **Result:** Professional demand letter with consistent formatting

### Appendix B: Technical Research Notes

**Docxtemplater:**
- MIT licensed, actively maintained
- 50k+ weekly npm downloads
- Supports all required features (conditionals, loops, etc.)
- Works entirely client-side
- Can handle complex Word XML issues (text run splitting)
- Extensive documentation and examples available

**Survey.js:**
- Commercial license available for Creator component (free for internal use)
- Runtime library is MIT licensed
- Large community and active development
- Supports all required question types and logic
- Clean JSON format easy to version control
- TypeScript support

**Browser Storage:**
- localStorage limit: 5-10MB (varies by browser)
- Adequate for survey answers (typically < 100KB per draft)
- Synchronous API (simple to use)
- No expiration (persists until cleared)

**SharePoint Considerations:**
- Modern SharePoint supports static file hosting
- CORS should work for same-origin requests
- File access controlled by SharePoint permissions
- No special configuration required for MVP

### Appendix C: File Naming Conventions

**Surveys:**
- Format: `survey-[descriptive-name]-v[version].json`
- Example: `survey-employment-agreement-v1.json`

**Templates:**
- Format: `template-[descriptive-name]-v[version].docx`
- Example: `template-employment-agreement-v1.docx`

**Mappings:**
- Format: `mapping-[template-name]-[survey-name].json`
- Example: `mapping-employment-agreement-employment-survey.json`

**Packages:**
- Format: `package-[descriptive-name].json`
- Example: `package-employment-docs.json`

**Generated Documents:**
- Format: `[matter-name]-[template-name]-[YYYY-MM-DD].docx`
- Example: `SmithHiring2025-employment-agreement-2025-10-11.docx`

### Appendix D: Sample Package JSON (Complete)

```json
{
  "id": "employment-pkg-001",
  "name": "Employment Documents Package",
  "description": "Generate employment agreements and offer letters for new hires. Includes conditional clauses for different employment types.",
  "templates": [
    {
      "id": "employment-agreement",
      "name": "Employment Agreement",
      "file": "./templates/template-employment-agreement-v1.docx",
      "mapping": "./mappings/mapping-employment-agreement-employment-survey.json"
    },
    {
      "id": "offer-letter",
      "name": "Offer Letter",
      "file": "./templates/template-offer-letter-v1.docx",
      "mapping": "./mappings/mapping-offer-letter-employment-survey.json"
    }
  ],
  "survey": "./surveys/survey-employment-agreement-v1.json",
  "version": "1.0
  
