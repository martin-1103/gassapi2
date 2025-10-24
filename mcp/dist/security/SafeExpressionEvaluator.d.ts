/**
 * Safe Expression Evaluator
 * Evaluates JavaScript expressions in a sandboxed environment
 */
export declare class SafeExpressionEvaluator {
    private static readonly ALLOWED_GLOBALS;
    private static readonly MAX_EXPRESSION_LENGTH;
    private static readonly MAX_EXECUTION_TIME;
    /**
     * Evaluate a JavaScript expression safely
     */
    static evaluate(expression: string, context?: Record<string, any>): any;
    /**
     * Validate expression before evaluation
     */
    private static validateExpression;
    /**
     * Sanitize expression to remove dangerous constructs
     */
    private static sanitizeExpression;
    /**
     * Create safe evaluation context
     */
    private static createSafeContext;
    /**
     * Check if context key is valid
     */
    private static isValidContextKey;
    /**
     * Sanitize context value
     */
    private static sanitizeContextValue;
    /**
     * Evaluate expression with timeout
     */
    private static evaluateWithTimeout;
    /**
     * Test expression for syntax validity
     */
    static testExpression(expression: string): {
        isValid: boolean;
        error?: string;
    };
    /**
     * Get allowed functions and variables
     */
    static getAllowedGlobals(): string[];
}
//# sourceMappingURL=SafeExpressionEvaluator.d.ts.map