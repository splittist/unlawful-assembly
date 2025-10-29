import { FieldMappingService } from '@/services/fieldMapping';
import { showNotification, getTypeColor } from './uiUtils';

/**
 * Mapping Interface UI Component
 * Handles the mapping between survey fields and template placeholders
 */
export class MappingInterfaceComponent {
  private mappingService: FieldMappingService;

  constructor(mappingService: FieldMappingService) {
    this.mappingService = mappingService;
  }

  public render(container: HTMLElement): void {
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
        showNotification(`Applied ${appliedCount} automatic mappings`, 'success');
      } else {
        showNotification('No high-confidence mappings found', 'warning');
      }
    });

    // Clear all mappings
    clearBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all mappings?')) {
        this.mappingService.clearMappings();
        this.refreshMappingInterface(container);
        showNotification('All mappings cleared', 'info');
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

      showNotification('Survey and template data loaded successfully', 'success');

    } catch (error) {
      console.error('Error loading mapping data:', error);
      showNotification('Failed to load mapping data', 'error');
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
          <span class="text-xs px-2 py-1 rounded ${getTypeColor(placeholder.type)}">${placeholder.type}</span>
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
            showNotification(`Mapped ${surveyField} → ${placeholder}`, 'success');
          } catch (error) {
            showNotification(`Error creating mapping: ${error}`, 'error');
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
                <span class="text-xs px-2 py-1 rounded ${getTypeColor(mapping.placeholderType)}">${mapping.placeholderType}</span>
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
              showNotification(`Applied suggestion: ${surveyField} → ${placeholder}`, 'success');
            } catch (error) {
              showNotification(`Error applying suggestion: ${error}`, 'error');
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
    
    showNotification('Mappings exported successfully', 'success');
  }

  private async importMappings(file: File, container: HTMLElement): Promise<void> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const importedCount = this.mappingService.importMappings(data);
      this.refreshMappingInterface(container);
      
      showNotification(`Imported ${importedCount} mappings from ${file.name}`, 'success');
      
    } catch (error) {
      console.error('Error importing mappings:', error);
      showNotification('Failed to import mappings. Please check file format.', 'error');
    }
  }

}
