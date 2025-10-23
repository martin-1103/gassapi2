<?php
namespace App\Repositories;

use App\Repositories\BaseRepository;

class CollectionRepository extends BaseRepository {
    
    protected function getTableName() {
        return 'collections';
    }

    /**
     * List collections by project ID
     */
    public function listByProject($projectId, $limit = 100) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List collections failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Create collection for project
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
     * Update collection with JSON handling
     */
    public function updateCollection($id, $data) {
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
     * Check if collection belongs to project
     */
    public function belongsToProject($collectionId, $projectId) {
        $collection = $this->findById($collectionId);
        return $collection && $collection['project_id'] === $projectId;
    }

    /**
     * Count collections in project
     */
    public function countByProject($projectId) {
        return $this->count(['project_id' => $projectId]);
    }

    /**
     * Find default collection for project
     */
    public function findDefaultByProject($projectId) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->where('is_default', 1);
        $result = $db->getOne($this->getTableName());
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find default collection failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Unset default for all collections in project
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
     * Get collections with child count
     */
    public function listWithChildren($projectId) {
        $collections = $this->listByProject($projectId);
        
        foreach ($collections as &$collection) {
            // Count child collections
            $collection['child_count'] = $this->count(['parent_id' => $collection['id']]);
        }
        
        return $collections;
    }

    /**
     * Generate unique ID for collection
     */
    private function generateId() {
        return 'col_' . bin2hex(random_bytes(16));
    }
}
