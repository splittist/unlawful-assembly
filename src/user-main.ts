import './style.css';
import { DomUtils } from '@/utils/common';
import { PackageService, type PackageContent } from '@/services/packageService';
import { DocumentGeneratorService } from '@/services/documentGenerator';

/**
 * User interface main entry point
 * This will be the main interface for filling out surveys and generating documents
 */
class UserApp {
  private container: HTMLElement;
  private loadedPackage: PackageContent | null = null;
  private currentSurveyResponses: any = {};

  constructor() {
    this.container = document.querySelector<HTMLDivElement>('#user-app')!;
    this.init();
  }

  private init(): void {
    this.renderLayout();
    this.checkForDrafts();
  }

  private renderLayout(): void {
    this.container.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <!-- Header -->
        <header class="bg-white shadow-sm">
          <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
              <div class="flex items-center">
                <h1 class="text-2xl font-bold text-gray-900">Document Assembly</h1>
                <span class="ml-3 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">User</span>
              </div>
              <nav class="flex space-x-4">
                <a href="creator.html" class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Creator Interface</a>
              </nav>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div id="main-content">
            <!-- Content will be rendered here -->
          </div>
        </main>
      </div>
    `;

    this.renderPackageSelection();
    this.setupPackageSelection();
  }

  private checkForDrafts(): void {
    // Check localStorage for existing drafts
    const drafts = this.getExistingDrafts();
    
    if (drafts.length > 0) {
      this.showDraftModal(drafts);
    }
  }

  private getExistingDrafts(): any[] {
    const drafts: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('docassembly_draft_')) {
        try {
          const draft = JSON.parse(localStorage.getItem(key)!);
          drafts.push({ key, ...draft });
        } catch (e) {
          // Invalid draft, ignore
        }
      }
    }
    return drafts;
  }

  private showDraftModal(drafts: any[]): void {
    const modal = DomUtils.createElement('div', 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50');
    modal.innerHTML = `
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900">Continue Previous Work?</h3>
          <div class="mt-4 max-h-60 overflow-y-auto">
            ${drafts.map(draft => `
              <div class="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded">
                <div>
                  <p class="text-sm font-medium text-gray-900">${draft.packageId}</p>
                  <p class="text-xs text-gray-500">${draft.matterName || 'Untitled'}</p>
                  <p class="text-xs text-gray-400">${new Date(draft.lastSaved).toLocaleDateString()}</p>
                </div>
                <button class="continue-draft text-blue-600 hover:text-blue-800 text-sm" data-key="${draft.key}">
                  Continue
                </button>
              </div>
            `).join('')}
          </div>
          <div class="mt-6 flex justify-end space-x-3">
            <button id="start-new" class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded">
              Start New
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Event handlers
    modal.querySelector('#start-new')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.querySelectorAll('.continue-draft').forEach(button => {
      button.addEventListener('click', (e) => {
        const key = (e.target as HTMLElement).dataset.key!;
        this.continueDraft(key);
        document.body.removeChild(modal);
      });
    });
  }

  private continueDraft(draftKey: string): void {
    // This will be implemented when survey rendering is added
    console.log('Continuing draft:', draftKey);
    const mainContent = this.container.querySelector('#main-content')!;
    mainContent.innerHTML = `
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-medium text-gray-900 mb-4">Continue Draft</h2>
        <p class="text-gray-600">Draft continuation will be implemented when survey rendering is added.</p>
        <button class="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm" onclick="location.reload()">
          Back to Package Selection
        </button>
      </div>
    `;
  }

  private renderPackageSelection(): void {
    const mainContent = this.container.querySelector('#main-content')!;
    
    mainContent.innerHTML = `
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold text-gray-900">Document Assembly</h2>
        <p class="mt-4 text-lg text-gray-600">Load a document package to complete surveys and generate documents</p>
      </div>

      <!-- Package Upload Section -->
      <div class="bg-white rounded-lg shadow-lg p-8 mb-8">
        <div class="text-center">
          <h3 class="text-xl font-semibold text-gray-900 mb-4">📦 Load Document Package</h3>
          <p class="text-gray-600 mb-6">Upload a .zip package created with the Document Assembly Creator</p>
          
          <!-- Upload Area -->
          <div id="package-upload-area" class="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div class="space-y-4">
              <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p class="text-lg font-medium text-gray-900">Click to upload package</p>
                <p class="text-sm text-gray-500">or drag and drop your .zip package here</p>
              </div>
              <p class="text-xs text-gray-400">Maximum file size: 50MB</p>
            </div>
            <input type="file" id="package-file-input" class="hidden" accept=".zip" />
          </div>
        </div>
      </div>

      <!-- Sample Packages Section -->
      <div id="packages-container" class="space-y-6">
        <div class="text-center mb-6">
          <h3 class="text-xl font-semibold text-gray-900">Sample Packages</h3>
          <p class="text-gray-600">Try these demonstration packages</p>
        </div>

        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900">📋 Employment Contract Package</h4>
              <p class="mt-2 text-gray-600">Complete employment contract generation with salary details, benefits, and job responsibilities</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Employment</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Contract</span>
                <span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">HR</span>
              </div>
            </div>
            <div class="ml-4">
              <button id="demo-package-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                Load Demo Package
              </button>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>📊 12 questions • 📄 1 template • 🔗 10 field mappings</span>
              <span>Created with Document Assembly Creator v2.0</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6 opacity-75">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h4 class="text-lg font-semibold text-gray-900">🤝 NDA Package</h4>
              <p class="mt-2 text-gray-600">Generate mutual or one-way non-disclosure agreements with custom terms</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Legal</span>
                <span class="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Confidentiality</span>
              </div>
            </div>
            <div class="ml-4">
              <button class="bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg cursor-not-allowed" disabled>
                Coming Soon
              </button>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>📊 8 questions • 📄 2 templates • 🔗 6 field mappings</span>
              <span>Package in development</span>
            </div>
          </div>
        </div>

        <!-- Legacy Phase 1 Test -->
        <div class="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-6">
          <div class="text-center">
            <h4 class="text-lg font-semibold text-gray-700">🧪 Phase 1 Legacy Test</h4>
            <p class="mt-2 text-gray-500">Test the original Phase 1 survey loading functionality</p>
            <button id="test-survey-btn" class="mt-4 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Load Phase 1 Test Survey
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private setupPackageSelection(): void {
    // Set up event listeners for package selection and upload
    
    // Test survey button (Phase 1 legacy)
    const testBtn = this.container.querySelector('#test-survey-btn');
    testBtn?.addEventListener('click', () => {
      this.loadTestSurvey();
    });

    // Demo package button
    const demoBtn = this.container.querySelector('#demo-package-btn');
    demoBtn?.addEventListener('click', () => {
      this.loadDemoPackage();
    });

    // Package upload area click handler
    const uploadArea = this.container.querySelector('#package-upload-area');
    const fileInput = this.container.querySelector('#package-file-input') as HTMLInputElement;
    
    uploadArea?.addEventListener('click', () => {
      fileInput?.click();
    });

    // File input change handler
    fileInput?.addEventListener('change', (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files[0]) {
        this.handlePackageUpload(target.files[0]);
      }
    });

    // Drag and drop handlers
    if (uploadArea) {
      uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-blue-400', 'bg-blue-50');
      });

      uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
      });

      uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-blue-400', 'bg-blue-50');
        
        const dragEvent = e as DragEvent;
        const files = dragEvent.dataTransfer?.files;
        if (files && files[0]) {
          this.handlePackageUpload(files[0]);
        }
      });
    }
  }

  private async handlePackageUpload(file: File): Promise<void> {
    console.log('Handling package upload:', file.name);
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.zip')) {
      this.showError('Please select a .zip package file');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      this.showError('Package file is too large. Maximum size is 50MB.');
      return;
    }

    const mainContent = this.container.querySelector('#main-content')!;
    
    try {
      // Show loading state
      DomUtils.setLoadingState(mainContent as HTMLElement, {
        isLoading: true,
        message: 'Loading package...'
      });

      // Import package using PackageService
      const packageContent = await PackageService.importPackage(file);
      this.loadedPackage = packageContent;
      
      console.log('Package loaded successfully:', packageContent.metadata.title);
      
      // Render the survey from the loaded package
      await this.renderSurveyFromPackage(packageContent);
      
    } catch (error) {
      console.error('Error loading package:', error);
      this.showError(`Failed to load package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async loadDemoPackage(): Promise<void> {
    console.log('Loading demo package...');
    
    const mainContent = this.container.querySelector('#main-content')!;
    
    try {
      // Show loading state
      DomUtils.setLoadingState(mainContent as HTMLElement, {
        isLoading: true,
        message: 'Loading demo package...'
      });

      // Create a demo package with template and mappings
      const templateBuffer = await this.createDemoTemplate();
      
      const demoPackage: PackageContent = {
        metadata: {
          id: 'demo-employment-contract',
          title: 'Employment Contract Package',
          description: 'Complete employment contract generation with salary details, benefits, and job responsibilities',
          version: '1.0.0',
          author: 'Document Assembly Creator',
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          tags: ['Employment', 'Contract', 'HR']
        },
        template: {
          filename: 'employment-contract-template.docx',
          content: templateBuffer,
          placeholders: [
            { name: 'employee_name', fullMatch: '{employee_name}', type: 'simple' },
            { name: 'employee_email', fullMatch: '{employee_email}', type: 'simple' },
            { name: 'position_title', fullMatch: '{position_title}', type: 'simple' },
            { name: 'department', fullMatch: '{department}', type: 'simple' },
            { name: 'salary', fullMatch: '{salary}', type: 'simple' },
            { name: 'pay_frequency', fullMatch: '{pay_frequency}', type: 'simple' },
            { name: 'benefits', fullMatch: '{benefits}', type: 'simple' },
            { name: 'start_date', fullMatch: '{start_date}', type: 'simple' },
            { name: 'employment_type', fullMatch: '{employment_type}', type: 'simple' },
            { name: 'reporting_manager', fullMatch: '{reporting_manager}', type: 'simple' },
            { name: '_generated_date', fullMatch: '{_generated_date}', type: 'simple' }
          ]
        },
        survey: {
          title: 'Employment Contract Information',
          pages: [
            {
              name: 'employee-info',
              elements: [
                {
                  type: 'text',
                  name: 'employee_name',
                  title: 'Employee Full Name',
                  isRequired: true
                },
                {
                  type: 'email',
                  name: 'employee_email',
                  title: 'Employee Email Address',
                  isRequired: true
                },
                {
                  type: 'text',
                  name: 'position_title',
                  title: 'Position Title',
                  isRequired: true
                },
                {
                  type: 'text',
                  name: 'department',
                  title: 'Department',
                  isRequired: true
                }
              ]
            },
            {
              name: 'compensation',
              elements: [
                {
                  type: 'text',
                  name: 'salary',
                  title: 'Annual Salary (USD)',
                  inputType: 'number',
                  isRequired: true
                },
                {
                  type: 'dropdown',
                  name: 'pay_frequency',
                  title: 'Pay Frequency',
                  choices: ['Weekly', 'Bi-weekly', 'Monthly'],
                  isRequired: true
                },
                {
                  type: 'checkbox',
                  name: 'benefits',
                  title: 'Benefits Package',
                  choices: ['Health Insurance', 'Dental Insurance', '401k', 'Paid Time Off', 'Stock Options']
                }
              ]
            },
            {
              name: 'employment-details',
              elements: [
                {
                  type: 'text',
                  name: 'start_date',
                  title: 'Start Date',
                  inputType: 'date',
                  isRequired: true
                },
                {
                  type: 'dropdown',
                  name: 'employment_type',
                  title: 'Employment Type',
                  choices: ['Full-time', 'Part-time', 'Contract'],
                  isRequired: true
                },
                {
                  type: 'text',
                  name: 'reporting_manager',
                  title: 'Reporting Manager',
                  isRequired: true
                }
              ]
            }
          ]
        },
        mappings: [
          { id: '1', surveyField: 'employee_name', placeholder: '{employee_name}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '2', surveyField: 'employee_email', placeholder: '{employee_email}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '3', surveyField: 'position_title', placeholder: '{position_title}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '4', surveyField: 'department', placeholder: '{department}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '5', surveyField: 'salary', placeholder: '{salary}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '6', surveyField: 'pay_frequency', placeholder: '{pay_frequency}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '7', surveyField: 'benefits', placeholder: '{benefits}', placeholderType: 'simple', isRequired: false, isValid: true },
          { id: '8', surveyField: 'start_date', placeholder: '{start_date}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '9', surveyField: 'employment_type', placeholder: '{employment_type}', placeholderType: 'simple', isRequired: true, isValid: true },
          { id: '10', surveyField: 'reporting_manager', placeholder: '{reporting_manager}', placeholderType: 'simple', isRequired: true, isValid: true }
        ]
      };

      this.loadedPackage = demoPackage;
      console.log('Demo package loaded successfully');
      
      // Render the survey from the demo package
      await this.renderSurveyFromPackage(demoPackage);
      
    } catch (error) {
      console.error('Error loading demo package:', error);
      this.showError(`Failed to load demo package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async renderSurveyFromPackage(packageContent: PackageContent): Promise<void> {
    const mainContent = this.container.querySelector('#main-content')!;
    
    try {
      // Import and use the SurveyRuntimeService
      const { SurveyRuntimeService } = await import('@/services/surveyRuntime');
      const surveyService = new SurveyRuntimeService();
      
      // Initialize survey with package content and completion callback
      surveyService.initialize(
        mainContent as HTMLElement, 
        packageContent.survey,
        (surveyData) => this.handleSurveyComplete(surveyData, packageContent)
      );
      
      console.log('Survey rendered from package:', packageContent.metadata.title);
      
    } catch (error) {
      console.error('Error rendering survey from package:', error);
      this.showError(`Failed to render survey: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleSurveyComplete(surveyData: any, packageContent: PackageContent): Promise<void> {
    console.log('Survey completed, generating document...', { surveyData, packageContent: packageContent.metadata.title });
    
    this.currentSurveyResponses = surveyData;
    
    const mainContent = this.container.querySelector('#main-content')!;
    
    try {
      // Show loading state
      DomUtils.setLoadingState(mainContent as HTMLElement, {
        isLoading: true,
        message: 'Generating document...'
      });

      // Check if package has template and mappings
      if (!packageContent.template) {
        this.showDocumentGenerationUI(surveyData, packageContent);
        return;
      }

      if (!packageContent.mappings || packageContent.mappings.length === 0) {
        this.showMappingRequiredMessage(surveyData, packageContent);
        return;
      }

      // Generate document using DocumentGeneratorService
      await DocumentGeneratorService.generateDocument(surveyData, packageContent);
      
      // Show success message
      this.showDocumentGeneratedMessage(packageContent.metadata.title);
      
    } catch (error) {
      console.error('Error generating document:', error);
      this.showError(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private showDocumentGenerationUI(surveyData: any, packageContent: PackageContent): void {
    const mainContent = this.container.querySelector('#main-content')!;
    
    mainContent.innerHTML = `
      <div class="bg-white shadow rounded-lg p-8">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Survey Completed!</h2>
          <p class="text-gray-600 mb-6">Your survey responses have been collected successfully.</p>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-yellow-800">Document Template Required</h3>
                <div class="mt-2 text-sm text-yellow-700">
                  <p>To generate a document, this package needs a DOCX template with field mappings. Use the Document Assembly Creator to add templates and create field mappings.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Start Over
            </button>
            <div class="text-sm text-gray-500">
              <p>Survey responses: ${Object.keys(surveyData).length} fields collected</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private showMappingRequiredMessage(surveyData: any, packageContent: PackageContent): void {
    const mainContent = this.container.querySelector('#main-content')!;
    
    mainContent.innerHTML = `
      <div class="bg-white shadow rounded-lg p-8">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">Field Mappings Required</h2>
          <p class="text-gray-600 mb-6">This package contains a template but no field mappings have been configured.</p>
          
          <div class="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 text-left">
                <h3 class="text-sm font-medium text-blue-800">Next Steps</h3>
                <div class="mt-2 text-sm text-blue-700">
                  <p>Use the Document Assembly Creator to:</p>
                  <ul class="list-disc list-inside mt-2 space-y-1">
                    <li>Open this package in the Creator interface</li>
                    <li>Navigate to the Mapping Interface tab</li>
                    <li>Map survey fields to template placeholders</li>
                    <li>Export the updated package</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <a href="creator.html" class="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Open Document Assembly Creator
            </a>
            <button onclick="location.reload()" class="block mx-auto text-blue-600 hover:text-blue-800 text-sm">
              Start Over
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private showDocumentGeneratedMessage(packageTitle: string): void {
    const mainContent = this.container.querySelector('#main-content')!;
    
    mainContent.innerHTML = `
      <div class="bg-white shadow rounded-lg p-8">
        <div class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-green-900 mb-4">Document Generated Successfully!</h2>
          <p class="text-gray-600 mb-6">Your document has been created and downloaded automatically.</p>
          
          <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3 text-left">
                <h3 class="text-sm font-medium text-green-800">Document Details</h3>
                <div class="mt-2 text-sm text-green-700">
                  <p><strong>Package:</strong> ${packageTitle}</p>
                  <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
                  <p><strong>Status:</strong> Download should have started automatically</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
              Generate Another Document
            </button>
            <div class="text-sm text-gray-500">
              <p>Check your Downloads folder for the generated document</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private showError(message: string): void {
    const mainContent = this.container.querySelector('#main-content')!;
    DomUtils.setErrorState(mainContent as HTMLElement, {
      hasError: true,
      message: 'Package Loading Error',
      details: message
    });
  }

  private async createDemoTemplate(): Promise<ArrayBuffer> {
    // Create a simple DOCX document content for the demo
    const templateContent = `
EMPLOYMENT AGREEMENT

Generated on: {_generated_date}

This Employment Agreement ("Agreement") is entered into between {employee_name} ("Employee") and [Company Name] ("Company").

1. POSITION AND DUTIES

The Employee will serve in the position of {position_title} in the {department} department. The Employee will report directly to {reporting_manager}.

2. EMPLOYMENT TYPE

This is a {employment_type} employment position, effective {start_date}.

3. COMPENSATION

The Employee's annual salary will be {salary}, paid {pay_frequency}.

4. BENEFITS

The Employee will be eligible for the following benefits: {benefits}.

5. CONTACT INFORMATION

Employee Email: {employee_email}


________________________
Employee Signature

________________________
Company Representative

Date: ________________
    `.trim();

    // Create a minimal DOCX structure using PizZip
    const PizZip = (await import('pizzip')).default;
    const zip = new PizZip();

    // Create document XML with proper Word markup
    const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        ${templateContent.split('\n').map(line => {
          if (line.trim() === '') {
            return '<w:p><w:pPr></w:pPr></w:p>';
          }
          return `<w:p><w:r><w:t>${line}</w:t></w:r></w:p>`;
        }).join('')}
    </w:body>
</w:document>`;

    // Add required DOCX structure files
    zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

    zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

    zip.file('word/document.xml', documentXml);

    // Generate the ArrayBuffer
    const buffer = zip.generate({
      type: 'arraybuffer'
    });

    return buffer;
  }

  private async loadTestSurvey(): Promise<void> {
    const mainContent = this.container.querySelector('#main-content')!;
    
    try {
      // Show loading state
      DomUtils.setLoadingState(mainContent as HTMLElement, {
        isLoading: true,
        message: 'Loading sample survey...'
      });

      // Load the sample survey
      const response = await fetch('/surveys/employment-survey.json');
      if (!response.ok) {
        throw new Error('Failed to load sample survey');
      }
      const surveyJson = await response.json();

      // Import and use the SurveyRuntimeService
      const { SurveyRuntimeService } = await import('@/services/surveyRuntime');
      const surveyService = new SurveyRuntimeService();
      surveyService.initialize(mainContent as HTMLElement, surveyJson);

      console.log('Phase 1 Deliverable: Successfully loaded and displayed survey in runtime!');
      
    } catch (error) {
      console.error('Error loading test survey:', error);
      DomUtils.setErrorState(mainContent as HTMLElement, {
        hasError: true,
        message: 'Failed to load test survey',
        details: 'This demo requires the sample survey file. In a real deployment, this would load from the configured survey path.'
      });
    }
  }
}

// Initialize the user app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new UserApp();
});