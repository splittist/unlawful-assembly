import { DocxParserService, type DocxParseResult } from '@/services/docxParser';
import { getTypeColor } from './uiUtils';

/**
 * Template Manager UI Component
 * Handles template documentation, DOCX upload, and template analysis
 */
export class TemplateManagerComponent {
  public render(container: HTMLElement): void {
    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Template Manager</h2>
          <p class="mt-1 text-sm text-gray-600">Comprehensive guide for creating DOCX templates with docxtemplater syntax</p>
        </div>
        <div class="p-6 space-y-8">
          
          <!-- DOCX Template Analysis Section (First - Not Collapsible) -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Analysis</span>
              Template Analysis & Validation
            </h3>
            <p class="text-gray-600 mb-4">Upload a DOCX template to analyze placeholders and validate syntax.</p>
            
            <!-- File Upload Area -->
            <div class="mb-6">
              <div id="docx-upload-area" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <div class="space-y-3">
                  <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-900">Click to upload DOCX template</p>
                    <p class="text-xs text-gray-500">or drag and drop your .docx file here</p>
                  </div>
                  <p class="text-xs text-gray-400">Maximum file size: 10MB</p>
                </div>
                <input type="file" id="docx-file-input" class="hidden" accept=".docx" />
              </div>
            </div>

            <!-- Analysis Results -->
            <div id="docx-analysis-results" class="hidden">
              <!-- File Info -->
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 class="font-medium text-blue-900 mb-2">📄 File Information</h4>
                <div id="file-info" class="text-sm text-blue-800 space-y-1">
                  <!-- Will be populated dynamically -->
                </div>
              </div>

              <!-- Placeholder Analysis -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 class="font-medium text-green-900 mb-2">✅ Found Placeholders</h4>
                  <div id="found-placeholders" class="space-y-2">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>
                
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 class="font-medium text-gray-900 mb-2">📊 Statistics</h4>
                  <div id="placeholder-stats" class="text-sm text-gray-700">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>
              </div>

              <!-- Validation Results -->
              <div id="validation-section" class="hidden">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 class="font-medium text-green-900 mb-2">✅ Valid Mappings</h4>
                    <div id="valid-placeholders" class="space-y-1 text-sm">
                      <!-- Will be populated dynamically -->
                    </div>
                  </div>
                  
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 class="font-medium text-red-900 mb-2">❌ Unmapped Fields</h4>
                    <div id="invalid-placeholders" class="space-y-1 text-sm">
                      <!-- Will be populated dynamically -->
                    </div>
                  </div>
                  
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 class="font-medium text-yellow-900 mb-2">⚠️ Missing Placeholders</h4>
                    <div id="missing-placeholders" class="space-y-1 text-sm">
                      <!-- Will be populated dynamically -->
                    </div>
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
                <button id="clear-analysis" class="text-sm text-gray-600 hover:text-gray-800">
                  Clear Analysis
                </button>
                <div class="space-x-2">
                  <button id="validate-with-survey" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium" disabled>
                    Validate with Current Survey
                  </button>
                  <button id="export-placeholders" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium" disabled>
                    Export Placeholder List
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Reference Section (Collapsible) -->
          <div class="border border-gray-200 rounded-lg">
            <button class="collapsible-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" data-target="quick-reference-content">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Reference</span>
                Quick Syntax Reference
              </h3>
              <svg class="collapsible-icon w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="quick-reference-content" class="collapsible-content hidden px-6 pb-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded border">
                  <h4 class="font-medium text-gray-900 mb-2">Basic</h4>
                  <code class="text-xs font-mono text-gray-700">{{field_name}}</code>
                </div>
                <div class="bg-gray-50 p-4 rounded border">
                  <h4 class="font-medium text-gray-900 mb-2">If Condition</h4>
                  <code class="text-xs font-mono text-gray-700">{{#field}}...{{/field}}</code>
                </div>
                <div class="bg-gray-50 p-4 rounded border">
                  <h4 class="font-medium text-gray-900 mb-2">Unless Condition</h4>
                  <code class="text-xs font-mono text-gray-700">{{^field}}...{{/field}}</code>
                </div>
                <div class="bg-gray-50 p-4 rounded border">
                  <h4 class="font-medium text-gray-900 mb-2">Loop Array</h4>
                  <code class="text-xs font-mono text-gray-700">{{#array}}{{.}}{{/array}}</code>
                </div>
                <div class="bg-gray-50 p-4 rounded border">
                  <h4 class="font-medium text-gray-900 mb-2">Loop Objects</h4>
                  <code class="text-xs font-mono text-gray-700">{{#objects}}{{prop}}{{/objects}}</code>
                </div>
                <div class="bg-gray-50 p-4 rounded border">
                  <h4 class="font-medium text-gray-900 mb-2">Index in Loop</h4>
                  <code class="text-xs font-mono text-gray-700">{{@index}}</code>
                </div>
              </div>
            </div>
          </div>

          <!-- Best Practices Section (Collapsible) -->
          <div class="border border-gray-200 rounded-lg">
            <button class="collapsible-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" data-target="best-practices-content">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Tips</span>
                Best Practices & Guidelines
              </h3>
              <svg class="collapsible-icon w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="best-practices-content" class="collapsible-content hidden px-6 pb-6">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 class="font-medium text-gray-900 mb-3">Field Naming:</h4>
                  <ul class="space-y-2 text-sm text-gray-600">
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      Use lowercase with underscores: <code>employee_name</code>
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      Be descriptive: <code>start_date</code> not <code>date1</code>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-500 mr-2">✗</span>
                      Avoid spaces: <code>employee name</code>
                    </li>
                    <li class="flex items-start">
                      <span class="text-red-500 mr-2">✗</span>
                      Avoid special characters: <code>employee-name</code>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 class="font-medium text-gray-900 mb-3">Template Structure:</h4>
                  <ul class="space-y-2 text-sm text-gray-600">
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      Test templates with sample data
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      Use consistent formatting
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      Include fallback text for optional fields
                    </li>
                    <li class="flex items-start">
                      <span class="text-green-500 mr-2">✓</span>
                      Save as .docx format (not .doc)
                    </li>
                  </ul>
                </div>
              </div>

              <div class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded">
                <h4 class="font-medium text-amber-800 mb-2">⚠️ Important Notes:</h4>
                <ul class="text-sm text-amber-700 space-y-1">
                  <li>• Always match survey field names exactly with template placeholders</li>
                  <li>• Test conditional logic with different survey response combinations</li>
                  <li>• Use the Mapping Interface to verify field connections before generating documents</li>
                  <li>• Keep template files under 10MB for optimal performance</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- Basic Placeholders Section (Collapsible) -->
          <div class="border border-gray-200 rounded-lg">
            <button class="collapsible-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" data-target="basic-placeholders-content">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Basic</span>
                Simple Field Replacement
              </h3>
              <svg class="collapsible-icon w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="basic-placeholders-content" class="collapsible-content hidden px-6 pb-6">
              <p class="text-gray-600 mb-4">Replace placeholders with survey response values using double curly braces.</p>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Syntax Examples:</h4>
                  <div class="space-y-3">
                    <div class="bg-gray-50 p-3 rounded border">
                      <div class="flex justify-between items-center">
                        <code class="text-sm font-mono">{{employee_name}}</code>
                        <button class="copy-btn text-xs text-blue-600 hover:text-blue-800" data-copy="{{employee_name}}">Copy</button>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">Basic text replacement</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                      <div class="flex justify-between items-center">
                        <code class="text-sm font-mono">{{start_date}}</code>
                        <button class="copy-btn text-xs text-blue-600 hover:text-blue-800" data-copy="{{start_date}}">Copy</button>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">Date field replacement</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded border">
                      <div class="flex justify-between items-center">
                        <code class="text-sm font-mono">{{department}}</code>
                        <button class="copy-btn text-xs text-blue-600 hover:text-blue-800" data-copy="{{department}}">Copy</button>
                      </div>
                      <p class="text-xs text-gray-600 mt-1">Selection field replacement</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Document Example:</h4>
                  <div class="bg-blue-50 p-4 rounded border border-blue-200">
                    <p class="text-sm font-mono leading-relaxed">
                      Dear {{employee_name}},<br><br>
                      Your employment with {{company_name}} will begin on {{start_date}}. 
                      You will be working in the {{department}} department reporting to {{manager_name}}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Conditional Logic Section (Collapsible) -->
          <div class="border border-gray-200 rounded-lg">
            <button class="collapsible-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" data-target="conditional-content">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Advanced</span>
                Conditional Content
              </h3>
              <svg class="collapsible-icon w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="conditional-content" class="collapsible-content hidden px-6 pb-6">
              <p class="text-gray-600 mb-4">Show or hide content based on survey responses using conditional statements.</p>
              
              <div class="space-y-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Basic Conditions:</h4>
                  <div class="bg-gray-50 p-4 rounded border">
                    <div class="flex justify-between items-start mb-2">
                      <code class="text-sm font-mono">{{#has_benefits}}Benefits package information...{{/has_benefits}}</code>
                      <button class="copy-btn text-xs text-blue-600 hover:text-blue-800" data-copy="{{#has_benefits}}Benefits package information...{{/has_benefits}}">Copy</button>
                    </div>
                    <p class="text-xs text-gray-600">Shows content only if has_benefits is true or non-empty</p>
                  </div>
                </div>
                
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Inverted Conditions:</h4>
                  <div class="bg-gray-50 p-4 rounded border">
                    <div class="flex justify-between items-start mb-2">
                      <code class="text-sm font-mono">{{^is_remote}}Office location: {{office_address}}{{/is_remote}}</code>
                      <button class="copy-btn text-xs text-blue-600 hover:text-blue-800" data-copy="{{^is_remote}}Office location: {{office_address}}{{/is_remote}}">Copy</button>
                    </div>
                    <p class="text-xs text-gray-600">Shows content only if is_remote is false or empty</p>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Complex Example:</h4>
                  <div class="bg-blue-50 p-4 rounded border border-blue-200">
                    <pre class="text-sm font-mono leading-relaxed">${'{{'}#is_full_time${'}}'}
Full-time employment benefits include:
• Health insurance
• ${'{{'}#has_dental${'}}'}Dental coverage${'{{'}/has_dental${'}}'}
• ${'{{'}vacation_days${'}}'}  vacation days per year
${'{{'}/is_full_time${'}}'}

${'{{'}^is_full_time${'}}'}
Part-time employment terms:
• Hourly rate: $${'{{'}hourly_rate${'}}'}
• Scheduled hours: ${'{{'}weekly_hours${'}}'}  per week
${'{{'}/is_full_time${'}}'}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loops Section (Collapsible) -->
          <div class="border border-gray-200 rounded-lg">
            <button class="collapsible-header w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" data-target="loops-content">
              <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Expert</span>
                Loops and Repeating Content
              </h3>
              <svg class="collapsible-icon w-5 h-5 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="loops-content" class="collapsible-content hidden px-6 pb-6">
              <p class="text-gray-600 mb-4">Repeat content blocks for array data or multiple selections.</p>
              
              <div class="space-y-4">
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Simple Loop:</h4>
                  <div class="bg-gray-50 p-4 rounded border">
                    <div class="flex justify-between items-start mb-2">
                      <code class="text-sm font-mono">{{#responsibilities}}• {{.}}{{/responsibilities}}</code>
                      <button class="copy-btn text-xs text-blue-600 hover:text-blue-800" data-copy="{{#responsibilities}}• {{.}}{{/responsibilities}}">Copy</button>
                    </div>
                    <p class="text-xs text-gray-600">Loops through array items, {{.}} refers to current item</p>
                  </div>
                </div>
                
                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Object Loop:</h4>
                  <div class="bg-gray-50 p-4 rounded border">
                    <div class="flex justify-between items-start mb-2">
                      <code class="text-sm font-mono">{{#team_members}}{{name}} - {{title}}{{/team_members}}</code>
                      <button class="copy-btn text-xs text-blue-600 hover:text-blue-800" data-copy="{{#team_members}}{{name}} - {{title}}{{/team_members}}">Copy</button>
                    </div>
                    <p class="text-xs text-gray-600">Loops through objects, access properties by name</p>
                  </div>
                </div>

                <div>
                  <h4 class="font-medium text-gray-900 mb-2">Complex Example:</h4>
                  <div class="bg-blue-50 p-4 rounded border border-blue-200">
                    <pre class="text-sm font-mono leading-relaxed">Job Responsibilities:
${'{{'}#job_duties${'}}'}
${'{{'}@index${'}}'}.  ${'{{'}title${'}}'}
   Description: ${'{{'}description${'}}'}
   ${'{{'}#required_skills${'}}'}• ${'{{'}.${'}}'}${'{{'}/required_skills${'}}'}
${'{{'}/job_duties${'}}'}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    // Set up copy-to-clipboard functionality
    this.setupCopyButtons(container);
    // Set up DOCX upload functionality
    this.setupDocxUpload(container);
    // Set up collapsible sections
    this.setupCollapsibleSections(container);
  }

  private setupCollapsibleSections(container: HTMLElement): void {
    container.querySelectorAll('.collapsible-header').forEach(header => {
      header.addEventListener('click', () => {
        const targetId = header.getAttribute('data-target');
        if (!targetId) return;
        
        const content = container.querySelector(`#${targetId}`);
        const icon = header.querySelector('.collapsible-icon');
        
        if (content && icon) {
          content.classList.toggle('hidden');
          icon.classList.toggle('rotate-180');
        }
      });
    });
  }

  private setupCopyButtons(container: HTMLElement): void {
    container.querySelectorAll('.copy-btn').forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        const copyText = (e.target as HTMLElement).dataset.copy;
        if (copyText) {
          try {
            await navigator.clipboard.writeText(copyText);
            
            // Visual feedback
            const originalText = (e.target as HTMLElement).textContent;
            (e.target as HTMLElement).textContent = 'Copied!';
            (e.target as HTMLElement).classList.add('text-green-600');
            (e.target as HTMLElement).classList.remove('text-blue-600');
            
            setTimeout(() => {
              (e.target as HTMLElement).textContent = originalText;
              (e.target as HTMLElement).classList.remove('text-green-600');
              (e.target as HTMLElement).classList.add('text-blue-600');
            }, 1500);
            
          } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = copyText;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            // Visual feedback for fallback
            (e.target as HTMLElement).textContent = 'Copied!';
            setTimeout(() => {
              (e.target as HTMLElement).textContent = 'Copy';
            }, 1500);
          }
        }
      });
    });
  }

  private setupDocxUpload(container: HTMLElement): void {
    const uploadArea = container.querySelector('#docx-upload-area') as HTMLElement;
    const fileInput = container.querySelector('#docx-file-input') as HTMLInputElement;
    const resultsArea = container.querySelector('#docx-analysis-results') as HTMLElement;
    const clearBtn = container.querySelector('#clear-analysis') as HTMLElement;
    const validateBtn = container.querySelector('#validate-with-survey') as HTMLButtonElement;
    const exportBtn = container.querySelector('#export-placeholders') as HTMLButtonElement;

    let currentParseResult: DocxParseResult | null = null;

    // Handle file input change
    const handleFileUpload = async (file: File) => {
      if (!file) return;

      try {
        // Show loading state
        uploadArea.innerHTML = `
          <div class="space-y-3">
            <div class="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
            <p class="text-sm font-medium text-gray-900">Analyzing DOCX file...</p>
            <p class="text-xs text-gray-500">Extracting placeholders and document structure</p>
          </div>
        `;

        // Parse the DOCX file
        const parseResult = await DocxParserService.parseDocx(file);
        currentParseResult = parseResult;

        // Reset upload area
        this.resetUploadArea(uploadArea, fileInput);

        // Show results
        if (parseResult.parseErrors.length > 0) {
          this.showParseErrors(resultsArea, parseResult);
        } else {
          this.showParseResults(resultsArea, parseResult);
          validateBtn.disabled = false;
          exportBtn.disabled = false;
        }

        resultsArea.classList.remove('hidden');

      } catch (error) {
        console.error('Error uploading file:', error);
        this.resetUploadArea(uploadArea, fileInput);
        this.showError(resultsArea, 'Failed to analyze DOCX file. Please try again.');
      }
    };

    // Upload area click handler
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    });

    // Drag and drop handlers
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('border-blue-400', 'bg-blue-50');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
      
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        handleFileUpload(files[0]);
      }
    });

    // Clear analysis handler
    clearBtn.addEventListener('click', () => {
      currentParseResult = null;
      resultsArea.classList.add('hidden');
      validateBtn.disabled = true;
      exportBtn.disabled = true;
      this.resetUploadArea(uploadArea, fileInput);
    });

    // Validate with survey handler
    validateBtn.addEventListener('click', () => {
      if (currentParseResult) {
        this.validateWithSurvey(container, currentParseResult);
      }
    });

    // Export placeholders handler
    exportBtn.addEventListener('click', () => {
      if (currentParseResult) {
        this.exportPlaceholders(currentParseResult);
      }
    });
  }

  private resetUploadArea(uploadArea: HTMLElement, fileInput: HTMLInputElement): void {
    uploadArea.innerHTML = `
      <div class="space-y-3">
        <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium text-gray-900">Click to upload DOCX template</p>
          <p class="text-xs text-gray-500">or drag and drop your .docx file here</p>
        </div>
        <p class="text-xs text-gray-400">Maximum file size: 10MB</p>
      </div>
    `;
    fileInput.value = '';
  }

  private showParseResults(resultsArea: HTMLElement, parseResult: DocxParseResult): void {
    // File info
    const fileInfo = resultsArea.querySelector('#file-info')!;
    fileInfo.innerHTML = `
      <div>📁 <strong>File:</strong> ${parseResult.fileName}</div>
      <div>📏 <strong>Size:</strong> ${(parseResult.fileSize / 1024).toFixed(1)} KB</div>
      <div>🔍 <strong>Placeholders Found:</strong> ${parseResult.placeholders.length}</div>
    `;

    // Found placeholders
    const foundPlaceholders = resultsArea.querySelector('#found-placeholders')!;
    if (parseResult.placeholders.length === 0) {
      foundPlaceholders.innerHTML = '<p class="text-sm text-gray-600">No placeholders found in this document.</p>';
    } else {
      const placeholderList = parseResult.placeholders.map(p => `
        <div class="bg-white border border-gray-200 rounded p-2">
          <div class="flex justify-between items-start">
            <span class="font-mono text-sm text-gray-900">${p.fullMatch}</span>
            <span class="text-xs px-2 py-1 rounded ${getTypeColor(p.type)}">${p.type}</span>
          </div>
          ${p.context ? `<p class="text-xs text-gray-600 mt-1">${p.context}</p>` : ''}
        </div>
      `).join('');
      foundPlaceholders.innerHTML = placeholderList;
    }

    // Statistics
    const stats = DocxParserService.getPlaceholderStats(parseResult.placeholders);
    const placeholderStats = resultsArea.querySelector('#placeholder-stats')!;
    placeholderStats.innerHTML = `
      <div class="space-y-1">
        <div><strong>Total:</strong> ${stats.total}</div>
        <div><strong>Simple:</strong> ${stats.byType.simple}</div>
        <div><strong>Conditional:</strong> ${stats.byType.conditional}</div>
        <div><strong>Loops:</strong> ${stats.byType.loop}</div>
        <div><strong>Required:</strong> ${stats.required}</div>
        <div><strong>Optional:</strong> ${stats.optional}</div>
      </div>
    `;
  }

  private showParseErrors(resultsArea: HTMLElement, parseResult: DocxParseResult): void {
    resultsArea.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 class="font-medium text-red-900 mb-2">❌ Analysis Failed</h4>
        <div class="space-y-1">
          ${parseResult.parseErrors.map(error => `<p class="text-sm text-red-800">• ${error}</p>`).join('')}
        </div>
      </div>
    `;
  }

  private showError(resultsArea: HTMLElement, message: string): void {
    resultsArea.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 class="font-medium text-red-900 mb-2">❌ Error</h4>
        <p class="text-sm text-red-800">${message}</p>
      </div>
    `;
    resultsArea.classList.remove('hidden');
  }

  private validateWithSurvey(container: HTMLElement, parseResult: DocxParseResult): void {
    // This would get survey fields from the Survey Designer tab
    // For now, we'll use mock survey fields
    const mockSurveyFields = ['employee_name', 'start_date', 'department', 'manager_name', 'company_name'];
    
    const validation = DocxParserService.validatePlaceholders(parseResult.placeholders, mockSurveyFields);
    
    const validationSection = container.querySelector('#validation-section')!;
    const validPlaceholders = container.querySelector('#valid-placeholders')!;
    const invalidPlaceholders = container.querySelector('#invalid-placeholders')!;
    const missingPlaceholders = container.querySelector('#missing-placeholders')!;

    // Show validation results
    validPlaceholders.innerHTML = validation.valid.length > 0 
      ? validation.valid.map(p => `<div class="text-green-700">✅ ${p.name}</div>`).join('')
      : '<div class="text-gray-600">No valid mappings found</div>';

    invalidPlaceholders.innerHTML = validation.invalid.length > 0
      ? validation.invalid.map(p => `<div class="text-red-700">❌ ${p.name}</div>`).join('')
      : '<div class="text-gray-600">All placeholders are mapped</div>';

    missingPlaceholders.innerHTML = validation.missing.length > 0
      ? validation.missing.map(field => `<div class="text-yellow-700">⚠️ ${field}</div>`).join('')
      : '<div class="text-gray-600">All survey fields have placeholders</div>';

    validationSection.classList.remove('hidden');
  }

  private exportPlaceholders(parseResult: DocxParseResult): void {
    const exportData = {
      fileName: parseResult.fileName,
      analyzedAt: new Date().toISOString(),
      statistics: DocxParserService.getPlaceholderStats(parseResult.placeholders),
      placeholders: parseResult.placeholders.map(p => ({
        name: p.name,
        type: p.type,
        syntax: p.fullMatch,
        context: p.context,
        required: p.isRequired
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `placeholders-${parseResult.fileName.replace('.docx', '')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

}
