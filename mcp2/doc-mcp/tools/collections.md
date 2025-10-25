# Collection Tools

## Available Tools
- `get_collections`
- `create_collection`
- `move_collection`
- `delete_collection`

## get_collections

**Purpose:** List all collections for a project with hierarchical structure

### Parameters
- **Required:** None
- **Optional:** project_id, include_endpoint_count, flatten

### Usage Example
```
get_collections()

get_collections(
  project_id: "proj_123",
  flatten: true
)
```

### Common Mistakes
- ❌ Invalid project_id
- ✅ Call without parameters for default project

---

## create_collection

**Purpose:** Create a new collection in a project

### Parameters
- **Required:** name
- **Optional:** project_id, parent_id, description

### Usage Example
```
create_collection(
  name: "API Tests",
  description: "Collection for API testing"
)

create_collection(
  name: "Nested Collection",
  parent_id: "parent_456",
  description: "Child collection"
)
```

### Common Mistakes
- ❌ Empty name
- ❌ Invalid parent_id
- ✅ Use parent_id for nested collections

---

## move_collection

**Purpose:** Move a collection to a new parent or root level

### Parameters
- **Required:** collection_id, new_parent_id
- **Optional:** None

### Usage Example
```
move_collection(
  collection_id: "col_123",
  new_parent_id: "parent_456"
)

move_collection(
  collection_id: "col_123",
  new_parent_id: "root"
)
```

### Common Mistakes
- ❌ Invalid collection_id
- ❌ Invalid new_parent_id
- ❌ Circular reference (moving to its own child)

---

## delete_collection

**Purpose:** Delete a collection (with safety checks for endpoints)

### Parameters
- **Required:** collection_id
- **Optional:** force

### Usage Example
```
delete_collection(
  collection_id: "col_123"
)

delete_collection(
  collection_id: "col_123",
  force: true
)
```

### Common Mistakes
- ❌ Invalid collection_id
- ❌ Deleting collection with endpoints without force
- ✅ Use force carefully - it deletes everything