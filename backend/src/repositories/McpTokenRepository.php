<?php
namespace App\Repositories;

/**
 * MCP Token Repository
 */
class McpTokenRepository extends BaseRepository {

    protected function getTableName() {
        return 'mcp_client_tokens';
    }

    /**
     * Create a new MCP client token and return [id, token]
     */
    public function issueToken($projectId, $createdBy) {
        $tokenPlain = bin2hex(random_bytes(32));
        $tokenHash = hash('sha256', $tokenPlain);
        $data = [
            'id' => 'mcp_' . time() . '_' . substr(md5(uniqid()), 0, 8),
            'project_id' => $projectId,
            'token_hash' => $tokenHash,
            'created_by' => $createdBy,
            'is_active' => 1
        ];
        $this->create($data);
        return [ 'id' => $data['id'], 'token' => $tokenPlain ];
    }

    public function findActiveByPlainToken($plainToken) {
        $hash = hash('sha256', $plainToken);
        $db = self::getConnection();
        $db->where('token_hash', $hash);
        $db->where('is_active', 1);
        return $db->getOne($this->getTableName());
    }

    public function setLastValidatedNow($id) {
        return parent::update($id, ['last_validated_at' => date('Y-m-d H:i:s')]);
    }

    public function revokeById($id) {
        return parent::update($id, ['is_active' => 0]);
    }
}
