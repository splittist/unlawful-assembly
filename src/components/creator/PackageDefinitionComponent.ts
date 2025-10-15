import { PackageService, type PackageContent } from '@/services/packageService';
import { FieldMappingService } from '@/services/fieldMapping';
import { SurveyCreatorService } from '@/services/surveyCreator';
import { showNotification } from './uiUtils';

/**
 * Package Definition UI Component
 * Handles package creation, import, and export
 */
export class PackageDefinitionComponent {
  private mappingService: FieldMappingService;
  private surveyCreatorService: SurveyCreatorService;
  private currentPackage: PackageContent | null = null;

  constructor(mappingService: FieldMappingService, surveyCreatorService: SurveyCreatorService) {
    this.mappingService = mappingService;
    this.surveyCreatorService = surveyCreatorService;
  }

  public render(container: HTMLElement): void {
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
        showNotification('Created new package', 'info');
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
          showNotification(`Package "${this.currentPackage.metadata.title}" loaded successfully`, 'success');
        } catch (error) {
          showNotification(`Failed to load package: ${error}`, 'error');
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
        showNotification('Package exported successfully', 'success');
      } catch (error) {
        showNotification(`Failed to export package: ${error}`, 'error');
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
      showNotification('Template import will use data from Template Manager tab', 'info');
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
    
    showNotification(message, validation.isValid ? 'success' : 'warning');
  }

  private importSurveyFromCreator(): void {
    try {
      // Get the current survey from the Survey Creator service
      const currentSurvey = this.surveyCreatorService.getSurveyJson();
      
      if (this.currentPackage) {
        this.currentPackage.survey = currentSurvey;
        showNotification('Survey imported from Survey Designer', 'success');
      }
    } catch (error) {
      console.error('Error importing survey:', error);
      showNotification('Failed to import survey from designer', 'error');
    }
  }

  private importMappingsFromInterface(): void {
    // This would get the current mappings from the Mapping Interface tab
    const mockMappings = this.mappingService.getMappings();
    
    if (this.currentPackage) {
      this.currentPackage.mappings = mockMappings;
      showNotification(`Imported ${mockMappings.length} mappings from Mapping Interface`, 'success');
    }
  }
}
