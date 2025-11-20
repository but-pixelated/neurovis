import { NodeData, EdgeData, Pulse, SimulationState, NodeType } from '../types';
import { SIM_CONSTANTS } from '../constants';

export const createInitialState = (nodes: NodeData[], edges: EdgeData[]): SimulationState => ({
  nodes: nodes.reduce((acc, node) => ({ ...acc, [node.id]: { ...node, value: 0 } }), {}),
  edges,
  pulses: [],
  time: 0,
});

export const stepBiological = (
  state: SimulationState,
  dt: number,
  config: { speed: number; noise: boolean }
): SimulationState => {
  const newNodes = { ...state.nodes };
  const newPulses: Pulse[] = [];
  const completedPulses: Pulse[] = [];

  // 1. Move existing pulses
  state.pulses.forEach(p => {
    const nextProgress = p.progress + (SIM_CONSTANTS.PULSE_SPEED * dt * config.speed);
    if (nextProgress >= 1) {
      completedPulses.push(p);
    } else {
      newPulses.push({ ...p, progress: nextProgress });
    }
  });

  // 2. Apply completed pulses to target nodes
  const inputs: Record<string, number> = {};
  completedPulses.forEach(p => {
    const edge = state.edges.find(e => e.id === p.edgeId);
    if (edge) {
      inputs[edge.target] = (inputs[edge.target] || 0) + edge.weight;
    }
  });

  // 3. Update nodes (LIF dynamics)
  Object.keys(newNodes).forEach(id => {
    const node = { ...newNodes[id] };
    const input = (inputs[id] || 0) + (config.noise ? (Math.random() - 0.5) * 0.1 : 0);
    
    // Decay
    node.value = node.value * SIM_CONSTANTS.BIO_DECAY + input;

    // Spike threshold
    if (node.value >= (node.threshold || 1.0)) {
      node.value = -0.2; // Hyperpolarization (refractory start)
      
      // Fire pulses to all outgoing edges
      const outgoing = state.edges.filter(e => e.source === id);
      outgoing.forEach(edge => {
        newPulses.push({
          id: `${edge.id}-${state.time}-${Math.random()}`,
          edgeId: edge.id,
          progress: 0,
          value: 1.0
        });
      });
    } else {
      // Return to resting potential (0)
      // Simplified recovery
      if (node.value < 0) node.value += (node.recovery || 0.05);
    }

    newNodes[id] = node;
  });

  return {
    ...state,
    nodes: newNodes,
    pulses: newPulses,
    time: state.time + dt
  };
};

export const stepArtificial = (
  state: SimulationState,
  dt: number, // Used for animation phase
  config: { speed: number }
): SimulationState => {
  // Artificial doesn't use "pulses" in the same way, but we animate "flow"
  // We will just use a sine wave driver for the "Input" layer to simulate data
  // and then propagate instantly but visualize slowly in the UI component
  
  const newNodes = { ...state.nodes };
  const time = state.time + dt * config.speed;
  
  // 1. Feed inputs (sinusoidal data for demo)
  const inputNodes = Object.values(newNodes).filter(n => n.metadata.layer === 'input');
  inputNodes.forEach((n, i) => {
    newNodes[n.id] = { ...n, value: (Math.sin(time * 2 + i) + 1) / 2 };
  });

  // 2. Forward pass (simple MLP)
  // We do this every frame for immediate feedback, UI smooths it visually
  const hiddenNodes = Object.values(newNodes).filter(n => n.metadata.layer === 'hidden');
  hiddenNodes.forEach(n => {
    const incoming = state.edges.filter(e => e.target === n.id);
    const sum = incoming.reduce((acc, e) => {
      return acc + (newNodes[e.source].value * e.weight);
    }, 0);
    // ReLU
    newNodes[n.id] = { ...n, value: Math.max(0, sum) };
  });

  const outputNodes = Object.values(newNodes).filter(n => n.metadata.layer === 'output');
  outputNodes.forEach(n => {
    const incoming = state.edges.filter(e => e.target === n.id);
    const sum = incoming.reduce((acc, e) => {
      return acc + (newNodes[e.source].value * e.weight);
    }, 0);
    // Sigmoid
    newNodes[n.id] = { ...n, value: 1 / (1 + Math.exp(-sum)) };
  });

  return {
    ...state,
    nodes: newNodes,
    time
  };
};
