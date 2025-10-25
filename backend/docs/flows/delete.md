# Delete Flow

## Endpoint
`DELETE /flow/{id}`

## Description
Menghapus flow beserta semua data terkait dari project. Operasi ini **irreversible** dan akan menghapus flow dalam kedua format (Steps dan React Flow).

## Headers
```
Authorization: Bearer {access_token}
```

## Path Parameters
- `id`: ID flow

## Response

### Success (200)
```json
{
  "success": true,
  "status_code": 200,
  "message": "Flow deleted",
  "timestamp": "2025-10-25 07:00:00",
  "request_id": "req_abc123",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "deleted_at": "2025-10-25 15:30:00"
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

### Error (409) - Flow in Use
```json
{
  "status": "error",
  "message": "Cannot delete flow: Currently being executed or referenced by active tests"
}
```

## Deletion Process

System akan menghapus:
1. **Flow Record**: Data flow utama
2. **Flow Data**: `flow_data` (Steps format)
3. **UI Data**: `ui_data` (React Flow format)
4. **Flow Inputs**: Konfigurasi input dinamis
5. **Execution History**: Riwayat eksekusi flow
6. **Test Results**: Hasil test terkait flow

## Side Effects

### 1. **Irreversible Operation**
- ⚠️ **WARNING**: Tidak dapat undo setelah delete
- Semua data flow akan dihapus permanen
- Tidak ada soft delete atau trash

### 2. **Dependency Impact**
- Test yang menggunakan flow ini akan gagal
- Automation yang depend pada flow perlu di-update
- CI/CD pipeline yang refer ke flow perlu disesuaikan

### 3. **Audit Trail**
- Delete action tetap tercatat di audit logs
- Tidak dapat menghapus audit trails

## Safety Checks

### Pre-Deletion Validation
```json
// System akan cek:
{
  "checks": {
    "is_executing": false,        // Tidak sedang dijalankan
    "has_active_tests": false,    // Tidak ada active tests
    "user_has_permission": true   // User punya akses
  }
}
```

### Deletion Confirmation
```bash
# Opsional: Force delete (melewati beberapa checks)
DELETE /gassapi2/backend/?act=flow_delete&id=flow_123&force=true
Authorization: Bearer {token}
```

## Use Cases

### 1. **Flow Cleanup**
```javascript
// Hapus flow yang tidak terpakai
const deleteUnusedFlow = async (flowId) => {
  const response = await fetch(`/gassapi2/backend/?act=flow_delete&id=${flowId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const result = await response.json();
  if (result.success) {
    console.log(`Flow ${result.data.name} deleted successfully`);
    // Update UI, remove dari list
  } else {
    console.error('Delete failed:', result.message);
  }
};
```

### 2. **Batch Cleanup**
```bash
# Delete multiple flows (requires admin permission)
for flow_id in "${flow_ids[@]}"; do
  curl -X DELETE "${API_URL}/flow_delete?id=${flow_id}" \
    -H "Authorization: Bearer ${TOKEN}"
done
```

### 3. **Automated Maintenance**
```javascript
// Hapus flow yang tidak aktif > 30 hari
const cleanupOldFlows = async (projectId) => {
  const flows = await getInactiveFlows(projectId, 30); // 30 days
  const deletePromises = flows.map(flow => deleteFlow(flow.id));

  await Promise.all(deletePromises);
  console.log(`Cleaned up ${flows.length} old flows`);
};
```

## Alternatives to Deletion

### 1. **Deactivate Instead**
```bash
# Deactivate flow (preserve data)
PUT /gassapi2/backend/?act=flow_update&id=flow_123
{
  "is_active": false
}
```

### 2. **Archive Flow**
```bash
# Move to archive collection
PUT /gassapi2/backend/?act=flow_update&id=flow_123
{
  "collection_id": "col_archive",
  "name": "[ARCHIVED] User Registration Flow"
}
```

### 3. **Export Before Delete**
```javascript
// Backup flow data sebelum delete
const exportAndDelete = async (flowId) => {
  // Get complete flow data
  const flow = await getFlow(flowId);
  const flowUI = await getFlowUI(flowId);

  // Export to file
  const exportData = {
    flow: flow.data,
    ui: flowUI.data,
    exported_at: new Date().toISOString()
  };

  await saveToFile(`flow_backup_${flowId}.json`, exportData);

  // Then delete
  await deleteFlow(flowId);
};
```

## Best Practices

### 1. **Before Deletion**
- Konfirmasi dengan user: "Are you sure?"
- Check dependencies dan active tests
- Export atau backup jika diperlukan
- Notify team members yang terlibat

### 2. **Deletion Process**
- Use transaction untuk consistency
- Log deletion untuk audit
- Update cache dan dependencies
- Verify deletion success

### 3. **After Deletion**
- Update UI components
- Clear related cache
- Notify dependent systems
- Document perubahan

## Authorization
- User harus menjadi member dari project yang memiliki flow ini
- Hanya project admin yang bisa force delete
- User tidak bisa delete flow yang sedang dijalankan

## Example
```bash
# Delete flow
DELETE /gassapi2/backend/?act=flow_delete&id=flow_a1b2c3d4e5f6g7h8
Authorization: Bearer eyJhbGc...

# Response: Success
{
  "success": true,
  "message": "Flow deleted",
  "data": {
    "id": "flow_a1b2c3d4e5f6g7h8",
    "name": "User Registration Flow",
    "deleted_at": "2025-10-25 15:30:00"
  }
}

# Response: Flow in use
{
  "status": "error",
  "message": "Cannot delete flow: Currently being executed"
}
```

## Monitoring and Recovery

### Deletion Tracking
```javascript
// Monitor deletion events
const trackDeletion = (flowId, userId) => {
  logEvent('flow_deleted', {
    flow_id: flowId,
    deleted_by: userId,
    deleted_at: new Date().toISOString()
  });
};
```

### Recovery Options
- **Backup Restore**: Dari export files
- **Audit Analysis**: Lihat riwayat perubahan
- **Team Notification**: Informasi ke team
- **Documentation Update**: Update docs

## Related Documentation
- [Update Flow](update.md) - For deactivation alternatives
- [List Flows](list.md) - To see remaining flows
- [Flow Management](../flow-management.md) - Complete flow lifecycle
