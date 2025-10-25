# Toggle Flow Active Status

## Endpoint
`PUT /flow/{id}/toggle-active`

## Description
Toggle status aktif/nonaktif flow. Endpoint ini memungkinkan perubahan status flow tanpa perlu mengirim data lengkap. Status aktif menentukan apakah flow dapat dijalankan oleh execution engines.

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID flow

## Response

### Success (200) - Activated
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flow activated",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_123",
    "folder_id": "fld_123",
    "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true}]",
    "flow_data": "{\"version\":\"1.0\",\"steps\":[...]}",
    "ui_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 1,
    "created_by": "user_xyz",
    "created_at": "2025-10-25 10:30:00",
    "updated_at": "2025-10-25 12:00:00"
  }
}
```

### Success (200) - Deactivated
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flow deactivated",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "description": "Complete user registration and verification flow",
    "project_id": "proj_123",
    "folder_id": "fld_123",
    "flow_inputs": "[{\"name\":\"username\",\"type\":\"string\",\"required\":true}]",
    "flow_data": "{\"version\":\"1.0\",\"steps\":[...]}",
    "ui_data": "{\"nodes\":[...],\"edges\":[...]}",
    "is_active": 0,
    "created_by": "user_xyz",
    "created_at": "2025-10-25 10:30:00",
    "updated_at": "2025-10-25 12:00:00"
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

### Error (409) - Flow Currently Running
```json
{
  "status": "error",
  "message": "Cannot toggle status: Flow is currently being executed"
}
```

## Status Behavior

### Active Status (`is_active = 1`)
- ✅ **Available for execution**
- Muncul di `GET /flows/active`
- Dapat dijalankan oleh automation tools
- Muncul di flow selection UI

### Inactive Status (`is_active = 0`)
- ❌ **Not available for execution**
- Tidak muncul di active flows list
- Tidak dapat dijalankan (akan error)
- Tetap ada untuk editing dan development

## Use Cases

### 1. **Development Workflow**
```javascript
// Development lifecycle management
const manageFlowLifecycle = async (flowId) => {
  // 1. Deactivate untuk development
  await toggleFlowStatus(flowId); // Deactivate

  // 2. Update flow logic
  await updateFlow(flowId, newFlowData);

  // 3. Test flow
  await testFlow(flowId);

  // 4. Activate untuk production
  await toggleFlowStatus(flowId); // Activate
};
```

### 2. **Maintenance Mode**
```bash
# Disable flow untuk maintenance
PUT /gassapi2/backend/?act=flow_toggle_active&id=flow_123

# Re-enable setelah maintenance selesai
PUT /gassapi2/backend/?act=flow_toggle_active&id=flow_123
```

### 3. **A/B Testing**
```javascript
// Switch antara flows untuk testing
const switchFlows = async (flowAId, flowBId) => {
  await toggleFlowStatus(flowAId); // Disable A
  await toggleFlowStatus(flowBId); // Enable B

  console.log('Switched to Flow B for testing');
};
```

### 4. **Scheduled Management**
```javascript
// Scheduled flow management
const scheduleFlowStatus = async (flowId, activeAt) => {
  const now = new Date();

  if (now >= activeAt) {
    await toggleFlowStatus(flowId);
    console.log(`Flow ${flowId} activated at ${now.toISOString()}`);
  }
};
```

## Alternative Methods

### Explicit Status Setting
```bash
# Set status secara eksplisit
PUT /gassapi2/backend/?act=flow_update&id=flow_123
Content-Type: application/json

{
  "is_active": true   // atau false
}
```

### Batch Status Updates
```javascript
// Update multiple flows
const batchToggleStatus = async (flowIds, targetStatus) => {
  const promises = flowIds.map(id =>
    updateFlow(id, { is_active: targetStatus })
  );

  await Promise.all(promises);
  console.log(`Updated ${flowIds.length} flows to ${targetStatus ? 'active' : 'inactive'}`);
};
```

## Impact and Side Effects

### When Activating Flow
- ✅ Flow muncul di active flows list
- ✅ Dapat dipilih untuk execution
- ✅ Automation tools dapat menjalankan flow
- ✅ API endpoints akan menerima execution requests

### When Deactivating Flow
- ❌ Flow tidak akan muncul di active flows
- ❌ Existing executions akan diselesaikan
- ❌ New execution requests akan ditolak
- ❌ Automation tools perlu update reference

### Status Validation
```javascript
// Cek flow status sebelum execution
const checkFlowStatus = async (flowId) => {
  const flow = await getFlow(flowId);

  if (!flow.data.is_active) {
    throw new Error(`Flow ${flowId} is not active`);
  }

  return flow;
};
```

## Monitoring and Auditing

### Status Change Tracking
```json
// Audit log entry untuk status change
{
  "event_type": "flow_status_changed",
  "flow_id": "flow_123",
  "old_status": 0,
  "new_status": 1,
  "changed_by": "user_456",
  "timestamp": "2025-10-25T12:00:00Z",
  "ip_address": "192.168.1.100"
}
```

### Status Monitoring
```javascript
// Monitor flow status changes
const monitorFlowStatus = () => {
  setInterval(async () => {
    const flows = await getAllFlows();
    const inactiveFlows = flows.filter(f => !f.is_active);

    if (inactiveFlows.length > 0) {
      console.log(`${inactiveFlows.length} flows are currently inactive`);
    }
  }, 60000); // Check every minute
};
```

## Best Practices

### 1. **Before Deactivating**
- Check ongoing executions
- Notify dependent teams
- Update automation scripts
- Document reason for deactivation

### 2. **Before Activating**
- Validate flow configuration
- Test with sample data
- Ensure all dependencies are met
- Verify environment variables

### 3. **Status Management**
- Use descriptive commit messages
- Track status changes in version control
- Maintain flow lifecycle documentation
- Implement rollback procedures

## Integration Examples

### CI/CD Pipeline Integration
```yaml
# GitHub Actions example
- name: Toggle Flow Status
  run: |
    # Deactivate flow sebelum deployment
    curl -X PUT "${{ secrets.API_URL }}/flow_toggle_active?id=${{ flow_id }}" \
      -H "Authorization: Bearer ${{ secrets.API_TOKEN }}"

    # Deploy new version
    # ... deployment steps ...

    # Activate flow setelah deployment
    curl -X PUT "${{ secrets.API_URL }}/flow_toggle_active?id=${{ flow_id }}" \
      -H "Authorization: Bearer ${{ secrets.API_TOKEN }}"
```

### React Component Integration
```jsx
// Flow toggle button component
const FlowToggle = ({ flow, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/gassapi2/backend/?act=flow_toggle_active&id=${flow.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const result = await response.json();
      if (result.success) {
        onToggle(result.data);
      }
    } catch (error) {
      console.error('Toggle failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`btn ${flow.is_active ? 'btn-warning' : 'btn-success'}`}
    >
      {loading ? 'Loading...' : (flow.is_active ? 'Deactivate' : 'Activate')}
    </button>
  );
};
```

## Authorization
- User harus menjadi member dari project yang memiliki flow ini
- Tidak dapat toggle status flow yang sedang dijalankan
- Status change akan tercatat di audit logs

## Example
```bash
# Toggle flow status
PUT /gassapi2/backend/?act=flow_toggle_active&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

# Response: Flow activated
{
  "success": true,
  "message": "Flow activated",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "is_active": 1,
    "updated_at": "2025-10-25 12:00:00"
  }
}

# Toggle lagi untuk deactivate
PUT /gassapi2/backend/?act=flow_toggle_active&id=flow_a1b2c3d4e5f6g7h8

# Response: Flow deactivated
{
  "success": true,
  "message": "Flow deactivated",
  "data": {
    "is_active": 0,
    "updated_at": "2025-10-25 12:05:00"
  }
}
```

## Related Documentation
- [Update Flow](update.md) - Alternative method for status changes
- [List Flows](list.md) - View flow status in list
- [Execute Flow](../execution/execute.md) - Flow execution requirements
