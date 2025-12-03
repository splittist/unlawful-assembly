import './style.css';
import { FieldMappingService } from '@/services/fieldMapping';
import { SurveyCreatorService } from '@/services/surveyCreator';
import {
  SurveyDesignerComponent,
  TemplateManagerComponent,
  MappingInterfaceComponent,
  PackageDefinitionComponent
} from '@/components/creator';

/**
 * Creator interface main entry point
 * This orchestrates the Survey.js Creator interface for designing questionnaires
 */
class CreatorApp {
  private container: HTMLElement;
  private mappingService: FieldMappingService;
  private surveyCreatorService: SurveyCreatorService;
  
  // UI Components
  private surveyDesignerComponent: SurveyDesignerComponent;
  private templateManagerComponent: TemplateManagerComponent;
  private mappingInterfaceComponent: MappingInterfaceComponent;
  private packageDefinitionComponent: PackageDefinitionComponent;

  constructor() {
    this.container = document.querySelector<HTMLDivElement>('#creator-app')!;
    this.mappingService = new FieldMappingService();
    this.surveyCreatorService = new SurveyCreatorService();
    
    // Initialize UI components
    this.surveyDesignerComponent = new SurveyDesignerComponent(this.surveyCreatorService);
    this.templateManagerComponent = new TemplateManagerComponent(this.surveyCreatorService);
    this.mappingInterfaceComponent = new MappingInterfaceComponent(
      this.mappingService,
      this.surveyCreatorService,
      this.templateManagerComponent
    );
    this.packageDefinitionComponent = new PackageDefinitionComponent(
      this.mappingService,
      this.surveyCreatorService,
      this.templateManagerComponent
    );
    
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
        this.surveyDesignerComponent.render(container);
        break;
      case 'template':
        this.templateManagerComponent.render(container);
        break;
      case 'mapping':
        this.mappingInterfaceComponent.render(container);
        break;
      case 'package':
        this.packageDefinitionComponent.render(container);
        break;
      default:
        container.innerHTML = '<p>Tab not implemented yet</p>';
    }
  }
}

// Initialize the creator app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CreatorApp();
});
