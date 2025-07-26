import React, { forwardRef, useCallback, useState } from 'react';
import Node from './Node';
import { FlowNode, Connection, NodeType } from '../types/flow';

interface CanvasProps {
  nodes: FlowNode[];
  connections: Connection[];
  selectedNode: FlowNode | null;
  isConnecting: boolean;
  connectionStart: string | null;
  draggedNodeType: NodeType | null;
  onNodeSelect: (node: FlowNode) => void;
  onNodeMove: (nodeId: string, updates: Partial<FlowNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onStartConnection: (nodeId: string) => void;
  onCompleteConnection: (nodeId: string) => void;
  onCancelConnection: () => void;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(({
  nodes,
  connections,
  selectedNode,
  isConnecting,
  connectionStart,
  draggedNodeType,
  onNodeSelect,
  onNodeMove,
  onNodeDelete,
  onAddNode,
  onStartConnection,
  onCompleteConnection,
  onCancelConnection
}, ref) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const nodeType = e.dataTransfer.getData('application/reactflow') as NodeType;
    if (nodeType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left - 75, // Center the node
        y: e.clientY - rect.top - 40
      };
      onAddNode(nodeType, position);
    }
  }, [onAddNode]);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      if (isConnecting) {
        onCancelConnection();
      } else {
        onNodeSelect(null as any);
      }
    }
  }, [isConnecting, onCancelConnection, onNodeSelect]);

  const getConnectionPath = (connection: Connection) => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);
    
    if (!sourceNode || !targetNode) return '';

    const sourceX = sourceNode.position.x + 150; // Node width
    const sourceY = sourceNode.position.y + 40; // Half node height
    const targetX = targetNode.position.x;
    const targetY = targetNode.position.y + 40;

    const midX = (sourceX + targetX) / 2;

    return `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`;
  };

  return (
    <div
      ref={ref}
      className={`flex-1 relative bg-gray-50 overflow-hidden ${
        isDragOver ? 'drop-zone' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-40">
        <svg width="100%" height="100%">
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Connection Lines */}
      <svg className="absolute inset-0 pointer-events-none">
        {connections.map(connection => (
          <path
            key={connection.id}
            d={getConnectionPath(connection)}
            className="connection-line"
          />
        ))}
      </svg>

      {/* Nodes */}
      {nodes.map(node => (
        <Node
          key={node.id}
          node={node}
          isSelected={selectedNode?.id === node.id}
          isConnecting={isConnecting}
          connectionStart={connectionStart}
          onSelect={() => onNodeSelect(node)}
          onMove={onNodeMove}
          onDelete={onNodeDelete}
          onStartConnection={onStartConnection}
          onCompleteConnection={onCompleteConnection}
        />
      ))}

      {/* Drop Zone Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-lg shadow-lg p-4 border-2 border-dashed border-indigo-300">
            <p className="text-indigo-600 font-medium">Drop here to add node</p>
          </div>
        </div>
      )}
    </div>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;