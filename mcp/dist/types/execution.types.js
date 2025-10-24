/**
 * GASSAPI MCP Direct Execution Types
 * Type definitions for direct HTTP and flow execution
 */
/**
 * Execution Error
 */
export class ExecutionError extends Error {
    constructor(message, code, statusCode, cause, context) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.cause = cause;
        this.context = context;
        this.name = 'ExecutionError';
    }
}
/**
 * Error Codes
 */
export var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes["NETWORK_ERROR"] = "NETWORK_ERROR";
    ErrorCodes["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ErrorCodes["SSL_ERROR"] = "SSL_ERROR";
    ErrorCodes["DNS_ERROR"] = "DNS_ERROR";
    ErrorCodes["INVALID_URL"] = "INVALID_URL";
    ErrorCodes["INVALID_METHOD"] = "INVALID_METHOD";
    ErrorCodes["INVALID_HEADERS"] = "INVALID_HEADERS";
    ErrorCodes["INVALID_BODY"] = "INVALID_BODY";
    ErrorCodes["VARIABLE_INTERPOLATION_ERROR"] = "VARIABLE_INTERPOLATION_ERROR";
    ErrorCodes["FLOW_VALIDATION_ERROR"] = "FLOW_VALIDATION_ERROR";
    ErrorCodes["FLOW_CIRCULAR_DEPENDENCY"] = "FLOW_CIRCULAR_DEPENDENCY";
    ErrorCodes["FLOW_TIMEOUT"] = "FLOW_TIMEOUT";
    ErrorCodes["CONDITION_EVALUATION_ERROR"] = "CONDITION_EVALUATION_ERROR";
    ErrorCodes["UNSAFE_EXPRESSION"] = "UNSAFE_EXPRESSION";
})(ErrorCodes || (ErrorCodes = {}));
//# sourceMappingURL=execution.types.js.map