# AI Error Handling Guidelines for Flow Creation

## 🚨 Error Handling Mandat

AI/LLM WAJIB memahami dan mengimplementasikan error handling berikut saat membuat flow:

## 📋 Error Categories

### 1. **Critical Errors (Must Handle)**
```javascript
// AI harus mengenali dan memperbaiki:
- Invalid flow structure
- Missing required fields
- Invalid variable references
- Circular dependencies
- Invalid HTTP methods/URLs
```

### 2. **Warning Errors (Should Address)**
```javascript
// AI harus memberikan warning:
- Unused flow inputs
- Potential performance issues
- Missing outputs in steps
- Incomplete error handling
```

### 3. **Info Errors (Good Practice)**
```javascript
// AI harus memberikan saran:
- Optimization opportunities
- Security recommendations
- Best practice suggestions
```

## 🔍 Error Detection Algorithms

### Algorithm 1: Structure Validation
```javascript
function validateFlowStructure(flow) {
  const errors = [];

  // Critical checks
  if (!flow.name) {
    errors.push({
      type: "critical",
      code: "MISSING_NAME",
      message: "Flow name is required",
      field: "name",
      severity: "error"
    });
  }

  if (!flow.flow_data) {
    errors.push({
      type: "critical",
      code: "MISSING_FLOW_DATA",
      message: "flow_data is required",
      field: "flow_data",
      severity: "error"
    });
  }

  // Check flow_data structure
  if (flow.flow_data) {
    if (flow.flow_data.version !== "1.0") {
      errors.push({
        type: "critical",
        code: "INVALID_VERSION",
        message: "flow_data.version must be '1.0'",
        field: "flow_data.version",
        severity: "error",
        suggestion: "Set flow_data.version to '1.0'"
      });
    }

    if (!Array.isArray(flow.flow_data.steps)) {
      errors.push({
        type: "critical",
        code: "INVALID_STEPS",
        message: "flow_data.steps must be an array",
        field: "flow_data.steps",
        severity: "error"
      });
    }
  }

  return errors;
}
```

### Algorithm 2: Step Validation
```javascript
function validateSteps(steps) {
  const errors = [];
  const stepIds = new Set();

  steps.forEach((step, index) => {
    // Check required fields
    const requiredFields = ['id', 'name', 'method', 'url'];
    requiredFields.forEach(field => {
      if (!step[field]) {
        errors.push({
          type: "critical",
          code: "MISSING_REQUIRED_FIELD",
          message: `Step ${index}: Missing required field '${field}'`,
          step: index,
          field: field,
          severity: "error"
        });
      }
    });

    // Validate ID format and uniqueness
    if (step.id) {
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(step.id)) {
        errors.push({
          type: "critical",
          code: "INVALID_ID_FORMAT",
          message: `Step ${index}: Invalid ID format '${step.id}'. Use [a-zA-Z_][a-zA-Z0-9_]*`,
          step: index,
          field: "id",
          severity: "error",
          example: "register_user, getUserData"
        });
      }

      if (stepIds.has(step.id)) {
        errors.push({
          type: "critical",
          code: "DUPLICATE_ID",
          message: `Step ${index}: Duplicate ID '${step.id}'`,
          step: index,
          field: "id",
          severity: "error",
          suggestion: "Use unique step IDs"
        });
      }
      stepIds.add(step.id);
    }

    // Validate HTTP method
    if (step.method && !["GET", "POST", "PUT", "DELETE", "PATCH"].includes(step.method)) {
      errors.push({
        type: "critical",
        code: "INVALID_HTTP_METHOD",
        message: `Step ${index}: Invalid HTTP method '${step.method}'`,
        step: index,
        field: "method",
        severity: "error",
        allowed_methods: ["GET", "POST", "PUT", "DELETE", "PATCH"]
      });
    }

    // Validate URL
    if (step.url && !isValidUrl(step.url)) {
      errors.push({
        type: "critical",
        code: "INVALID_URL",
        message: `Step ${index}: Invalid URL '${step.url}'`,
        step: index,
        field: "url",
        severity: "error",
        suggestion: "Use valid HTTP/HTTPS URL or template variable"
      });
    }
  });

  return errors;
}
```

### Algorithm 3: Variable Reference Validation
```javascript
function validateVariableReferences(flow) {
  const errors = [];
  const stepIds = flow.flow_data.steps.map(s => s.id);
  const inputNames = flow.flow_inputs?.map(input => input.name) || [];

  flow.flow_data.steps.forEach((step, stepIndex) => {
    const references = extractVariableReferences(step);

    references.forEach(ref => {
      const [type, field] = ref.split('.');

      // Validate reference format
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(type)) {
        errors.push({
          type: "critical",
          code: "INVALID_REFERENCE_TYPE",
          message: `Step ${stepIndex}: Invalid reference type '${type}' in '${ref}'`,
          step: stepIndex,
          field: "variable_reference",
          severity: "error",
          reference: ref,
          suggestion: "Use valid type: input, env, headers, or stepId"
        });
        return;
      }

      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
        errors.push({
          type: "critical",
          code: "INVALID_REFERENCE_FIELD",
          message: `Step ${stepIndex}: Invalid field name '${field}' in '${ref}'`,
          step: stepIndex,
          field: "variable_reference",
          severity: "error",
          reference: ref,
          suggestion: "Use valid field name: [a-zA-Z_][a-zA-Z0-9_]*"
        });
        return;
      }

      // Validate input references
      if (type === 'input') {
        if (!inputNames.includes(field)) {
          errors.push({
            type: "error",
            code: "INPUT_FIELD_NOT_FOUND",
            message: `Step ${stepIndex}: Input field '${field}' not found in flow_inputs`,
            step: stepIndex,
            field: "flow_inputs",
            severity: "error",
            reference: ref,
            available_inputs: inputNames,
            suggestion: `Add '${field}' to flow_inputs or fix reference`
          });
        }
      }

      // Validate step references
      if (type !== 'input' && type !== 'env' && type !== 'headers') {
        if (!stepIds.includes(type)) {
          errors.push({
            type: "critical",
            code: "STEP_NOT_FOUND",
            message: `Step ${stepIndex}: Step '${type}' not found in flow`,
            step: stepIndex,
            field: "variable_reference",
            severity: "error",
            reference: ref,
            available_steps: stepIds,
            suggestion: `Use existing step ID or fix reference`
          });
        }
      }

      // Check for circular dependencies
      if (type === step.id) {
        errors.push({
          type: "critical",
          code: "CIRCULAR_DEPENDENCY",
          message: `Step ${stepIndex}: Circular dependency detected - step '${step.id}' references itself`,
          step: stepIndex,
          field: "variable_reference",
          severity: "error",
          reference: ref,
          suggestion: "Remove circular reference or restructure flow"
        });
      }
    });
  });

  return errors;
}
```

## ⚠️ Error Resolution Strategies

### Strategy 1: Auto-Fix Common Issues
```javascript
function autoFixErrors(flow, errors) {
  const fixedFlow = JSON.parse(JSON.stringify(flow));

  errors.forEach(error => {
    switch (error.code) {
      case 'MISSING_NAME':
        fixedFlow.name = "Generated Flow " + Date.now();
        break;

      case 'MISSING_FLOW_DATA':
        fixedFlow.flow_data = {
          version: "1.0",
          steps: [],
          config: {
            delay: 0,
            retryCount: 1,
            parallel: false
          }
        };
        break;

      case 'INVALID_VERSION':
        if (fixedFlow.flow_data) {
          fixedFlow.flow_data.version = "1.0";
        }
        break;

      case 'MISSING_FLOW_DATA_CONFIG':
        if (fixedFlow.flow_data) {
          fixedFlow.flow_data.config = {
            delay: 0,
            retryCount: 1,
            parallel: false
          };
        }
        break;
    }
  });

  return fixedFlow;
}
```

### Strategy 2: Generate Corrective Suggestions
```javascript
function generateSuggestions(errors) {
  return errors.map(error => {
    let suggestion = "";

    switch (error.code) {
      case 'INVALID_ID_FORMAT':
        suggestion = `Change '${error.example || 'invalid-id'}' to 'validIdFormat' (e.g., 'register_user')`;
        break;

      case 'DUPLICATE_ID':
        suggestion = `Rename step with duplicate ID '${error.field}' to something unique`;
        break;

      case 'INVALID_HTTP_METHOD':
        suggestion = `Use valid HTTP method: ${error.allowed_methods.join(', ')}`;
        break;

      case 'INVALID_REFERENCE_TYPE':
        suggestion = `Use valid reference type: input, env, headers, or valid step ID`;
        break;

      case 'INPUT_FIELD_NOT_FOUND':
        suggestion = `Add '${error.field}' to flow_inputs or use available input: ${error.available_inputs.join(', ')}`;
        break;

      case 'STEP_NOT_FOUND':
        suggestion = `Use existing step ID: ${error.available_steps.join(', ')}`;
        break;

      default:
        suggestion = error.suggestion || "Review and fix the error";
    }

    return {
      ...error,
      auto_fixable: ['MISSING_NAME', 'MISSING_FLOW_DATA', 'INVALID_VERSION', 'MISSING_FLOW_DATA_CONFIG'].includes(error.code),
      suggestion: suggestion
    };
  });
}
```

## 📊 Error Reporting Format

### Standard Error Response
```javascript
{
  "validation_status": "failed",
  "error_count": 3,
  "errors": [
    {
      "type": "critical|error|warning|info",
      "code": "ERROR_CODE",
      "message": "Human readable error message",
      "step": "step_index or null",
      "field": "field_name or null",
      "severity": "error|warning|info",
      "line": "line_number or null",
      "suggestion": "How to fix this error",
      "auto_fixable": true|false,
      "reference": "variable_reference_if_applicable",
      "available_options": ["option1", "option2"] // if applicable
    }
  ],
  "summary": {
    "critical": 1,
    "error": 1,
    "warning": 1,
    "info": 0
  },
  "quick_fixes": [
    {
      "description": "Auto-fixable issues found",
      "fixes_applied": false,
      "fixed_flow": null
    }
  ]
}
```

### Success Response with Warnings
```javascript
{
  "validation_status": "success_with_warnings",
  "error_count": 0,
  "warnings": [
    {
      "type": "warning",
      "code": "UNUSED_INPUT",
      "message": "Flow input 'unusedField' is not referenced in any step",
      "field": "flow_inputs",
      "severity": "warning",
      "suggestion": "Remove unused input or reference it in steps"
    }
  ],
  "summary": {
    "critical": 0,
    "error": 0,
    "warning": 1,
    "info": 0
  }
}
```

## 🛠️ AI Implementation Guidelines

### Step 1: Pre-Validation
```javascript
function preValidateFlow(flowDescription) {
  // Check basic structure before processing
  const basicValidation = validateBasicStructure(flowDescription);

  if (basicValidation.critical > 0) {
    return {
      valid: false,
      errors: basicValidation.errors,
      suggestion: "Fix critical errors before proceeding"
    };
  }

  return { valid: true };
}
```

### Step 2: Error Detection & Correction
```javascript
function createFlowWithValidation(userRequest) {
  // Step 1: Generate initial flow
  let flow = generateFlow(userRequest);

  // Step 2: Validate flow
  const errors = validateFlow(flow);

  if (errors.length > 0) {
    // Step 3: Generate enhanced errors with suggestions
    const enhancedErrors = generateSuggestions(errors);

    // Step 4: Try auto-fix if possible
    const autoFixable = enhancedErrors.filter(e => e.auto_fixable);
    if (autoFixable.length > 0) {
      flow = autoFixErrors(flow, autoFixable);

      // Re-validate after auto-fix
      const remainingErrors = validateFlow(flow);

      if (remainingErrors.length > 0) {
        return {
          valid: false,
          flow: flow,
          errors: generateSuggestions(remainingErrors),
          auto_fixed: autoFixable.length
        };
      }
    } else {
      return {
        valid: false,
        flow: flow,
        errors: enhancedErrors,
        auto_fixed: 0
      };
    }
  }

  return {
    valid: true,
    flow: flow,
    errors: [],
    auto_fixed: 0
  };
}
```

### Step 3: User Communication
```javascript
function formatErrorForUser(errors) {
  const summary = errors.summary;

  if (summary.critical > 0) {
    return `❌ Flow Creation Failed (${summary.critical} critical error${summary.critical > 1 ? 's' : ''})\n\n` +
           `Critical Issues:\n` +
           errors.filter(e => e.type === 'critical')
                 .map(e => `• ${e.message} ${e.suggestion ? `(${e.suggestion})` : ''}`)
                 .join('\n');
  } else if (summary.error > 0) {
    return `⚠️ Flow Has Errors (${summary.error} error${summary.error > 1 ? 's' : ''})\n\n` +
           `Issues to Fix:\n` +
           errors.filter(e => e.type === 'error')
                 .map(e => `• ${e.message} ${e.suggestion ? `(${e.suggestion})` : ''}`)
                 .join('\n');
  } else if (summary.warning > 0) {
    return `✅ Flow Created with Warnings (${summary.warning} warning${summary.warning > 1 ? 's' : ''})\n\n` +
           `Warnings:\n` +
           errors.filter(e => e.type === 'warning')
                 .map(e => `• ${e.message} ${e.suggestion ? `(${e.suggestion})` : ''}`)
                 .join('\n');
  }

  return "✅ Flow Created Successfully!";
}
```

## 🎯 Best Practices for AI

### 1. **Prevention First**
- Validate input requirements before generating flow
- Check for common issues early
- Provide clear templates and examples

### 2. **Progressive Validation**
- Validate structure first
- Then validate individual components
- Finally validate relationships and dependencies

### 3. **Helpful Error Messages**
- Be specific about what's wrong
- Provide clear solutions
- Include examples when possible

### 4. **Auto-Fix When Possible**
- Fix simple structural issues automatically
- Document what was fixed
- Allow user review

### 5. **User Education**
- Explain validation rules
- Provide best practice suggestions
- Include learning resources

---

**AI/LLM HARUS mengimplementasikan error handling ini untuk memastikan flow yang dihasilkan 100% valid dan siap digunakan!**