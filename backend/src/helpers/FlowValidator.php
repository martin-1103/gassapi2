<?php
namespace App\Helpers;

class FlowValidator {

    /**
     * Validate flow inputs definition
     */
    public static function validateFlowInputs($flowInputs) {
        $errors = [];

        if (!is_array($flowInputs)) {
            return ['flow_inputs must be an array'];
        }

        foreach ($flowInputs as $index => $input) {
            $inputErrors = self::validateSingleInput($input, $index);
            $errors = array_merge($errors, $inputErrors);
        }

        return $errors;
    }

    /**
     * Validate single input definition
     */
    private static function validateSingleInput($input, $index) {
        $errors = [];

        if (!is_array($input)) {
            return ["Input $index must be an object"];
        }

        // Check required fields
        if (empty($input['name'])) {
            $errors[] = "Input $index: name is required";
        }

        if (empty($input['type'])) {
            $errors[] = "Input $index: type is required";
        }

        // Validate name format
        if (!empty($input['name'])) {
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $input['name'])) {
                $errors[] = "Input $index: name must be a valid variable name (start with letter/underscore, only alphanumeric and underscore)";
            }
        }

        // Validate type
        if (!empty($input['type'])) {
            $validTypes = ['string', 'number', 'boolean', 'email', 'password', 'object', 'array', 'file', 'date', 'json'];
            if (!in_array($input['type'], $validTypes)) {
                $errors[] = "Input $index: type must be one of: " . implode(', ', $validTypes);
            }
        }

        // Validate validation rules if present
        if (isset($input['validation']) && is_array($input['validation'])) {
            $validationErrors = self::validateInputValidation($input['validation'], $input['type'], $index);
            $errors = array_merge($errors, $validationErrors);
        }

        return $errors;
    }

    /**
     * Validate input validation rules
     */
    private static function validateInputValidation($validation, $inputType, $inputIndex) {
        $errors = [];

        // Validate min_length
        if (isset($validation['min_length'])) {
            if (!is_int($validation['min_length']) || $validation['min_length'] < 0) {
                $errors[] = "Input $inputIndex: min_length must be a non-negative integer";
            }
            if (in_array($inputType, ['number', 'boolean', 'date']) && isset($validation['min_length'])) {
                $errors[] = "Input $inputIndex: min_length is not applicable for type $inputType";
            }
        }

        // Validate max_length
        if (isset($validation['max_length'])) {
            if (!is_int($validation['max_length']) || $validation['max_length'] <= 0) {
                $errors[] = "Input $inputIndex: max_length must be a positive integer";
            }
            if (in_array($inputType, ['number', 'boolean', 'date']) && isset($validation['max_length'])) {
                $errors[] = "Input $inputIndex: max_length is not applicable for type $inputType";
            }
        }

        // Validate min/max for numbers
        if ($inputType === 'number') {
            if (isset($validation['min']) && !is_numeric($validation['min'])) {
                $errors[] = "Input $inputIndex: min must be numeric for number type";
            }
            if (isset($validation['max']) && !is_numeric($validation['max'])) {
                $errors[] = "Input $inputIndex: max must be numeric for number type";
            }
            if (isset($validation['min']) && isset($validation['max']) && $validation['min'] > $validation['max']) {
                $errors[] = "Input $inputIndex: min cannot be greater than max";
            }
        }

        // Validate pattern for strings
        if ($inputType === 'string' && isset($validation['pattern'])) {
            if (@preg_match($validation['pattern'], '') === false) {
                $errors[] = "Input $inputIndex: pattern must be a valid regex";
            }
        }

        // Validate options
        if (isset($validation['options'])) {
            if (!is_array($validation['options'])) {
                $errors[] = "Input $inputIndex: options must be an array";
            } else {
                foreach ($validation['options'] as $optionIndex => $option) {
                    if (!is_string($option)) {
                        $errors[] = "Input $inputIndex: option $optionIndex must be a string";
                    }
                }
            }
        }

        return $errors;
    }

    /**
     * Validate variable references in flow data
     */
    public static function validateVariableReferences($data) {
        $errors = [];

        if (isset($data['steps']) && is_array($data['steps'])) {
            foreach ($data['steps'] as $stepIndex => $step) {
                $stepErrors = self::validateStepVariableReferences($step, $stepIndex);
                $errors = array_merge($errors, $stepErrors);
            }
        }

        
        return $errors;
    }

    /**
     * Validate variable references in a step
     */
    private static function validateStepVariableReferences($step, $stepIndex) {
        $errors = [];
        $allReferences = [];

        // Extract references from URL
        if (!empty($step['url'])) {
            $urlRefs = self::extractVariableReferences($step['url']);
            $allReferences = array_merge($allReferences, $urlRefs);
        }

        // Extract references from headers
        if (!empty($step['headers']) && is_array($step['headers'])) {
            foreach ($step['headers'] as $key => $value) {
                if (is_string($value)) {
                    $headerRefs = self::extractVariableReferences($value);
                    $allReferences = array_merge($allReferences, $headerRefs);
                }
            }
        }

        // Extract references from body
        if (!empty($step['body'])) {
            $bodyRefs = self::extractVariableReferencesFromArray($step['body']);
            $allReferences = array_merge($allReferences, $bodyRefs);
        }

        // Validate each reference format
        foreach ($allReferences as $ref) {
            $refErrors = self::validateSingleVariableReference($ref, $stepIndex);
            $errors = array_merge($errors, $refErrors);
        }

        return $errors;
    }

    /**
     * Extract variable references from string
     */
    private static function extractVariableReferences($string) {
        $references = [];

        if (preg_match_all('/\{\{([^}]+)\}\}/', $string, $matches)) {
            foreach ($matches[1] as $match) {
                $references[] = trim($match);
            }
        }

        return $references;
    }

    /**
     * Extract variable references from array recursively
     */
    private static function extractVariableReferencesFromArray($array) {
        $references = [];

        foreach ($array as $key => $value) {
            if (is_string($value)) {
                $refs = self::extractVariableReferences($value);
                $references = array_merge($references, $refs);
            } elseif (is_array($value)) {
                $refs = self::extractVariableReferencesFromArray($value);
                $references = array_merge($references, $refs);
            }
        }

        return $references;
    }

    /**
     * Validate single variable reference format
     */
    private static function validateSingleVariableReference($reference, $stepIndex) {
        $errors = [];

        if (empty($reference)) {
            $errors[] = "Step $stepIndex: Empty variable reference";
            return $errors;
        }

        // Check reference format: type.field
        if (!strpos($reference, '.')) {
            $errors[] = "Step $stepIndex: Invalid variable reference format '$reference'. Expected format: type.field";
            return $errors;
        }

        list($type, $field) = explode('.', $reference, 2);

        // Validate reference type
        $validTypes = ['input', 'env', 'headers'];
        if (!in_array($type, $validTypes)) {
            // Check if it's a step reference (should be stepId.fieldName)
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $type)) {
                $errors[] = "Step $stepIndex: Invalid reference type '$type'. Must be one of: " . implode(', ', $validTypes) . " or a valid step ID";
            }
        }

        // Validate field name
        if (empty($field)) {
            $errors[] = "Step $stepIndex: Empty field name in reference '$reference'";
        } elseif (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $field)) {
            $errors[] = "Step $stepIndex: Invalid field name '$field' in reference '$reference'";
        }

        return $errors;
    }

    /**
     * Validate flow configuration
     */
    public static function validateFlowConfig($config) {
        $errors = [];

        if (!is_array($config)) {
            return ['Configuration must be an object'];
        }

        // Validate delay
        if (isset($config['delay'])) {
            if (!is_int($config['delay']) || $config['delay'] < 0) {
                $errors[] = 'Delay must be a non-negative integer (milliseconds)';
            }
            if ($config['delay'] > 300000) { // 5 minutes max
                $errors[] = 'Delay cannot exceed 300000 milliseconds (5 minutes)';
            }
        }

        // Validate retryCount
        if (isset($config['retryCount'])) {
            if (!is_int($config['retryCount']) || $config['retryCount'] < 0) {
                $errors[] = 'Retry count must be a non-negative integer';
            }
            if ($config['retryCount'] > 10) {
                $errors[] = 'Retry count cannot exceed 10';
            }
        }

        // Validate parallel
        if (isset($config['parallel'])) {
            if (!is_bool($config['parallel'])) {
                $errors[] = 'Parallel must be a boolean';
            }
        }

        return $errors;
    }

    /**
     * Complete flow validation
     */
    public static function validateCompleteFlow($data) {
        $errors = [];

        // Validate basic structure
        if (!isset($data['version'])) {
            $errors[] = 'Version is required';
        }

        if (!isset($data['steps']) || !is_array($data['steps'])) {
            $errors[] = 'Steps array is required';
        } else {
            if (empty($data['steps'])) {
                $errors[] = 'At least one step is required';
            }
        }

        // Validate configuration
        if (isset($data['config'])) {
            $configErrors = self::validateFlowConfig($data['config']);
            $errors = array_merge($errors, $configErrors);
        }

        // Validate each step
        if (isset($data['steps'])) {
            foreach ($data['steps'] as $index => $step) {
                $stepErrors = self::validateStep($step, $index);
                $errors = array_merge($errors, $stepErrors);
            }
        }

        // Validate variable references
        $refErrors = self::validateVariableReferences($data);
        $errors = array_merge($errors, $refErrors);

        return $errors;
    }

    /**
     * Validate single step
     */
    private static function validateStep($step, $index) {
        $errors = [];

        if (!is_array($step)) {
            $errors[] = "Step $index must be an object";
            return $errors;
        }

        // Required fields
        if (empty($step['id'])) {
            $errors[] = "Step $index: id is required";
        } else {
            // Validate step ID format
            if (!preg_match('/^[a-zA-Z_][a-zA-Z0-9_]*$/', $step['id'])) {
                $errors[] = "Step $index: id must be a valid identifier (start with letter/underscore, only alphanumeric and underscore)";
            }
        }

        if (empty($step['method'])) {
            $errors[] = "Step $index: method is required";
        } else {
            $validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
            if (!in_array(strtoupper($step['method']), $validMethods)) {
                $errors[] = "Step $index: method must be one of: " . implode(', ', $validMethods);
            }
        }

        if (empty($step['url'])) {
            $errors[] = "Step $index: url is required";
        } else {
            // Basic URL validation
            if (!is_string($step['url'])) {
                $errors[] = "Step $index: url must be a string";
            } elseif (!preg_match('/^https?:\/\/|\{\{|^\//', $step['url'])) {
                $errors[] = "Step $index: url must start with http://, https://, /, or be a variable reference";
            }
        }

        return $errors;
    }
}