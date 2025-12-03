import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import type { SurveyDefinition } from '@/types';
import type { DocxPlaceholder } from './docxParser';
import type { FieldMapping } from './fieldMapping';

/**
 * Interface for package metadata
 */
export interface PackageMetadata {
  id: string;
  title: string;
  description: string;
  version: string;
  author: string;
  created: string;
  modified: string;
  tags: string[];
}

/**
 * Interface for a single template with its content and metadata
 */
export interface TemplateEntry {
  id: string;
  filename: string;
  content: ArrayBuffer;
  placeholders: DocxPlaceholder[];
}

/**
 * Interface for per-template field mappings
 */
export interface TemplateMappings {
  templateId: string;
  mappings: FieldMapping[];
}

/**
 * Interface for package content
 */
export interface PackageContent {
  metadata: PackageMetadata;
  survey: SurveyDefinition;
  /** @deprecated Use templates array instead. Kept for backward compatibility. */
  template?: {
    filename: string;
    content: ArrayBuffer;
    placeholders: DocxPlaceholder[];
  };
  /** Array of templates in the package */
  templates: TemplateEntry[];
  /** @deprecated Use templateMappings array instead. Kept for backward compatibility. */
  mappings: FieldMapping[];
  /** Per-template mappings */
  templateMappings: TemplateMappings[];
  readme?: string;
}

/**
 * Interface for package validation results
 */
export interface PackageValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  completeness: number;
}

/**
 * Package creation and management service
 * Handles bundling surveys, templates, and mappings into distributable packages
 */
export class PackageService {
  
  /**
   * Create a new package with default metadata
   */
  static createPackage(title: string): PackageContent {
    const timestamp = new Date().toISOString();
    
    return {
      metadata: {
        id: this.generatePackageId(),
        title: title || 'Untitled Package',
        description: '',
        version: '1.0.0',
        author: '',
        created: timestamp,
        modified: timestamp,
        tags: []
      },
      survey: {
        title: 'New Survey',
        description: '',
        pages: [{
          name: 'page1',
          elements: []
        }]
      },
      templates: [],
      mappings: [],
      templateMappings: [],
      readme: this.generateDefaultReadme()
    };
  }

  /**
   * Validate a package before export
   */
  static validatePackage(packageContent: PackageContent): PackageValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validate metadata
    if (!packageContent.metadata.title.trim()) {
      errors.push('Package title is required');
    }

    if (!packageContent.metadata.version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
    }

    // Validate survey
    if (!packageContent.survey.title?.trim()) {
      errors.push('Survey title is required');
    }

    if (!packageContent.survey.pages || packageContent.survey.pages.length === 0) {
      errors.push('Survey must have at least one page');
    }

    const hasQuestions = packageContent.survey.pages?.some(page => 
      page.elements && page.elements.length > 0
    );

    if (!hasQuestions) {
      errors.push('Survey must have at least one question');
    }

    // Validate templates (new multi-template support)
    const hasTemplates = packageContent.templates && packageContent.templates.length > 0;
    const hasLegacyTemplate = !!packageContent.template;

    if (hasTemplates) {
      for (const template of packageContent.templates) {
        if (!template.filename?.endsWith('.docx')) {
          errors.push(`Template "${template.id}" file must be a .docx format`);
        }

        if (!template.content || template.content.byteLength === 0) {
          errors.push(`Template "${template.id}" file content is missing or empty`);
        }

        if (template.placeholders.length === 0) {
          warnings.push(`Template "${template.filename}" contains no placeholders - document generation may not work as expected`);
        }
      }
    } else if (hasLegacyTemplate) {
      // Legacy single template validation
      if (!packageContent.template!.filename?.endsWith('.docx')) {
        errors.push('Template file must be a .docx format');
      }

      if (!packageContent.template!.content || packageContent.template!.content.byteLength === 0) {
        errors.push('Template file content is missing or empty');
      }

      if (packageContent.template!.placeholders.length === 0) {
        warnings.push('Template contains no placeholders - document generation may not work as expected');
      }
    } else {
      warnings.push('No template file included - package will only contain survey');
    }

    // Validate mappings
    const hasTemplateMappings = packageContent.templateMappings && packageContent.templateMappings.length > 0;
    const hasLegacyMappings = packageContent.mappings && packageContent.mappings.length > 0;

    // Create a Map for O(1) lookup of template mappings by templateId
    const templateMappingsMap = new Map<string, TemplateMappings>();
    if (hasTemplateMappings) {
      for (const tm of packageContent.templateMappings) {
        templateMappingsMap.set(tm.templateId, tm);
      }
    }

    if (hasTemplates) {
      // Validate per-template mappings
      for (const template of packageContent.templates) {
        const templateMapping = templateMappingsMap.get(template.id);
        if (!templateMapping || templateMapping.mappings.length === 0) {
          warnings.push(`No field mappings defined for template "${template.filename}" - documents cannot be generated without mappings`);
        }
      }
    } else if (hasLegacyTemplate && !hasLegacyMappings) {
      warnings.push('No field mappings defined - documents cannot be generated without mappings');
    }

    // Check mapping completeness
    let completeness = 0;
    if (hasTemplates && hasTemplateMappings) {
      let totalRequired = 0;
      let totalMapped = 0;

      for (const template of packageContent.templates) {
        const templateMapping = templateMappingsMap.get(template.id);
        const requiredPlaceholders = template.placeholders.filter(p => p.isRequired || p.type === 'simple');
        const mappedPlaceholders = templateMapping?.mappings.map(m => m.placeholder) || [];
        const mappedRequiredCount = requiredPlaceholders.filter(p => mappedPlaceholders.includes(p.name)).length;
        
        totalRequired += requiredPlaceholders.length;
        totalMapped += mappedRequiredCount;
      }

      if (totalRequired > 0) {
        completeness = (totalMapped / totalRequired) * 100;
        if (completeness < 100) {
          warnings.push(`Only ${Math.round(completeness)}% of required placeholders are mapped across all templates`);
        }
      }
    } else if (hasLegacyTemplate && packageContent.template) {
      // Legacy completeness calculation
      const requiredPlaceholders = packageContent.template.placeholders.filter(p => p.isRequired || p.type === 'simple');
      const mappedPlaceholders = packageContent.mappings.map(m => m.placeholder);
      const mappedRequiredCount = requiredPlaceholders.filter(p => mappedPlaceholders.includes(p.name)).length;
      
      if (requiredPlaceholders.length > 0) {
        completeness = (mappedRequiredCount / requiredPlaceholders.length) * 100;
        
        if (completeness < 100) {
          warnings.push(`Only ${Math.round(completeness)}% of required placeholders are mapped`);
        }
      }
    }

    // Suggestions
    if (!packageContent.metadata.description.trim()) {
      suggestions.push('Add a description to help users understand the package purpose');
    }

    if (!packageContent.metadata.author.trim()) {
      suggestions.push('Add author information for package attribution');
    }

    if (packageContent.metadata.tags.length === 0) {
      suggestions.push('Add tags to improve package discoverability');
    }

    if (!packageContent.readme || packageContent.readme.trim().length < 100) {
      suggestions.push('Add a detailed README with usage instructions');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      completeness: Math.round(completeness)
    };
  }

  /**
   * Export package as ZIP file
   */
  static async exportPackage(packageContent: PackageContent, filename?: string): Promise<void> {
    try {
      // Validate before export
      const validation = this.validatePackage(packageContent);
      if (!validation.isValid) {
        throw new Error(`Package validation failed: ${validation.errors.join(', ')}`);
      }

      // Create ZIP file
      const zip = new PizZip();

      // Add package metadata
      const hasMultipleTemplates = packageContent.templates && packageContent.templates.length > 0;
      zip.file('package.json', JSON.stringify({
        name: packageContent.metadata.id,
        title: packageContent.metadata.title,
        description: packageContent.metadata.description,
        version: packageContent.metadata.version,
        author: packageContent.metadata.author,
        created: packageContent.metadata.created,
        modified: new Date().toISOString(),
        tags: packageContent.metadata.tags,
        type: 'document-assembly-package',
        generator: 'Document Assembly Creator v2.0',
        multiTemplate: hasMultipleTemplates
      }, null, 2));

      // Add survey definition
      zip.file('survey.json', JSON.stringify(packageContent.survey, null, 2));

      // Add multiple templates (new format)
      if (hasMultipleTemplates) {
        for (const template of packageContent.templates) {
          zip.file(`templates/${template.id}/${template.filename}`, template.content);
          
          // Add template analysis per template
          zip.file(`templates/${template.id}/analysis.json`, JSON.stringify({
            id: template.id,
            filename: template.filename,
            placeholders: template.placeholders,
            analyzedAt: new Date().toISOString()
          }, null, 2));
        }

        // Add per-template mappings
        if (packageContent.templateMappings && packageContent.templateMappings.length > 0) {
          zip.file('template-mappings.json', JSON.stringify({
            version: '2.0',
            createdAt: new Date().toISOString(),
            templateMappings: packageContent.templateMappings
          }, null, 2));
        }
      }

      // Add legacy template file (for backward compatibility)
      if (packageContent.template) {
        zip.file(`template/${packageContent.template.filename}`, packageContent.template.content);
        
        // Add template analysis
        zip.file('template/analysis.json', JSON.stringify({
          filename: packageContent.template.filename,
          placeholders: packageContent.template.placeholders,
          analyzedAt: new Date().toISOString()
        }, null, 2));
      }

      // Add legacy field mappings (for backward compatibility)
      zip.file('mappings.json', JSON.stringify({
        version: '1.0',
        createdAt: new Date().toISOString(),
        mappings: packageContent.mappings
      }, null, 2));

      // Add README
      if (packageContent.readme) {
        zip.file('README.md', packageContent.readme);
      }

      // Add validation report
      zip.file('validation-report.json', JSON.stringify(validation, null, 2));

      // Generate ZIP blob and download
      const zipBlob = zip.generate({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 6
        }
      });

      const exportFilename = filename || `${packageContent.metadata.id}-v${packageContent.metadata.version}.zip`;
      saveAs(zipBlob, exportFilename);

      console.log(`Package exported successfully: ${exportFilename}`);

    } catch (error) {
      console.error('Error exporting package:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Import package from ZIP file
   */
  static async importPackage(file: File): Promise<PackageContent> {
    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith('.zip')) {
        throw new Error('Package file must be a .zip format');
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('Package file size must be less than 50MB');
      }

      // Read ZIP file
      const arrayBuffer = await file.arrayBuffer();
      const zip = new PizZip(arrayBuffer);

      // Extract package metadata
      const packageJsonFile = zip.file('package.json');
      if (!packageJsonFile) {
        throw new Error('Invalid package: missing package.json');
      }

      const packageJson = JSON.parse(packageJsonFile.asText());
      
      // Validate package type
      if (packageJson.type !== 'document-assembly-package') {
        throw new Error('Invalid package type - this is not a document assembly package');
      }

      // Extract survey
      const surveyFile = zip.file('survey.json');
      if (!surveyFile) {
        throw new Error('Invalid package: missing survey.json');
      }

      const survey = JSON.parse(surveyFile.asText());

      // Extract multiple templates (new format)
      const templates: TemplateEntry[] = [];
      const templatesFolder = zip.file(/^templates\//);
      if (templatesFolder.length > 0) {
        // Get unique template IDs from folder structure
        const templateIds = new Set<string>();
        for (const file of templatesFolder) {
          const match = file.name.match(/^templates\/([^/]+)\//);
          if (match) {
            templateIds.add(match[1]);
          }
        }

        for (const templateId of templateIds) {
          const templateDir = `templates/${templateId}/`;
          const docxFiles = zip.file(new RegExp(`^${templateDir}.*\\.docx$`));
          const analysisFile = zip.file(`${templateDir}analysis.json`);
          
          if (docxFiles.length > 0 && analysisFile) {
            const analysis = JSON.parse(analysisFile.asText());
            templates.push({
              id: analysis.id || templateId,
              filename: analysis.filename,
              content: docxFiles[0].asArrayBuffer(),
              placeholders: analysis.placeholders || []
            });
          }
        }
      }

      // Extract legacy template (if exists) for backward compatibility
      let template;
      const legacyTemplateFiles = zip.file(/^template\//);
      if (legacyTemplateFiles.length > 0) {
        const docxFile = legacyTemplateFiles.find(f => f.name.endsWith('.docx'));
        const analysisFile = zip.file('template/analysis.json');
        
        if (docxFile && analysisFile) {
          const analysis = JSON.parse(analysisFile.asText());
          template = {
            filename: analysis.filename,
            content: docxFile.asArrayBuffer(),
            placeholders: analysis.placeholders
          };
        }
      }

      // Extract per-template mappings (new format)
      let templateMappings: TemplateMappings[] = [];
      const templateMappingsFile = zip.file('template-mappings.json');
      if (templateMappingsFile) {
        const mappingsData = JSON.parse(templateMappingsFile.asText());
        templateMappings = mappingsData.templateMappings || [];
      }

      // Extract legacy mappings
      let mappings: FieldMapping[] = [];
      const mappingsFile = zip.file('mappings.json');
      if (mappingsFile) {
        const mappingsData = JSON.parse(mappingsFile.asText());
        mappings = mappingsData.mappings || [];
      }

      // Extract README
      let readme = '';
      const readmeFile = zip.file('README.md');
      if (readmeFile) {
        readme = readmeFile.asText();
      }

      // Construct package content
      const packageContent: PackageContent = {
        metadata: {
          id: packageJson.name,
          title: packageJson.title,
          description: packageJson.description || '',
          version: packageJson.version,
          author: packageJson.author || '',
          created: packageJson.created,
          modified: new Date().toISOString(),
          tags: packageJson.tags || []
        },
        survey,
        templates,
        template,
        templateMappings,
        mappings,
        readme
      };

      console.log(`Package imported successfully: ${packageContent.metadata.title}`);
      return packageContent;

    } catch (error) {
      console.error('Error importing package:', error);
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate package statistics
   */
  static getPackageStats(packageContent: PackageContent): {
    surveyQuestions: number;
    templatePlaceholders: number;
    templateCount: number;
    activeMappings: number;
    completeness: number;
    estimatedSize: string;
  } {
    const surveyQuestions = packageContent.survey.pages?.reduce((count, page) => 
      count + (page.elements?.length || 0), 0) || 0;

    // Count placeholders across all templates
    let templatePlaceholders = 0;
    let templateCount = 0;
    let templateSize = 0;

    if (packageContent.templates && packageContent.templates.length > 0) {
      templateCount = packageContent.templates.length;
      templatePlaceholders = packageContent.templates.reduce(
        (count, t) => count + (t.placeholders?.length || 0), 0
      );
      templateSize = packageContent.templates.reduce(
        (size, t) => size + (t.content?.byteLength || 0), 0
      );
    } else if (packageContent.template) {
      templateCount = 1;
      templatePlaceholders = packageContent.template.placeholders?.length || 0;
      templateSize = packageContent.template.content?.byteLength || 0;
    }

    // Count all mappings
    let activeMappings = packageContent.mappings?.length || 0;
    if (packageContent.templateMappings && packageContent.templateMappings.length > 0) {
      activeMappings += packageContent.templateMappings.reduce(
        (count, tm) => count + (tm.mappings?.length || 0), 0
      );
    }
    
    const validation = this.validatePackage(packageContent);
    
    // Estimate package size (rough calculation)
    const surveySize = JSON.stringify(packageContent.survey).length;
    const mappingsSize = JSON.stringify(packageContent.mappings || []).length +
                        JSON.stringify(packageContent.templateMappings || []).length;
    const metadataSize = 1024; // Approximate metadata overhead
    
    const totalBytes = surveySize + mappingsSize + templateSize + metadataSize;
    const estimatedSize = this.formatFileSize(totalBytes);

    return {
      surveyQuestions,
      templatePlaceholders,
      templateCount,
      activeMappings,
      completeness: validation.completeness,
      estimatedSize
    };
  }

  /**
   * Generate a unique package ID
   */
  private static generatePackageId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `pkg_${timestamp}_${random}`;
  }

  /**
   * Generate default README content
   */
  private static generateDefaultReadme(): string {
    return `# Document Assembly Package

## Overview
This package contains a survey and document template for automated document generation.

## Contents
- **Survey Definition**: Interactive questionnaire for data collection
- **Document Template**: DOCX template with placeholders for data insertion
- **Field Mappings**: Connections between survey responses and template fields

## Usage
1. Load this package in the Document Assembly application
2. Complete the survey to provide data
3. Generate personalized documents using the template

## Requirements
- Document Assembly application v2.0 or higher
- Modern web browser with JavaScript enabled

---
Generated by Document Assembly Creator
`;
  }

  /**
   * Format file size for display
   */
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}