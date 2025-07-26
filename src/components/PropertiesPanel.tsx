import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { FlowNode } from '../types/flow';

interface PropertiesPanelProps {
  node: FlowNode;
  onUpdateNode: (nodeId: string, updates: Partial<FlowNode>) => void;
  onClose: () => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  node,
  onUpdateNode,
  onClose
}) => {
  const [formData, setFormData] = useState(node.data);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setFormData(node.data);
    setHasChanges(false);
  }, [node.data]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateNode(node.id, { data: formData });
    setHasChanges(false);
  };

  const addAction = () => {
    const currentActions = formData.actions || [];
    handleInputChange('actions', [...currentActions, { type: 'webhook', value: '' }]);
  };

  const removeAction = (index: number) => {
    const currentActions = formData.actions || [];
    handleInputChange('actions', currentActions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, field: string, value: string) => {
    const currentActions = formData.actions || [];
    const updatedActions = [...currentActions];
    updatedActions[index] = { ...updatedActions[index], [field]: value };
    handleInputChange('actions', updatedActions);
  };

  const renderNodeSpecificFields = () => {
    switch (node.type) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={4}
                placeholder="Enter your message here..."
              />
            </div>
          </div>
        );

      case 'condition':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <input
                type="text"
                value={formData.condition || ''}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter condition (e.g., user_input == 'yes')"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                True Path Label
              </label>
              <input
                type="text"
                value={formData.truePath || ''}
                onChange={(e) => handleInputChange('truePath', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Yes"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                False Path Label
              </label>
              <input
                type="text"
                value={formData.falsePath || ''}
                onChange={(e) => handleInputChange('falsePath', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="No"
              />
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Input Type
              </label>
              <select
                value={formData.inputType || 'text'}
                onChange={(e) => handleInputChange('inputType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="text">Text</option>
                <option value="email">Email</option>
                <option value="number">Number</option>
                <option value="phone">Phone</option>
                <option value="date">Date</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder
              </label>
              <input
                type="text"
                value={formData.placeholder || ''}
                onChange={(e) => handleInputChange('placeholder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter placeholder text..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Variable Name
              </label>
              <input
                type="text"
                value={formData.variableName || ''}
                onChange={(e) => handleInputChange('variableName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="user_input"
              />
            </div>
          </div>
        );

      case 'action':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Actions
              </label>
              <button
                onClick={addAction}
                className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
            </div>
            
            {(formData.actions || []).map((action, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <select
                    value={action.type || 'webhook'}
                    onChange={(e) => updateAction(index, 'type', e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="webhook">Webhook</option>
                    <option value="email">Send Email</option>
                    <option value="variable">Set Variable</option>
                  </select>
                  <button
                    onClick={() => removeAction(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <input
                  type="text"
                  value={action.value || ''}
                  onChange={(e) => updateAction(index, 'value', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="Enter action value..."
                />
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 custom-scrollbar overflow-y-auto slide-in-right">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 capitalize">
          {node.type} Node
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Node Label */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Node Label
          </label>
          <input
            type="text"
            value={formData.label || ''}
            onChange={(e) => handleInputChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter node label..."
          />
        </div>

        {/* Node-specific fields */}
        {renderNodeSpecificFields()}

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`
              w-full flex items-center justify-center px-4 py-2 rounded-md font-medium text-sm
              ${hasChanges
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;