export type NodeType = 'start' | 'message' | 'condition' | 'input' | 'action' | 'end';

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    message?: string;
    condition?: string;
    truePath?: string;
    falsePath?: string;
    inputType?: string;
    placeholder?: string;
    variableName?: string;
    actions?: Array<{
      type: string;
      value: string;
    }>;
  };
  connections: string[];
}

export interface Connection {
  id: string;
  source: string;
  target: string;
}

export interface FlowData {
  nodes: FlowNode[];
  connections: Connection[];
  metadata: {
    name: string;
    createdAt: string;
    version: string;
  };
}