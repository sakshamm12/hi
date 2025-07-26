import React, { useState } from 'react';
import { 
  Save, 
  Upload, 
  Download, 
  Play, 
  CheckCircle, 
  AlertCircle,
  Settings,
  Eye
} from 'lucide-react';

interface ToolbarProps {
  onValidate: () => { isValid: boolean; message: string };
  onExport: () => void;
  onSave: () => void;
  onLoad: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onValidate,
  onExport,
  onSave,
  onLoad
}) => {
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleValidate = () => {
    const result = onValidate();
    setValidationResult(result);
    setShowValidation(true);
    setTimeout(() => setShowValidation(false), 3000);
  };

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const flowData = JSON.parse(content);
          console.log('Loaded flow data:', flowData);
          // Here you would update the flow state
        } catch (error) {
          console.error('Error loading file:', error);
        }
      };
      reader.readAsText(file);
    }
    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">Chatbot Flow Builder</h1>
          
          {showValidation && validationResult && (
            <div className={`
              flex items-center px-3 py-1 rounded-md text-sm font-medium
              ${validationResult.isValid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
              }
            `}>
              {validationResult.isValid ? (
                <CheckCircle className="w-4 h-4 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              {validationResult.message}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Validate Button */}
          <button
            onClick={handleValidate}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Validate
          </button>

          {/* Load Button */}
          <label className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Load
            <input
              type="file"
              accept=".json"
              onChange={handleFileLoad}
              className="hidden"
            />
          </label>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>

          {/* Save Button */}
          <button
            onClick={onSave}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </button>

          {/* Preview Button */}
          <button
            onClick={() => console.log('Preview flow')}
            className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;