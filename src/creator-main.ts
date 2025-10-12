import './style.css';
import { DomUtils } from '@/utils/common';
import { DocxParserService, type DocxParseResult } from '@/services/docxParser';
import { FieldMappingService, type FieldMapping } from '@/services/fieldMapping';
import { PackageService, type PackageContent } from '@/services/packageService';

/**
 * Creator interface main entry point
 * This will be the Survey.js Creator interface for designing questionnaires
 */
class CreatorApp {
  private container: HTMLElement;
  private mappingService: FieldMappingService;
  private currentPackage: PackageContent | null = null;

  constructor() {
    this.container = document.querySelector<HTMLDivElement>('#creator-app')!;
    this.mappingService = new FieldMappingService();
    this.init();
  }

  private init(): void {
    this.renderLayout();
    this.setupNavigation();
  }

  private renderLayout(): void {
    this.container.innerHTML = `
      <div class="min-h-screen bg-gray-50">
        <!-- Header -->
        <header class="bg-white shadow-sm border-b border-gray-200">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center">
                <h1 class="text-2xl font-bold text-gray-900">Document Assembly</h1>
                <span class="ml-3 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Creator</span>
              </div>
              <nav class="flex space-x-4">
                <a href="../index.html" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">User Interface</a>
              </nav>
            </div>
          </div>
        </header>

        <!-- Navigation Tabs -->
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button id="survey-tab" class="tab-button active" data-tab="survey">
                Survey Designer
              </button>
              <button id="template-tab" class="tab-button" data-tab="template">
                Template Manager
              </button>
              <button id="mapping-tab" class="tab-button" data-tab="mapping">
                Mapping Interface
              </button>
              <button id="package-tab" class="tab-button" data-tab="package">
                Package Definition
              </button>
            </nav>
          </div>
        </div>

        <!-- Content Area -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div id="content-area">
            <!-- Tab content will be rendered here -->
          </div>
        </main>
      </div>
    `;

    // Add tab styling
    const style = document.createElement('style');
    style.textContent = `
      .tab-button {
        @apply border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm;
      }
      .tab-button.active {
        @apply border-blue-500 text-blue-600;
      }
    `;
    document.head.appendChild(style);
  }

  private setupNavigation(): void {
    const tabs = this.container.querySelectorAll('.tab-button');
    const contentArea = this.container.querySelector('#content-area')!;

    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const button = e.target as HTMLButtonElement;
        const tabName = button.dataset.tab;

        // Update active tab
        tabs.forEach((t) => t.classList.remove('active'));
        button.classList.add('active');

        // Render tab content
        this.renderTabContent(tabName!, contentArea as HTMLElement);
      });
    });

    // Initialize with survey tab
    this.renderTabContent('survey', contentArea as HTMLElement);
  }

  private renderTabContent(tabName: string, container: HTMLElement): void {
    switch (tabName) {
      case 'survey':
        this.renderSurveyDesigner(container);
        break;
      case 'template':
        this.renderTemplateManager(container);
        break;
      case 'mapping':
        this.renderMappingInterface(container);
        break;
      case 'package':
        this.renderPackageDefinition(container);
        break;
      default:
        container.innerHTML = '<p>Tab not implemented yet</p>';
    }
  }

  private renderSurveyDesigner(container: HTMLElement): void {
    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Survey Designer</h2>
          <p class="mt-1 text-sm text-gray-600">Create and edit questionnaires using Survey.js</p>
        </div>
        <div class="p-6">
          <div class="mb-6 flex space-x-3">
            <button id="new-survey-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              New Survey
            </button>
            <label class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
              Load Survey
              <input type="file" id="load-survey-input" class="hidden" accept=".json">
            </label>
          </div>
          <div id="survey-creator-container" class="min-h-96 border border-gray-200 rounded-lg">
            <div class="text-center py-12 text-gray-500">
              <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 class="mt-2 text-sm font-medium text-gray-900">No Survey Loaded</h3>
              <p class="mt-1 text-sm text-gray-500">Create a new survey or load an existing one to get started</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button id="preview-survey-btn" class="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium" disabled>
              Preview Survey
            </button>
            <button id="download-survey-btn" class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium" disabled>
              Download Survey JSON
            </button>
          </div>
        </div>
      </div>
    `;

    // Set up event handlers
    this.setupSurveyDesignerEvents(container);
  }

  private setupSurveyDesignerEvents(container: HTMLElement): void {
    const newSurveyBtn = container.querySelector('#new-survey-btn');
    const loadSurveyInput = container.querySelector('#load-survey-input') as HTMLInputElement;
    const previewBtn = container.querySelector('#preview-survey-btn');
    const downloadBtn = container.querySelector('#download-survey-btn');
    const creatorContainer = container.querySelector('#survey-creator-container')!;

    newSurveyBtn?.addEventListener('click', () => {
      this.createNewSurvey(creatorContainer as HTMLElement);
    });

    loadSurveyInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.loadSurveyFile(file, creatorContainer as HTMLElement);
      }
    });

    // Add a button to test loading the sample survey
    const loadSampleBtn = DomUtils.createElement('button', 
      'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium ml-3',
      'Load Sample Survey'
    );
    loadSampleBtn.addEventListener('click', () => {
      this.loadSampleSurvey(creatorContainer as HTMLElement);
    });
    container.querySelector('.mb-6')?.appendChild(loadSampleBtn);

    previewBtn?.addEventListener('click', () => {
      this.previewSurvey();
    });

    downloadBtn?.addEventListener('click', () => {
      this.downloadSurvey();
    });
  }

  private createNewSurvey(container: HTMLElement): void {
    // For Phase 1, create a simple form builder
    const sampleSurvey = {
      title: 'New Survey',
      description: 'Created with Document Assembly Tool',
      pages: [
        {
          name: 'page1',
          elements: [
            {
              type: 'text',
              name: 'sample_field',
              title: 'Sample Text Field',
              isRequired: true
            }
          ]
        }
      ]
    };

    this.displaySurveyPreview(sampleSurvey, container);
    this.enableSurveyActions();
  }

  private async loadSurveyFile(file: File, container: HTMLElement): Promise<void> {
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      const survey = JSON.parse(content);
      this.displaySurveyPreview(survey, container);
      this.enableSurveyActions();
    } catch (error) {
      DomUtils.setErrorState(container, {
        hasError: true,
        message: 'Failed to load survey file',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private displaySurveyPreview(survey: any, container: HTMLElement): void {
    container.innerHTML = `
      <div class="p-6">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 class="font-medium text-blue-900">${survey.title}</h3>
          <p class="text-sm text-blue-700 mt-1">${survey.description || 'No description'}</p>
        </div>
        <div class="space-y-4">
          <h4 class="font-medium text-gray-900">Survey Structure:</h4>
          ${survey.pages?.map((page: any, pageIndex: number) => `
            <div class="border border-gray-200 rounded p-4">
              <h5 class="font-medium text-gray-700">Page ${pageIndex + 1}: ${page.name}</h5>
              <div class="mt-2 space-y-2">
                ${page.elements?.map((element: any) => `
                  <div class="bg-gray-50 p-2 rounded text-sm">
                    <span class="font-medium">${element.name}</span> 
                    <span class="text-gray-500">(${element.type})</span>
                    ${element.title ? `- ${element.title}` : ''}
                  </div>
                `).join('') || '<div class="text-gray-500 text-sm">No questions</div>'}
              </div>
            </div>
          `).join('') || '<div class="text-gray-500">No pages found</div>'}
        </div>
        <div class="mt-4 p-4 bg-gray-50 rounded">
          <p class="text-sm text-gray-600">
            <strong>Note:</strong> Full Survey.js Creator integration will be available in Phase 2. 
            Currently showing survey structure preview.
          </p>
        </div>
      </div>
    `;
  }

  private enableSurveyActions(): void {
    const previewBtn = this.container.querySelector('#preview-survey-btn') as HTMLButtonElement;
    const downloadBtn = this.container.querySelector('#download-survey-btn') as HTMLButtonElement;
    
    if (previewBtn) {
      previewBtn.disabled = false;
      previewBtn.classList.remove('bg-gray-300', 'text-gray-700');
      previewBtn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-700');
    }
    
    if (downloadBtn) {
      downloadBtn.disabled = false;
    }
  }

  private previewSurvey(): void {
    alert('Survey preview will be available in Phase 2 with full Survey.js integration');
  }

  private downloadSurvey(): void {
    alert('Survey download will be available in Phase 2 with full Survey.js integration');
  }

  private renderTemplateManager(container: HTMLElement): void {
    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Template Manager</h2>
          <p class="mt-1 text-sm text-gray-600">Comprehensive guide for creating DOCX templates with docxtemplater syntax</p>
        </div>
        <div class="p-6 space-y-8">
          
          <!-- Basic Placeholders Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Basic</span>
              Simple Field Replacement
            </h3>
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

          <!-- Conditional Logic Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Advanced</span>
              Conditional Content
            </h3>
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
                  <pre class="text-sm font-mono leading-relaxed">\{\{#is_full_time\}\}
Full-time employment benefits include:
• Health insurance
• \{\{#has_dental\}\}Dental coverage\{\{/has_dental\}\}
• \{\{vacation_days\}\} vacation days per year
\{\{/is_full_time\}\}

\{\{^is_full_time\}\}
Part-time employment terms:
• Hourly rate: $\{\{hourly_rate\}\}
• Scheduled hours: \{\{weekly_hours\}\} per week
\{\{/is_full_time\}\}</pre>
                </div>
              </div>
            </div>
          </div>

          <!-- Loops Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Expert</span>
              Loops and Repeating Content
            </h3>
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
\{\{#job_duties\}\}
\{\{@index\}\}. \{\{title\}\}
   Description: \{\{description\}\}
   \{\{#required_skills\}\}• \{\{.\}\}\{\{/required_skills\}\}
\{\{/job_duties\}\}</pre>
                </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Best Practices Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Tips</span>
              Best Practices & Guidelines
            </h3>
            
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

          <!-- Quick Reference Section -->
          <div class="border border-gray-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <span class="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">Reference</span>
              Quick Syntax Reference
            </h3>
            
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

          <!-- DOCX Template Analysis Section -->
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

        </div>
      </div>
    `;

    // Set up copy-to-clipboard functionality
    this.setupCopyButtons(container);
    // Set up DOCX upload functionality
    this.setupDocxUpload(container);
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
            <span class="text-xs px-2 py-1 rounded ${this.getTypeColor(p.type)}">${p.type}</span>
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

  private getTypeColor(type: string): string {
    switch (type) {
      case 'simple': return 'bg-blue-100 text-blue-800';
      case 'conditional': return 'bg-yellow-100 text-yellow-800';
      case 'loop': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  private renderMappingInterface(container: HTMLElement): void {
    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Mapping Interface</h2>
          <p class="mt-1 text-sm text-gray-600">Connect survey questions to template placeholders for document generation</p>
        </div>
        
        <div class="p-6 space-y-6">
          
          <!-- Status & Actions Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div>
              <div class="flex items-center space-x-4">
                <div id="mapping-status" class="flex items-center space-x-2">
                  <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span class="text-sm font-medium text-gray-600">No data loaded</span>
                </div>
                <div id="mapping-stats" class="text-xs text-gray-500">
                  <!-- Will be populated dynamically -->
                </div>
              </div>
            </div>
            <div class="flex space-x-2">
              <button id="load-data-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                📊 Load Survey & Template Data
              </button>
              <button id="auto-map-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium" disabled>
                🤖 Auto-Map Fields
              </button>
              <button id="clear-mappings-btn" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-medium" disabled>
                🗑️ Clear All
              </button>
            </div>
          </div>

          <!-- Main Content Area -->
          <div id="mapping-content">
            
            <!-- No Data State -->
            <div id="no-data-state" class="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
              <div class="space-y-4">
                <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 mb-2">Ready to Create Mappings</h3>
                  <p class="text-gray-600 mb-4">To start mapping fields, you need:</p>
                  <ul class="text-left text-sm text-gray-600 space-y-2 max-w-md mx-auto">
                    <li class="flex items-center"><span class="text-blue-600 mr-2">1.</span> A survey with questions (from Survey Designer tab)</li>
                    <li class="flex items-center"><span class="text-blue-600 mr-2">2.</span> A DOCX template with placeholders (from Template Manager tab)</li>
                  </ul>
                  <p class="text-xs text-gray-500 mt-4">Click "Load Survey & Template Data" to begin</p>
                </div>
              </div>
            </div>

            <!-- Mapping Interface -->
            <div id="mapping-interface" class="hidden">
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <!-- Survey Fields Panel -->
                <div class="lg:col-span-4">
                  <div class="border border-gray-200 rounded-lg">
                    <div class="bg-blue-50 px-4 py-3 border-b border-gray-200">
                      <h3 class="font-medium text-blue-900 flex items-center">
                        <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">Survey</span>
                        Question Fields
                      </h3>
                      <p class="text-sm text-blue-700 mt-1">Drag fields to create mappings</p>
                    </div>
                    <div id="survey-fields-list" class="p-4 space-y-2 max-h-96 overflow-y-auto">
                      <!-- Will be populated dynamically -->
                    </div>
                  </div>
                </div>

                <!-- Mapping Connections -->
                <div class="lg:col-span-4">
                  <div class="border border-gray-200 rounded-lg">
                    <div class="bg-green-50 px-4 py-3 border-b border-gray-200">
                      <h3 class="font-medium text-green-900 flex items-center">
                        <span class="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">Active</span>
                        Field Mappings
                      </h3>
                      <p class="text-sm text-green-700 mt-1">Current connections</p>
                    </div>
                    <div id="mappings-list" class="p-4 space-y-2 max-h-96 overflow-y-auto">
                      <div class="text-center text-gray-500 py-8">
                        <p class="text-sm">No mappings created yet</p>
                        <p class="text-xs mt-1">Drag survey fields to template placeholders</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Template Placeholders Panel -->
                <div class="lg:col-span-4">
                  <div class="border border-gray-200 rounded-lg">
                    <div class="bg-purple-50 px-4 py-3 border-b border-gray-200">
                      <h3 class="font-medium text-purple-900 flex items-center">
                        <span class="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">Template</span>
                        Placeholders
                      </h3>
                      <p class="text-sm text-purple-700 mt-1">Drop zones for mapping</p>
                    </div>
                    <div id="placeholders-list" class="p-4 space-y-2 max-h-96 overflow-y-auto">
                      <!-- Will be populated dynamically -->
                    </div>
                  </div>
                </div>

              </div>

              <!-- Auto-Suggestions Panel -->
              <div id="suggestions-panel" class="mt-6 hidden">
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 class="font-medium text-yellow-900 mb-3 flex items-center">
                    <span class="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-2">AI</span>
                    Suggested Mappings
                  </h4>
                  <div id="suggestions-list" class="space-y-2">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>
              </div>

              <!-- Validation Results -->
              <div id="validation-panel" class="mt-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 class="font-medium text-green-900 mb-2">✅ Valid Mappings</h4>
                    <div id="valid-mappings-count" class="text-2xl font-bold text-green-700">0</div>
                    <p class="text-sm text-green-600">Ready for document generation</p>
                  </div>
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 class="font-medium text-yellow-900 mb-2">⚠️ Warnings</h4>
                    <div id="warnings-count" class="text-2xl font-bold text-yellow-700">0</div>
                    <p class="text-sm text-yellow-600">May need attention</p>
                  </div>
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 class="font-medium text-red-900 mb-2">❌ Errors</h4>
                    <div id="errors-count" class="text-2xl font-bold text-red-700">0</div>
                    <p class="text-sm text-red-600">Must be fixed</p>
                  </div>
                </div>
                
                <!-- Detailed Issues -->
                <div id="validation-details" class="mt-4 hidden">
                  <div class="space-y-2">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>
              </div>

              <!-- Export/Import Actions -->
              <div class="mt-6 flex justify-between items-center pt-4 border-t border-gray-200">
                <div class="flex space-x-2">
                  <button id="import-mappings-btn" class="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 border border-blue-300 rounded">
                    📥 Import Mappings
                  </button>
                  <input type="file" id="mappings-file-input" class="hidden" accept=".json" />
                </div>
                <div class="flex space-x-2">
                  <button id="export-mappings-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium" disabled>
                    💾 Export Mappings
                  </button>
                  <button id="validate-mappings-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium" disabled>
                    ✅ Validate All
                  </button>
                </div>
              </div>

            </div>
            
          </div>
        </div>
      </div>
    `;

    // Set up mapping interface functionality
    this.setupMappingInterface(container);
  }

  private setupMappingInterface(container: HTMLElement): void {
    const loadDataBtn = container.querySelector('#load-data-btn') as HTMLButtonElement;
    const autoMapBtn = container.querySelector('#auto-map-btn') as HTMLButtonElement;
    const clearBtn = container.querySelector('#clear-mappings-btn') as HTMLButtonElement;
    const exportBtn = container.querySelector('#export-mappings-btn') as HTMLButtonElement;
    const validateBtn = container.querySelector('#validate-mappings-btn') as HTMLButtonElement;
    const importBtn = container.querySelector('#import-mappings-btn') as HTMLButtonElement;
    const fileInput = container.querySelector('#mappings-file-input') as HTMLInputElement;

    // Load survey and template data
    loadDataBtn.addEventListener('click', () => {
      this.loadMappingData(container);
    });

    // Auto-map fields with suggestions
    autoMapBtn.addEventListener('click', () => {
      const appliedCount = this.mappingService.applySuggestions(0.7);
      this.refreshMappingInterface(container);
      
      if (appliedCount > 0) {
        this.showNotification(`Applied ${appliedCount} automatic mappings`, 'success');
      } else {
        this.showNotification('No high-confidence mappings found', 'warning');
      }
    });

    // Clear all mappings
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all mappings?')) {
        this.mappingService.clearMappings();
        this.refreshMappingInterface(container);
        this.showNotification('All mappings cleared', 'info');
      }
    });

    // Export mappings
    exportBtn.addEventListener('click', () => {
      this.exportMappings();
    });

    // Validate mappings
    validateBtn.addEventListener('click', () => {
      this.validateMappings(container);
    });

    // Import mappings
    importBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.importMappings(file, container);
      }
    });
  }

  private async loadMappingData(container: HTMLElement): Promise<void> {
    try {
      // Get survey fields from Survey Creator (mock for now)
      const mockSurveyFields = [
        'employee_name', 'company_name', 'job_title', 'start_date', 
        'department', 'manager_name', 'employment_type', 'annual_salary', 
        'pay_frequency', 'hourly_rate', 'weekly_hours', 'has_benefits',
        'has_health_insurance', 'response_deadline', 'hr_manager_name',
        'office_address', 'working_hours', 'is_remote', 'is_salary_based'
      ];

      // Get template placeholders (this would come from uploaded DOCX analysis)
      const mockPlaceholders = [
        { name: 'employee_name', type: 'simple' as const, isRequired: true, fullMatch: '{{employee_name}}', context: 'Dear {{employee_name}}' },
        { name: 'company_name', type: 'simple' as const, isRequired: true, fullMatch: '{{company_name}}', context: 'employment with {{company_name}} in' },
        { name: 'job_title', type: 'simple' as const, isRequired: true, fullMatch: '{{job_title}}', context: 'position of {{job_title}}' },
        { name: 'start_date', type: 'simple' as const, isRequired: true, fullMatch: '{{start_date}}', context: 'Start Date: {{start_date}}' },
        { name: 'department', type: 'simple' as const, isRequired: true, fullMatch: '{{department}}', context: 'Department: {{department}}' },
        { name: 'is_salary_based', type: 'conditional' as const, isRequired: false, fullMatch: '{{#is_salary_based}}', context: 'conditional salary section' },
        { name: 'annual_salary', type: 'simple' as const, isRequired: false, fullMatch: '{{annual_salary}}', context: 'Annual Salary: ${{annual_salary}}' },
        { name: 'hourly_rate', type: 'simple' as const, isRequired: false, fullMatch: '{{hourly_rate}}', context: 'Hourly Rate: ${{hourly_rate}}' },
        { name: 'has_benefits', type: 'conditional' as const, isRequired: false, fullMatch: '{{#has_benefits}}', context: 'benefits section' },
        { name: 'benefit_list', type: 'loop' as const, isRequired: false, fullMatch: '{{#benefit_list}}', context: 'list of benefits' }
      ];

      // Initialize mapping service
      this.mappingService.initialize(mockSurveyFields, mockPlaceholders);

      // Update UI
      this.showMappingInterface(container);
      this.populateMappingData(container, mockSurveyFields, mockPlaceholders);
      this.updateMappingStatus(container, true);
      
      // Enable buttons
      const autoMapBtn = container.querySelector('#auto-map-btn') as HTMLButtonElement;
      const clearBtn = container.querySelector('#clear-mappings-btn') as HTMLButtonElement;
      const exportBtn = container.querySelector('#export-mappings-btn') as HTMLButtonElement;
      const validateBtn = container.querySelector('#validate-mappings-btn') as HTMLButtonElement;
      
      autoMapBtn.disabled = false;
      clearBtn.disabled = false;
      exportBtn.disabled = false;
      validateBtn.disabled = false;

      this.showNotification('Survey and template data loaded successfully', 'success');

    } catch (error) {
      console.error('Error loading mapping data:', error);
      this.showNotification('Failed to load mapping data', 'error');
    }
  }

  private showMappingInterface(container: HTMLElement): void {
    const noDataState = container.querySelector('#no-data-state')!;
    const mappingInterface = container.querySelector('#mapping-interface')!;
    
    noDataState.classList.add('hidden');
    mappingInterface.classList.remove('hidden');
  }

  private populateMappingData(container: HTMLElement, surveyFields: string[], placeholders: any[]): void {
    const surveyFieldsList = container.querySelector('#survey-fields-list')!;
    const placeholdersList = container.querySelector('#placeholders-list')!;

    // Populate survey fields
    surveyFieldsList.innerHTML = surveyFields.map(field => `
      <div class="survey-field-item bg-blue-50 border border-blue-200 rounded p-3 cursor-move hover:bg-blue-100 transition-colors" 
           draggable="true" 
           data-field="${field}">
        <div class="flex justify-between items-center">
          <span class="font-medium text-blue-900">${field}</span>
          <span class="text-xs text-blue-600">Question</span>
        </div>
        <p class="text-xs text-blue-700 mt-1">Survey response field</p>
      </div>
    `).join('');

    // Populate placeholders
    placeholdersList.innerHTML = placeholders.map(placeholder => `
      <div class="placeholder-item bg-purple-50 border border-purple-200 rounded p-3 hover:bg-purple-100 transition-colors drop-zone" 
           data-placeholder="${placeholder.name}"
           data-type="${placeholder.type}">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-purple-900">${placeholder.fullMatch}</span>
          <span class="text-xs px-2 py-1 rounded ${this.getTypeColor(placeholder.type)}">${placeholder.type}</span>
        </div>
        <p class="text-xs text-purple-700">${placeholder.context || 'Template placeholder'}</p>
        ${placeholder.isRequired ? '<span class="text-xs text-red-600 font-medium">Required</span>' : ''}
      </div>
    `).join('');

    // Set up drag and drop
    this.setupDragAndDrop(container);
  }

  private setupDragAndDrop(container: HTMLElement): void {
    // Survey field drag start
    container.querySelectorAll('.survey-field-item').forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const field = (e.target as HTMLElement).dataset.field;
        if (field) {
          (e as DragEvent).dataTransfer?.setData('text/plain', field);
          (e.target as HTMLElement).classList.add('opacity-50');
        }
      });

      item.addEventListener('dragend', (e) => {
        (e.target as HTMLElement).classList.remove('opacity-50');
      });
    });

    // Placeholder drop zones
    container.querySelectorAll('.drop-zone').forEach(zone => {
      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        (e.target as HTMLElement).classList.add('bg-purple-200', 'border-purple-400');
      });

      zone.addEventListener('dragleave', (e) => {
        (e.target as HTMLElement).classList.remove('bg-purple-200', 'border-purple-400');
      });

      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        const surveyField = (e as DragEvent).dataTransfer?.getData('text/plain');
        const placeholderElement = (e.target as HTMLElement).closest('.placeholder-item') as HTMLElement;
        const placeholder = placeholderElement?.dataset.placeholder;
        
        if (surveyField && placeholder) {
          try {
            this.mappingService.createMapping(surveyField, placeholder);
            this.refreshMappingInterface(container);
            this.showNotification(`Mapped ${surveyField} → ${placeholder}`, 'success');
          } catch (error) {
            this.showNotification(`Error creating mapping: ${error}`, 'error');
          }
        }

        (e.target as HTMLElement).classList.remove('bg-purple-200', 'border-purple-400');
      });
    });
  }

  private refreshMappingInterface(container: HTMLElement): void {
    const mappingsList = container.querySelector('#mappings-list')!;
    const mappings = this.mappingService.getMappings();

    if (mappings.length === 0) {
      mappingsList.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <p class="text-sm">No mappings created yet</p>
          <p class="text-xs mt-1">Drag survey fields to template placeholders</p>
        </div>
      `;
    } else {
      mappingsList.innerHTML = mappings.map(mapping => `
        <div class="mapping-item bg-white border border-gray-200 rounded p-3 hover:shadow-sm transition-shadow">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-1">
                <span class="text-sm font-medium text-blue-600">${mapping.surveyField}</span>
                <span class="text-gray-400">→</span>
                <span class="text-sm font-medium text-purple-600">${mapping.placeholder}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs px-2 py-1 rounded ${this.getTypeColor(mapping.placeholderType)}">${mapping.placeholderType}</span>
                ${mapping.isRequired ? '<span class="text-xs text-red-600">Required</span>' : '<span class="text-xs text-gray-500">Optional</span>'}
              </div>
            </div>
            <button class="remove-mapping text-red-600 hover:text-red-800 text-xs p-1" 
                    data-mapping-id="${mapping.id}">✕</button>
          </div>
        </div>
      `).join('');

      // Set up remove buttons
      container.querySelectorAll('.remove-mapping').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const mappingId = (e.target as HTMLElement).dataset.mappingId;
          if (mappingId && confirm('Remove this mapping?')) {
            this.mappingService.removeMapping(mappingId);
            this.refreshMappingInterface(container);
          }
        });
      });
    }

    // Update statistics and suggestions
    this.updateMappingStats(container);
    this.updateSuggestions(container);
  }

  private updateMappingStats(container: HTMLElement): void {
    const stats = this.mappingService.getStatistics();
    const statsElement = container.querySelector('#mapping-stats')!;
    
    statsElement.innerHTML = `
      ${stats.totalMappings} mappings • 
      ${stats.unmappedSurveyFields} unmapped fields • 
      ${stats.completeness}% complete
    `;
  }

  private updateSuggestions(container: HTMLElement): void {
    const suggestions = this.mappingService.generateSuggestions().slice(0, 5); // Show top 5
    const suggestionsPanel = container.querySelector('#suggestions-panel')!;
    const suggestionsList = container.querySelector('#suggestions-list')!;

    if (suggestions.length === 0) {
      suggestionsPanel.classList.add('hidden');
    } else {
      suggestionsPanel.classList.remove('hidden');
      suggestionsList.innerHTML = suggestions.map(suggestion => `
        <div class="suggestion-item bg-white border border-yellow-200 rounded p-3 flex justify-between items-center">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-medium text-gray-900">${suggestion.surveyField}</span>
              <span class="text-gray-400">→</span>
              <span class="text-sm font-medium text-gray-900">${suggestion.placeholder}</span>
            </div>
            <p class="text-xs text-gray-600">${suggestion.reason} (${Math.round(suggestion.confidence * 100)}% confidence)</p>
          </div>
          <button class="apply-suggestion bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-xs"
                  data-survey-field="${suggestion.surveyField}"
                  data-placeholder="${suggestion.placeholder}">
            Apply
          </button>
        </div>
      `).join('');

      // Set up apply buttons
      container.querySelectorAll('.apply-suggestion').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const surveyField = (e.target as HTMLElement).dataset.surveyField;
          const placeholder = (e.target as HTMLElement).dataset.placeholder;
          
          if (surveyField && placeholder) {
            try {
              this.mappingService.createMapping(surveyField, placeholder);
              this.refreshMappingInterface(container);
              this.showNotification(`Applied suggestion: ${surveyField} → ${placeholder}`, 'success');
            } catch (error) {
              this.showNotification(`Error applying suggestion: ${error}`, 'error');
            }
          }
        });
      });
    }
  }

  private validateMappings(container: HTMLElement): void {
    const validation = this.mappingService.validateMappings();
    
    // Update validation counts
    const validCount = container.querySelector('#valid-mappings-count')!;
    const warningsCount = container.querySelector('#warnings-count')!;
    const errorsCount = container.querySelector('#errors-count')!;
    
    validCount.textContent = validation.mappedCount.toString();
    warningsCount.textContent = validation.warnings.length.toString();
    errorsCount.textContent = validation.errors.length.toString();

    // Show detailed validation results
    const validationDetails = container.querySelector('#validation-details')!;
    
    if (validation.errors.length > 0 || validation.warnings.length > 0) {
      validationDetails.classList.remove('hidden');
      validationDetails.innerHTML = `
        ${validation.errors.map(error => `
          <div class="bg-red-50 border border-red-200 rounded p-3">
            <p class="text-sm text-red-800">❌ ${error}</p>
          </div>
        `).join('')}
        ${validation.warnings.map(warning => `
          <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
            <p class="text-sm text-yellow-800">⚠️ ${warning}</p>
          </div>
        `).join('')}
      `;
    } else {
      validationDetails.classList.add('hidden');
    }

    // Update status
    this.updateMappingStatus(container, true, validation);
  }

  private updateMappingStatus(container: HTMLElement, hasData: boolean, validation?: any): void {
    const statusElement = container.querySelector('#mapping-status')!;
    
    if (!hasData) {
      statusElement.innerHTML = `
        <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
        <span class="text-sm font-medium text-gray-600">No data loaded</span>
      `;
    } else if (validation) {
      const isValid = validation.isValid;
      const completeness = validation.completeness;
      
      statusElement.innerHTML = `
        <div class="w-3 h-3 ${isValid ? 'bg-green-500' : 'bg-red-500'} rounded-full"></div>
        <span class="text-sm font-medium ${isValid ? 'text-green-600' : 'text-red-600'}">
          ${isValid ? 'Valid' : 'Issues Found'} (${completeness}% complete)
        </span>
      `;
    } else {
      statusElement.innerHTML = `
        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
        <span class="text-sm font-medium text-yellow-600">Ready for mapping</span>
      `;
    }
  }

  private exportMappings(): void {
    const exportData = this.mappingService.exportMappings();
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-mappings-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification('Mappings exported successfully', 'success');
  }

  private async importMappings(file: File, container: HTMLElement): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const importedCount = this.mappingService.importMappings(data);
      this.refreshMappingInterface(container);
      
      this.showNotification(`Imported ${importedCount} mappings from ${file.name}`, 'success');
      
    } catch (error) {
      console.error('Error importing mappings:', error);
      this.showNotification('Failed to import mappings. Please check file format.', 'error');
    }
  }

  private showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const colors = {
      success: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      info: 'bg-blue-100 text-blue-800 border-blue-200'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} border rounded-lg p-4 shadow-lg z-50 max-w-sm`;
    notification.innerHTML = `
      <div class="flex justify-between items-center">
        <p class="text-sm font-medium">${message}</p>
        <button class="ml-2 text-lg leading-none">&times;</button>
      </div>
    `;

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    // Manual close
    notification.querySelector('button')?.addEventListener('click', () => {
      notification.remove();
    });

    document.body.appendChild(notification);
  }

  private renderPackageDefinition(container: HTMLElement): void {
    // Initialize with a new package if none exists
    if (!this.currentPackage) {
      this.currentPackage = PackageService.createPackage('Document Assembly Package');
    }

    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Package Definition</h2>
          <p class="mt-1 text-sm text-gray-600">Create distributable document assembly packages with surveys, templates, and mappings</p>
        </div>
        
        <div class="p-6 space-y-6">
          
          <!-- Package Actions Bar -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
            <div class="flex space-x-2">
              <button id="new-package-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium">
                📦 New Package
              </button>
              <button id="load-package-btn" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium">
                📂 Load Package
              </button>
              <input type="file" id="package-file-input" class="hidden" accept=".zip" />
            </div>
            <div class="flex space-x-2">
              <button id="validate-package-btn" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium">
                ✅ Validate Package
              </button>
              <button id="export-package-btn" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm font-medium">
                💾 Export Package
              </button>
            </div>
          </div>

          <!-- Package Overview -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Package Metadata -->
            <div class="lg:col-span-2">
              <div class="border border-gray-200 rounded-lg">
                <div class="bg-blue-50 px-4 py-3 border-b border-gray-200">
                  <h3 class="font-medium text-blue-900">📋 Package Information</h3>
                </div>
                <div class="p-4 space-y-4">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Package Title *</label>
                      <input type="text" id="package-title" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Enter package title">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Version *</label>
                      <input type="text" id="package-version" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="1.0.0" pattern="\\d+\\.\\d+\\.\\d+">
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="package-description" rows="3" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Describe the purpose and contents of this package"></textarea>
                  </div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input type="text" id="package-author" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Package creator name">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                      <input type="text" id="package-tags" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="contract, employment, legal">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Package Statistics -->
            <div>
              <div class="border border-gray-200 rounded-lg">
                <div class="bg-green-50 px-4 py-3 border-b border-gray-200">
                  <h3 class="font-medium text-green-900">📊 Package Stats</h3>
                </div>
                <div class="p-4">
                  <div id="package-stats" class="space-y-3">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- Package Contents -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Survey Content -->
            <div>
              <div class="border border-gray-200 rounded-lg h-full">
                <div class="bg-blue-50 px-4 py-3 border-b border-gray-200">
                  <h3 class="font-medium text-blue-900 flex items-center justify-between">
                    <span>📝 Survey</span>
                    <button id="import-survey-btn" class="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 border border-blue-300 rounded">Import</button>
                  </h3>
                </div>
                <div id="survey-content" class="p-4">
                  <!-- Will be populated dynamically -->
                </div>
              </div>
            </div>

            <!-- Template Content -->
            <div>
              <div class="border border-gray-200 rounded-lg h-full">
                <div class="bg-purple-50 px-4 py-3 border-b border-gray-200">
                  <h3 class="font-medium text-purple-900 flex items-center justify-between">
                    <span>📄 Template</span>
                    <button id="import-template-btn" class="text-xs text-purple-600 hover:text-purple-800 px-2 py-1 border border-purple-300 rounded">Import</button>
                  </h3>
                </div>
                <div id="template-content" class="p-4">
                  <!-- Will be populated dynamically -->
                </div>
              </div>
            </div>

            <!-- Mappings Content -->
            <div>
              <div class="border border-gray-200 rounded-lg h-full">
                <div class="bg-yellow-50 px-4 py-3 border-b border-gray-200">
                  <h3 class="font-medium text-yellow-900 flex items-center justify-between">
                    <span>🔗 Mappings</span>
                    <button id="import-mappings-btn" class="text-xs text-yellow-600 hover:text-yellow-800 px-2 py-1 border border-yellow-300 rounded">Import</button>
                  </h3>
                </div>
                <div id="mappings-content" class="p-4">
                  <!-- Will be populated dynamically -->
                </div>
              </div>
            </div>

          </div>

          <!-- README Editor -->
          <div class="border border-gray-200 rounded-lg">
            <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 class="font-medium text-gray-900">📚 README Documentation</h3>
              <p class="text-sm text-gray-600 mt-1">Provide instructions and information for package users</p>
            </div>
            <div class="p-4">
              <textarea id="package-readme" rows="8" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono" placeholder="# Package Documentation

## Overview
Describe what this package does...

## Usage
Explain how to use this package...

## Requirements
List any requirements..."></textarea>
            </div>
          </div>

          <!-- Validation Results -->
          <div id="validation-results" class="hidden">
            <div class="border border-gray-200 rounded-lg">
              <div class="bg-red-50 px-4 py-3 border-b border-gray-200">
                <h3 class="font-medium text-red-900">⚠️ Validation Results</h3>
              </div>
              <div id="validation-content" class="p-4">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    // Set up package definition functionality
    this.setupPackageDefinition(container);
    // Populate with current package data
    this.populatePackageForm(container);
  }

  private setupPackageDefinition(container: HTMLElement): void {
    // Get form elements
    const newPackageBtn = container.querySelector('#new-package-btn') as HTMLButtonElement;
    const loadPackageBtn = container.querySelector('#load-package-btn') as HTMLButtonElement;
    const validatePackageBtn = container.querySelector('#validate-package-btn') as HTMLButtonElement;
    const exportPackageBtn = container.querySelector('#export-package-btn') as HTMLButtonElement;
    const packageFileInput = container.querySelector('#package-file-input') as HTMLInputElement;
    
    const titleInput = container.querySelector('#package-title') as HTMLInputElement;
    const versionInput = container.querySelector('#package-version') as HTMLInputElement;
    const descriptionInput = container.querySelector('#package-description') as HTMLTextAreaElement;
    const authorInput = container.querySelector('#package-author') as HTMLInputElement;
    const tagsInput = container.querySelector('#package-tags') as HTMLInputElement;
    const readmeInput = container.querySelector('#package-readme') as HTMLTextAreaElement;

    // Content import buttons
    const importSurveyBtn = container.querySelector('#import-survey-btn') as HTMLButtonElement;
    const importTemplateBtn = container.querySelector('#import-template-btn') as HTMLButtonElement;
    const importMappingsBtn = container.querySelector('#import-mappings-btn') as HTMLButtonElement;

    // New package
    newPackageBtn.addEventListener('click', () => {
      if (confirm('Create a new package? This will clear the current package data.')) {
        this.currentPackage = PackageService.createPackage('New Document Assembly Package');
        this.populatePackageForm(container);
        this.showNotification('Created new package', 'info');
      }
    });

    // Load package from file
    loadPackageBtn.addEventListener('click', () => {
      packageFileInput.click();
    });

    packageFileInput.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          this.currentPackage = await PackageService.importPackage(file);
          this.populatePackageForm(container);
          this.showNotification(`Package "${this.currentPackage.metadata.title}" loaded successfully`, 'success');
        } catch (error) {
          this.showNotification(`Failed to load package: ${error}`, 'error');
        }
      }
    });

    // Validate package
    validatePackageBtn.addEventListener('click', () => {
      this.updatePackageFromForm(container);
      this.validateCurrentPackage(container);
    });

    // Export package
    exportPackageBtn.addEventListener('click', async () => {
      try {
        this.updatePackageFromForm(container);
        await PackageService.exportPackage(this.currentPackage!);
        this.showNotification('Package exported successfully', 'success');
      } catch (error) {
        this.showNotification(`Failed to export package: ${error}`, 'error');
      }
    });

    // Form field change handlers
    const updatePackageHandler = () => {
      this.updatePackageFromForm(container);
      this.updatePackageStats(container);
    };

    titleInput.addEventListener('input', updatePackageHandler);
    versionInput.addEventListener('input', updatePackageHandler);
    descriptionInput.addEventListener('input', updatePackageHandler);
    authorInput.addEventListener('input', updatePackageHandler);
    tagsInput.addEventListener('input', updatePackageHandler);
    readmeInput.addEventListener('input', updatePackageHandler);

    // Content import handlers
    importSurveyBtn.addEventListener('click', () => {
      this.importSurveyFromCreator();
      this.populatePackageForm(container);
    });

    importTemplateBtn.addEventListener('click', () => {
      this.showNotification('Template import will use data from Template Manager tab', 'info');
    });

    importMappingsBtn.addEventListener('click', () => {
      this.importMappingsFromInterface();
      this.populatePackageForm(container);
    });
  }

  private populatePackageForm(container: HTMLElement): void {
    if (!this.currentPackage) return;

    // Populate form fields
    const titleInput = container.querySelector('#package-title') as HTMLInputElement;
    const versionInput = container.querySelector('#package-version') as HTMLInputElement;
    const descriptionInput = container.querySelector('#package-description') as HTMLTextAreaElement;
    const authorInput = container.querySelector('#package-author') as HTMLInputElement;
    const tagsInput = container.querySelector('#package-tags') as HTMLInputElement;
    const readmeInput = container.querySelector('#package-readme') as HTMLTextAreaElement;

    titleInput.value = this.currentPackage.metadata.title;
    versionInput.value = this.currentPackage.metadata.version;
    descriptionInput.value = this.currentPackage.metadata.description;
    authorInput.value = this.currentPackage.metadata.author;
    tagsInput.value = this.currentPackage.metadata.tags.join(', ');
    readmeInput.value = this.currentPackage.readme || '';

    // Update content displays
    this.updateSurveyContent(container);
    this.updateTemplateContent(container);
    this.updateMappingsContent(container);
    this.updatePackageStats(container);
  }

  private updatePackageFromForm(container: HTMLElement): void {
    if (!this.currentPackage) return;

    const titleInput = container.querySelector('#package-title') as HTMLInputElement;
    const versionInput = container.querySelector('#package-version') as HTMLInputElement;
    const descriptionInput = container.querySelector('#package-description') as HTMLTextAreaElement;
    const authorInput = container.querySelector('#package-author') as HTMLInputElement;
    const tagsInput = container.querySelector('#package-tags') as HTMLInputElement;
    const readmeInput = container.querySelector('#package-readme') as HTMLTextAreaElement;

    this.currentPackage.metadata.title = titleInput.value;
    this.currentPackage.metadata.version = versionInput.value;
    this.currentPackage.metadata.description = descriptionInput.value;
    this.currentPackage.metadata.author = authorInput.value;
    this.currentPackage.metadata.tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    this.currentPackage.readme = readmeInput.value;
    this.currentPackage.metadata.modified = new Date().toISOString();
  }

  private updateSurveyContent(container: HTMLElement): void {
    const surveyContent = container.querySelector('#survey-content')!;
    
    if (!this.currentPackage?.survey) {
      surveyContent.innerHTML = '<p class="text-sm text-gray-500">No survey loaded</p>';
      return;
    }

    const questionCount = this.currentPackage.survey.pages?.reduce((count, page) => 
      count + (page.elements?.length || 0), 0) || 0;

    surveyContent.innerHTML = `
      <div class="space-y-2">
        <div class="flex justify-between items-center">
          <span class="text-sm font-medium text-gray-900">${this.currentPackage.survey.title}</span>
        </div>
        <div class="text-xs text-gray-600">
          <div>${questionCount} questions</div>
          <div>${this.currentPackage.survey.pages?.length || 0} pages</div>
        </div>
        <div class="text-xs text-blue-600">
          <button class="hover:underline">Preview Survey →</button>
        </div>
      </div>
    `;
  }

  private updateTemplateContent(container: HTMLElement): void {
    const templateContent = container.querySelector('#template-content')!;
    
    if (!this.currentPackage?.template) {
      templateContent.innerHTML = `
        <p class="text-sm text-gray-500 mb-2">No template loaded</p>
        <button class="text-xs text-purple-600 hover:underline">Import from Template Manager →</button>
      `;
      return;
    }

    const sizeKB = Math.round(this.currentPackage.template.content.byteLength / 1024);
    
    templateContent.innerHTML = `
      <div class="space-y-2">
        <div class="text-sm font-medium text-gray-900">${this.currentPackage.template.filename}</div>
        <div class="text-xs text-gray-600">
          <div>${sizeKB} KB</div>
          <div>${this.currentPackage.template.placeholders.length} placeholders</div>
        </div>
        <div class="text-xs text-purple-600">
          <button class="hover:underline">Analyze Template →</button>
        </div>
      </div>
    `;
  }

  private updateMappingsContent(container: HTMLElement): void {
    const mappingsContent = container.querySelector('#mappings-content')!;
    
    if (!this.currentPackage?.mappings || this.currentPackage.mappings.length === 0) {
      mappingsContent.innerHTML = `
        <p class="text-sm text-gray-500 mb-2">No mappings loaded</p>
        <button class="text-xs text-yellow-600 hover:underline">Import from Mapping Interface →</button>
      `;
      return;
    }

    mappingsContent.innerHTML = `
      <div class="space-y-2">
        <div class="text-sm font-medium text-gray-900">${this.currentPackage.mappings.length} mappings</div>
        <div class="text-xs text-gray-600">
          ${this.currentPackage.mappings.filter(m => m.isRequired).length} required
        </div>
        <div class="text-xs text-yellow-600">
          <button class="hover:underline">View Mappings →</button>
        </div>
      </div>
    `;
  }

  private updatePackageStats(container: HTMLElement): void {
    if (!this.currentPackage) return;

    const stats = PackageService.getPackageStats(this.currentPackage);
    const statsElement = container.querySelector('#package-stats')!;

    statsElement.innerHTML = `
      <div class="space-y-2">
        <div class="flex justify-between">
          <span class="text-sm text-gray-600">Survey Questions</span>
          <span class="text-sm font-medium">${stats.surveyQuestions}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-gray-600">Template Fields</span>
          <span class="text-sm font-medium">${stats.templatePlaceholders}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-gray-600">Active Mappings</span>
          <span class="text-sm font-medium">${stats.activeMappings}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-gray-600">Completeness</span>
          <span class="text-sm font-medium ${stats.completeness >= 80 ? 'text-green-600' : stats.completeness >= 50 ? 'text-yellow-600' : 'text-red-600'}">${stats.completeness}%</span>
        </div>
        <div class="flex justify-between border-t pt-2">
          <span class="text-sm text-gray-600">Est. Size</span>
          <span class="text-sm font-medium">${stats.estimatedSize}</span>
        </div>
      </div>
    `;
  }

  private validateCurrentPackage(container: HTMLElement): void {
    if (!this.currentPackage) return;

    const validation = PackageService.validatePackage(this.currentPackage);
    const validationResults = container.querySelector('#validation-results')!;
    const validationContent = container.querySelector('#validation-content')!;

    if (!validation.isValid || validation.warnings.length > 0 || validation.suggestions.length > 0) {
      validationResults.classList.remove('hidden');
      
      validationContent.innerHTML = `
        ${validation.errors.length > 0 ? `
          <div class="mb-4">
            <h4 class="font-medium text-red-900 mb-2">❌ Errors (${validation.errors.length})</h4>
            <div class="space-y-1">
              ${validation.errors.map(error => `<p class="text-sm text-red-800">• ${error}</p>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${validation.warnings.length > 0 ? `
          <div class="mb-4">
            <h4 class="font-medium text-yellow-900 mb-2">⚠️ Warnings (${validation.warnings.length})</h4>
            <div class="space-y-1">
              ${validation.warnings.map(warning => `<p class="text-sm text-yellow-800">• ${warning}</p>`).join('')}
            </div>
          </div>
        ` : ''}
        
        ${validation.suggestions.length > 0 ? `
          <div>
            <h4 class="font-medium text-blue-900 mb-2">💡 Suggestions (${validation.suggestions.length})</h4>
            <div class="space-y-1">
              ${validation.suggestions.map(suggestion => `<p class="text-sm text-blue-800">• ${suggestion}</p>`).join('')}
            </div>
          </div>
        ` : ''}
      `;
    } else {
      validationResults.classList.add('hidden');
    }

    const message = validation.isValid ? 
      'Package validation passed successfully!' : 
      `Package has ${validation.errors.length} errors and ${validation.warnings.length} warnings`;
    
    this.showNotification(message, validation.isValid ? 'success' : 'warning');
  }

  private importSurveyFromCreator(): void {
    // This would get the current survey from the Survey Creator tab
    // For now, using mock data
    const mockSurvey = {
      title: 'Employment Contract Survey',
      description: 'Survey for collecting employment contract information',
      pages: [{
        name: 'page1',
        elements: [
          { type: 'text', name: 'employee_name', title: 'Full Name', isRequired: true },
          { type: 'text', name: 'job_title', title: 'Job Title', isRequired: true },
          { type: 'text', name: 'start_date', title: 'Start Date', isRequired: true },
          { type: 'text', name: 'department', title: 'Department', isRequired: true },
          { type: 'radiogroup', name: 'employment_type', title: 'Employment Type', 
            choices: ['Full-time', 'Part-time', 'Contract'], isRequired: true }
        ]
      }]
    };

    if (this.currentPackage) {
      this.currentPackage.survey = mockSurvey;
      this.showNotification('Survey imported from Survey Designer', 'success');
    }
  }

  private importMappingsFromInterface(): void {
    // This would get the current mappings from the Mapping Interface tab
    const mockMappings = this.mappingService.getMappings();
    
    if (this.currentPackage) {
      this.currentPackage.mappings = mockMappings;
      this.showNotification(`Imported ${mockMappings.length} mappings from Mapping Interface`, 'success');
    }
  }

  private async loadSampleSurvey(container: HTMLElement): Promise<void> {
    try {
      DomUtils.setLoadingState(container, {
        isLoading: true,
        message: 'Loading sample survey...'
      });

      const response = await fetch('/surveys/employment-survey.json');
      if (!response.ok) {
        throw new Error('Failed to load sample survey');
      }
      const survey = await response.json();
      
      this.displaySurveyPreview(survey, container);
      this.enableSurveyActions();
      
      console.log('Phase 1 Deliverable: Successfully loaded survey in Creator interface!');
      
    } catch (error) {
      console.error('Error loading sample survey:', error);
      DomUtils.setErrorState(container, {
        hasError: true,
        message: 'Failed to load sample survey',
        details: 'This demo requires the sample survey file to demonstrate survey loading in creator mode.'
      });
    }
  }
}

// Initialize the creator app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CreatorApp();
});