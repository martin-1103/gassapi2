<?php
namespace App\Repositories;

/**
 * Project Repository for projects and memberships
 */
class ProjectRepository extends BaseRepository {

    protected function getTableName() {
        return 'projects';
    }

    /**
     * Create project with owner
     */
    public function createWithOwner($ownerId, array $data) {
        // Ensure required fields
        if (!isset($data['id'])) {
            $data['id'] = 'proj_' . time() . '_' . substr(md5(uniqid()), 0, 8);
        }
        $data['owner_id'] = $ownerId;
        if (!isset($data['settings'])) {
            $data['settings'] = json_encode([ 'visibility' => 'private' ]);
        }
        if (!isset($data['is_public'])) {
            $data['is_public'] = 0;
        }

        // DB unique constraint will protect (owner_id, name)
        $projectId = parent::create($data);
        return $projectId;
    }

    /**
     * List projects where user is owner or member
     */
    public function listForUser($userId, $limit = 50, $offset = 0) {
        $db = self::getConnection();
        $sql = "SELECT DISTINCT p.* FROM projects p\n                LEFT JOIN project_members pm ON pm.project_id = p.id\n                WHERE p.owner_id = ? OR pm.user_id = ?\n                ORDER BY p.created_at DESC\n                LIMIT ?, ?";
        $params = [$userId, $userId, (int)$offset, (int)$limit];
        $rows = $db->rawQuery($sql, $params);
        return $rows ?: [];
    }

    /**
     * Get single project ensuring user has access (owner or member)
     */
    public function findForUser($projectId, $userId) {
        $db = self::getConnection();
        $sql = "SELECT DISTINCT p.* FROM projects p\n                LEFT JOIN project_members pm ON pm.project_id = p.id\n                WHERE p.id = ? AND (p.owner_id = ? OR pm.user_id = ?)\n                LIMIT 1";
        $rows = $db->rawQuery($sql, [$projectId, $userId, $userId]);
        return $rows ? $rows[0] : null;
    }

    /**
     * Check if user is project owner
     */
    public function isOwner($projectId, $userId) {
        $project = $this->findById($projectId);
        return $project && $project['owner_id'] === $userId;
    }

    /**
     * Check if user is member (or owner)
     */
    public function isMember($projectId, $userId) {
        if ($this->isOwner($projectId, $userId)) return true;
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->where('user_id', $userId);
        $row = $db->getOne('project_members');
        return (bool)$row;
    }

    /**
     * Add member to project
     */
    public function addMember($projectId, $userId, $invitedBy) {
        $db = self::getConnection();
        $data = [
            'id' => 'pm_' . time() . '_' . substr(md5(uniqid()), 0, 8),
            'project_id' => $projectId,
            'user_id' => $userId,
            'invited_by' => $invitedBy,
        ];
        $id = $db->insert('project_members', $data);
        if (!$id) {
            throw new RepositoryException('Add member failed: ' . $db->getLastError());
        }
        return $data['id'];
    }

    /**
     * Remove member from project
     */
    public function removeMember($projectId, $userId) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->where('user_id', $userId);
        $ok = $db->delete('project_members');
        if ($ok === false) {
            throw new RepositoryException('Remove member failed: ' . $db->getLastError());
        }
        return $ok;
    }

    /**
     * Count project members
     */
    public function countMembers($projectId) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        return $db->getValue('project_members', 'COUNT(*)');
    }
}
