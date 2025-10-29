import type { DocxPlaceholder } from './docxParser';

/**
 * Interface for a field mapping between survey and template
 */
export interface FieldMapping {
  id: string;
  surveyField: string;
  placeholder: string;
  placeholderType: 'simple' | 'conditional' | 'loop';
  isRequired: boolean;
  isValid: boolean;
  confidence?: number; // Auto-suggestion confidence score
  notes?: string;
}

/**
 * Interface for mapping validation results
 */
export interface MappingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  mappedCount: number;
  requiredCount: number;
  completeness: number; // Percentage of required fields mapped
}

/**
 * Interface for auto-suggestion result
 */
export interface MappingSuggestion {
  surveyField: string;
  placeholder: string;
  confidence: number;
  reason: string;
}

/**
 * Field Mapping Service
 * Handles connections between survey questions and DOCX template placeholders
 */
export class FieldMappingService {
  private mappings: Map<string, FieldMapping> = new Map();
  private surveyFields: string[] = [];
  private placeholders: DocxPlaceholder[] = [];

  /**
   * Initialize the service with survey fields and placeholders
   */
  initialize(surveyFields: string[], placeholders: DocxPlaceholder[]): void {
    this.surveyFields = surveyFields;
    this.placeholders = placeholders;
    this.mappings.clear();
    
    console.log(`Initialized mapping service with ${surveyFields.length} survey fields and ${placeholders.length} placeholders`);
  }

  /**
   * Create a field mapping
   */
  createMapping(surveyField: string, placeholder: string): string {
    const mappingId = this.generateMappingId(surveyField, placeholder);
    
    const placeholderObj = this.placeholders.find(p => p.name === placeholder);
    if (!placeholderObj) {
      throw new Error(`Placeholder "${placeholder}" not found`);
    }

    if (!this.surveyFields.includes(surveyField)) {
      throw new Error(`Survey field "${surveyField}" not found`);
    }

    const mapping: FieldMapping = {
      id: mappingId,
      surveyField,
      placeholder,
      placeholderType: placeholderObj.type,
      isRequired: placeholderObj.isRequired || placeholderObj.type === 'simple',
      isValid: true,
      confidence: 1.0
    };

    this.mappings.set(mappingId, mapping);
    console.log(`Created mapping: ${surveyField} → ${placeholder}`);
    
    return mappingId;
  }

  /**
   * Remove a field mapping
   */
  removeMapping(mappingId: string): boolean {
    return this.mappings.delete(mappingId);
  }

  /**
   * Update mapping notes
   */
  updateMappingNotes(mappingId: string, notes: string): boolean {
    const mapping = this.mappings.get(mappingId);
    if (mapping) {
      mapping.notes = notes;
      return true;
    }
    return false;
  }

  /**
   * Get all current mappings
   */
  getMappings(): FieldMapping[] {
    return Array.from(this.mappings.values());
  }

  /**
   * Get mapping by ID
   */
  getMapping(mappingId: string): FieldMapping | undefined {
    return this.mappings.get(mappingId);
  }

  /**
   * Get mappings for a specific survey field
   */
  getMappingsForSurveyField(surveyField: string): FieldMapping[] {
    return this.getMappings().filter(m => m.surveyField === surveyField);
  }

  /**
   * Get mappings for a specific placeholder
   */
  getMappingsForPlaceholder(placeholder: string): FieldMapping[] {
    return this.getMappings().filter(m => m.placeholder === placeholder);
  }

  /**
   * Generate automatic mapping suggestions using field name similarity
   */
  generateSuggestions(): MappingSuggestion[] {
    const suggestions: MappingSuggestion[] = [];
    const alreadyMapped = new Set(this.getMappings().map(m => m.placeholder));

    for (const placeholder of this.placeholders) {
      // Skip if already mapped
      if (alreadyMapped.has(placeholder.name)) {
        continue;
      }

      // Skip non-simple placeholders for auto-suggestion
      if (placeholder.type !== 'simple') {
        continue;
      }

      const bestMatch = this.findBestFieldMatch(placeholder.name);
      if (bestMatch) {
        suggestions.push({
          surveyField: bestMatch.field,
          placeholder: placeholder.name,
          confidence: bestMatch.confidence,
          reason: bestMatch.reason
        });
      }
    }

    // Sort by confidence descending
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Apply automatic suggestions with minimum confidence threshold
   */
  applySuggestions(minConfidence: number = 0.8): number {
    const suggestions = this.generateSuggestions().filter(s => s.confidence >= minConfidence);
    let appliedCount = 0;

    for (const suggestion of suggestions) {
      try {
        // Check if survey field is already mapped
        const existingMappings = this.getMappingsForSurveyField(suggestion.surveyField);
        if (existingMappings.length === 0) {
          this.createMapping(suggestion.surveyField, suggestion.placeholder);
          appliedCount++;
        }
      } catch (error) {
        console.warn(`Failed to apply suggestion: ${error}`);
      }
    }

    console.log(`Applied ${appliedCount} automatic suggestions`);
    return appliedCount;
  }

  /**
   * Validate all current mappings
   */
  validateMappings(): MappingValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    const mappings = this.getMappings();
    
    // Check for duplicate survey field mappings
    const surveyFieldCounts = new Map<string, number>();
    for (const mapping of mappings) {
      const count = surveyFieldCounts.get(mapping.surveyField) || 0;
      surveyFieldCounts.set(mapping.surveyField, count + 1);
    }

    for (const [field, count] of surveyFieldCounts) {
      if (count > 1) {
        warnings.push(`Survey field "${field}" is mapped to multiple placeholders`);
      }
    }

    // Check for duplicate placeholder mappings
    const placeholderCounts = new Map<string, number>();
    for (const mapping of mappings) {
      const count = placeholderCounts.get(mapping.placeholder) || 0;
      placeholderCounts.set(mapping.placeholder, count + 1);
    }

    for (const [placeholder, count] of placeholderCounts) {
      if (count > 1) {
        errors.push(`Placeholder "${placeholder}" is mapped to multiple survey fields`);
      }
    }

    // Check for unmapped required placeholders
    const mappedPlaceholders = new Set(mappings.map(m => m.placeholder));
    const requiredPlaceholders = this.placeholders.filter(p => p.isRequired || p.type === 'simple');
    
    for (const placeholder of requiredPlaceholders) {
      if (!mappedPlaceholders.has(placeholder.name)) {
        errors.push(`Required placeholder "${placeholder.name}" is not mapped`);
      }
    }

    // Calculate completeness
    const requiredCount = requiredPlaceholders.length;
    const mappedRequiredCount = requiredPlaceholders.filter(p => mappedPlaceholders.has(p.name)).length;
    const completeness = requiredCount > 0 ? (mappedRequiredCount / requiredCount) * 100 : 100;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      mappedCount: mappings.length,
      requiredCount,
      completeness: Math.round(completeness)
    };
  }

  /**
   * Export mappings as JSON
   */
  exportMappings(): object {
    return {
      version: '1.0',
      createdAt: new Date().toISOString(),
      surveyFields: this.surveyFields,
      placeholders: this.placeholders.map(p => ({
        name: p.name,
        type: p.type,
        isRequired: p.isRequired
      })),
      mappings: this.getMappings().map(m => ({
        surveyField: m.surveyField,
        placeholder: m.placeholder,
        placeholderType: m.placeholderType,
        isRequired: m.isRequired,
        notes: m.notes
      }))
    };
  }

  /**
   * Import mappings from JSON
   */
  importMappings(data: any): number {
    if (!data.mappings || !Array.isArray(data.mappings)) {
      throw new Error('Invalid mapping data format');
    }

    this.mappings.clear();
    let importedCount = 0;

    for (const mappingData of data.mappings) {
      try {
        // Validate that fields exist
        if (this.surveyFields.includes(mappingData.surveyField) &&
            this.placeholders.some(p => p.name === mappingData.placeholder)) {
          
          const mappingId = this.createMapping(mappingData.surveyField, mappingData.placeholder);
          
          if (mappingData.notes) {
            this.updateMappingNotes(mappingId, mappingData.notes);
          }
          
          importedCount++;
        }
      } catch (error) {
        console.warn(`Failed to import mapping: ${error}`);
      }
    }

    console.log(`Imported ${importedCount} mappings`);
    return importedCount;
  }

  /**
   * Clear all mappings
   */
  clearMappings(): void {
    this.mappings.clear();
  }

  /**
   * Get statistics about current mappings
   */
  getStatistics(): {
    totalMappings: number;
    byType: Record<string, number>;
    unmappedSurveyFields: number;
    unmappedPlaceholders: number;
    completeness: number;
  } {
    const mappings = this.getMappings();
    const mappedSurveyFields = new Set(mappings.map(m => m.surveyField));
    const mappedPlaceholders = new Set(mappings.map(m => m.placeholder));
    
    const byType = {
      simple: 0,
      conditional: 0,
      loop: 0
    };

    mappings.forEach(m => {
      byType[m.placeholderType]++;
    });

    const validation = this.validateMappings();

    return {
      totalMappings: mappings.length,
      byType,
      unmappedSurveyFields: this.surveyFields.length - mappedSurveyFields.size,
      unmappedPlaceholders: this.placeholders.length - mappedPlaceholders.size,
      completeness: validation.completeness
    };
  }

  /**
   * Find best matching survey field for a placeholder
   */
  private findBestFieldMatch(placeholderName: string): { field: string; confidence: number; reason: string } | null {
    const placeholder = placeholderName.toLowerCase();
    let bestMatch = { field: '', confidence: 0, reason: '' };

    for (const surveyField of this.surveyFields) {
      const field = surveyField.toLowerCase();
      let confidence = 0;
      let reason = '';

      // Exact match
      if (field === placeholder) {
        confidence = 1.0;
        reason = 'Exact name match';
      }
      // Field contains placeholder or vice versa
      else if (field.includes(placeholder) || placeholder.includes(field)) {
        confidence = 0.9;
        reason = 'Partial name match';
      }
      // Similar words (split by underscore/camelCase)
      else {
        const fieldWords = this.splitFieldName(field);
        const placeholderWords = this.splitFieldName(placeholder);
        
        const commonWords = fieldWords.filter(word => placeholderWords.includes(word));
        if (commonWords.length > 0) {
          confidence = (commonWords.length / Math.max(fieldWords.length, placeholderWords.length)) * 0.8;
          reason = `Common words: ${commonWords.join(', ')}`;
        }
      }

      if (confidence > bestMatch.confidence) {
        bestMatch = { field: surveyField, confidence, reason };
      }
    }

    return bestMatch.confidence > 0.5 ? bestMatch : null;
  }

  /**
   * Split field name into words for comparison
   */
  private splitFieldName(name: string): string[] {
    return name
      .replace(/[_-]/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1); // Filter out single characters
  }

  /**
   * Generate unique mapping ID
   */
  private generateMappingId(surveyField: string, placeholder: string): string {
    return `${surveyField}_to_${placeholder}_${Date.now()}`;
  }
}