import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Controller } from './mvc/controller';
import { AIModel } from './mvc/model';
import { View } from './mvc/view';
import type { Prediction } from './types';

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);

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

        const view = new View(canvas);
        const mvcController = new Controller(model, view, video, setPredictions);
        controllerRef.current = mvcController;

        setIsReady(true);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize models');
      }
    };
    init();

    return () => {
      controllerRef.current?.stop();
      // Clean up camera stream during hot-reloads to prevent "Starting videoinput failed" hardware lock
      if (video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        video.srcObject = null;
      }
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
      console.error(err);
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

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8 relative">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">YOLOv8 Object Detection <span className="text-sm font-normal text-slate-400 ml-2">(bottle-cup & laptop)</span></h1>
        <div className="flex items-center gap-4">
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
              onLoadedMetadata={() => {
                if (videoRef.current && canvasRef.current) {
                  canvasRef.current.width = videoRef.current.videoWidth;
                  canvasRef.current.height = videoRef.current.videoHeight;
                }
              }}
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
                disabled={!isReady}
                className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
}