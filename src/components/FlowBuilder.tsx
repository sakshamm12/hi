import React, { useState, useCallback, useRef } from 'react';
import Sidebar from './Sidebar';
import Canvas from './Canvas';
import PropertiesPanel from './PropertiesPanel';
import Toolbar from './Toolbar';
import { FlowNode, Connection, NodeType } from '../types/flow';

const FlowBuilder: React.FC = () => {
  const [nodes, setNodes] = useState<FlowNode[]>([
    {
      id: 'start-1',
      type: 'start',
      position: { x: 100, y: 100 },
      data: { label: 'Start' },
      connections: []
    }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState<string | null>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<NodeType | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    const newNode: FlowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        message: type === 'message' ? 'Enter your message here' : undefined,
        condition: type === 'condition' ? 'Enter condition' : undefined,
        inputType: type === 'input' ? 'text' : undefined,
        actions: type === 'action' ? [] : undefined
      },
      connections: []
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<FlowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedNode]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.source !== nodeId && conn.target !== nodeId
    ));
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  const startConnection = useCallback((nodeId: string) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  }, []);

  const completeConnection = useCallback((targetNodeId: string) => {
    if (connectionStart && connectionStart !== targetNodeId) {
      const newConnection: Connection = {
        id: `${connectionStart}-${targetNodeId}`,
        source: connectionStart,
        target: targetNodeId
      };

      setConnections(prev => [...prev, newConnection]);
      
      // Update source node's connections
      setNodes(prev => prev.map(node => 
        node.id === connectionStart 
          ? { ...node, connections: [...node.connections, targetNodeId] }
          : node
      ));
    }
    
    setIsConnecting(false);
    setConnectionStart(null);
  }, [connectionStart]);

  const cancelConnection = useCallback(() => {
    setIsConnecting(false);
    setConnectionStart(null);
  }, []);

  const validateFlow = useCallback(() => {
    const startNodes = nodes.filter(node => node.type === 'start');
    const endNodes = nodes.filter(node => node.type === 'end');
    
    if (startNodes.length === 0) {
      return { isValid: false, message: 'Flow must have at least one start node' };
    }
    
    if (endNodes.length === 0) {
      return { isValid: false, message: 'Flow must have at least one end node' };
    }

    // Check for disconnected nodes (except start and end)
    const connectedNodeIds = new Set();
    connections.forEach(conn => {
      connectedNodeIds.add(conn.source);
      connectedNodeIds.add(conn.target);
    });

    const disconnectedNodes = nodes.filter(node => 
      node.type !== 'start' && 
      node.type !== 'end' && 
      !connectedNodeIds.has(node.id)
    );

    if (disconnectedNodes.length > 0) {
      return { 
        isValid: false, 
        message: `${disconnectedNodes.length} node(s) are not connected to the flow` 
      };
    }

    return { isValid: true, message: 'Flow is valid' };
  }, [nodes, connections]);

  const exportFlow = useCallback(() => {
    const flowData = {
      nodes,
      connections,
      metadata: {
        name: 'Untitled Flow',
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    const dataStr = JSON.stringify(flowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'chatbot-flow.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [nodes, connections]);

  return (
    <div className="flex h-full bg-gray-50">
      <Sidebar 
        onDragStart={setDraggedNodeType}
        onDragEnd={() => setDraggedNodeType(null)}
      />
      
      <div className="flex-1 flex flex-col">
        <Toolbar 
          onValidate={validateFlow}
          onExport={exportFlow}
          onSave={() => console.log('Save flow')}
          onLoad={() => console.log('Load flow')}
        />
        
        <div className="flex-1 flex">
          <Canvas
            ref={canvasRef}
            nodes={nodes}
            connections={connections}
            selectedNode={selectedNode}
            isConnecting={isConnecting}
            connectionStart={connectionStart}
            draggedNodeType={draggedNodeType}
            onNodeSelect={setSelectedNode}
            onNodeMove={updateNode}
            onNodeDelete={deleteNode}
            onAddNode={addNode}
            onStartConnection={startConnection}
            onCompleteConnection={completeConnection}
            onCancelConnection={cancelConnection}
          />
          
          {selectedNode && (
            <PropertiesPanel
              node={selectedNode}
              onUpdateNode={updateNode}
              onClose={() => setSelectedNode(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowBuilder;