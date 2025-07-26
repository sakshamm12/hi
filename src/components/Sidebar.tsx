import React from 'react';
import { 
  Play, 
  MessageSquare, 
  GitBranch, 
  Keyboard, 
  Zap, 
  Square 
} from 'lucide-react';
import { NodeType } from '../types/flow';

interface SidebarProps {
  onDragStart: (nodeType: NodeType) => void;
  onDragEnd: () => void;
}

const nodeTypes = [
  { type: 'start' as NodeType, icon: Play, label: 'Start', color: 'text-green-600' },
  { type: 'message' as NodeType, icon: MessageSquare, label: 'Message', color: 'text-blue-600' },
  { type: 'condition' as NodeType, icon: GitBranch, label: 'Condition', color: 'text-yellow-600' },
  { type: 'input' as NodeType, icon: Keyboard, label: 'User Input', color: 'text-purple-600' },
  { type: 'action' as NodeType, icon: Zap, label: 'Action', color: 'text-orange-600' },
  { type: 'end' as NodeType, icon: Square, label: 'End', color: 'text-red-600' },
];

const Sidebar: React.FC<SidebarProps> = ({ onDragStart, onDragEnd }) => {
  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.setData('application/reactflow', nodeType);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(nodeType);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 custom-scrollbar overflow-y-auto">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Node Library</h2>
      
      <div className="space-y-2">
        {nodeTypes.map(({ type, icon: Icon, label, color }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            onDragEnd={onDragEnd}
            className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-move hover:bg-gray-100 hover:shadow-md transition-all duration-200 group"
          >
            <Icon className={`w-5 h-5 ${color} mr-3 group-hover:scale-110 transition-transform`} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h3 className="text-md font-medium text-gray-700 mb-3">Instructions</h3>
        <div className="text-xs text-gray-500 space-y-2">
          <p>• Drag nodes from the library to the canvas</p>
          <p>• Click on nodes to edit their properties</p>
          <p>• Drag from connection handles to create flows</p>
          <p>• Use the toolbar to validate and export your flow</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;