import { useState, useRef, useEffect, RefObject } from 'react';
import { Controller } from '../mvc/controller';
import { AIModel } from '../mvc/model';
import { View } from '../mvc/view';
import type { Prediction } from '../types';

interface UseWebcamClassifierReturn {
  isReady: boolean;
  isStreaming: boolean;
  predictions: Prediction[];
  error: string | null;
  popupMessage: string | null;
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
}

export function useWebcamClassifier(): UseWebcamClassifierReturn {
  const [isReady, setIsReady] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [popupMessage, setPopupMessage] = useState<string | null>(null);

  const dominantTrackingRef = useRef<{ class: string; startTime: number }>({ class: '', startTime: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  const modelRef = useRef<AIModel | null>(null);

  useEffect(() => {
    if (predictions.length === 0) {
      dominantTrackingRef.current = { class: '', startTime: 0 };
      setPopupMessage(null);
      return;
    }
    
    // Cari objek dominan (skor tertinggi)
    const dominant = predictions.reduce((prev, current) => (prev.score > current.score) ? prev : current);
    const now = Date.now();

    if (dominantTrackingRef.current.class === dominant.class) {
      if (now - dominantTrackingRef.current.startTime > 3000) {
        setPopupMessage(`Pendeteksi yakin bahwa objek ini adalah: ${dominant.class.toUpperCase()}`);
      }
    } else {
      // Objek berubah, reset timer
      dominantTrackingRef.current = { class: dominant.class, startTime: now };
      setPopupMessage(null);
    }
  }, [predictions]);

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

  return {
    isReady,
    isStreaming,
    predictions,
    error,
    popupMessage,
    videoRef,
    canvasRef,
    startWebcam,
    stopWebcam
  };
}
