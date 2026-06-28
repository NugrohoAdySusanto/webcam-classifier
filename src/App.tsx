import { Header } from './components/Header';
import { WebcamScanner } from './components/WebcamScanner';
import { PredictionList } from './components/PredictionList';
import { useWebcamClassifier } from './hooks/useWebcamClassifier';

export default function App() {
  const {
    isReady,
    isStreaming,
    predictions,
    error,
    popupMessage,
    videoRef,
    canvasRef,
    startWebcam,
    stopWebcam
  } = useWebcamClassifier();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header isReady={isReady} />

        {error && (
          <div className="bg-rose-900/40 border border-rose-700/50 p-4 rounded-xl mb-6 text-rose-200 shadow-sm flex items-start">
            <span className="mr-3 mt-0.5">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8 items-stretch">
          <WebcamScanner 
            isReady={isReady}
            isStreaming={isStreaming}
            videoRef={videoRef}
            canvasRef={canvasRef}
            startWebcam={startWebcam}
            stopWebcam={stopWebcam}
          />

          <PredictionList 
            predictions={predictions} 
            isStreaming={isStreaming} 
          />
        </div>

        {/* 3-Second Dominant Object Popup */}
        {popupMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/50 text-emerald-100 px-6 py-3 rounded-full shadow-2xl shadow-emerald-500/20 flex items-center gap-3">
              <span className="text-xl">✨</span>
              <p className="font-medium tracking-wide">{popupMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}