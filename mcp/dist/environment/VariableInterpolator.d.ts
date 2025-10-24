/**
 * Variable Interpolator
 * Handles variable substitution in strings, objects, and templates
 */
export declare class VariableInterpolator {
    private static readonly VARIABLE_REGEX;
    private static readonly ALLOWED_GLOBALS;
    /**
     * Interpolate variables in a string
     */
    static interpolate(text: string, variables: Record<string, any>): string;
    /**
     * Interpolate variables in an object recursively
     */
    static interpolateObject(obj: any, variables: Record<string, any>): any;
    /**
     * Interpolate variables in request body
     */
    static interpolateBody(body: any, variables: Record<string, any>): any;
    /**
     * Interpolate variables in URL
     */
    static interpolateUrl(url: string, variables: Record<string, any>): string;
    /**
     * Interpolate variables in headers
     */
    static interpolateHeaders(headers: Record<string, string>, variables: Record<string, any>): Record<string, string>;
    /**
     * Evaluate a JavaScript expression safely
     */
    static evaluateExpression(expression: string, context: Record<string, any>): any;
    /**
     * Sanitize JavaScript expression to prevent dangerous operations
     */
    private static sanitizeExpression;
    /**
     * Validate variable name
     */
    static isValidVariableName(name: string): boolean;
    /**
     * Extract variable names from template
     */
    static extractVariables(template: string): string[];
    /**
     * Check if template contains variables
     */
    static hasVariables(template: string): boolean;
    /**
     * Validate interpolation context
     */
    static validateContext(variables: Record<string, any>): {
        isValid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=VariableInterpolator.d.ts.map