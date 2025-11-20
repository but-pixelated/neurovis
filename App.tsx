import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { NodeType, SimulationState, SimulationConfig } from './types';
import { BIO_NODES, BIO_EDGES, ART_NODES, ART_EDGES, SIM_CONSTANTS } from './constants';
import { createInitialState, stepBiological, stepArtificial } from './services/simulation';
import { NetworkGraph } from './components/NetworkGraph';
import { UIOverlay } from './components/UIOverlay';
import { InfoPanel } from './components/InfoPanel';

// Invisible component to hook into the render loop for physics updates
const SimulationLoop: React.FC<{
  simState: React.MutableRefObject<SimulationState>;
  config: SimulationConfig;
  mode: NodeType;
}> = ({ simState, config, mode }) => {
  useFrame((state, delta) => {
    if (!config.autoPlay) return;
    // Cap delta to avoid huge jumps if tab was backgrounded
    const dt = Math.min(delta, 0.1);
    
    if (mode === 'biological') {
      simState.current = stepBiological(simState.current, dt, config);
    } else {
      simState.current = stepArtificial(simState.current, dt, config);
    }
  });
  return null;
};

const App: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<NodeType>('biological');
  const [config, setConfig] = useState<SimulationConfig>({ speed: 1.0, noise: false, autoPlay: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // --- Refs ---
  // We use a ref for simulation state to avoid React re-renders on every frame (60fps)
  const simStateRef = useRef<SimulationState>(createInitialState(BIO_NODES, BIO_EDGES));

  // --- Effects ---
  
  // Reset simulation when mode changes
  useEffect(() => {
    setSelectedId(null);
    if (mode === 'biological') {
        simStateRef.current = createInitialState(BIO_NODES, BIO_EDGES);
    } else {
        simStateRef.current = createInitialState(ART_NODES, ART_EDGES);
    }
    // Trigger a re-render to ensure graph sees new topology immediately (ref updates don't trigger render)
    // We can do this by toggling a dummy state or just relying on the fact that `NetworkGraph` reads ref in useFrame
    // But `NetworkGraph` needs to reconstruct geometry if nodes changed.
    // Force update:
    setConfig(c => ({ ...c }));
  }, [mode]);

  // --- Handlers ---

  const handleReset = useCallback(() => {
    if (mode === 'biological') {
        simStateRef.current = createInitialState(BIO_NODES, BIO_EDGES);
    } else {
        simStateRef.current = createInitialState(ART_NODES, ART_EDGES);
    }
    // Force re-render of reactive parts if needed (usually not needed for ref-based sim, but good for UI sync)
  }, [mode]);

  // These handlers update the LIVE simulation state directly
  const handleUpdateNode = (id: string, data: any) => {
    if (simStateRef.current.nodes[id]) {
      simStateRef.current.nodes[id] = { ...simStateRef.current.nodes[id], ...data };
      // Force UI update
      setConfig(c => ({...c})); 
    }
  };

  const handleUpdateEdge = (id: string, weight: number) => {
    const edgeIndex = simStateRef.current.edges.findIndex(e => e.id === id);
    if (edgeIndex >= 0) {
      simStateRef.current.edges[edgeIndex] = { ...simStateRef.current.edges[edgeIndex], weight };
       // Force UI update
       setConfig(c => ({...c})); 
    }
  };

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden font-sans">
      
      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <NetworkGraph 
            simState={simStateRef} 
            mode={mode} 
            onNodeClick={setSelectedId}
            onEdgeClick={setSelectedId}
            hoveredNode={hoveredNode}
            setHoveredNode={setHoveredNode}
        />
        
        <SimulationLoop simState={simStateRef} config={config} mode={mode} />
        <OrbitControls makeDefault minDistance={2} maxDistance={20} />
      </Canvas>

      {/* UI Layer */}
      <UIOverlay 
        mode={mode} 
        config={config} 
        setConfig={setConfig} 
        setMode={setMode} 
        onReset={handleReset} 
      />

      {/* Info Panel Portal */}
      <InfoPanel 
        selectedId={selectedId} 
        nodes={simStateRef.current.nodes} // Note: This passes snapshot at render time.
        edges={simStateRef.current.edges}
        onClose={() => setSelectedId(null)}
        onUpdateNode={handleUpdateNode}
        onUpdateEdge={handleUpdateEdge}
      />
      
    </div>
  );
};

export default App;
