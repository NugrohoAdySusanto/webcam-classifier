import type { Prediction } from '../types';
import { Target } from 'lucide-react';

interface PredictionListProps {
  predictions: Prediction[];
  isStreaming: boolean;
}

export function PredictionList({ predictions, isStreaming }: PredictionListProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700/50 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-700/50">
        <Target className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold tracking-tight">Active Detections</h2>
      </div>

      <div className="space-y-5 overflow-y-auto flex-grow pr-2 custom-scrollbar">
        {predictions.length > 0 ? (
          predictions.map((p, i) => (
            <div key={i} className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="capitalize font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                  {p.class}
                </span>
                <span className="text-sm text-slate-400 font-mono">
                  {(p.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-900/50 h-2.5 rounded-full overflow-hidden shadow-inner ring-1 ring-white/5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out relative"
                  style={{ width: `${p.score * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
            <Target className="w-12 h-12 mb-4 opacity-20" />
            <p className="italic text-center">
              {isStreaming 
                ? "Monitoring frame... No objects detected yet." 
                : "Start scanning to see predictions."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
