import './style.css';
import { DomUtils } from '@/utils/common';

/**
 * Creator interface main entry point
 * This will be the Survey.js Creator interface for designing questionnaires
 */
class CreatorApp {
  private container: HTMLElement;

  constructor() {
    this.container = document.querySelector<HTMLDivElement>('#creator-app')!;
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
          <p class="mt-1 text-sm text-gray-600">Instructions for creating DOCX templates with placeholders</p>
        </div>
        <div class="p-6">
          <div class="prose max-w-none">
            <h3>Template Creation Guide</h3>
            <p>Create DOCX templates using the following placeholder syntax:</p>
            <ul>
              <li><code>{fieldName}</code> - Simple field replacement</li>
              <li><code>{#if field}...{/if}</code> - Conditional content</li>
              <li><code>{#loop}...{/loop}</code> - Repeating sections</li>
            </ul>
            <p><strong>File naming:</strong> Use format <code>template-[name]-v[version].docx</code></p>
            <p><strong>Upload location:</strong> Place templates in the <code>/templates/</code> folder</p>
          </div>
        </div>
      </div>
    `;
  }

  private renderMappingInterface(container: HTMLElement): void {
    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Mapping Interface</h2>
          <p class="mt-1 text-sm text-gray-600">Map survey fields to template placeholders</p>
        </div>
        <div class="p-6">
          <div class="text-center py-12 text-gray-500">
            Mapping interface will be implemented in Phase 2
          </div>
        </div>
      </div>
    `;
  }

  private renderPackageDefinition(container: HTMLElement): void {
    container.innerHTML = `
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Package Definition</h2>
          <p class="mt-1 text-sm text-gray-600">Bundle surveys and templates into document packages</p>
        </div>
        <div class="p-6">
          <div class="text-center py-12 text-gray-500">
            Package definition interface will be implemented in Phase 2
          </div>
        </div>
      </div>
    `;
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