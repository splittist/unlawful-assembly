import './style.css';
import { DomUtils } from '@/utils/common';

/**
 * User interface main entry point
 * This will be the main interface for filling out surveys and generating documents
 */
class UserApp {
  private container: HTMLElement;

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
        <h2 class="text-3xl font-bold text-gray-900">Select Document Package</h2>
        <p class="mt-4 text-lg text-gray-600">Choose a document package to generate legal documents</p>
      </div>

      <div id="packages-container" class="space-y-6">
        <!-- Sample packages for demonstration -->
        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <h3 class="text-xl font-semibold text-gray-900">Employment Agreement Package</h3>
          <p class="mt-2 text-gray-600">Generate employment agreements and offer letters for new hires</p>
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              <span>2 templates • Updated Oct 11, 2025</span>
            </div>
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors" disabled>
              Start (Coming Soon)
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <h3 class="text-xl font-semibold text-gray-900">NDA Package</h3>
          <p class="mt-2 text-gray-600">Generate mutual or one-way non-disclosure agreements</p>
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              <span>2 templates • Updated Oct 10, 2025</span>
            </div>
            <button class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors" disabled>
              Start (Coming Soon)
            </button>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
          <h3 class="text-xl font-semibold text-gray-900">Test Survey Package (Phase 1)</h3>
          <p class="mt-2 text-gray-600">Demo survey for testing Phase 1 deliverable - loads sample employment survey</p>
          <div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-gray-500">
              <span>Sample survey • Phase 1 Demo</span>
            </div>
            <button id="test-survey-btn" class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Test Survey Loading
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private setupPackageSelection(): void {
    // Set up the test survey button
    const testBtn = this.container.querySelector('#test-survey-btn');
    testBtn?.addEventListener('click', () => {
      this.loadTestSurvey();
    });
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