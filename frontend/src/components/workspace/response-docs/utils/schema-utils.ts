// Utilitas untuk pembuatan dan formatting schema dari response API

export interface SchemaProperty {
  type:
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array'
    | 'null'
    | 'undefined';
  description?: string;
  required?: boolean;
  enum?: string[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  additionalProperties?: boolean | SchemaProperty;
}

/**
 * Generate schema dari response data
 */
export function generateSchemaFromResponse(data: unknown): SchemaProperty {
  if (data === null) return { type: 'null', description: 'Null value' };
  if (data === undefined)
    return { type: 'undefined', description: 'Undefined value' };
  if (typeof data === 'string')
    return { type: 'string', description: 'String value' };
  if (typeof data === 'number')
    return { type: 'number', description: 'Numeric value' };
  if (typeof data === 'boolean')
    return { type: 'boolean', description: 'Boolean value' };
  if (Array.isArray(data)) {
    return {
      type: 'array',
      description: 'Array of items',
      items:
        data.length > 0
          ? generateSchemaFromResponse(data[0])
          : { type: 'string', description: 'Array item' },
    };
  }
  if (typeof data === 'object') {
    const properties: Record<string, SchemaProperty> = {};
    const required: string[] = [];

    Object.entries(data).forEach(([key, value]) => {
      properties[key] = generateSchemaFromResponse(value);
      // Consider common required fields
      if (key.toLowerCase() !== 'id' && key.toLowerCase() !== 'name') {
        required.push(key);
      }
    });

    return {
      type: 'object',
      description: 'Object with properties',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  return { type: 'string', description: 'Unknown type' };
}

/**
 * Format schema untuk display dengan indentasi yang bagus
 */
export function formatSchema(schema: SchemaProperty, indent = 0): string {
  const indentStr = '  '.repeat(indent);
  const nextIndentStr = '  '.repeat(indent + 1);

  let schemaText = `{\n${indentStr}$type: ${schema.type}`;

  if (schema.description) {
    schemaText += `,\n${indentStr}description: "${schema.description}"`;
  }

  if (schema.enum) {
    schemaText += `,\n${indentStr}enum: [${schema.enum.map(e => `"${e}"`).join(', ')}]`;
  }

  if (schema.properties) {
    schemaText += `,\n${indentStr}properties: {\n`;

    Object.entries(schema.properties).forEach(([key, prop], index, array) => {
      const isLast = index === array.length - 1;
      schemaText += `${nextIndentStr}${key}: ${formatSchema(prop, indent + 1)}${isLast ? '' : ','}\n`;
    });

    schemaText += `${indentStr}}`;
  }

  if (schema.required) {
    schemaText += `,\n${indentStr}required: [${schema.required.map(r => `"${r}"`).join(', ')}]`;
  }

  if (schema.items) {
    schemaText += `,\n${indentStr}items: ${formatSchema(schema.items, indent + 1)}`;
  }

  if (schema.additionalProperties) {
    schemaText += `,\n${indentStr}additionalProperties: ${schema.additionalProperties}`;
  }

  schemaText += `\n}`;

  return schemaText;
}
