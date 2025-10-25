<?php
namespace App\Repositories;

use App\Repositories\BaseRepository;

class FlowRepository extends BaseRepository {
    
    protected function getTableName() {
        return 'flows';
    }

    /**
     * List flows by project ID
     */
    public function listByProject($projectId, $limit = 100) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List flows failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * List active flows by project
     */
    public function listActiveByProject($projectId, $limit = 100) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->where('is_active', 1);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List active flows failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * List flows by folder ID
     */
    public function listByFolder($folderId, $limit = 100) {
        $db = self::getConnection();
        $db->where('folder_id', $folderId);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List flows by folder failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Create flow for project
     */
    public function createForProject($projectId, $data) {
        if (!isset($data['id'])) {
            $data['id'] = $this->generateId();
        }
        $data['project_id'] = $projectId;
        
        // flow_data should already be JSON encoded by handler
        if (!isset($data['flow_data'])) {
            $data['flow_data'] = json_encode(['version' => '1.0', 'steps' => [], 'config' => ['delay' => 0, 'retryCount' => 1, 'parallel' => false]]);
        }

        // Default is_active to 1 if not set
        if (!isset($data['is_active'])) {
            $data['is_active'] = 1;
        }

        return $this->create($data);
    }

    /**
     * Update flow with dual format handling
     */
    public function updateFlow($id, $data) {
        // Data should already be JSON encoded by handler
        // No need to encode here to avoid double encoding
        return $this->update($id, $data);
    }

    /**
     * Toggle flow active status
     */
    public function toggleActive($id) {
        $flow = $this->findById($id);
        if (!$flow) {
            throw new RepositoryException('Flow not found');
        }
        
        $newStatus = $flow['is_active'] ? 0 : 1;
        return $this->update($id, ['is_active' => $newStatus]);
    }

    /**
     * Activate flow
     */
    public function activate($id) {
        return $this->update($id, ['is_active' => 1]);
    }

    /**
     * Deactivate flow
     */
    public function deactivate($id) {
        return $this->update($id, ['is_active' => 0]);
    }

    /**
     * Check if flow belongs to project
     */
    public function belongsToProject($flowId, $projectId) {
        $flow = $this->findById($flowId);
        return $flow && $flow['project_id'] === $projectId;
    }

    /**
     * Get flow with folder info
     */
    public function findWithDetails($flowId) {
        $db = self::getConnection();
        $sql = "SELECT f.*, c.name as folder_name 
                FROM flows f 
                LEFT JOIN folders c ON f.folder_id = c.id 
                WHERE f.id = ?";
        $result = $db->rawQueryOne($sql, [$flowId]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find flow with details failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Count flows in project
     */
    public function countByProject($projectId) {
        return $this->count(['project_id' => $projectId]);
    }

    /**
     * Count active flows in project
     */
    public function countActiveByProject($projectId) {
        return $this->count(['project_id' => $projectId, 'is_active' => 1]);
    }

    /**
     * Search flows by name or description
     */
    public function search($projectId, $keyword, $limit = 50) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->where("(name LIKE ? OR description LIKE ?)", ['%' . $keyword . '%', '%' . $keyword . '%']);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Search flows failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Duplicate flow
     */
    public function duplicate($flowId, $newName = null) {
        $flow = $this->findById($flowId);
        if (!$flow) {
            throw new RepositoryException('Flow not found');
        }

        $newFlow = [
            'id' => $this->generateId(),
            'name' => $newName ?? ($flow['name'] . ' (Copy)'),
            'description' => $flow['description'],
            'project_id' => $flow['project_id'],
            'folder_id' => $flow['folder_id'],
            'flow_data' => $flow['flow_data'],
            'created_by' => $flow['created_by'],
            'is_active' => 0 // Start as inactive
        ];

        return $this->create($newFlow);
    }

    /**
     * Generate unique ID for flow
     */
    private function generateId() {
        return 'flow_' . bin2hex(random_bytes(16));
    }
}
