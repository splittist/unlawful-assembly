import { ExpressionEvaluator } from './expressionEvaluator';

/**
 * Manages visibility of pages and elements based on visibleIf expressions
 * Handles dependency tracking and automatic updates when variables change
 * 
 * Note: This is designed for simple form-based surveys (Phase 1).
 * It works with basic HTML forms and stores data in a data object.
 */
export class VisibilityManager {
  private variableDependencies: Map<string, Set<string>> = new Map(); // variable -> dependent element IDs
  private surveyData: Record<string, any> = {};
  private surveyDefinition: any;
  private formContainer: HTMLElement | null = null;

  constructor(surveyDefinition: any, formContainer?: HTMLElement) {
    this.surveyDefinition = surveyDefinition;
    this.formContainer = formContainer || null;
    this.buildDependencyMap();
  }

  /**
   * Build map of which elements depend on which variables
   * This enables efficient updates when only specific variables change
   */
  private buildDependencyMap(): void {
    this.variableDependencies.clear();

    // Check pages for visibleIf expressions
    if (this.surveyDefinition.pages) {
      this.surveyDefinition.pages.forEach((page: any, index: number) => {
        if (page.visibleIf) {
          const variables = ExpressionEvaluator.getReferencedVariables(page.visibleIf);
          variables.forEach((varName) => {
            if (!this.variableDependencies.has(varName)) {
              this.variableDependencies.set(varName, new Set());
            }
            this.variableDependencies.get(varName)!.add(`page:${index}`);
          });
        }

        // Check elements for visibleIf expressions
        if (page.elements) {
          page.elements.forEach((element: any) => {
            if (element.visibleIf) {
              const variables = ExpressionEvaluator.getReferencedVariables(element.visibleIf);
              variables.forEach((varName) => {
                if (!this.variableDependencies.has(varName)) {
                  this.variableDependencies.set(varName, new Set());
                }
                this.variableDependencies.get(varName)!.add(`element:${element.name}`);
              });
            }
          });
        }
      });
    }
  }

  /**
   * Set up event listeners for form field changes
   */
  setupFormWatching(formContainer: HTMLElement): void {
    this.formContainer = formContainer;

    // Listen for changes on all form inputs
    formContainer.addEventListener('change', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.name) {
        this.handleValueChange(target.name, this.getFieldValue(target.name));
      }
    });

    // Also listen for input events for real-time updates
    formContainer.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      if (target.name && (target.type === 'text' || target.type === 'textarea')) {
        this.handleValueChange(target.name, this.getFieldValue(target.name));
      }
    });
  }

  /**
   * Get the current value of a form field
   */
  private getFieldValue(fieldName: string): any {
    if (!this.formContainer) return undefined;

    const fields = this.formContainer.querySelectorAll(`[name="${fieldName}"]`);
    if (fields.length === 0) return undefined;

    // Handle radio buttons
    if ((fields[0] as HTMLInputElement).type === 'radio') {
      const checkedRadio = Array.from(fields).find(
        (field) => (field as HTMLInputElement).checked
      ) as HTMLInputElement;
      return checkedRadio ? checkedRadio.value : undefined;
    }

    // Handle checkboxes
    if ((fields[0] as HTMLInputElement).type === 'checkbox') {
      if (fields.length === 1) {
        // Single checkbox (boolean)
        return (fields[0] as HTMLInputElement).checked;
      } else {
        // Multiple checkboxes (array)
        const checkedValues = Array.from(fields)
          .filter((field) => (field as HTMLInputElement).checked)
          .map((field) => (field as HTMLInputElement).value);
        return checkedValues.length > 0 ? checkedValues : undefined;
      }
    }

    // Handle single field (text, select, etc.)
    const field = fields[0] as HTMLInputElement;
    return field.value || undefined;
  }

  /**
   * Handle a value change and update visibility
   */
  private handleValueChange(fieldName: string, value: any): void {
    // Update stored data
    this.surveyData[fieldName] = value;

    // Update visibility for dependent elements
    this.updateVisibility(fieldName);
  }

  /**
   * Update visibility for all elements that depend on a changed variable
   * @param changedVariable - Name of the variable that changed
   */
  private updateVisibility(changedVariable: string): void {
    const dependentElements = this.variableDependencies.get(changedVariable);
    if (!dependentElements) return;

    dependentElements.forEach((elementId) => {
      if (elementId.startsWith('page:')) {
        const pageIndex = parseInt(elementId.substring(5));
        this.updatePageVisibility(pageIndex);
      } else if (elementId.startsWith('element:')) {
        const elementName = elementId.substring(8);
        this.updateElementVisibility(elementName);
      }
    });
  }

  /**
   * Update visibility of a specific page
   */
  private updatePageVisibility(pageIndex: number): void {
    if (!this.formContainer || !this.surveyDefinition.pages) return;

    const page = this.surveyDefinition.pages[pageIndex];
    if (!page || !page.visibleIf) return;

    const shouldBeVisible = ExpressionEvaluator.evaluate(page.visibleIf, this.surveyData);
    const pageElement = this.formContainer.querySelector(`[data-page="${pageIndex}"]`);

    if (pageElement) {
      if (shouldBeVisible) {
        (pageElement as HTMLElement).style.display = '';
      } else {
        (pageElement as HTMLElement).style.display = 'none';
      }
    }
  }

  /**
   * Update visibility of a specific element
   */
  private updateElementVisibility(elementName: string): void {
    if (!this.formContainer) return;

    // Find the element in the survey definition
    let element: any = null;
    if (this.surveyDefinition.pages) {
      for (const page of this.surveyDefinition.pages) {
        if (page.elements) {
          element = page.elements.find((e: any) => e.name === elementName);
          if (element) break;
        }
      }
    }

    if (!element || !element.visibleIf) return;

    const shouldBeVisible = ExpressionEvaluator.evaluate(element.visibleIf, this.surveyData);

    // Find the form group containing this element
    const formGroup = this.formContainer.querySelector(`[name="${elementName}"]`)?.closest('.form-group');

    if (formGroup) {
      if (shouldBeVisible) {
        (formGroup as HTMLElement).style.display = '';
      } else {
        (formGroup as HTMLElement).style.display = 'none';
      }
    }
  }

  /**
   * Initialize visibility for all conditional elements
   * Should be called after form is rendered and before first user interaction
   */
  initializeVisibility(initialData?: Record<string, any>): void {
    // Set initial data if provided
    if (initialData) {
      this.surveyData = { ...initialData };
    }

    // Initialize page visibility
    if (this.surveyDefinition.pages) {
      this.surveyDefinition.pages.forEach((_page: any, index: number) => {
        this.updatePageVisibility(index);
      });
    }

    // Initialize element visibility
    if (this.surveyDefinition.pages) {
      this.surveyDefinition.pages.forEach((page: any) => {
        if (page.elements) {
          page.elements.forEach((element: any) => {
            if (element.visibleIf) {
              this.updateElementVisibility(element.name);
            }
          });
        }
      });
    }
  }

  /**
   * Rebuild dependency map when survey structure changes
   * Call this when pages or elements are added/removed/modified
   */
  rebuildDependencies(): void {
    this.buildDependencyMap();
  }

  /**
   * Update the survey definition (for use when editing in creator)
   */
  updateSurveyDefinition(surveyDefinition: any): void {
    this.surveyDefinition = surveyDefinition;
    this.rebuildDependencies();
  }
}
