import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeData, EdgeData, NodeType } from '../types';

interface InfoPanelProps {
  selectedId: string | null;
  nodes: Record<string, NodeData>;
  edges: EdgeData[];
  onClose: () => void;
  onUpdateNode: (id: string, data: Partial<NodeData>) => void;
  onUpdateEdge: (id: string, weight: number) => void;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  selectedId,
  nodes,
  edges,
  onClose,
  onUpdateNode,
  onUpdateEdge
}) => {
  const selectedNode = selectedId ? nodes[selectedId] : null;
  const selectedEdge = !selectedNode ? edges.find(e => e.id === selectedId) : null;

  return (
    <AnimatePresence>
      {selectedId && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 border-l border-gray-700 backdrop-blur-md p-6 shadow-2xl z-50 overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white"
            aria-label="Close panel"
          >
            ✕
          </button>

          {selectedNode && (
            <div>
              <div className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-blue-600 mb-2 uppercase tracking-wider">
                {selectedNode.type} Node
              </div>
              <h2 className="text-2xl font-bold mb-4 text-white">{selectedNode.metadata.label}</h2>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                {selectedNode.metadata.description}
              </p>

              <div className="space-y-6">
                {selectedNode.type === 'biological' && (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-400">Threshold Potential</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.1"
                        value={selectedNode.threshold}
                        onChange={(e) => onUpdateNode(selectedNode.id, { threshold: parseFloat(e.target.value) })}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                      />
                      <div className="text-right text-xs text-blue-400">{selectedNode.threshold?.toFixed(2)}mV</div>
                    </div>
                    <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-400">Recovery Rate</label>
                        <input
                            type="range"
                            min="0.01"
                            max="0.2"
                            step="0.01"
                            value={selectedNode.recovery}
                            onChange={(e) => onUpdateNode(selectedNode.id, { recovery: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                        <div className="text-right text-xs text-blue-400">{selectedNode.recovery?.toFixed(3)}</div>
                    </div>
                  </>
                )}

                {selectedNode.type === 'artificial' && (
                   <div className="p-4 bg-gray-800 rounded border border-gray-700">
                     <h3 className="text-sm font-bold text-gray-200 mb-2">Activation Math</h3>
                     <p className="text-xs text-gray-400 font-mono">
                       {selectedNode.metadata.layer === 'output' ? 'f(x) = 1 / (1 + e^-x)' : 'f(x) = max(0, x)'}
                     </p>
                     <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between text-sm">
                       <span>Current Activation:</span>
                       <span className="font-mono text-blue-400">{selectedNode.value.toFixed(3)}</span>
                     </div>
                   </div>
                )}
              </div>
            </div>
          )}

          {selectedEdge && (
            <div>
               <div className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-600 mb-2 uppercase tracking-wider">
                Synaptic Weight
              </div>
              <h2 className="text-xl font-bold mb-4 text-white">Connection</h2>
              <p className="text-gray-300 text-sm mb-6">
                Adjusts the strength of the signal transmitted between neurons.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-400">Weight Strength</label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={selectedEdge.weight}
                  onChange={(e) => onUpdateEdge(selectedEdge.id, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <div className="flex justify-between text-xs">
                    <span className="text-red-400">Inhibitory (-2)</span>
                    <span className="text-white font-bold">{selectedEdge.weight.toFixed(1)}</span>
                    <span className="text-green-400">Excitatory (+2)</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
