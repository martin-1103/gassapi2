<?php
namespace App\Repositories;

use App\Config\Database;
use App\Helpers\ResponseHelper;

/**
 * Base Repository dengan shared functionality untuk semua repositories
 */
abstract class BaseRepository {

    /**
     * Get database connection instance (shared singleton from Database)
     */
    protected static function getConnection() {
        try {
            static $db = null;
            if ($db === null) {
                $db = new \MysqliDb(Database::getMysqliDbConfig());

                // Validate that we have a proper MysqliDb instance
                if (!method_exists($db, 'insert') || !method_exists($db, 'get')) {
                    throw new RepositoryException('Invalid MysqliDb instance - required methods not available');
                }
            }
            return $db;
        } catch (\Exception $e) {
            error_log("Database connection failed: " . $e->getMessage());
            throw new RepositoryException('Database connection failed', 500, $e);
        }
    }

    /**
     * Get table name dari child class
     */
    abstract protected function getTableName();

    /**
     * Get primary key field name
     */
    protected function getPrimaryKey() {
        return 'id';
    }

    /**
     * Find single record by ID
     */
    public function findById($id) {
        $db = self::getConnection();
        $db->where($this->getPrimaryKey(), $id);
        $result = $db->getOne($this->getTableName());
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find by ID failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Find single record by custom field
     */
    public function findBy($field, $value) {
        $db = self::getConnection();
        $db->where($field, $value);
        $result = $db->getOne($this->getTableName());
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find by field failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Find multiple records by custom field
     */
    public function findManyBy($field, $value, $limit = null) {
        $db = self::getConnection();
        $db->where($field, $value);
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Find many by field failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Get all records
     */
    public function all($limit = null, $orderBy = null) {
        $db = self::getConnection();
        if ($orderBy) {
            $db->orderBy($orderBy);
        }
        $result = $db->get($this->getTableName(), $limit);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Get all failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Create new record
     */
    public function create($data) {
        $db = self::getConnection();
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }

        // For tables with custom primary key, return the provided ID
        $customId = $data[$this->getPrimaryKey()] ?? null;

        $result = $db->insert($this->getTableName(), $data);
        if (!$result) {
            throw new RepositoryException('Create failed: ' . $db->getLastError());
        }

        // Return custom ID if provided, otherwise return auto-increment ID
        return $customId ?: $result;
    }

    /**
     * Update record by ID
     */
    public function update($id, $data) {
        $db = self::getConnection();
        $db->where($this->getPrimaryKey(), $id);
        if (!isset($data['updated_at'])) {
            $data['updated_at'] = date('Y-m-d H:i:s');
        }
        $result = $db->update($this->getTableName(), $data);
        if (!$result) {
            throw new RepositoryException('Update failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Delete record by ID
     */
    public function delete($id) {
        $db = self::getConnection();
        $db->where($this->getPrimaryKey(), $id);
        $result = $db->delete($this->getTableName());
        if (!$result) {
            throw new RepositoryException('Delete failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Count records
     */
    public function count($where = null) {
        $db = self::getConnection();
        if ($where) {
            foreach ($where as $field => $value) {
                $db->where($field, $value);
            }
        }
        $result = $db->getValue($this->getTableName(), "COUNT(*)");
        if ($db->getLastErrno()) {
            throw new RepositoryException('Count failed: ' . $db->getLastError());
        }
        return $result;
    }

    /**
     * Check if record exists
     */
    public function exists($field, $value) {
        return $this->count([$field => $value]) > 0;
    }

    /**
     * Get records with pagination
     */
    public function paginate($page = 1, $limit = 10, $orderBy = null) {
        $db = self::getConnection();
        $offset = ($page - 1) * $limit;
        if ($orderBy) {
            // Parse orderBy if it contains direction (e.g., "created_at DESC")
            $parts = explode(' ', trim($orderBy));
            if (count($parts) === 2) {
                $db->orderBy($parts[0], $parts[1]);
            } else {
                $db->orderBy($orderBy);
            }
        }
        $results = $db->get($this->getTableName(), [$offset, $limit]);
        if ($db->getLastErrno()) {
            throw new RepositoryException('Pagination failed: ' . $db->getLastError());
        }
        $total = $this->count();
        return [
            'data' => $results,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ];
    }

    /**
     * Begin transaction
     */
    protected static function beginTransaction() {
        $db = self::getConnection();
        $db->startTransaction();
    }

    /**
     * Commit transaction
     */
    protected static function commit() {
        $db = self::getConnection();
        $db->commit();
    }

    /**
     * Rollback transaction
     */
    protected static function rollback() {
        $db = self::getConnection();
        $db->rollback();
    }
}