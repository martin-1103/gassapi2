<?php
namespace App\Repositories;

use App\Repositories\BaseRepository;

class FolderRepository extends BaseRepository {

    protected function getTableName() {
        return 'folders';
    }

    /**
     * List folders by project ID
     */
    public function listByProject($projectId, $limit = 100) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List folders failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Create folder for project
     */
    public function createForProject($projectId, $data) {
        if (!isset($data['id'])) {
            $data['id'] = $this->generateId();
        }
        $data['project_id'] = $projectId;
        
        // Ensure JSON fields
        if (!isset($data['headers'])) {
            $data['headers'] = json_encode(new \stdClass());
        } elseif (is_array($data['headers']) || is_object($data['headers'])) {
            $data['headers'] = json_encode($data['headers']);
        }
        
        if (!isset($data['variables'])) {
            $data['variables'] = json_encode(new \stdClass());
        } elseif (is_array($data['variables']) || is_object($data['variables'])) {
            $data['variables'] = json_encode($data['variables']);
        }

        return $this->create($data);
    }

    /**
     * Update folder with JSON handling
     */
    public function updateFolder($id, $data) {
        // Handle JSON fields
        if (isset($data['headers']) && (is_array($data['headers']) || is_object($data['headers']))) {
            $data['headers'] = json_encode($data['headers']);
        }
        if (isset($data['variables']) && (is_array($data['variables']) || is_object($data['variables']))) {
            $data['variables'] = json_encode($data['variables']);
        }

        return $this->update($id, $data);
    }

    /**
     * Check if folder belongs to project
     */
    public function belongsToProject($folderId, $projectId) {
        $folder = $this->findById($folderId);
        return $folder && $folder['project_id'] === $projectId;
    }

    /**
     * Count folders in project
     */
    public function countByProject($projectId) {
        return $this->count(['project_id' => $projectId]);
    }

    /**
     * Find default folder for project
     */
    public function findDefaultByProject($projectId) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->where('is_default', 1);
        $result = $db->getOne($this->getTableName());
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find default folder failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Unset default for all folders in project
     */
    public function unsetDefaultForProject($projectId) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $result = $db->update($this->getTableName(), ['is_default' => 0]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Unset default failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Get folders with child count
     */
    public function listWithChildren($projectId) {
        $folders = $this->listByProject($projectId);
        
        foreach ($folders as &$folder) {
            // Count child folders
            $folder['child_count'] = $this->count(['parent_id' => $folder['id']]);
        }
        
        return $folders;
    }

    /**
     * Generate unique ID for folder
     */
    private function generateId() {
        return 'col_' . bin2hex(random_bytes(16));
    }
}
