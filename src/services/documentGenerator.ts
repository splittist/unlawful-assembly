import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import type { PackageContent } from './packageService';
import type { FieldMapping } from './fieldMapping';

/**
 * Document Generation Service
 * Handles the complete pipeline for generating documents from survey responses,
 * field mappings, and DOCX templates using docxtemplater
 */
export class DocumentGeneratorService {
  /**
   * Generate document from survey responses and package content
   */
  static async generateDocument(
    surveyResponses: Record<string, any>,
    packageContent: PackageContent,
    templateFilename?: string
  ): Promise<void> {
    try {
      console.log('Starting document generation...', {
        responses: surveyResponses,
        packageTitle: packageContent.metadata.title,
        templateFilename
      });

      // Validate inputs
      if (!surveyResponses || Object.keys(surveyResponses).length === 0) {
        throw new Error('Survey responses are required for document generation');
      }

      if (!packageContent.template) {
        throw new Error('Package must contain a template for document generation');
      }

      if (!packageContent.mappings || packageContent.mappings.length === 0) {
        throw new Error('Package must contain field mappings for document generation');
      }

      // Transform survey responses using field mappings
      const templateData = this.transformResponsesToTemplateData(
        surveyResponses,
        packageContent.mappings
      );

      console.log('Transformed template data:', templateData);

      // Generate document using docxtemplater
      const generatedDocument = await this.processTemplate(
        packageContent.template.content,
        templateData
      );

      // Save the generated document
      const filename = this.generateFilename(
        packageContent.metadata.title,
        templateFilename || packageContent.template.filename
      );

      this.saveDocument(generatedDocument, filename);

      console.log('Document generated successfully:', filename);

    } catch (error) {
      console.error('Error generating document:', error);
      throw new Error(`Failed to generate document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform survey responses to template data using field mappings
   */
  private static transformResponsesToTemplateData(
    surveyResponses: Record<string, any>,
    fieldMappings: FieldMapping[]
  ): Record<string, any> {
    const templateData: Record<string, any> = {};

    // Apply field mappings to transform survey responses
    for (const mapping of fieldMappings) {
      const surveyValue = surveyResponses[mapping.surveyField];
      
      if (surveyValue !== undefined && surveyValue !== null) {
        // Transform the value based on data type
        const transformedValue = this.transformValue(surveyValue);
        // Use placeholder name (without braces) as template field
        const fieldName = mapping.placeholder.replace(/[{}]/g, '');
        templateData[fieldName] = transformedValue;
      } else {
        // Handle missing values
        console.warn(`Survey response missing for field: ${mapping.surveyField}`);
        const fieldName = mapping.placeholder.replace(/[{}]/g, '');
        templateData[fieldName] = '';
      }
    }

    // Add metadata and generated fields
    templateData['_generated_date'] = new Date().toLocaleDateString();
    templateData['_generated_time'] = new Date().toLocaleTimeString();
    templateData['_generated_datetime'] = new Date().toLocaleString();

    return templateData;
  }

  /**
   * Transform individual values for template processing
   */
  private static transformValue(value: any): any {
    // Handle array values (like multi-select checkboxes)
    if (Array.isArray(value)) {
      // Join array values with commas for document templates
      return value.length > 0 ? value.join(', ') : '';
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    // Handle date values
    if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
      const date = value instanceof Date ? value : new Date(value);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }

    // Handle number values - format as currency if it looks like money
    if (typeof value === 'number') {
      // Simple heuristic: if it's a whole number > 1000, might be salary
      if (Number.isInteger(value) && value > 1000) {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      }
      return value.toString();
    }

    // Default: return as string, handle null/undefined
    return value != null ? String(value) : '';
  }



  /**
   * Process DOCX template with data using docxtemplater
   */
  private static async processTemplate(
    templateBuffer: ArrayBuffer,
    templateData: Record<string, any>
  ): Promise<ArrayBuffer> {
    try {
      // Load template with PizZip
      const zip = new PizZip(templateBuffer);

      // Create docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        errorLogging: true
      });

      console.log('Template loaded, rendering with data...');

      // Render the document with data
      doc.render(templateData);

      // Generate the final document
      const buffer = doc.getZip().generate({
        type: 'arraybuffer',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      return buffer;

    } catch (error) {
      console.error('Error processing template:', error);
      
      // Provide detailed error information for docxtemplater errors
      if (error instanceof Error) {
        if ('properties' in error) {
          const docxError = error as any;
          throw new Error(`Template processing error: ${docxError.message}. Details: ${JSON.stringify(docxError.properties)}`);
        }
      }
      
      throw new Error(`Failed to process template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate filename for the output document
   */
  private static generateFilename(packageTitle: string, originalFilename: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const baseName = packageTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const extension = originalFilename.split('.').pop() || 'docx';
    
    return `${baseName}_${timestamp}.${extension}`;
  }

  /**
   * Save the generated document to user's computer
   */
  private static saveDocument(documentBuffer: ArrayBuffer, filename: string): void {
    try {
      const blob = new Blob([documentBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      saveAs(blob, filename);
      console.log('Document saved:', filename);
      
    } catch (error) {
      console.error('Error saving document:', error);
      throw new Error(`Failed to save document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate that all required template fields have corresponding survey responses
   */
  static validateTemplateData(
    surveyResponses: Record<string, any>,
    fieldMappings: FieldMapping[]
  ): { isValid: boolean; missingFields: string[]; warnings: string[] } {
    const missingFields: string[] = [];
    const warnings: string[] = [];

    for (const mapping of fieldMappings) {
      const surveyValue = surveyResponses[mapping.surveyField];
      
      if (mapping.isRequired && (surveyValue === undefined || surveyValue === null || surveyValue === '')) {
        missingFields.push(mapping.surveyField);
      }
      
      if (!mapping.isRequired && (surveyValue === undefined || surveyValue === null)) {
        warnings.push(`Optional field '${mapping.surveyField}' is empty, using default value`);
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
      warnings
    };
  }

  /**
   * Get preview of template data transformation
   */
  static getTemplateDataPreview(
    surveyResponses: Record<string, any>,
    fieldMappings: FieldMapping[]
  ): Record<string, any> {
    return this.transformResponsesToTemplateData(surveyResponses, fieldMappings);
  }
}