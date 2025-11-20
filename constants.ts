import { EdgeData, NodeData } from './types';

export const BIO_NODES: NodeData[] = [
  {
    id: 'b1',
    type: 'biological',
    position: [-2, 1, 0],
    value: 0,
    threshold: 0.8,
    recovery: 0.05,
    metadata: { label: 'Sensory Neuron', description: 'Receives external stimulus. High sensitivity.' }
  },
  {
    id: 'b2',
    type: 'biological',
    position: [0, 0, 0],
    value: 0,
    threshold: 1.0,
    recovery: 0.1,
    metadata: { label: 'Interneuron', description: 'Processes signal relay. Modulates firing rate.' }
  },
  {
    id: 'b3',
    type: 'biological',
    position: [2, 0.5, 0],
    value: 0,
    threshold: 0.9,
    recovery: 0.08,
    metadata: { label: 'Motor Neuron', description: 'Drives output response. Integrates signals.' }
  },
  {
    id: 'b4',
    type: 'biological',
    position: [0, -2, 1],
    value: 0,
    threshold: 1.1,
    recovery: 0.02,
    metadata: { label: 'Inhibitory Neuron', description: 'Suppresses activity in connected neighbors.' }
  },
];

export const BIO_EDGES: EdgeData[] = [
  { id: 'e1', source: 'b1', target: 'b2', weight: 0.8 },
  { id: 'e2', source: 'b2', target: 'b3', weight: 0.7 },
  { id: 'e3', source: 'b1', target: 'b4', weight: 0.5 },
  { id: 'e4', source: 'b4', target: 'b2', weight: -0.9 }, // Inhibitory
];

export const ART_NODES: NodeData[] = [
  // Input Layer
  { id: 'a1', type: 'artificial', position: [-3, 1.5, 0], value: 0, metadata: { label: 'Input A', description: 'Feature X1', layer: 'input' } },
  { id: 'a2', type: 'artificial', position: [-3, -1.5, 0], value: 0, metadata: { label: 'Input B', description: 'Feature X2', layer: 'input' } },
  // Hidden Layer
  { id: 'h1', type: 'artificial', position: [0, 2, 0], value: 0, metadata: { label: 'Hidden 1', description: 'Relu Activation', layer: 'hidden' } },
  { id: 'h2', type: 'artificial', position: [0, 0, 0], value: 0, metadata: { label: 'Hidden 2', description: 'Relu Activation', layer: 'hidden' } },
  { id: 'h3', type: 'artificial', position: [0, -2, 0], value: 0, metadata: { label: 'Hidden 3', description: 'Relu Activation', layer: 'hidden' } },
  // Output Layer
  { id: 'o1', type: 'artificial', position: [3, 0, 0], value: 0, metadata: { label: 'Output', description: 'Sigmoid Probability', layer: 'output' } },
];

export const ART_EDGES: EdgeData[] = [
  { id: 'ae1', source: 'a1', target: 'h1', weight: 0.5 },
  { id: 'ae2', source: 'a1', target: 'h2', weight: -0.2 },
  { id: 'ae3', source: 'a2', target: 'h2', weight: 0.8 },
  { id: 'ae4', source: 'a2', target: 'h3', weight: 0.4 },
  { id: 'ae5', source: 'h1', target: 'o1', weight: 0.6 },
  { id: 'ae6', source: 'h2', target: 'o1', weight: 0.9 },
  { id: 'ae7', source: 'h3', target: 'o1', weight: -0.5 },
];

export const SIM_CONSTANTS = {
  BIO_DECAY: 0.95, // Membrane potential decay
  PULSE_SPEED: 2.5,
  TIMESTEP: 0.016,
};
