export interface InputModalProps {
  node: Node;
  initialParentName: string;
  initialPrice: string;
  onSubmit: (newParentName: string, newPrice: number) => void;
  onClose: () => void;
  parentOptions: string[]; // Add this prop to pass parent options
}

export interface Payload {
  name: string;
  value?: number;
}

export interface SankeyNode {
  isleaf?: boolean;
  name: string;
  cost?: number;
  index: number;
  visible: boolean;
  value?: number;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  color?: string;
  strokeWidth?: number;
}

export type Map = Record<number, number[]>;

export interface MyCustomNodeProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: Payload;
  containerWidth: number;
  onNodeClick: (nodeId: string, event: React.MouseEvent<SVGElement>) => void; // New click handler
  allNodes: Node[];
  colorThreshold: number;
}

export interface SnakeyChartComponentProps {
  refresh: boolean; // Prop to trigger data fetch
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface UploadComponentProps {
  onUploadSuccess: () => void; // Callback function to trigger data fetch
}
