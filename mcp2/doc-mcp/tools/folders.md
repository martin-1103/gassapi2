# Folder Tools

## Available Tools
- `get_folders`
- `create_folder`
- `move_folder`
- `delete_folder`

## get_folders

**Purpose:** List all folders for a project with hierarchical structure

### Parameters
- **Required:** None
- **Optional:** project_id, include_endpoint_count, flatten

### Usage Example
```
get_folders()

get_folders(
  project_id: "proj_123",
  flatten: true
)
```

### Common Mistakes
- ❌ Invalid project_id
- ✅ Call without parameters for default project

---

## create_folder

**Purpose:** Create a new folder in a project

### Parameters
- **Required:** name
- **Optional:** project_id, parent_id, description

### Usage Example
```
create_folder(
  name: "API Tests",
  description: "Folder for API testing"
)

create_folder(
  name: "Nested Folder",
  parent_id: "parent_456",
  description: "Child folder"
)
```

### Common Mistakes
- ❌ Empty name
- ❌ Invalid parent_id
- ✅ Use parent_id for nested folders

---

## move_folder

**Purpose:** Move a folder to a new parent or root level

### Parameters
- **Required:** folder_id, new_parent_id
- **Optional:** None

### Usage Example
```
move_folder(
  folder_id: "fld_123",
  new_parent_id: "parent_456"
)

move_folder(
  folder_id: "fld_123",
  new_parent_id: "root"
)
```

### Common Mistakes
- ❌ Invalid folder_id
- ❌ Invalid new_parent_id
- ❌ Circular reference (moving to its own child)

---

## delete_folder

**Purpose:** Delete a folder (with safety checks for endpoints)

### Parameters
- **Required:** folder_id
- **Optional:** force

### Usage Example
```
delete_folder(
  folder_id: "fld_123"
)

delete_folder(
  folder_id: "fld_123",
  force: true
)
```

### Common Mistakes
- ❌ Invalid folder_id
- ❌ Deleting folder with endpoints without force
- ✅ Use force carefully - it deletes everything