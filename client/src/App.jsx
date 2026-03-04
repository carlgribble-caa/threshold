import { useCallback, useState } from 'react';
import { ReactFlow, ReactFlowProvider, useNodesState, useEdgesState, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DialogueOverlay from './components/DialogueOverlay';
import Sidebar from './components/Sidebar';
import ObjectNode from './components/ObjectNode';
import GoalNode from './components/GoalNode';

const nodeTypes = {
  object: ObjectNode,
  goal: GoalNode,
};

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView={false}
        minZoom={0.1}
        maxZoom={3.0}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0a0a' }}
      >
        <Background color="transparent" />
      </ReactFlow>
      <DialogueOverlay />
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  );
}
