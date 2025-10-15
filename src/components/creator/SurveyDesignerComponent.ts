import { DomUtils } from '@/utils/common';
import { SurveyCreatorService } from '@/services/surveyCreator';
import { showNotification } from './uiUtils';

/**
 * Survey Designer UI Component
 * Handles the survey creation and editing interface
 */
export class SurveyDesignerComponent {
  private surveyCreatorService: SurveyCreatorService;

  constructor(surveyCreatorService: SurveyCreatorService) {
    this.surveyCreatorService = surveyCreatorService;
  }

  /**
   * Render the survey designer UI
   */
  public render(container: HTMLElement): void {
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

    this.setupEvents(container);
  }

  /**
   * Set up event handlers for the survey designer
   */
  private setupEvents(container: HTMLElement): void {
    const newSurveyBtn = container.querySelector('#new-survey-btn');
    const loadSurveyInput = container.querySelector('#load-survey-input') as HTMLInputElement;
    const previewBtn = container.querySelector('#preview-survey-btn');
    const downloadBtn = container.querySelector('#download-survey-btn');
    const creatorContainer = container.querySelector('#survey-creator-container')!;

    // Initialize the SurveyCreatorService with the container
    this.surveyCreatorService.initialize(creatorContainer as HTMLElement);

    // Enable buttons now that service is initialized
    if (previewBtn) {
      (previewBtn as HTMLButtonElement).disabled = false;
      previewBtn.classList.remove('bg-gray-300', 'text-gray-700');
      previewBtn.classList.add('bg-green-600', 'text-white', 'hover:bg-green-700');
    }
    if (downloadBtn) {
      (downloadBtn as HTMLButtonElement).disabled = false;
    }

    newSurveyBtn?.addEventListener('click', () => {
      this.createNewSurvey();
    });

    loadSurveyInput?.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.loadSurveyFile(file);
      }
    });

    // Add a button to test loading the sample survey
    const loadSampleBtn = DomUtils.createElement('button', 
      'bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium ml-3',
      'Load Sample Survey'
    );
    loadSampleBtn.addEventListener('click', () => {
      this.loadSampleSurvey();
    });
    container.querySelector('.mb-6')?.appendChild(loadSampleBtn);

    previewBtn?.addEventListener('click', () => {
      this.previewSurvey();
    });

    downloadBtn?.addEventListener('click', () => {
      this.downloadSurvey();
    });
  }

  /**
   * Create a new survey
   */
  private createNewSurvey(): void {
    try {
      this.surveyCreatorService.createNewSurvey();
      showNotification('New survey created', 'success');
    } catch (error) {
      console.error('Error creating new survey:', error);
      showNotification('Failed to create new survey', 'error');
    }
  }

  /**
   * Load survey from file
   */
  private async loadSurveyFile(file: File): Promise<void> {
    try {
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      });

      const survey = JSON.parse(content);
      this.surveyCreatorService.loadSurvey(survey);
      showNotification(`Survey loaded: ${survey.title || file.name}`, 'success');
    } catch (error) {
      console.error('Error loading survey file:', error);
      showNotification('Failed to load survey file. Please check the file format.', 'error');
    }
  }

  /**
   * Preview the current survey
   */
  private previewSurvey(): void {
    try {
      this.surveyCreatorService.showPreview();
    } catch (error) {
      console.error('Error showing preview:', error);
      showNotification('Preview functionality is provided by the Survey Designer interface', 'info');
    }
  }

  /**
   * Download the current survey as JSON
   */
  private downloadSurvey(): void {
    try {
      this.surveyCreatorService.downloadSurvey();
      showNotification('Survey downloaded successfully', 'success');
    } catch (error) {
      console.error('Error downloading survey:', error);
      showNotification(`Failed to download survey: ${error}`, 'error');
    }
  }

  /**
   * Load a sample survey for testing
   */
  private async loadSampleSurvey(): Promise<void> {
    try {
      const response = await fetch('/surveys/employment-survey.json');
      if (!response.ok) {
        throw new Error('Failed to load sample survey');
      }
      const survey = await response.json();
      
      this.surveyCreatorService.loadSurvey(survey);
      showNotification('Sample survey loaded successfully', 'success');
      
      console.log('Phase 2 Deliverable: Successfully loaded survey using SurveyCreatorService!');
      
    } catch (error) {
      console.error('Error loading sample survey:', error);
      showNotification('Failed to load sample survey', 'error');
    }
  }
}
