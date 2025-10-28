# Duplicate Flow

## Endpoint
`POST /flow/{id}/duplicate`

## Description
Menduplikasi flow yang sudah ada dengan semua data terkait. Flow baru akan dibuat dengan status inactive (`is_active = 0`) dan dapat diedit secara independen. Duplication akan menyalin kedua format (Steps dan React Flow).

## Headers
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

## Path Parameters
- `id`: ID flow yang akan diduplikasi

## Request Body (Optional)
```json
{
  "name": "User Registration Flow - Test Environment",
  "folder_id": "fld_test_environment",
  "description": "Modified version for testing with sandbox environment"
}
```

### Fields
- `name` (optional): Nama untuk flow yang diduplikasi. Jika tidak diberikan, akan menggunakan nama asli + " (Copy)"
- `folder_id` (optional): Pindahkan ke folder berbeda
- `description` (optional): Custom description untuk duplicated flow

## Response

### Created (201)
```json
{
  "success": true,
  "status_code": 201,
  "message": "Flow duplicated",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": {
    "id": "flow_c3d4e5f6g7h8i9j0",
    "name": "User Registration Flow - Test Environment",
    "description": "Modified version for testing with sandbox environment",
    "project_id": "proj_123",
    "folder_id": "fld_test_environment",
    "folder_name": "Test Environment",
    "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true}]",
    "flow_data": "{\"version\":\"1.0\",\"steps\":[...]}",
    "ui_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 0,
    "created_by": "user_xyz",
    "created_at": "2025-10-25 12:30:00",
    "updated_at": "2025-10-25 12:30:00",
    "duplicated_from": "flow_a1b2c3d4e5f6g7h8"
  }
}
```

### Error (404)
```json
{
  "status": "error",
  "message": "Flow not found"
}
```

### Error (403)
```json
{
  "status": "error",
  "message": "Forbidden"
}
```

### Error (409) - Folder Access
```json
{
  "status": "error",
  "message": "Cannot duplicate to folder: User does not have access to target folder"
}
```

## Duplication Process

### What Gets Duplicated
1. **Flow Metadata**: Name, description, folder
2. **Flow Inputs**: Semua definisi input dinamis
3. **Flow Data**: `flow_data` (Steps format)
4. **UI Data**: `ui_data` (React Flow format)
5. **Configuration**: Execution config, validation rules

### What Gets Generated Fresh
1. **New Flow ID**: Unique identifier
2. **Created Timestamp**: Duplication time
3. **Updated Timestamp**: Same as created
4. **Status**: Always starts as `inactive`
5. **Audit Trail**: New creation record

## Naming Convention

### Default Naming
- **Original**: "User Registration Flow"
- **Duplicate**: "User Registration Flow (Copy)"

### Multiple Duplicates
- **1st**: "User Registration Flow (Copy)"
- **2nd**: "User Registration Flow (Copy 2)"
- **3rd**: "User Registration Flow (Copy 3)"

### Custom Naming
```json
{
  "name": "Custom Flow Name"
}
// Result: "Custom Flow Name"
```

## Use Cases

### 1. **Environment-Based Flows**
```javascript
// Create environment-specific versions
const createEnvironmentFlows = async (baseFlowId) => {
  const environments = ['dev', 'staging', 'prod'];

  for (const env of environments) {
    await duplicateFlow(baseFlowId, {
      name: `Registration Flow - ${env.toUpperCase()}`,
      folder_id: `fld_${env}`,
      description: `Registration flow for ${env} environment`
    });
  }
};
```

### 2. **A/B Testing Variants**
```bash
# Create flow variants for testing
POST http://localhost:8080/?act=flow_duplicate&id=flow_base
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "name": "Registration Flow - Variant A",
  "folder_id": "fld_test_variants"
}

POST http://localhost:8080/?act=flow_duplicate&id=flow_base
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "name": "Registration Flow - Variant B",
  "folder_id": "fld_test_variants"
}
```

### 3. **Template Creation**
```javascript
// Create template flows from working examples
const createTemplate = async (workingFlowId, templateName) => {
  const duplicate = await duplicateFlow(workingFlowId, {
    name: templateName,
    folder_id: 'fld_templates',
    description: `Template flow based on ${workingFlowId}`
  });

  // Customize template with generic inputs
  await updateFlow(duplicate.data.id, {
    flow_inputs: [
      {
        name: "apiEndpoint",
        type": "string",
        required: true,
        description: "Target API endpoint"
      }
    ]
  });

  return duplicate;
};
```

### 4. **Backup Before Major Changes**
```bash
# Create backup before risky modifications
POST http://localhost:8080/?act=flow_duplicate&id=flow_critical
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "name": "CRITICAL FLOW BACKUP - DO NOT DELETE",
  "folder_id": "fld_backups",
  "description": "Backup before major refactoring on 2025-10-28"
}
```

## Advanced Duplication

### With Modifications
```javascript
// Duplicate and immediately modify
const duplicateAndModify = async (flowId, modifications) => {
  // 1. Duplicate flow
  const duplicate = await duplicateFlow(flowId, {
    name: modifications.name || undefined
  });

  // 2. Parse flow data
  const flowData = JSON.parse(duplicate.data.flow_data);

  // 3. Apply modifications
  if (modifications.steps) {
    flowData.steps = modifications.steps;
  }

  if (modifications.config) {
    flowData.config = { ...flowData.config, ...modifications.config };
  }

  // 4. Update duplicated flow
  await updateFlow(duplicate.data.id, {
    flow_data: flowData,
    flow_inputs: modifications.flow_inputs || undefined
  });

  return duplicate;
};

// Usage
const newFlow = await duplicateAndModify('flow_123', {
  name: 'Modified Registration Flow',
  steps: [
    // Custom steps array
  ],
  flow_inputs: [
    // Custom inputs
  ]
});
```

### Batch Duplication
```javascript
// Create multiple variants at once
const batchDuplicate = async (baseFlowId, variants) => {
  const promises = variants.map(variant =>
    duplicateFlow(baseFlowId, {
      name: variant.name,
      folder_id: variant.folder_id,
      description: variant.description
    }).then(response => ({
      ...response,
      variant: variant.name
    }))
  );

  const results = await Promise.all(promises);
  return results;
};

// Create 5 test variants
const variants = [
  { name: 'Test Variant 1', folder_id: 'fld_tests' },
  { name: 'Test Variant 2', folder_id: 'fld_tests' },
  { name: 'Test Variant 3', folder_id: 'fld_tests' },
  { name: 'Test Variant 4', folder_id: 'fld_tests' },
  { name: 'Test Variant 5', folder_id: 'fld_tests' }
];

const duplicates = await batchDuplicate('flow_base', variants);
console.log(`Created ${duplicates.length} variants`);
```

## Independent Flow Management

### After Duplication
- ✅ **Independent IDs**: Duplicate memiliki unique ID
- ✅ **Independent Data**: Changes tidak affect original flow
- ✅ **Independent Status**: Dapat di-activate secara terpisah
- ✅ **Independent Execution**: Dapat dijalankan tanpa konflik

### Flow Relationships
```javascript
// Track flow relationships
const trackFlowHierarchy = (flowId) => {
  return {
    original_id: flowId,
    duplicates: getFlowDuplicates(flowId),
    is_duplicate: isDuplicateFlow(flowId),
    duplicated_from: getOriginalFlowId(flowId)
  };
};
```

## Best Practices

### 1. **Before Duplicating**
- Verify original flow is working correctly
- Choose appropriate target folder
- Plan naming convention
- Check permissions for target folder

### 2. **After Duplicating**
- Test duplicated flow immediately
- Update flow references if needed
- Activate when ready for use
- Document purpose of duplicate

### 3. **Naming Strategy**
- Use descriptive names
- Include environment/variant info
- Avoid generic "(Copy)" when possible
- Follow team naming conventions

### 4. **Folder Organization**
- Use dedicated folders for test flows
- Separate production from development
- Archive old duplicates when no longer needed
- Maintain folder permissions

## Authorization
- User harus menjadi member dari project yang memiliki flow ini
- User harus memiliki akses ke target folder (jika specified)
- Duplicated flow akan mewarisi permissions dari target folder

## Example
```bash
# Basic duplication
POST /gassapi2/backend/?act=flow_duplicate&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

# Response: New flow created
{
  "success": true,
  "message": "Flow duplicated",
  "data": {
    "id": "flow_c3d4e5f6g7h8i9j0",
    "name": "User Registration Flow (Copy)",
    "duplicated_from": "flow_a1b2c3d4e5f6g7h8",
    "is_active": 0
  }
}

# Custom duplication
POST /gassapi2/backend/?act=flow_duplicate&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "name": "Registration Flow - Development",
  "folder_id": "fld_dev",
  "description": "Development version with debug endpoints"
}

# Response: Custom flow created
{
  "success": true,
  "message": "Flow duplicated",
  "data": {
    "id": "flow_new123",
    "name": "Registration Flow - Development",
    "folder_id": "fld_dev",
    "folder_name": "Development",
    "duplicated_from": "flow_a1b2c3d4e5f6g7h8"
  }
}
```

## Integration Examples

### React Component for Duplication
```jsx
const FlowDuplicateButton = ({ flowId, onDuplicate }) => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleDuplicate = async (customName, targetFolder) => {
    setLoading(true);
    try {
      const response = await fetch(`/gassapi2/backend/?act=flow_duplicate&id=${flowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: customName,
          folder_id: targetFolder
        })
      });

      const result = await response.json();
      if (result.success) {
        onDuplicate(result.data);
        setShowModal(false);
      }
    } catch (error) {
      console.error('Duplication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} disabled={loading}>
        {loading ? 'Duplicating...' : 'Duplicate Flow'}
      </button>

      <DuplicateFlowModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleDuplicate}
      />
    </>
  );
};
```

## Monitoring and Analytics

### Duplication Tracking
```javascript
// Track duplication patterns
const trackDuplicationUsage = async () => {
  const duplicates = await getAllDuplicateFlows();

  const analytics = {
    total_duplicates: duplicates.length,
    most_duplicated_flow: findMostDuplicatedFlow(),
    duplicate_folders: getDuplicateFolders(),
    average_duplicates_per_flow: duplicates.length / getOriginalFlowCount()
  };

  return analytics;
};
```

### Duplicate Cleanup
```javascript
// Clean up old test duplicates
const cleanupTestDuplicates = async (olderThanDays = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const oldDuplicates = await getFlowsOlderThan(cutoffDate, 'test');
  const deletePromises = oldDuplicates.map(flow => deleteFlow(flow.id));

  await Promise.all(deletePromises);
  console.log(`Cleaned up ${oldDuplicates.length} old test duplicates`);
};
```

## Related Documentation
- [Create Flow](create.md) - For creating new flows
- [Update Flow](update.md) - For modifying duplicated flows
- [List Flows](list.md) - To view all flows including duplicates
