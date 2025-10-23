<?php
namespace App\Repositories;

use App\Config\Database;
use App\Helpers\ResponseHelper;

/**
 * Base Repository dengan shared functionality untuk semua repositories
 */
abstract class BaseRepository {

    protected static $db = null;

    /**
     * Get database connection instance
     */
    protected static function getConnection() {
        if (self::$db === null) {
            try {
                self::$db = new \MysqliDb(Database::getMysqliDbConfig());
            } catch (\Exception $e) {
                error_log("Database connection failed: " . $e->getMessage());
                ResponseHelper::error('Database connection failed', 500);
            }
        }
        return self::$db;
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
        return $db->getOne($this->getTableName());
    }

    /**
     * Find single record by custom field
     */
    public function findBy($field, $value) {
        $db = self::getConnection();
        $db->where($field, $value);
        return $db->getOne($this->getTableName());
    }

    /**
     * Find multiple records by custom field
     */
    public function findManyBy($field, $value, $limit = null) {
        $db = self::getConnection();
        $db->where($field, $value);

        if ($limit) {
            $db->limit($limit);
        }

        return $db->get($this->getTableName());
    }

    /**
     * Get all records
     */
    public function all($limit = null, $orderBy = null) {
        $db = self::getConnection();

        if ($orderBy) {
            $db->orderBy($orderBy);
        }

        if ($limit) {
            $db->limit($limit);
        }

        return $db->get($this->getTableName());
    }

    /**
     * Create new record
     */
    public function create($data) {
        $db = self::getConnection();

        // Add created_at if not exists
        if (!isset($data['created_at'])) {
            $data['created_at'] = date('Y-m-d H:i:s');
        }

        $id = $db->insert($this->getTableName(), $data);

        if (!$id) {
            ResponseHelper::error('Create failed: ' . $db->getLastError());
        }

        return $id;
    }

    /**
     * Update record by ID
     */
    public function update($id, $data) {
        $db = self::getConnection();
        $db->where($this->getPrimaryKey(), $id);

        // Add updated_at if not exists
        if (!isset($data['updated_at'])) {
            $data['updated_at'] = date('Y-m-d H:i:s');
        }

        $result = $db->update($this->getTableName(), $data);

        if (!$result) {
            ResponseHelper::error('Update failed: ' . $db->getLastError());
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
            ResponseHelper::error('Delete failed: ' . $db->getLastError());
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

        return $db->getValue($this->getTableName(), "COUNT(*)");
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
            $db->orderBy($orderBy);
        }

        $results = $db->get($this->getTableName(), [$offset, $limit]);
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