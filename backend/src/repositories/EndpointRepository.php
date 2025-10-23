<?php
namespace App\Repositories;

use App\Repositories\BaseRepository;

class EndpointRepository extends BaseRepository {
    
    protected function getTableName() {
        return 'endpoints';
    }

    /**
     * List endpoints by collection ID
     */
    public function listByCollection($collectionId, $limit = 100) {
        $db = self::getConnection();
        $db->where('collection_id', $collectionId);
        $db->orderBy('created_at', 'DESC');
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List endpoints failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * List endpoints by project (via collection)
     */
    public function listByProject($projectId, $limit = 100) {
        $db = self::getConnection();
        $sql = "SELECT e.* FROM endpoints e 
                INNER JOIN collections c ON e.collection_id = c.id 
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
     * Create endpoint for collection
     */
    public function createForCollection($collectionId, $data) {
        if (!isset($data['id'])) {
            $data['id'] = $this->generateId();
        }
        $data['collection_id'] = $collectionId;
        
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
     * Check if endpoint belongs to collection
     */
    public function belongsToCollection($endpointId, $collectionId) {
        $endpoint = $this->findById($endpointId);
        return $endpoint && $endpoint['collection_id'] === $collectionId;
    }

    /**
     * Get endpoint with collection and project info
     */
    public function findWithDetails($endpointId) {
        $db = self::getConnection();
        $sql = "SELECT e.*, c.name as collection_name, c.project_id 
                FROM endpoints e 
                INNER JOIN collections c ON e.collection_id = c.id 
                WHERE e.id = ?";
        $result = $db->rawQueryOne($sql, [$endpointId]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find endpoint with details failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Count endpoints in collection
     */
    public function countByCollection($collectionId) {
        return $this->count(['collection_id' => $collectionId]);
    }

    /**
     * Search endpoints by name or URL
     */
    public function search($projectId, $keyword, $limit = 50) {
        $db = self::getConnection();
        $sql = "SELECT e.* FROM endpoints e 
                INNER JOIN collections c ON e.collection_id = c.id 
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
     * Get endpoints grouped by collection
     */
    public function listGroupedByCollection($projectId) {
        $db = self::getConnection();
        $sql = "SELECT e.*, c.name as collection_name 
                FROM endpoints e 
                INNER JOIN collections c ON e.collection_id = c.id 
                WHERE c.project_id = ? 
                ORDER BY c.name, e.created_at DESC";
        $result = $db->rawQuery($sql, [$projectId]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('List grouped endpoints failed: ' . $db->getLastError());
        }
        
        // Group by collection
        $grouped = [];
        foreach ($result as $endpoint) {
            $collectionId = $endpoint['collection_id'];
            if (!isset($grouped[$collectionId])) {
                $grouped[$collectionId] = [
                    'collection_id' => $collectionId,
                    'collection_name' => $endpoint['collection_name'],
                    'endpoints' => []
                ];
            }
            unset($endpoint['collection_name']);
            $grouped[$collectionId]['endpoints'][] = $endpoint;
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
