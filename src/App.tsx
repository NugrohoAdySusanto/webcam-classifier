import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Loader2, RefreshCw } from 'lucide-react';
import { Controller } from './mvc/controller';
import { AIModel } from './mvc/model';
import { View } from './mvc/view';
import type { Prediction } from './types';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [mode, setMode] = useState<'OBJECT' | 'EMOTION'>('OBJECT');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const modelRef = useRef<AIModel | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const init = async () => {
      try {
        const model = new AIModel();
        await model.init();
        modelRef.current = model;

        const view = new View(video, canvas);
        const mvcController = new Controller(model, view, video);
        controllerRef.current = mvcController;

        setIsReady(true);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize models');
      }
    };
    init();

    return () => {
      controllerRef.current?.stop();
    };
  }, []);

  const startWebcam = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play();
      setIsStreaming(true);
      setError(null);
      controllerRef.current?.start();
    } catch (err: any) {
      setError(err.message || 'Webcam access denied');
    }
  };

  const stopWebcam = () => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
    controllerRef.current?.stop();
    setIsStreaming(false);
  };

  const handleResetScan = () => setScannedResult(null);

  const toggleMode = async () => {
    if (!controllerRef.current) return;
    const newMode = await controllerRef.current.toggleMode();
    setMode(newMode);
    setPredictions([]);
    setScannedResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 relative">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">AI Vision Classifier <span className="text-sm font-normal text-slate-400 ml-2">(COCO-SSD)</span></h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMode}
            className="bg-slate-700 px-3 py-1 rounded text-sm hover:bg-slate-600"
          >
            Mode: {mode}
          </button>
          <div className="flex items-center gap-2">
            {isReady ? <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" /> : <Loader2 className="animate-spin" />}
            <span>{isReady ? 'Ready' : 'Loading Model...'}</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-900/50 border border-red-700 p-4 rounded mb-4 text-red-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg">
          <div className="relative mb-4">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded-lg bg-black"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full rounded-lg pointer-events-none"
            />
          </div>
          <div className="flex gap-4">
            {!isStreaming ? (
              <button
                onClick={startWebcam}
                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                <Camera size={20} /> Start Webcam
              </button>
            ) : (
              <button
                onClick={stopWebcam}
                className="flex items-center gap-2 bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition-colors"
              >
                <CameraOff size={20} /> Stop Webcam
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Real-time Predictions</h2>
          <div className="space-y-4">
            {predictions.length > 0 ? (
              predictions.map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="capitalize">{p.class}</span>
                    <span>{(p.score * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-300"
                      style={{ width: `${p.score * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-400 italic text-center py-8">
                {isStreaming ? "Analyzing frame..." : "Start webcam to see predictions"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stable Detection Modal */}
      {scannedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border border-slate-700 text-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/50">
              <Camera size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Object Detected!</h3>
            <p className="text-slate-300 mb-8 text-lg">
              Benda yang Anda scan adalah: <br/>
              <span className="text-white font-bold text-3xl block mt-2 capitalize">{scannedResult}</span>
            </p>
            <button
              onClick={handleResetScan}
              className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-95"
            >
              <RefreshCw size={20} /> Scan Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}