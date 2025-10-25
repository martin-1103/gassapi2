<?php
namespace App\Helpers;

class FlowConverter {

    /**
     * Convert React Flow format to Steps format
     * UI (React Flow) → Execution (Steps)
     */
    public static function reactFlowToSteps($reactFlowData) {
        if (!isset($reactFlowData['nodes']) || !isset($reactFlowData['edges'])) {
            throw new \InvalidArgumentException('Invalid React Flow data format');
        }

        $nodes = $reactFlowData['nodes'];
        $edges = $reactFlowData['edges'];

        // Sort nodes based on edges connection (topological sort)
        $orderedNodes = self::sortNodesByEdges($nodes, $edges);

        $steps = [];
        foreach ($orderedNodes as $node) {
            $step = [
                'id' => $node['id'],
                'name' => $node['data']['name'] ?? $node['id'],
                'method' => $node['data']['method'] ?? 'GET',
                'url' => $node['data']['url'] ?? '',
                'headers' => $node['data']['headers'] ?? [],
                'body' => $node['data']['body'] ?? null,
                'outputs' => $node['data']['outputs'] ?? [],
                'tests' => $node['data']['tests'] ?? []
            ];

            // Convert variable references from node references to step references
            $step = self::convertVariableReferences($step);
            $steps[] = $step;
        }

        return [
            'version' => '1.0',
            'steps' => $steps,
            'config' => [
                'delay' => 0,
                'retryCount' => 1,
                'parallel' => false
            ]
        ];
    }

    /**
     * Convert Steps format to React Flow format
     * Execution (Steps) → UI (React Flow)
     */
    public static function stepsToReactFlow($stepsData) {
        if (!isset($stepsData['steps'])) {
            throw new \InvalidArgumentException('Invalid Steps data format');
        }

        $nodes = [];
        $edges = [];

        foreach ($stepsData['steps'] as $index => $step) {
            // Create node for each step
            $node = [
                'id' => $step['id'],
                'type' => 'apiCall',
                'position' => [
                    'x' => $index * 250,
                    'y' => 100
                ],
                'data' => [
                    'name' => $step['name'] ?? $step['id'],
                    'method' => $step['method'] ?? 'GET',
                    'url' => $step['url'] ?? '',
                    'headers' => $step['headers'] ?? [],
                    'body' => $step['body'] ?? null,
                    'outputs' => $step['outputs'] ?? [],
                    'tests' => $step['tests'] ?? []
                ]
            ];

            // Convert variable references from step references to node references
            $node['data'] = self::convertVariableReferencesToNodes($node['data']);
            $nodes[] = $node;

            // Create edge to next step
            if ($index < count($stepsData['steps']) - 1) {
                $nextStepId = $stepsData['steps'][$index + 1]['id'];
                $edges[] = [
                    'id' => "edge-{$step['id']}-$nextStepId",
                    'source' => $step['id'],
                    'target' => $nextStepId,
                    'type' => 'smoothstep'
                ];
            }
        }

        return [
            'nodes' => $nodes,
            'edges' => $edges
        ];
    }

    /**
     * Sort nodes based on edge connections (simple topological sort)
     */
    private static function sortNodesByEdges($nodes, $edges) {
        if (empty($edges)) {
            return $nodes;
        }

        // Create adjacency list
        $adjacency = [];
        $nodeMap = [];

        foreach ($nodes as $node) {
            $nodeMap[$node['id']] = $node;
            $adjacency[$node['id']] = [];
        }

        foreach ($edges as $edge) {
            $source = $edge['source'];
            $target = $edge['target'];
            $adjacency[$source][] = $target;
        }

        // Find nodes with no incoming edges
        $visited = [];
        $result = [];
        $queue = [];

        // Find starting nodes (no incoming edges)
        foreach ($nodeMap as $nodeId => $node) {
            $hasIncoming = false;
            foreach ($edges as $edge) {
                if ($edge['target'] === $nodeId) {
                    $hasIncoming = true;
                    break;
                }
            }
            if (!$hasIncoming) {
                $queue[] = $nodeId;
            }
        }

        // Topological sort
        while (!empty($queue)) {
            $current = array_shift($queue);
            $visited[] = $current;
            $result[] = $nodeMap[$current];

            foreach ($adjacency[$current] as $neighbor) {
                if (!in_array($neighbor, $visited) && !in_array($neighbor, $queue)) {
                    $queue[] = $neighbor;
                }
            }
        }

        // Add any remaining nodes (in case of disconnected graphs)
        foreach ($nodes as $node) {
            if (!in_array($node['id'], $visited)) {
                $result[] = $node;
            }
        }

        return $result;
    }

    /**
     * Convert variable references from format like {{nodeId.field}} to {{stepId.field}}
     */
    private static function convertVariableReferences($step) {
        // Convert in headers
        if (!empty($step['headers'])) {
            $step['headers'] = self::replaceReferencesInArray($step['headers']);
        }

        // Convert in body
        if (!empty($step['body'])) {
            if (is_array($step['body'])) {
                $step['body'] = self::replaceReferencesInArray($step['body']);
            } else {
                $step['body'] = self::replaceReferencesInString($step['body']);
            }
        }

        // Convert in URL
        if (!empty($step['url'])) {
            $step['url'] = self::replaceReferencesInString($step['url']);
        }

        return $step;
    }

    /**
     * Convert variable references from format like {{stepId.field}} to {{nodeId.field}}
     */
    private static function convertVariableReferencesToNodes($nodeData) {
        // Convert in headers
        if (!empty($nodeData['headers'])) {
            $nodeData['headers'] = self::replaceReferencesInArray($nodeData['headers']);
        }

        // Convert in body
        if (!empty($nodeData['body'])) {
            if (is_array($nodeData['body'])) {
                $nodeData['body'] = self::replaceReferencesInArray($nodeData['body']);
            } else {
                $nodeData['body'] = self::replaceReferencesInString($nodeData['body']);
            }
        }

        // Convert in URL
        if (!empty($nodeData['url'])) {
            $nodeData['url'] = self::replaceReferencesInString($nodeData['url']);
        }

        return $nodeData;
    }

    /**
     * Replace references in array structure recursively
     */
    private static function replaceReferencesInArray($array) {
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $array[$key] = self::replaceReferencesInArray($value);
            } elseif (is_string($value)) {
                $array[$key] = self::replaceReferencesInString($value);
            }
        }
        return $array;
    }

    /**
     * Replace variable references in string
     * Pattern: {{nodeId.field}} or {{stepId.field}} - just validate format
     */
    private static function replaceReferencesInString($string) {
        // For now, just return as-is since the format is compatible
        // Both node and step references use the same {{id.field}} format
        return $string;
    }

    /**
     * Validate React Flow structure
     */
    public static function validateReactFlowFormat($data) {
        $errors = [];

        if (!isset($data['nodes'])) {
            $errors[] = 'Missing nodes array';
        } else {
            foreach ($data['nodes'] as $index => $node) {
                if (!isset($node['id'])) {
                    $errors[] = "Node $index missing id";
                }
                if (!isset($node['data'])) {
                    $errors[] = "Node $index missing data";
                } else {
                    if (!isset($node['data']['method'])) {
                        $errors[] = "Node $index missing method";
                    }
                    if (!isset($node['data']['url'])) {
                        $errors[] = "Node $index missing URL";
                    }
                }
            }
        }

        if (!isset($data['edges'])) {
            $errors[] = 'Missing edges array';
        } else {
            foreach ($data['edges'] as $index => $edge) {
                if (!isset($edge['source'])) {
                    $errors[] = "Edge $index missing source";
                }
                if (!isset($edge['target'])) {
                    $errors[] = "Edge $index missing target";
                }
            }
        }

        return $errors;
    }

    /**
     * Validate Steps structure
     */
    public static function validateStepsFormat($data) {
        $errors = [];

        if (!isset($data['steps'])) {
            $errors[] = 'Missing steps array';
        } else {
            foreach ($data['steps'] as $index => $step) {
                if (!isset($step['id'])) {
                    $errors[] = "Step $index missing id";
                }
                if (!isset($step['method'])) {
                    $errors[] = "Step $index missing method";
                }
                if (!isset($step['url'])) {
                    $errors[] = "Step $index missing URL";
                }
            }
        }

        if (!isset($data['version'])) {
            $errors[] = 'Missing version';
        }

        return $errors;
    }
}