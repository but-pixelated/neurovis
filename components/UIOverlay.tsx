import React from 'react';
import { NodeType, SimulationConfig } from '../types';

interface UIOverlayProps {
  mode: NodeType;
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  setMode: (m: NodeType) => void;
  onReset: () => void;
}

export const UIOverlay: React.FC<UIOverlayProps> = ({
  mode,
  config,
  setConfig,
  setMode,
  onReset
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      {/* Header */}
      <header className="flex justify-between items-start pointer-events-auto">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 drop-shadow-sm">
            NEURO<span className="text-white">VIS</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1 max-w-md">
            Comparing Biological Neural Networks vs. Artificial Deep Learning
          </p>
        </div>
        
        {/* Mode Toggles */}
        <div className="bg-gray-900/80 backdrop-blur border border-gray-700 rounded-full p-1 flex gap-1">
          <button
            onClick={() => setMode('biological')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              mode === 'biological' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            Biological
          </button>
          <button
            onClick={() => setMode('artificial')}
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
              mode === 'artificial' 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
              : 'text-gray-400 hover:text-white'
            }`}
          >
            Artificial
          </button>
        </div>
      </header>

      {/* Bottom Controls */}
      <footer className="pointer-events-auto flex items-end gap-4">
        <div className="bg-gray-900/90 border border-gray-700 rounded-xl p-4 backdrop-blur-md shadow-2xl flex flex-col gap-4 w-64">
          <div className="flex items-center justify-between">
             <button
               onClick={() => setConfig(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
               className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${
                 config.autoPlay ? 'bg-white text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
               }`}
               aria-label={config.autoPlay ? "Pause" : "Play"}
             >
               {config.autoPlay ? '⏸' : '▶'}
             </button>
             <button 
                onClick={onReset}
                className="text-xs text-gray-400 hover:text-white uppercase font-bold tracking-widest"
             >
                Reset
             </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-400">
                <label>Simulation Speed</label>
                <span>{config.speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={config.speed}
              onChange={(e) => setConfig(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
              className="w-full h-1.5 bg-gray-700 rounded-full appearance-none accent-white"
            />
          </div>
          
          {mode === 'biological' && (
              <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="noise"
                    checked={config.noise}
                    onChange={(e) => setConfig(prev => ({ ...prev, noise: e.target.checked }))}
                    className="w-4 h-4 rounded bg-gray-700 border-gray-600 accent-green-500"
                  />
                  <label htmlFor="noise" className="text-xs text-gray-300 select-none">Inject Random Noise</label>
              </div>
          )}
        </div>

        {/* Contextual Help / Legend */}
        <div className="bg-black/60 border border-gray-800 rounded-lg p-4 backdrop-blur text-xs text-gray-300 hidden md:block">
            <h3 className="font-bold text-white mb-2">Legend</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${mode === 'biological' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                    <span>Active Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-0.5 bg-gray-400"></div>
                    <span>Connection</span>
                </div>
                <div className="col-span-2 mt-2 text-gray-500 italic">
                    Click nodes/edges to edit properties.
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};
