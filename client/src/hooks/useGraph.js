import { useCallback } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';

export function useGraph() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addNode = useCallback((object) => {
    const node = {
      id: object.id,
      type: object.type === 'goal' ? 'goal' : 'object',
      position: object.position || { x: Math.random() * 600, y: Math.random() * 400 },
      data: {
        label: object.label,
        type: object.type,
        status: object.status,
        summary: object.summary,
        confidence: object.confidence,
      },
    };
    setNodes((nds) => [...nds, node]);
  }, [setNodes]);

  const addEdge = useCallback((edge) => {
    const flowEdge = {
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      label: edge.label,
      style: {
        stroke: '#d4a574',
        strokeWidth: 1.5,
        strokeDasharray: edge.status === 'proposed' ? '5 5' : 'none',
      },
      labelStyle: { fill: '#a67c52', fontSize: 10 },
    };
    setEdges((eds) => [...eds, flowEdge]);
  }, [setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addNode,
    addEdge,
  };
}
