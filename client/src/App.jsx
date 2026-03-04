import { useState, useCallback, useEffect, useRef } from 'react';
import { ReactFlow, ReactFlowProvider, useNodesState, useEdgesState, useReactFlow, Background } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import DialogueOverlay from './components/DialogueOverlay';
import EmergingObject from './components/EmergingObject';
import Sidebar from './components/Sidebar';
import ObjectNode from './components/ObjectNode';
import GoalNode from './components/GoalNode';
import ProposedEdge from './components/ProposedEdge';
import ConfirmedEdge from './components/ConfirmedEdge';
import Toolbar from './components/Toolbar';
import AddObjectModal from './components/AddObjectModal';

const nodeTypes = {
  object: ObjectNode,
  goal: GoalNode,
};

const edgeTypes = {
  proposed: ProposedEdge,
  confirmed: ConfirmedEdge,
};

// Node dimensions (approximate) for handle position calculation
const NODE_W = { object: 200, goal: 220 };
const NODE_H_DEFAULT = 100;

// Pick the best source/target handle pair based on relative node positions.
function bestHandles(srcNode, tgtNode) {
  const sw = NODE_W[srcNode.type] || 200;
  const tw = NODE_W[tgtNode.type] || 200;
  const sh = srcNode.measured?.height || NODE_H_DEFAULT;
  const th = tgtNode.measured?.height || NODE_H_DEFAULT;

  const sx = srcNode.position.x + sw / 2;
  const sy = srcNode.position.y + sh / 2;
  const tx = tgtNode.position.x + tw / 2;
  const ty = tgtNode.position.y + th / 2;

  const dx = tx - sx;
  const dy = ty - sy;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  let sourceHandle, targetHandle;
  if (angle >= -45 && angle < 45) {
    sourceHandle = 'right';
    targetHandle = 'left';
  } else if (angle >= 45 && angle < 135) {
    sourceHandle = 'bottom';
    targetHandle = 'top';
  } else if (angle >= -135 && angle < -45) {
    sourceHandle = 'top';
    targetHandle = 'bottom';
  } else {
    sourceHandle = 'left';
    targetHandle = 'right';
  }

  return { sourceHandle, targetHandle };
}


function WelcomeHint({ visible }) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        zIndex: 500,
        pointerEvents: 'none',
      }}
    >
      <div style={{
        color: '#e8c49a',
        fontSize: 20,
        fontWeight: 300,
        letterSpacing: '0.04em',
        marginBottom: 16,
        opacity: 0.9,
      }}>
        threshold
      </div>
      <div style={{
        color: '#8a7460',
        fontSize: 13,
        letterSpacing: '0.03em',
        lineHeight: 1.8,
        opacity: 0.7,
      }}>
        click ◇ dialogue to begin thinking
      </div>
    </div>
  );
}

function Flow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [showAddObject, setShowAddObject] = useState(false);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const [emergingObjects, setEmergingObjects] = useState([]);
  const { screenToFlowPosition, setCenter, getZoom } = useReactFlow();
  const saveTimers = useRef({});
  const edgeCallbacksRef = useRef({ onConfirm: null, onReject: null, onEditLabel: null });

  // Escape exits connect mode
  useEffect(() => {
    if (!connectMode) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setConnectMode(false);
        setConnectSource(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectMode]);

  // Load persisted objects and edges on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/objects').then((r) => r.json()).catch(() => []),
      fetch('/api/graph').then((r) => r.json()).catch(() => ({ edges: [] })),
    ]).then(([objects, graph]) => {
      const restored = objects
        .filter((o) => o.status === 'crystallized')
        .map((o) => ({
          id: o.id,
          type: o.type === 'goal' ? 'goal' : 'object',
          position: o.position || { x: 0, y: 0 },
          data: {
            label: o.label,
            type: o.type,
            status: 'crystallized',
            summary: o.summary,
            confidence: o.confidence,
          },
        }));
      if (restored.length > 0) setNodes(restored);

      if (graph.edges && graph.edges.length > 0) {
        const nodeMap = {};
        restored.forEach((n) => { nodeMap[n.id] = n; });

        const restoredEdges = graph.edges.map((e) => {
          const src = nodeMap[e.source];
          const tgt = nodeMap[e.target];
          const handles = src && tgt ? bestHandles(src, tgt) : { sourceHandle: 'bottom', targetHandle: 'top' };
          const isProposed = e.status === 'proposed';
          return {
            id: e.id || `${e.source}-${e.target}`,
            source: e.source,
            target: e.target,
            sourceHandle: handles.sourceHandle,
            targetHandle: handles.targetHandle,
            label: e.label,
            ...(isProposed
              ? {
                  type: 'proposed',
                  data: {
                    onConfirm: (id) => edgeCallbacksRef.current.onConfirm?.(id),
                    onReject: (id) => edgeCallbacksRef.current.onReject?.(id),
                    onEditLabel: (id, newLabel) => edgeCallbacksRef.current.onEditLabel?.(id, newLabel),
                  },
                }
              : {
                  type: 'confirmed',
                }
            ),
          };
        });
        setEdges(restoredEdges);
      }
    });
  }, [setNodes, setEdges]);

  // When dialogue produces new objects, add them to orbit
  const handleObjectsEmerged = useCallback((objects) => {
    setEmergingObjects((prev) => [...prev, ...objects]);
  }, []);

  // Crystallize: drag an emerging object onto the canvas → becomes a graph node
  const handleCrystallize = useCallback((obj, screenX, screenY) => {
    const position = screenToFlowPosition({ x: screenX, y: screenY });

    const newNode = {
      id: obj.id,
      type: obj.type === 'goal' ? 'goal' : 'object',
      position,
      data: {
        label: obj.label,
        type: obj.type,
        status: 'crystallized',
        summary: obj.summary,
        confidence: obj.confidence,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setEmergingObjects((prev) => prev.filter((o) => o.id !== obj.id));

    // Persist to backend
    fetch('/api/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: obj.id,
        label: obj.label,
        summary: obj.summary || '',
        type: obj.type,
        status: 'crystallized',
        confidence: obj.confidence || 0.5,
        position,
        created: obj.created || new Date().toISOString(),
        updated: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [setNodes, screenToFlowPosition]);

  // When Claude proposes connections, resolve labels → node IDs and create edges
  const handleConnectionsProposed = useCallback((connections, newObjects) => {
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        const labelMap = {};
        currentNodes.forEach((n) => { labelMap[n.data.label.toLowerCase()] = n.id; });
        newObjects.forEach((o) => { labelMap[o.label.toLowerCase()] = o.id; });

        const newEdges = [];
        for (const conn of connections) {
          const sourceId = labelMap[conn.from_label?.toLowerCase()];
          const targetId = labelMap[conn.to_label?.toLowerCase()];
          if (!sourceId || !targetId || sourceId === targetId) continue;

          const edgeId = `${sourceId}-${targetId}`;
          if (currentEdges.some((e) => e.id === edgeId)) continue;

          const srcNode = currentNodes.find((n) => n.id === sourceId);
          const tgtNode = currentNodes.find((n) => n.id === targetId);
          const handles = srcNode && tgtNode ? bestHandles(srcNode, tgtNode) : { sourceHandle: 'bottom', targetHandle: 'top' };

          newEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            sourceHandle: handles.sourceHandle,
            targetHandle: handles.targetHandle,
            label: conn.label || '',
            type: 'proposed',
            data: {
              onConfirm: (id) => edgeCallbacksRef.current.onConfirm?.(id),
              onReject: (id) => edgeCallbacksRef.current.onReject?.(id),
              onEditLabel: (id, newLabel) => edgeCallbacksRef.current.onEditLabel?.(id, newLabel),
            },
          });
        }

        if (newEdges.length > 0) {
          const allEdges = [...currentEdges, ...newEdges];
          fetch('/api/graph', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              edges: allEdges.map((e) => ({
                id: e.id, source: e.source, target: e.target,
                label: e.label, status: e.type === 'proposed' ? 'proposed' : 'confirmed',
              })),
            }),
          }).catch(() => {});

          return allEdges;
        }
        return currentEdges;
      });
      return currentNodes;
    });
  }, [setNodes, setEdges]);

  // Save position + recalculate edge handles after user drags a node
  const handleNodeDragStop = useCallback((_event, draggedNode) => {
    if (saveTimers.current[draggedNode.id]) clearTimeout(saveTimers.current[draggedNode.id]);
    saveTimers.current[draggedNode.id] = setTimeout(() => {
      fetch(`/api/objects/${draggedNode.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ position: draggedNode.position }),
      }).catch(() => {});
    }, 500);

    setNodes((currentNodes) => {
      const nodeMap = {};
      currentNodes.forEach((n) => { nodeMap[n.id] = n; });

      setEdges((currentEdges) => {
        let changed = false;
        const updated = currentEdges.map((e) => {
          if (e.source !== draggedNode.id && e.target !== draggedNode.id) return e;
          const src = nodeMap[e.source];
          const tgt = nodeMap[e.target];
          if (!src || !tgt) return e;
          const handles = bestHandles(src, tgt);
          if (handles.sourceHandle !== e.sourceHandle || handles.targetHandle !== e.targetHandle) {
            changed = true;
            return { ...e, sourceHandle: handles.sourceHandle, targetHandle: handles.targetHandle };
          }
          return e;
        });
        return changed ? updated : currentEdges;
      });
      return currentNodes;
    });
  }, [setNodes, setEdges]);

  // Dismiss an emerging object
  const handleDismiss = useCallback((id) => {
    setEmergingObjects((prev) => prev.filter((o) => o.id !== id));
  }, []);

  // Reset — clear everything and start fresh
  const handleReset = useCallback(() => {
    fetch('/api/sessions/reset', { method: 'POST' })
      .then(() => {
        setNodes([]);
        setEdges([]);
        setEmergingObjects([]);
      })
      .catch(() => {});
  }, [setNodes, setEdges]);

  // Delete a single node + its edges
  const handleDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => {
      const remaining = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
      fetch('/api/graph', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edges: remaining.map((e) => ({
            id: e.id, source: e.source, target: e.target,
            label: e.label, status: e.type === 'proposed' ? 'proposed' : 'confirmed',
          })),
        }),
      }).catch(() => {});
      return remaining;
    });
    fetch(`/api/objects/${nodeId}`, { method: 'DELETE' }).catch(() => {});
  }, [setNodes, setEdges]);

  // Edit a node's label or summary
  const handleEditNode = useCallback((nodeId, updates) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== nodeId) return n;
        const newData = { ...n.data, ...updates };
        // Persist to backend
        fetch(`/api/objects/${nodeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        }).catch(() => {});
        return { ...n, data: newData };
      })
    );
  }, [setNodes]);

  const handleEditNodeRef = useRef(handleEditNode);
  handleEditNodeRef.current = handleEditNode;

  const [contextMenu, setContextMenu] = useState(null);

  const handleNodeContextMenu = useCallback((event, node) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id, label: node.data.label });
  }, []);

  // Confirm a proposed edge → make it solid
  const handleConfirmEdge = useCallback((edgeId) => {
    setEdges((eds) => {
      const updated = eds.map((e) =>
        e.id === edgeId
          ? { ...e, type: 'confirmed', animated: false, data: {} }
          : e
      );
      fetch('/api/graph', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edges: updated.map((e) => ({
            id: e.id, source: e.source, target: e.target,
            label: e.label, status: e.type === 'proposed' ? 'proposed' : 'confirmed',
          })),
        }),
      }).catch(() => {});
      return updated;
    });
  }, [setEdges]);

  // Reject a proposed edge → remove it
  const handleRejectEdge = useCallback((edgeId) => {
    setEdges((eds) => {
      const remaining = eds.filter((e) => e.id !== edgeId);
      fetch('/api/graph', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edges: remaining.map((e) => ({
            id: e.id, source: e.source, target: e.target,
            label: e.label, status: e.type === 'proposed' ? 'proposed' : 'confirmed',
          })),
        }),
      }).catch(() => {});
      return remaining;
    });
  }, [setEdges]);

  // Edit an edge label
  const handleEditEdgeLabel = useCallback((edgeId, newLabel) => {
    setEdges((eds) => {
      const updated = eds.map((e) =>
        e.id === edgeId ? { ...e, label: newLabel } : e
      );
      fetch('/api/graph', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          edges: updated.map((e) => ({
            id: e.id, source: e.source, target: e.target,
            label: e.label, status: e.type === 'proposed' ? 'proposed' : 'confirmed',
          })),
        }),
      }).catch(() => {});
      return updated;
    });
  }, [setEdges]);

  // Keep ref up to date for use in edge creation
  edgeCallbacksRef.current.onConfirm = handleConfirmEdge;
  edgeCallbacksRef.current.onReject = handleRejectEdge;
  edgeCallbacksRef.current.onEditLabel = handleEditEdgeLabel;

  // Manual connection: create a proposed edge between two nodes
  const handleManualConnect = useCallback((sourceId, targetId) => {
    setNodes((currentNodes) => {
      const srcNode = currentNodes.find((n) => n.id === sourceId);
      const tgtNode = currentNodes.find((n) => n.id === targetId);
      if (!srcNode || !tgtNode) return currentNodes;

      const handles = bestHandles(srcNode, tgtNode);
      const edgeId = `${sourceId}-${targetId}`;

      setEdges((eds) => {
        // Check if edge already exists in either direction
        if (eds.some((e) => e.id === edgeId || e.id === `${targetId}-${sourceId}`)) return eds;

        const newEdge = {
          id: edgeId,
          source: sourceId,
          target: targetId,
          sourceHandle: handles.sourceHandle,
          targetHandle: handles.targetHandle,
          label: '',
          type: 'proposed',
          data: {
            onConfirm: (id) => edgeCallbacksRef.current.onConfirm?.(id),
            onReject: (id) => edgeCallbacksRef.current.onReject?.(id),
            onEditLabel: (id, newLabel) => edgeCallbacksRef.current.onEditLabel?.(id, newLabel),
          },
        };

        const updated = [...eds, newEdge];
        fetch('/api/graph', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            edges: updated.map((e) => ({
              id: e.id, source: e.source, target: e.target,
              label: e.label, status: e.type === 'proposed' ? 'proposed' : 'confirmed',
            })),
          }),
        }).catch(() => {});
        return updated;
      });

      return currentNodes;
    });
  }, [setNodes, setEdges]);

  // Manual object creation
  const handleCreateObject = useCallback(({ label, summary, type }) => {
    const position = screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    const id = crypto.randomUUID();

    const newNode = {
      id,
      type: type === 'goal' ? 'goal' : 'object',
      position,
      data: {
        label,
        type,
        status: 'crystallized',
        summary: summary || '',
        confidence: 0.5,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    fetch('/api/objects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        label,
        summary: summary || '',
        type,
        status: 'crystallized',
        confidence: 0.5,
        position,
        source: 'user',
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      }),
    }).catch(() => {});
  }, [setNodes, screenToFlowPosition]);

  // Execute a reasoning operation on a node
  const handleReason = useCallback((nodeId, operation) => {
    setNodes((nds) => {
      const target = nds.find((n) => n.id === nodeId);
      if (target) {
        const nodeW = target.type === 'goal' ? 220 : 200;
        const nodeH = target.measured?.height || 100;
        const cx = target.position.x + nodeW / 2;
        const cy = target.position.y + nodeH / 2;
        setCenter(cx, cy, { zoom: getZoom(), duration: 400 });
      }
      return nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, reasoning: true } } : n);
    });

    fetch('/api/reasoning/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation, targetId: nodeId }),
    })
      .then((r) => r.json())
      .then((result) => {
        setNodes((nds) =>
          nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, reasoning: false } } : n)
        );

        if (result.objects && result.objects.length > 0) {
          const newObjects = result.objects.map((o) => ({
            ...o,
            id: o.id || crypto.randomUUID(),
            created: new Date().toISOString(),
          }));
          setEmergingObjects((prev) => [...prev, ...newObjects]);

          if (result.connections && result.connections.length > 0) {
            handleConnectionsProposed(result.connections, newObjects);
          }
        }
      })
      .catch(() => {
        setNodes((nds) =>
          nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, reasoning: false } } : n)
        );
      });
  }, [setNodes, setEmergingObjects, handleConnectionsProposed, setCenter, getZoom]);

  const handleReasonRef = useRef(handleReason);
  handleReasonRef.current = handleReason;

  // Click node: in connect mode → select source/target; normal mode → expand/collapse
  const handleNodeClick = useCallback((_event, clickedNode) => {
    setContextMenu(null);

    // Connect mode: select source then target
    if (connectMode) {
      if (!connectSource) {
        setConnectSource(clickedNode.id);
      } else if (clickedNode.id !== connectSource) {
        handleManualConnect(connectSource, clickedNode.id);
        setConnectSource(null);
      }
      return;
    }

    // Normal mode: expand/collapse
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === clickedNode.id) {
          const wasExpanded = n.data.expanded;
          return {
            ...n,
            data: {
              ...n.data,
              expanded: !wasExpanded,
              onDelete: !wasExpanded ? () => handleDeleteNode(n.id) : undefined,
              onReason: !wasExpanded ? (op) => handleReasonRef.current(n.id, op) : undefined,
              onEdit: !wasExpanded ? (updates) => handleEditNodeRef.current(n.id, updates) : undefined,
            },
          };
        }
        if (n.data.expanded) {
          return { ...n, data: { ...n.data, expanded: false, onDelete: undefined, onReason: undefined, onEdit: undefined } };
        }
        return n;
      })
    );
  }, [setNodes, handleDeleteNode, connectMode, connectSource, handleManualConnect]);

  const handlePaneClick = useCallback(() => {
    setContextMenu(null);
    // Clear connect source if in connect mode
    if (connectMode) {
      setConnectSource(null);
      return;
    }
    setNodes((nds) =>
      nds.some((n) => n.data.expanded)
        ? nds.map((n) => n.data.expanded ? { ...n, data: { ...n.data, expanded: false, onDelete: undefined, onReason: undefined, onEdit: undefined } } : n)
        : nds
    );
  }, [setNodes, connectMode]);

  const handleNodeDragStart = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Toolbar handlers
  const handleToolbarDialogue = useCallback(() => {
    setShowDialogue((v) => !v);
    setConnectMode(false);
    setConnectSource(null);
    setShowAddObject(false);
  }, []);

  const handleToolbarAddObject = useCallback(() => {
    setShowAddObject((v) => !v);
    setConnectMode(false);
    setConnectSource(null);
    setShowDialogue(false);
  }, []);

  const handleToolbarConnect = useCallback(() => {
    setConnectMode((v) => {
      if (v) setConnectSource(null);
      return !v;
    });
    setShowDialogue(false);
    setShowAddObject(false);
  }, []);

  const handleToolbarSidebar = useCallback(() => {
    setSidebarOpen((v) => !v);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0a0a0a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDragStop={handleNodeDragStop}
        onNodeContextMenu={handleNodeContextMenu}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView={false}
        zoomOnDoubleClick={false}
        minZoom={0.1}
        maxZoom={3.0}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0a0a' }}
      >
        <Background color="transparent" />
      </ReactFlow>

      <Toolbar
        onDialogue={handleToolbarDialogue}
        onAddObject={handleToolbarAddObject}
        onConnect={handleToolbarConnect}
        onSidebar={handleToolbarSidebar}
        connectMode={connectMode}
        dialogueActive={showDialogue}
      />

      <WelcomeHint visible={!showDialogue && nodes.length === 0 && emergingObjects.length === 0} />

      <DialogueOverlay
        visible={showDialogue}
        onClose={() => setShowDialogue(false)}
        onObjectsEmerged={handleObjectsEmerged}
        onConnectionsProposed={handleConnectionsProposed}
      />

      {showAddObject && (
        <AddObjectModal
          onClose={() => setShowAddObject(false)}
          onCreate={handleCreateObject}
        />
      )}

      {/* Emerging objects orbit around centre of screen */}
      {emergingObjects.map((obj, index) => (
        <EmergingObject
          key={obj.id}
          object={obj}
          index={index}
          total={emergingObjects.length}
          onCrystallize={handleCrystallize}
          onDismiss={handleDismiss}
        />
      ))}

      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} nodes={nodes} edges={edges} onReset={handleReset} />

      {/* Connect mode status bar */}
      {connectMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(25, 22, 18, 0.9)',
            border: '1px solid rgba(232, 196, 154, 0.15)',
            borderRadius: 8,
            padding: '8px 16px',
            zIndex: 900,
            color: '#8a7460',
            fontSize: 12,
            letterSpacing: '0.03em',
            backdropFilter: 'blur(12px)',
          }}
        >
          {connectSource
            ? 'click target node to complete connection'
            : 'click a node to start connection'
          }
          <span
            style={{ marginLeft: 12, color: '#e8a08a', cursor: 'pointer' }}
            onClick={() => { setConnectMode(false); setConnectSource(null); }}
          >
            esc to cancel
          </span>
        </div>
      )}

      {/* Right-click context menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            background: 'rgba(25, 22, 18, 0.95)',
            border: '1px solid rgba(232, 196, 154, 0.15)',
            borderRadius: 8,
            padding: '4px 0',
            zIndex: 1100,
            backdropFilter: 'blur(12px)',
            minWidth: 140,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleDeleteNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
            style={{
              display: 'block',
              width: '100%',
              background: 'none',
              border: 'none',
              color: '#e8a08a',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: 12,
              textAlign: 'left',
            }}
          >
            Delete "{contextMenu.label}"
          </button>
        </div>
      )}
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
