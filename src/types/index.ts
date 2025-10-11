// Core application types based on PRD specifications

export interface SurveyDefinition {
  title?: string;
  description?: string;
  pages?: any[];
  // Survey.js JSON format - will be extended as needed
  [key: string]: any;
}

export interface TemplateInfo {
  id: string;
  name: string;
  file: string;
  mapping: string;
}

export interface PackageConfiguration {
  id: string;
  name: string;
  description: string;
  templates: TemplateInfo[];
  survey: string;
  version: string;
  createdDate: string;
  createdBy: string;
  lastUpdated: string;
}

export interface MappingConfiguration {
  version: string;
  templateId: string;
  surveyId: string;
  mappings: FieldMapping[];
}

export interface FieldMapping {
  surveyField: string;
  templatePlaceholder: string;
  transform: 'allcaps' | null;
}

export interface IndexConfiguration {
  version: string;
  lastUpdated: string;
  packages: PackageReference[];
}

export interface PackageReference {
  id: string;
  configFile: string;
}

export interface DraftData {
  packageId: string;
  matterName: string;
  surveyData: Record<string, any>;
  lastSaved: string;
  progress: number;
}

// UI State types
export type AppMode = 'creator' | 'user';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  details?: string;
}