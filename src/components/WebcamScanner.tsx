import { RefObject } from 'react';
import { Camera, CameraOff } from 'lucide-react';

interface WebcamScannerProps {
  isReady: boolean;
  isStreaming: boolean;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  startWebcam: () => void;
  stopWebcam: () => void;
}

export function WebcamScanner({
  isReady,
  isStreaming,
  videoRef,
  canvasRef,
  startWebcam,
  stopWebcam
}: WebcamScannerProps) {
  return (
    <div className="bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-700/50">
      <div className="relative mb-6 overflow-hidden rounded-xl bg-black aspect-video ring-1 ring-white/10 shadow-inner">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={() => {
            if (videoRef.current && canvasRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
            }
          }}
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <CameraOff className="w-12 h-12 text-slate-500 mb-2" />
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {!isStreaming ? (
          <button
            onClick={startWebcam}
            disabled={!isReady}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <Camera size={20} /> 
            <span>Start Scanning</span>
          </button>
        ) : (
          <button
            onClick={stopWebcam}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-red-600 to-rose-500 px-8 py-3 rounded-xl font-medium shadow-lg shadow-red-500/25 hover:from-red-500 hover:to-rose-400 hover:shadow-red-500/40 hover:-translate-y-0.5 transition-all"
          >
            <CameraOff size={20} /> 
            <span>Stop Camera</span>
          </button>
        )}
      </div>
    </div>
  );
}
