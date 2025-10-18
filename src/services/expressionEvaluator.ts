/**
 * Simple expression evaluator for visibleIf conditions
 * Supports: {variable}, !{variable}, {variable} == value, {variable} != value
 */
export class ExpressionEvaluator {
  /**
   * Evaluate a visibleIf expression against current survey variables
   * @param expression - The visibleIf expression string
   * @param variables - Current survey response data
   * @returns true if element should be visible, false otherwise
   */
  static evaluate(expression: string | undefined, variables: Record<string, any>): boolean {
    if (!expression || !expression.trim()) {
      return true; // Default to visible
    }

    try {
      return this.evaluateExpression(expression.trim(), variables);
    } catch (error) {
      console.error('Error evaluating expression:', expression, error);
      return true; // Default to visible on error
    }
  }

  /**
   * Parse and evaluate a single expression
   */
  private static evaluateExpression(expression: string, variables: Record<string, any>): boolean {
    // Simple variable reference: {variable_name}
    const simpleMatch = expression.match(/^\{(\w+)\}$/);
    if (simpleMatch) {
      const varName = simpleMatch[1];
      return this.isTruthy(variables[varName]);
    }

    // Negated variable: !{variable_name}
    const negatedMatch = expression.match(/^!\{(\w+)\}$/);
    if (negatedMatch) {
      const varName = negatedMatch[1];
      return !this.isTruthy(variables[varName]);
    }

    // Equality comparison: {variable} == value
    const equalityMatch = expression.match(/^\{(\w+)\}\s*==\s*(.+)$/);
    if (equalityMatch) {
      const [, varName, value] = equalityMatch;
      return this.compareValues(variables[varName], this.parseValue(value), '==');
    }

    // Inequality comparison: {variable} != value
    const inequalityMatch = expression.match(/^\{(\w+)\}\s*!=\s*(.+)$/);
    if (inequalityMatch) {
      const [, varName, value] = inequalityMatch;
      return this.compareValues(variables[varName], this.parseValue(value), '!=');
    }

    console.warn('Unsupported expression format:', expression);
    return true;
  }

  /**
   * Determine if a value should be considered truthy for visibility
   */
  private static isTruthy(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  }

  /**
   * Parse a string value into appropriate type
   */
  private static parseValue(valueStr: string): any {
    const trimmed = valueStr.trim();

    // Boolean values
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;

    // Null/undefined
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;

    // Numbers
    if (/^-?\d+$/.test(trimmed)) {
      return parseInt(trimmed, 10);
    }
    if (/^-?\d*\.\d+$/.test(trimmed)) {
      return parseFloat(trimmed);
    }

    // Quoted strings
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }

    // Unquoted string
    return trimmed;
  }

  /**
   * Compare two values using the specified operator
   * Uses loose equality (==) intentionally to handle type coercion for user convenience.
   * This allows expressions like {age} == 18 to work whether age is "18" or 18.
   */
  private static compareValues(left: any, right: any, operator: '==' | '!='): boolean {
    switch (operator) {
      case '==':
        return left == right; // Intentional loose equality for type coercion
      case '!=':
        return left != right; // Intentional loose inequality for type coercion
      default:
        return false;
    }
  }

  /**
   * Extract variable names referenced in an expression
   * @param expression - The visibleIf expression
   * @returns Array of variable names referenced in the expression
   */
  static getReferencedVariables(expression: string | undefined): string[] {
    if (!expression) return [];

    const matches = expression.match(/\{(\w+)\}/g);
    if (!matches) return [];

    return matches.map((match) => match.slice(1, -1)); // Remove { }
  }
}
