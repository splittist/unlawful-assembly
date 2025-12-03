import type { SurveyDefinition } from '@/types';
import { SurveyModel } from 'survey-core';
import { renderSurvey } from 'survey-js-ui';

// Import Survey.js CSS for proper styling
import 'survey-core/defaultV2.min.css';

/**
 * Survey.js Runtime integration service
 * Handles survey rendering and data collection for users and preview mode
 * Uses full Survey.js integration for form rendering with all features
 */
export class SurveyRuntimeService {
  private container: HTMLElement | null = null;
  private onCompleteCallback: ((data: Record<string, unknown>) => void) | null = null;
  private surveyModel: SurveyModel | null = null;

  /**
   * Initialize the Survey.js runtime
   * @param container - HTML element to render the survey in
   * @param surveyJson - Survey definition to render
   * @param onComplete - Optional callback when survey is completed (ignored in preview mode)
   * @param mode - 'user' for normal completion mode, 'preview' for read-only preview mode
   */
  initialize(
    container: HTMLElement,
    surveyJson: SurveyDefinition,
    onComplete?: (data: Record<string, unknown>) => void,
    mode: 'user' | 'preview' = 'user'
  ): void {
    this.container = container;
    this.onCompleteCallback = onComplete || null;

    // Create Survey.js model from the JSON definition
    this.surveyModel = new SurveyModel(surveyJson);

    // Configure survey based on mode
    if (mode === 'preview') {
      // Preview mode: display-only, no submission
      this.surveyModel.mode = 'display';
      this.surveyModel.showNavigationButtons = false;
      this.surveyModel.showCompletedPage = false;
    } else {
      // User mode: enable completion and navigation
      this.surveyModel.showNavigationButtons = true;
      this.surveyModel.showCompletedPage = false; // We handle completion ourselves

      // Set up completion handler
      this.surveyModel.onComplete.add((sender) => {
        const data = sender.data;
        console.log('Survey completed with data:', data);

        if (this.onCompleteCallback) {
          this.onCompleteCallback(data);
        } else {
          this.showCompletionMessage(data);
        }
      });
    }

    // Render the survey using Survey.js UI
    renderSurvey(this.surveyModel, container);
  }

  /**
   * Show completion message (used when no completion callback is provided)
   */
  private showCompletionMessage(data: Record<string, unknown>): void {
    if (this.container) {
      this.container.innerHTML = `
        <div class="bg-white shadow rounded-lg p-6">
          <div class="text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 class="mt-4 text-lg font-medium text-gray-900">Survey Completed!</h3>
            <p class="mt-2 text-sm text-gray-600">Your responses have been recorded.</p>
            
            <div class="mt-6 bg-gray-50 rounded-lg p-4">
              <h4 class="text-sm font-medium text-gray-900 mb-2">Your Responses:</h4>
              <div class="text-left space-y-1">
                ${Object.entries(data)
                  .map(
                    ([key, value]) => `
                  <div class="text-sm">
                    <span class="font-medium text-gray-700">${key}:</span> 
                    <span class="text-gray-600">${Array.isArray(value) ? value.join(', ') : String(value)}</span>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
            
            <div class="mt-6">
              <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Start Over
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Get current survey data from the Survey.js model
   */
  getCurrentData(): Record<string, unknown> {
    if (!this.surveyModel) return {};
    return this.surveyModel.data;
  }

  /**
   * Load data into the survey
   */
  loadData(data: Record<string, unknown>): void {
    if (this.surveyModel) {
      this.surveyModel.data = data;
    }
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.surveyModel) {
      this.surveyModel.dispose();
      this.surveyModel = null;
    }
    this.container = null;
    this.onCompleteCallback = null;
  }
}