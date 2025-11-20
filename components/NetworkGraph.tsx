import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { NodeData, EdgeData, SimulationState, NodeType } from '../types';

// Reusable geometries/materials for performance
const bioMaterial = new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.4, metalness: 0.1 });
const artMaterial = new THREE.MeshStandardMaterial({ color: '#60a5fa', roughness: 0.2, metalness: 0.8 });
const spikeMaterial = new THREE.MeshBasicMaterial({ color: '#facc15' });

interface NetworkGraphProps {
  simState: React.MutableRefObject<SimulationState>;
  mode: NodeType;
  onNodeClick: (id: string) => void;
  onEdgeClick: (id: string) => void;
  hoveredNode: string | null;
  setHoveredNode: (id: string | null) => void;
}

interface PulseProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  progress: number;
}

const PulseInstance: React.FC<PulseProps> = ({ start, end, progress }) => {
  const pos = useMemo(() => new THREE.Vector3(), []);
  pos.lerpVectors(start, end, progress);
  
  return (
    <mesh position={pos}>
      <sphereGeometry args={[0.08, 8, 8]} />
      <primitive object={spikeMaterial} />
    </mesh>
  );
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  simState,
  mode,
  onNodeClick,
  onEdgeClick,
  hoveredNode,
  setHoveredNode
}) => {
  // We keep refs to meshes to update them imperatively without React re-renders
  const nodeMeshes = useRef<Record<string, THREE.Mesh>>({});
  const edgeLines = useRef<Record<string, any>>({}); // Line refs

  const nodes: NodeData[] = Object.values(simState.current.nodes);
  const edges = simState.current.edges;

  useFrame(() => {
    const state = simState.current;
    
    // Update Nodes
    (Object.values(state.nodes) as NodeData[]).forEach((node) => {
      const mesh = nodeMeshes.current[node.id];
      if (mesh) {
        // Pulse scale/color based on value
        const baseScale = hoveredNode === node.id ? 1.2 : 1.0;
        const activation = node.value;
        
        if (mode === 'biological') {
            // Spiking animation
            const scale = baseScale + (activation > 0.5 ? 0.2 : 0);
            mesh.scale.setScalar(scale);
            
            // Flash color if spiking
            if (activation > 0.8) {
               (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0xffff00);
               (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 2;
            } else {
               (mesh.material as THREE.MeshStandardMaterial).emissive.setHex(0x000000);
               (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
            }
        } else {
            // Artificial: brightness = value
            const val = Math.min(Math.max(activation, 0), 1);
            mesh.scale.setScalar(baseScale + val * 0.2);
            (mesh.material as THREE.MeshStandardMaterial).emissive.setHSL(0.6, 1, 0.5);
            (mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = val * 2;
        }
      }
    });
  });

  // Helper to get Vector3 from node ID
  const getPos = (id: string) => {
    const p = simState.current.nodes[id].position;
    return new THREE.Vector3(p[0], p[1], p[2]);
  };

  return (
    <group>
      {/* NODES */}
      {nodes.map((node) => (
        <group key={node.id} position={node.position}>
          <mesh
            ref={(el) => { if (el) nodeMeshes.current[node.id] = el; }}
            onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }}
            onPointerOver={() => { document.body.style.cursor = 'pointer'; setHoveredNode(node.id); }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; setHoveredNode(null); }}
            material={mode === 'biological' ? bioMaterial.clone() : artMaterial.clone()}
          >
            <sphereGeometry args={[0.4, 32, 32]} />
          </mesh>
          {/* Label (always visible for educational clarity or on hover) */}
          <Html distanceFactor={10} position={[0, 0.6, 0]} style={{ pointerEvents: 'none' }}>
             <div className={`text-xs font-mono px-2 py-1 rounded bg-black/50 text-white whitespace-nowrap transition-opacity ${hoveredNode === node.id ? 'opacity-100' : 'opacity-40'}`}>
                {node.metadata.label}
                {mode === 'artificial' && <span className="block text-blue-300 font-bold">{node.value.toFixed(2)}</span>}
             </div>
          </Html>
        </group>
      ))}

      {/* EDGES */}
      {edges.map((edge) => {
        const start = getPos(edge.source);
        const end = getPos(edge.target);
        const isHovered = false; // Could extend hover logic to edges

        return (
          <React.Fragment key={edge.id}>
            <Line
              points={[start, end]}
              color={edge.weight > 0 ? (mode === 'biological' ? '#86efac' : '#93c5fd') : '#fca5a5'}
              lineWidth={Math.abs(edge.weight) * 2}
              transparent
              opacity={0.4}
              onClick={(e) => { e.stopPropagation(); onEdgeClick(edge.id); }}
              onPointerOver={() => document.body.style.cursor = 'pointer'}
              onPointerOut={() => document.body.style.cursor = 'auto'}
            />
          </React.Fragment>
        );
      })}

      {/* PULSES (Bio Mode) */}
      {mode === 'biological' && <BioPulses simState={simState} />}
    </group>
  );
};

const BioPulses: React.FC<{ simState: React.MutableRefObject<SimulationState> }> = ({ simState }) => {
    const pulses = simState.current.pulses;
    return (
        <>
            {pulses.map(p => {
                const sourceId = simState.current.edges.find(e => e.id === p.edgeId)?.source;
                const targetId = simState.current.edges.find(e => e.id === p.edgeId)?.target;
                if (!sourceId || !targetId) return null;
                
                const start = new THREE.Vector3(...simState.current.nodes[sourceId].position);
                const end = new THREE.Vector3(...simState.current.nodes[targetId].position);
                
                return <PulseInstance key={p.id} start={start} end={end} progress={p.progress} />;
            })}
        </>
    );
}