export interface InputModalProps {
  clickedNode: SankeyNode;
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
  allNodes: SankeyNode[];
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

/**
 * Interface that represents the environment variables you rely on.
 * For safety, check if the variable is present before usage.
 */
export interface EnvConfig {
  OPENAI_KEY?: string;
}

/**
 * Represents a row of CSV data.
 * Many times CSV rows are free-form, so we can make this a generic
 * "string-to-string" mapping or refine it if you know the CSV columns.
 */
export interface CSVRow {
  [key: string]: string;
}

/**
 * The structure returned by the OpenAI completion endpoint.
 * This is simplified; you can expand if you need more fields.
 */
export interface OpenAIChoiceMessage {
  message: {
    content: string;
  };
}

export interface OpenAICompletionResponse {
  data: {
    choices: OpenAIChoiceMessage[];
  };
  choices: {
    message: {
      content: string;
    };
  }[];
}

/**
 * Represents the shape of each node in the output JSON.
 * For instance, a node has at least a 'name', 'index' (and possibly 'cost').
 */
export interface OutputNode {
  name: string;
  index: number;
  cost?: number;
}

/**
 * The final hierarchical data returned by Document.convertData().
 */
export interface HierarchicalData {
  output: {
    nodes: OutputNode[];
  };
  parentChildMap: Record<number, number[]>;
}

// Define the type for the results array
export interface ResultType {
  // Replace 'key1', 'key2', etc., with actual keys and their types
  key1: string;
  key2: number;
  // Add other keys as needed
}
