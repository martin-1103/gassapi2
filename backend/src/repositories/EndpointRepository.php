<?php
namespace App\Repositories;

use App\Repositories\BaseRepository;

class EndpointRepository extends BaseRepository {
    
    protected function getTableName() {
        return 'endpoints';
    }

    /**
     * List endpoints by folder ID
     */
    public function listByFolder($folderId, $limit = 100) {
        $db = self::getConnection();
        $db->where('folder_id', $folderId);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List endpoints failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * List endpoints by project (via folder)
     */
    public function listByProject($projectId, $limit = 100) {
        $db = self::getConnection();
        $sql = "SELECT e.* FROM endpoints e 
                INNER JOIN folders c ON e.folder_id = c.id 
                WHERE c.project_id = ? 
                ORDER BY e.created_at DESC 
                LIMIT ?";
        $result = $db->rawQuery($sql, [$projectId, $limit]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List endpoints by project failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Create endpoint for folder
     */
    public function createForFolder($folderId, $data) {
        if (!isset($data['id'])) {
            $data['id'] = $this->generateId();
        }
        $data['folder_id'] = $folderId;
        
        // Ensure JSON fields
        if (!isset($data['headers'])) {
            $data['headers'] = json_encode(new \stdClass());
        } elseif (is_array($data['headers']) || is_object($data['headers'])) {
            $data['headers'] = json_encode($data['headers']);
        }
        
        if (isset($data['body']) && (is_array($data['body']) || is_object($data['body']))) {
            $data['body'] = json_encode($data['body']);
        }

        return $this->create($data);
    }

    /**
     * Update endpoint with JSON handling
     */
    public function updateEndpoint($id, $data) {
        // Handle JSON fields
        if (isset($data['headers']) && (is_array($data['headers']) || is_object($data['headers']))) {
            $data['headers'] = json_encode($data['headers']);
        }
        if (isset($data['body']) && (is_array($data['body']) || is_object($data['body']))) {
            $data['body'] = json_encode($data['body']);
        }

        return $this->update($id, $data);
    }

    /**
     * Check if endpoint belongs to folder
     */
    public function belongsToFolder($endpointId, $folderId) {
        $endpoint = $this->findById($endpointId);
        return $endpoint && $endpoint['folder_id'] === $folderId;
    }

    /**
     * Get endpoint with folder and project info
     */
    public function findWithDetails($endpointId) {
        $db = self::getConnection();
        $sql = "SELECT e.*, c.name as folder_name, c.project_id 
                FROM endpoints e 
                INNER JOIN folders c ON e.folder_id = c.id 
                WHERE e.id = ?";
        $result = $db->rawQueryOne($sql, [$endpointId]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find endpoint with details failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Count endpoints in folder
     */
    public function countByFolder($folderId) {
        return $this->count(['folder_id' => $folderId]);
    }

    /**
     * Search endpoints by name or URL
     */
    public function search($projectId, $keyword, $limit = 50) {
        $db = self::getConnection();
        $sql = "SELECT e.* FROM endpoints e 
                INNER JOIN folders c ON e.folder_id = c.id 
                WHERE c.project_id = ? 
                AND (e.name LIKE ? OR e.url LIKE ?) 
                ORDER BY e.created_at DESC 
                LIMIT ?";
        $search = '%' . $keyword . '%';
        $result = $db->rawQuery($sql, [$projectId, $search, $search, $limit]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Search endpoints failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Get endpoints grouped by folder
     */
    public function listGroupedByFolder($projectId) {
        $db = self::getConnection();
        $sql = "SELECT e.*, c.name as folder_name 
                FROM endpoints e 
                INNER JOIN folders c ON e.folder_id = c.id 
                WHERE c.project_id = ? 
                ORDER BY c.name, e.created_at DESC";
        $result = $db->rawQuery($sql, [$projectId]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List grouped endpoints failed: ' . $db->getLastError());
        }
        
        // Group by folder
        $grouped = [];
        foreach ($result as $endpoint) {
            $folderId = $endpoint['folder_id'];
            if (!isset($grouped[$folderId])) {
                $grouped[$folderId] = [
                    'folder_id' => $folderId,
                    'folder_name' => $endpoint['folder_name'],
                    'endpoints' => []
                ];
            }
            unset($endpoint['folder_name']);
            $grouped[$folderId]['endpoints'][] = $endpoint;
        }
        
        return array_values($grouped);
    }

    /**
     * Generate unique ID for endpoint
     */
    private function generateId() {
        return 'ep_' . bin2hex(random_bytes(16));
    }
}
