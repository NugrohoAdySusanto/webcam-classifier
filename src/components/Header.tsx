import { Loader2 } from 'lucide-react';

interface HeaderProps {
  isReady: boolean;
}

export function Header({ isReady }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          ICU (I-See-U)
        </h1>
        <p className="text-sm font-medium text-slate-400 mt-1">
          memantau dan mengenali objek tanpa kedip
        </p>
      </div>
      
      <div className="flex items-center gap-4 bg-slate-800 px-4 py-2 rounded-full border border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          {isReady ? (
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          ) : (
            <Loader2 className="animate-spin text-blue-400 w-4 h-4" />
          )}
          <span className="text-sm font-medium">{isReady ? 'System Ready' : 'Loading Model...'}</span>
        </div>
      </div>
    </header>
  );
}
