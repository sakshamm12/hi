import React, { useState, useCallback } from 'react';
import { 
  Play, 
  MessageSquare, 
  GitBranch, 
  Keyboard, 
  Zap, 
  Square,
  MoreVertical,
  Trash2,
  Edit3,
  ArrowRight
} from 'lucide-react';
import { FlowNode } from '../types/flow';

interface NodeProps {
  node: FlowNode;
  isSelected: boolean;
  isConnecting: boolean;
  connectionStart: string | null;
  onSelect: () => void;
  onMove: (nodeId: string, updates: Partial<FlowNode>) => void;
  onDelete: (nodeId: string) => void;
  onStartConnection: (nodeId: string) => void;
  onCompleteConnection: (nodeId: string) => void;
}

const nodeConfig = {
  start: { icon: Play, color: 'bg-green-100 border-green-300 text-green-800' },
  message: { icon: MessageSquare, color: 'bg-blue-100 border-blue-300 text-blue-800' },
  condition: { icon: GitBranch, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  input: { icon: Keyboard, color: 'bg-purple-100 border-purple-300 text-purple-800' },
  action: { icon: Zap, color: 'bg-orange-100 border-orange-300 text-orange-800' },
  end: { icon: Square, color: 'bg-red-100 border-red-300 text-red-800' },
};

const Node: React.FC<NodeProps> = ({
  node,
  isSelected,
  isConnecting,
  connectionStart,
  onSelect,
  onMove,
  onDelete,
  onStartConnection,
  onCompleteConnection
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const config = nodeConfig[node.type];
  const Icon = config.icon;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    });
    
    onSelect();
  }, [node.position, onSelect]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newPosition = {
      x: Math.max(0, e.clientX - dragStart.x),
      y: Math.max(0, e.clientY - dragStart.y)
    };
    
    onMove(node.id, { position: newPosition });
  }, [isDragging, dragStart, node.id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleConnectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isConnecting && connectionStart && connectionStart !== node.id) {
      onCompleteConnection(node.id);
    } else if (!isConnecting) {
      onStartConnection(node.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(node.id);
    setShowMenu(false);
  };

  const getDisplayText = () => {
    switch (node.type) {
      case 'message':
        return node.data.message || 'Enter message';
      case 'condition':
        return node.data.condition || 'Enter condition';
      case 'input':
        return `Input: ${node.data.inputType || 'text'}`;
      case 'action':
        return `Actions: ${node.data.actions?.length || 0}`;
      default:
        return node.data.label;
    }
  };

  return (
    <div
      className={`absolute cursor-move select-none fade-in ${
        isDragging ? 'dragging' : ''
      }`}
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: isSelected ? 10 : 1
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`
          w-36 min-h-20 rounded-lg border-2 p-3 shadow-lg
          ${config.color}
          ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
          hover:shadow-xl transition-all duration-200
          ${isConnecting && connectionStart !== node.id ? 'ring-2 ring-blue-400' : ''}
        `}
      >
        {/* Node Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <Icon className="w-4 h-4 mr-2" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {node.type}
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1 rounded hover:bg-black hover:bg-opacity-10"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border py-1 z-20 min-w-24">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                    setShowMenu(false);
                  }}
                  className="flex items-center px-3 py-1 text-xs hover:bg-gray-100 w-full text-left"
                >
                  <Edit3 className="w-3 h-3 mr-2" />
                  Edit
                </button>
                {node.type !== 'start' && (
                  <button
                    onClick={handleDeleteClick}
                    className="flex items-center px-3 py-1 text-xs hover:bg-gray-100 w-full text-left text-red-600"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Node Content */}
        <div className="text-xs text-gray-700 font-medium">
          {getDisplayText()}
        </div>

        {/* Connection Handle */}
        {node.type !== 'end' && (
          <div
            className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full connection-handle hover:bg-indigo-100 cursor-pointer"
            onClick={handleConnectionClick}
          >
            {(isConnecting && connectionStart === node.id) && (
              <ArrowRight className="w-2 h-2 text-indigo-600 absolute top-0.5 left-0.5" />
            )}
          </div>
        )}

        {/* Input Connection Handle */}
        {node.type !== 'start' && (
          <div
            className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-400 rounded-full connection-handle hover:bg-gray-100 cursor-pointer"
            onClick={handleConnectionClick}
          />
        )}
      </div>
    </div>
  );
};

export default Node;