<?php
namespace App\Handlers;

use App\Helpers\ResponseHelper;
use App\Helpers\ValidationHelper;
use App\Helpers\JwtHelper;
use App\Helpers\FlowConverter;
use App\Helpers\FlowValidator;
use App\Repositories\ProjectRepository;
use App\Repositories\FlowRepository;
use App\Repositories\CollectionRepository;

class FlowHandler {
    private $projects;
    private $flows;
    private $collections;

    public function __construct() {
        $this->projects = new ProjectRepository();
        $this->flows = new FlowRepository();
        $this->collections = new CollectionRepository();
    }

    /**
     * GET /project/{id}/flows
     */
    public function getAll($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $list = $this->flows->listByProject($projectId);
        ResponseHelper::success($list, 'Flows fetched');
    }

    /**
     * GET /project/{id}/flows/active
     */
    public function getActive($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $list = $this->flows->listActiveByProject($projectId);
        ResponseHelper::success($list, 'Active flows fetched');
    }

    /**
     * POST /project/{id}/flows
     */
    public function create($projectId) {
        if (!$projectId) { 
            ResponseHelper::error('Project ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        if (!$this->projects->isMember($projectId, $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $input = ValidationHelper::getJsonInput();
        ValidationHelper::required($input, ['name']);
        
        $name = ValidationHelper::sanitize($input['name']);
        $description = isset($input['description']) ? ValidationHelper::sanitize($input['description']) : null;
        $collectionId = isset($input['collection_id']) ? ValidationHelper::sanitize($input['collection_id']) : null;
        $flowInputs = isset($input['flow_inputs']) ? $input['flow_inputs'] : [];
        $flowData = $input['flow_data'] ?? ['version' => '1.0', 'steps' => [], 'config' => ['delay' => 0, 'retryCount' => 1, 'parallel' => false]];
        $isActive = isset($input['is_active']) ? (int)!!$input['is_active'] : 1;

        // Validate flow inputs
        if (!empty($flowInputs)) {
            $validationErrors = FlowValidator::validateFlowInputs($flowInputs);
            if (!empty($validationErrors)) {
                ResponseHelper::error('Invalid flow inputs: ' . implode(', ', $validationErrors), 400);
            }
        }

        // Validate collection belongs to project if provided
        if ($collectionId) {
            if (!$this->collections->belongsToProject($collectionId, $projectId)) {
                ResponseHelper::error('Collection does not belong to this project', 400);
            }
        }

        try {
            // Handle dual format conversion
            $flowDataSteps = $flowData;
            $flowDataUI = null;

            // Check if input is React Flow format (has nodes and edges)
            if (isset($flowData['nodes']) && isset($flowData['edges'])) {
                // Validate React Flow format
                $validationErrors = FlowConverter::validateReactFlowFormat($flowData);
                if (!empty($validationErrors)) {
                    ResponseHelper::error('Invalid flow format: ' . implode(', ', $validationErrors), 400);
                }

                // Convert React Flow to Steps for execution
                $flowDataSteps = FlowConverter::reactFlowToSteps($flowData);
                $flowDataUI = $flowData; // Store React Flow as-is for UI
            } else {
                // Validate Steps format
                $validationErrors = FlowConverter::validateStepsFormat($flowData);
                if (!empty($validationErrors)) {
                    ResponseHelper::error('Invalid flow format: ' . implode(', ', $validationErrors), 400);
                }

                // Convert Steps to React Flow for UI
                $flowDataUI = FlowConverter::stepsToReactFlow($flowData);
            }

            // Validate variable references in steps format
            $validationErrors = FlowValidator::validateVariableReferences($flowDataSteps);
            if (!empty($validationErrors)) {
                ResponseHelper::error('Invalid variable references: ' . implode(', ', $validationErrors), 400);
            }

            $flowId = $this->flows->createForProject($projectId, [
                'name' => $name,
                'description' => $description,
                'collection_id' => $collectionId,
                'flow_inputs' => json_encode($flowInputs),
                'flow_data' => json_encode($flowDataSteps),
                'ui_data' => json_encode($flowDataUI),
                'is_active' => $isActive,
                'created_by' => $userId
            ]);

            $flow = $this->flows->findById($flowId);
            ResponseHelper::created($flow, 'Flow created');
        } catch (\Exception $e) {
            error_log('Flow create error: ' . $e->getMessage());
            ResponseHelper::error('Failed to create flow', 500);
        }
    }

    /**
     * GET /flow/{id}
     */
    public function getById($id) {
        if (!$id) { 
            ResponseHelper::error('Flow ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $flow = $this->flows->findWithDetails($id);
        if (!$flow) { 
            ResponseHelper::error('Flow not found', 404); 
        }
        
        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        ResponseHelper::success($flow, 'Flow detail');
    }

    /**
     * PUT /flow/{id}
     */
    public function update($id) {
        if (!$id) { 
            ResponseHelper::error('Flow ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $flow = $this->flows->findById($id);
        if (!$flow) { 
            ResponseHelper::error('Flow not found', 404); 
        }
        
        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }
        
        $input = ValidationHelper::getJsonInput();
        $data = [];
        
        if (isset($input['name'])) { 
            $data['name'] = ValidationHelper::sanitize($input['name']); 
        }
        if (isset($input['description'])) { 
            $data['description'] = ValidationHelper::sanitize($input['description']); 
        }
        if (isset($input['collection_id'])) { 
            $collectionId = ValidationHelper::sanitize($input['collection_id']);
            // Validate collection belongs to project if provided
            if ($collectionId && !$this->collections->belongsToProject($collectionId, $flow['project_id'])) {
                ResponseHelper::error('Collection does not belong to this project', 400);
            }
            $data['collection_id'] = $collectionId;
        }
        if (isset($input['flow_data'])) {
            // Handle dual format conversion for update
            $flowDataInput = $input['flow_data'];

            // Check if input is React Flow format (has nodes and edges)
            if (isset($flowDataInput['nodes']) && isset($flowDataInput['edges'])) {
                // Validate React Flow format
                $validationErrors = FlowConverter::validateReactFlowFormat($flowDataInput);
                if (!empty($validationErrors)) {
                    ResponseHelper::error('Invalid flow format: ' . implode(', ', $validationErrors), 400);
                }

                // Convert React Flow to Steps for execution
                $data['flow_data'] = FlowConverter::reactFlowToSteps($flowDataInput);
                $data['ui_data'] = $flowDataInput; // Store React Flow for UI
            } else {
                // Validate Steps format
                $validationErrors = FlowConverter::validateStepsFormat($flowDataInput);
                if (!empty($validationErrors)) {
                    ResponseHelper::error('Invalid flow format: ' . implode(', ', $validationErrors), 400);
                }

                // Convert Steps to React Flow for UI
                $data['flow_data'] = $flowDataInput;
                $data['ui_data'] = FlowConverter::stepsToReactFlow($flowDataInput);
            }
        }

        // Validate variable references if flow_data is updated
        if (isset($data['flow_data'])) {
            // Get existing flow inputs if not being updated
            $existingFlow = $this->flows->findById($id);
            $flowInputs = isset($input['flow_inputs']) ? $input['flow_inputs'] :
                          ($existingFlow ? json_decode($existingFlow['flow_inputs'], true) : []);

            $validationErrors = FlowValidator::validateVariableReferences($data['flow_data']);
            if (!empty($validationErrors)) {
                ResponseHelper::error('Invalid variable references: ' . implode(', ', $validationErrors), 400);
            }
        }

        if (isset($input['is_active'])) {
            $data['is_active'] = (int)!!$input['is_active'];
        }

        try {
            $this->flows->updateFlow($id, $data);
            $updated = $this->flows->findById($id);
            ResponseHelper::success($updated, 'Flow updated');
        } catch (\Exception $e) {
            error_log('Flow update error: ' . $e->getMessage());
            ResponseHelper::error('Failed to update flow', 500);
        }
    }

    /**
     * DELETE /flow/{id}
     */
    public function delete($id) {
        if (!$id) { 
            ResponseHelper::error('Flow ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $flow = $this->flows->findById($id);
        if (!$flow) { 
            ResponseHelper::error('Flow not found', 404); 
        }
        
        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            $this->flows->delete($id);
            ResponseHelper::success(['id' => $id], 'Flow deleted');
        } catch (\Exception $e) {
            error_log('Flow delete error: ' . $e->getMessage());
            ResponseHelper::error('Failed to delete flow', 500);
        }
    }

    /**
     * PUT /flow/{id}/toggle-active
     */
    public function toggleActive($id) {
        if (!$id) { 
            ResponseHelper::error('Flow ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $flow = $this->flows->findById($id);
        if (!$flow) { 
            ResponseHelper::error('Flow not found', 404); 
        }
        
        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            $this->flows->toggleActive($id);
            $updated = $this->flows->findById($id);
            $status = $updated['is_active'] ? 'activated' : 'deactivated';
            ResponseHelper::success($updated, "Flow {$status}");
        } catch (\Exception $e) {
            error_log('Flow toggle error: ' . $e->getMessage());
            ResponseHelper::error('Failed to toggle flow status', 500);
        }
    }

    /**
     * POST /flow/{id}/duplicate
     */
    public function duplicate($id) {
        if (!$id) { 
            ResponseHelper::error('Flow ID is required', 400); 
        }
        $userId = $this->requireUserId();
        
        $flow = $this->flows->findById($id);
        if (!$flow) { 
            ResponseHelper::error('Flow not found', 404); 
        }
        
        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        $input = ValidationHelper::getJsonInput();
        $newName = isset($input['name']) ? ValidationHelper::sanitize($input['name']) : null;

        try {
            $newFlowId = $this->flows->duplicate($id, $newName);
            $newFlow = $this->flows->findById($newFlowId);
            ResponseHelper::created($newFlow, 'Flow duplicated');
        } catch (\Exception $e) {
            error_log('Flow duplicate error: ' . $e->getMessage());
            ResponseHelper::error('Failed to duplicate flow', 500);
        }
    }

    /**
     * PUT /flow/{id}/activate
     */
    public function activate($id) {
        if (!$id) {
            ResponseHelper::error('Flow ID is required', 400);
        }
        $userId = $this->requireUserId();

        $flow = $this->flows->findById($id);
        if (!$flow) {
            ResponseHelper::error('Flow not found', 404);
        }

        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            $this->flows->updateFlow($id, ['is_active' => 1]);
            $updated = $this->flows->findById($id);
            ResponseHelper::success($updated, 'Flow activated successfully');
        } catch (\Exception $e) {
            error_log('Flow activate error: ' . $e->getMessage());
            ResponseHelper::error('Failed to activate flow', 500);
        }
    }

    /**
     * PUT /flow/{id}/deactivate
     */
    public function deactivate($id) {
        if (!$id) {
            ResponseHelper::error('Flow ID is required', 400);
        }
        $userId = $this->requireUserId();

        $flow = $this->flows->findById($id);
        if (!$flow) {
            ResponseHelper::error('Flow not found', 404);
        }

        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        try {
            $this->flows->updateFlow($id, ['is_active' => 0]);
            $updated = $this->flows->findById($id);
            ResponseHelper::success($updated, 'Flow deactivated successfully');
        } catch (\Exception $e) {
            error_log('Flow deactivate error: ' . $e->getMessage());
            ResponseHelper::error('Failed to deactivate flow', 500);
        }
    }

    /**
     * POST /flow/{id}/execute
     */
    public function execute($id) {
        if (!$id) {
            ResponseHelper::error('Flow ID is required', 400);
        }
        $userId = $this->requireUserId();

        $flow = $this->flows->findById($id);
        if (!$flow) {
            ResponseHelper::error('Flow not found', 404);
        }

        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        // Check if flow is active
        if (!$flow['is_active']) {
            ResponseHelper::error('Flow is not active', 400);
        }

        try {
            // For now, just return success with flow details
            // In a real implementation, this would execute the flow logic
            $executionResult = [
                'flow_id' => $id,
                'status' => 'completed',
                'message' => 'Flow executed successfully',
                'execution_time' => date('Y-m-d H:i:s'),
                'flow_data' => $flow['flow_data']
            ];
            ResponseHelper::success($executionResult, 'Flow executed successfully');
        } catch (\Exception $e) {
            error_log('Flow execute error: ' . $e->getMessage());
            ResponseHelper::error('Failed to execute flow', 500);
        }
    }

    /**
     * GET /flow/{id}/ui - Get flow data for UI (React Flow format)
     */
    public function getByIdForUI($id) {
        if (!$id) {
            ResponseHelper::error('Flow ID is required', 400);
        }
        $userId = $this->requireUserId();

        $flow = $this->flows->findById($id);
        if (!$flow) {
            ResponseHelper::error('Flow not found', 404);
        }

        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        // Return UI data if available, otherwise convert from steps
        $uiData = $flow['ui_data'] ? json_decode($flow['ui_data'], true) : FlowConverter::stepsToReactFlow(json_decode($flow['flow_data'], true));

        $response = [
            'id' => $flow['id'],
            'name' => $flow['name'],
            'description' => $flow['description'],
            'project_id' => $flow['project_id'],
            'collection_id' => $flow['collection_id'],
            'flow_inputs' => $flow['flow_inputs'] ? json_decode($flow['flow_inputs'], true) : [],
            'flow_data' => $uiData, // React Flow format for UI
            'is_active' => $flow['is_active'],
            'created_by' => $flow['created_by'],
            'created_at' => $flow['created_at'],
            'updated_at' => $flow['updated_at']
        ];

        ResponseHelper::success($response, 'Flow data for UI');
    }

    /**
     * PUT /flow/{id}/ui - Update flow from UI (React Flow format)
     */
    public function updateFromUI($id) {
        if (!$id) {
            ResponseHelper::error('Flow ID is required', 400);
        }
        $userId = $this->requireUserId();

        $flow = $this->flows->findById($id);
        if (!$flow) {
            ResponseHelper::error('Flow not found', 404);
        }

        if (!$this->projects->isMember($flow['project_id'], $userId)) {
            ResponseHelper::error('Forbidden', 403);
        }

        $input = ValidationHelper::getJsonInput();

        // Validate React Flow format
        $validationErrors = FlowConverter::validateReactFlowFormat($input['flow_data']);
        if (!empty($validationErrors)) {
            ResponseHelper::error('Invalid flow format: ' . implode(', ', $validationErrors), 400);
        }

        // Convert to steps format for execution
        $stepsData = FlowConverter::reactFlowToSteps($input['flow_data']);

        $updateData = [
            'name' => isset($input['name']) ? ValidationHelper::sanitize($input['name']) : $flow['name'],
            'description' => isset($input['description']) ? ValidationHelper::sanitize($input['description']) : $flow['description'],
            'flow_inputs' => isset($input['flow_inputs']) ? json_encode($input['flow_inputs']) : $flow['flow_inputs'],
            'flow_data' => json_encode($stepsData), // Steps format for execution
            'ui_data' => json_encode($input['flow_data']), // React Flow format for UI
            'updated_at' => date('Y-m-d H:i:s')
        ];

        // Handle collection update
        if (isset($input['collection_id'])) {
            $collectionId = ValidationHelper::sanitize($input['collection_id']);
            if ($collectionId && !$this->collections->belongsToProject($collectionId, $flow['project_id'])) {
                ResponseHelper::error('Collection does not belong to this project', 400);
            }
            $updateData['collection_id'] = $collectionId;
        }

        // Handle active status
        if (isset($input['is_active'])) {
            $updateData['is_active'] = (int)!!$input['is_active'];
        }

        try {
            $this->flows->updateFlow($id, $updateData);
            $updated = $this->flows->findById($id);
            ResponseHelper::success($updated, 'Flow updated');
        } catch (\Exception $e) {
            error_log('Flow update error: ' . $e->getMessage());
            ResponseHelper::error('Failed to update flow', 500);
        }
    }

    private function requireUserId() {
        $token = JwtHelper::getTokenFromRequest();
        $payload = JwtHelper::validateAccessToken($token);
        if (!$payload) {
            ResponseHelper::error('Unauthorized', 401);
        }
        return $payload['sub'];
    }
}
