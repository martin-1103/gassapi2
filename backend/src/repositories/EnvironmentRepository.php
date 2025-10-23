<?php
namespace App\Repositories;

/**
 * Environment Repository
 */
class EnvironmentRepository extends BaseRepository {

    protected function getTableName() {
        return 'environments';
    }

    public function createForProject($projectId, array $data) {
        if (!isset($data['id'])) {
            $data['id'] = 'env_' . time() . '_' . substr(md5(uniqid()), 0, 8);
        }
        $data['project_id'] = $projectId;
        if (!isset($data['variables'])) {
            $data['variables'] = json_encode(new \stdClass());
        } else if (is_array($data['variables'])) {
            $data['variables'] = json_encode($data['variables']);
        }
        if (!isset($data['is_default'])) {
            $data['is_default'] = 0;
        }
        // If is_default set, unset others
        if (!empty($data['is_default'])) {
            $this->unsetDefaultForProject($projectId);
        }
        return parent::create($data);
    }

    public function listByProject($projectId) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        $db->orderBy('is_default', 'DESC');
        $db->orderBy('created_at', 'ASC');
        return $db->get($this->getTableName());
    }

    public function unsetDefaultForProject($projectId) {
        $db = self::getConnection();
        $db->where('project_id', $projectId);
        return $db->update($this->getTableName(), ['is_default' => 0]);
    }

    public function setDefault($envId) {
        $env = $this->findById($envId);
        if (!$env) return false;
        $this->unsetDefaultForProject($env['project_id']);
        return parent::update($envId, ['is_default' => 1]);
    }
}
