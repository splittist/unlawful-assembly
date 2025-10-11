import type {
  SurveyDefinition,
  PackageConfiguration,
  MappingConfiguration,
  IndexConfiguration,
} from '@/types';

/**
 * File loading service for handling JSON files from the expected folder structure
 * Handles local filesystem loading (for development) with proper error handling
 */
export class FileLoaderService {
  private basePath: string;

  constructor(basePath: string = '') {
    this.basePath = basePath;
  }

  /**
   * Load the main index/catalog configuration
   */
  async loadIndex(): Promise<IndexConfiguration> {
    try {
      const response = await fetch(`${this.basePath}/config.json`);
      if (!response.ok) {
        throw new Error(`Failed to load config.json: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading index configuration:', error);
      throw new Error('Could not load package catalog. Please ensure config.json exists in the root directory.');
    }
  }

  /**
   * Load a specific survey JSON file
   */
  async loadSurvey(surveyPath: string): Promise<SurveyDefinition> {
    try {
      const response = await fetch(`${this.basePath}${surveyPath}`);
      if (!response.ok) {
        throw new Error(`Failed to load survey: ${response.status} ${response.statusText}`);
      }
      const survey = await response.json();
      
      // Basic validation
      if (!survey || typeof survey !== 'object') {
        throw new Error('Invalid survey format');
      }
      
      return survey;
    } catch (error) {
      console.error('Error loading survey:', error);
      throw new Error(`Could not load survey from ${surveyPath}. Please check the file exists and is valid JSON.`);
    }
  }

  /**
   * Load a specific package configuration
   */
  async loadPackage(packagePath: string): Promise<PackageConfiguration> {
    try {
      const response = await fetch(`${this.basePath}${packagePath}`);
      if (!response.ok) {
        throw new Error(`Failed to load package: ${response.status} ${response.statusText}`);
      }
      const pkg = await response.json();
      
      // Basic validation
      if (!pkg?.id || !pkg?.name || !Array.isArray(pkg?.templates)) {
        throw new Error('Invalid package format');
      }
      
      return pkg;
    } catch (error) {
      console.error('Error loading package:', error);
      throw new Error(`Could not load package from ${packagePath}. Please check the file exists and is valid.`);
    }
  }

  /**
   * Load a mapping configuration
   */
  async loadMapping(mappingPath: string): Promise<MappingConfiguration> {
    try {
      const response = await fetch(`${this.basePath}${mappingPath}`);
      if (!response.ok) {
        throw new Error(`Failed to load mapping: ${response.status} ${response.statusText}`);
      }
      const mapping = await response.json();
      
      // Basic validation
      if (!mapping?.version || !mapping?.templateId || !Array.isArray(mapping?.mappings)) {
        throw new Error('Invalid mapping format');
      }
      
      return mapping;
    } catch (error) {
      console.error('Error loading mapping:', error);
      throw new Error(`Could not load mapping from ${mappingPath}. Please check the file exists and is valid.`);
    }
  }

  /**
   * Load available surveys from the surveys directory
   */
  async loadAvailableSurveys(): Promise<string[]> {
    try {
      // For now, return a mock list - this would be expanded to read directory contents
      // In a real SharePoint environment, this would query the surveys folder
      return [
        './surveys/employment-survey-v1.json',
        './surveys/nda-survey-v1.json',
      ];
    } catch (error) {
      console.error('Error loading available surveys:', error);
      return [];
    }
  }

  /**
   * Load available templates from the templates directory
   */
  async loadAvailableTemplates(): Promise<string[]> {
    try {
      // For now, return a mock list - this would be expanded to read directory contents
      return [
        './templates/employment-agreement-v1.docx',
        './templates/offer-letter-v1.docx',
        './templates/nda-mutual-v1.docx',
        './templates/nda-oneway-v1.docx',
      ];
    } catch (error) {
      console.error('Error loading available templates:', error);
      return [];
    }
  }

  /**
   * Check if a file exists
   */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.basePath}${filePath}`, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Validate that all required files for a package exist
   */
  async validatePackageFiles(pkg: PackageConfiguration): Promise<{ isValid: boolean; missingFiles: string[] }> {
    const missingFiles: string[] = [];
    
    // Check survey file
    if (!(await this.fileExists(pkg.survey))) {
      missingFiles.push(pkg.survey);
    }
    
    // Check all template and mapping files
    for (const template of pkg.templates) {
      if (!(await this.fileExists(template.file))) {
        missingFiles.push(template.file);
      }
      if (!(await this.fileExists(template.mapping))) {
        missingFiles.push(template.mapping);
      }
    }
    
    return {
      isValid: missingFiles.length === 0,
      missingFiles,
    };
  }
}

/**
 * Local storage service for draft management
 */
export class LocalStorageService {
  private static readonly DRAFT_PREFIX = 'docassembly_draft_';

  /**
   * Save a draft to localStorage
   */
  static saveDraft(packageId: string, draftData: any): string {
    const timestamp = Date.now();
    const key = `${this.DRAFT_PREFIX}${packageId}_${timestamp}`;
    
    const draft = {
      ...draftData,
      lastSaved: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(draft));
      return key;
    } catch (error) {
      console.error('Error saving draft:', error);
      throw new Error('Could not save draft. Storage may be full.');
    }
  }

  /**
   * Load a draft from localStorage
   */
  static loadDraft(key: string): any {
    try {
      const draft = localStorage.getItem(key);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  /**
   * Delete a draft from localStorage
   */
  static deleteDraft(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Get all existing drafts
   */
  static getAllDrafts(): Array<{ key: string; data: any }> {
    const drafts: Array<{ key: string; data: any }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.DRAFT_PREFIX)) {
        const data = this.loadDraft(key);
        if (data) {
          drafts.push({ key, data });
        }
      }
    }
    
    return drafts.sort((a, b) => 
      new Date(b.data.lastSaved).getTime() - new Date(a.data.lastSaved).getTime()
    );
  }

  /**
   * Clear all drafts
   */
  static clearAllDrafts(): void {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.DRAFT_PREFIX)) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
  }
}