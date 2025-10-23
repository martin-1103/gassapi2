# 🌊 Flow Builder Design

## 🎯 Overview

Visual flow builder menggunakan React Flow untuk intuitive API testing workflow design.

---

## 🏗️ Architecture

```
Flow Builder:
├── FlowCanvas          # React Flow canvas wrapper
├── NodeTypes           # Custom node components
│   ├── EndpointNode    # API endpoint call
│   ├── ConditionNode   # Logic/branching
│   ├── VariableNode    # Data transformation
│   └── ResponseNode    # Response handling
├── Controls            # Builder controls & toolbar
├── PropertiesPanel     # Node configuration panel
└── FlowValidation      # Real-time validation
```

---

## 🧩 Node Types

### 1. Endpoint Node
```typescript
interface EndpointNodeData {
  endpointId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
  headers: Record<string, string>;
  body?: any;
  variables: Record<string, any>;
  environment: string;
}
```

**Features:**
- Auto-complete endpoint selection
- Dynamic variable injection
- Request/response preview
- Environment switching

### 2. Condition Node
```typescript
interface ConditionNodeData {
  type: 'if' | 'switch' | 'try-catch';
  conditions: Array<{
    expression: string;
    targetNodeId?: string;
  }>;
  defaultTarget?: string;
}
```

**Features:**
- Visual logic branching
- Expression builder
- Response-based routing
- Error handling paths

### 3. Variable Node
```typescript
interface VariableNodeData {
  operation: 'set' | 'transform' | 'extract';
  source: 'response' | 'environment' | 'custom';
  expression: string;
  targetVariable: string;
}
```

**Features:**
- Data transformation
- Variable extraction
- Environment updates
- Custom JavaScript expressions

### 4. Response Node
```typescript
interface ResponseNodeData {
  action: 'assert' | 'validate' | 'store';
  expectations: Array<{
    path: string; // JSON path
    operator: 'equals' | 'contains' | 'exists' | 'greaterThan';
    value: any;
  }>;
  storeTo?: string;
}
```

**Features:**
- Response validation
- Assertion builder
- Data storage
- Test reporting

---

## 🎨 Component Structure

### FlowCanvas Component
```typescript
const FlowCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Local state management
  const updateNode = useNodeUpdate();

  // Flow validation
  const validation = useFlowValidation(nodes, edges);

  return (
    <div className="flow-builder">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
      >
        <Controls />
        <MiniMap />
      </ReactFlow>

      <PropertiesPanel
        selectedNode={selectedNode}
        onUpdateNode={updateNode}
      />
    </div>
  );
};
```

### Custom Node Component
```typescript
const EndpointNode: React.FC<NodeProps> = ({ data, selected }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const result = await runEndpoint(data);
      setResponse(result);
      // Store result locally
      updateNodeExecution(data.id, result);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={`endpoint-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />

      <div className="node-header">
        <MethodBadge method={data.method} />
        <span className="node-title">{data.name}</span>
      </div>

      <div className="node-content">
        <p className="endpoint-url">{data.url}</p>

        {response && (
          <ResponsePreview response={response} />
        )}
      </div>

      <div className="node-footer">
        <Button onClick={handleRun} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run'}
        </Button>
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
};
```

---

## 🔧 Local Features

### Auto-save
```typescript
const useAutoSave = (nodes: Node[], edges: Edge[]) => {
  const debouncedSave = useMemo(
    () => debounce(async (nodes, edges) => {
      await saveFlow(nodes, edges);
      showNotification('Flow saved', 'success');
    }, 2000),
    []
  );

  useEffect(() => {
    debouncedSave(nodes, edges);
  }, [nodes, edges, debouncedSave]);
};
```

---

## 🎯 User Experience

### Drag & Drop Interface
- **Node Palette**: Sidebar dengan available node types
- **Smart Connections**: Automatic edge validation
- **Auto-layout**: Arrange nodes secara otomatis
- **Zoom Controls**: Pan, zoom, fit-to-screen

### Interactive Features
- **Real-time Validation**: Visual feedback untuk invalid flows
- **Live Preview**: Test individual nodes tanpa menjalankan full flow
- **Context Menu**: Right-click actions untuk nodes dan edges
- **Keyboard Shortcuts**: Productivity shortcuts (Ctrl+S, Ctrl+Z, dll)

### Responsive Design
- **Mobile Support**: Touch-enabled interface
- **Adaptive Layout**: Responsive controls dan panels
- **Progressive Enhancement**: Core functionality works tanpa JavaScript penuh

---

## 📊 Performance Optimization

### Virtualization
```typescript
const VirtualizedFlow = () => {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      fitView
      minZoom={0.1}
      maxZoom={2}
      nodeDragThreshold={5}
      selectNodesOnDrag={false}
    />
  );
};
```

### Code Splitting
```typescript
const FlowBuilder = lazy(() => import('./FlowBuilder'));
const PropertiesPanel = lazy(() => import('./PropertiesPanel'));
```

### Memoization
```typescript
const memoizedNodeTypes = useMemo(() => ({
  endpoint: EndpointNode,
  condition: ConditionNode,
  variable: VariableNode,
  response: ResponseNode
}), []);
```