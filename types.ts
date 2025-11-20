export type NodeType = 'biological' | 'artificial';
export type LayerType = 'input' | 'hidden' | 'output';

export interface NodeMetadata {
  label: string;
  description: string;
  layer?: LayerType;
}

export interface NodeData {
  id: string;
  type: NodeType;
  position: [number, number, number];
  value: number; // Current potential or activation
  threshold?: number; // For Bio
  recovery?: number; // For Bio
  metadata: NodeMetadata;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  weight: number;
}

export interface Pulse {
  id: string;
  edgeId: string;
  progress: number; // 0 to 1
  value: number;
}

export interface SimulationState {
  nodes: Record<string, NodeData>;
  edges: EdgeData[];
  pulses: Pulse[];
  time: number;
}

export interface SimulationConfig {
  speed: number;
  noise: boolean;
  autoPlay: boolean;
}