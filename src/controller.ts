import { AIModel } from './model';
import { View } from './view';
import type { Prediction } from './types';

export interface AppState {
  isReady?: boolean;
  isStreaming?: boolean;
  predictions?: Prediction[];
  error?: string | null;
  scannedResult?: string | null;
}

export class Controller {
  private model: AIModel;
  private view: View;
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private requestRef?: number;
  private onStateChange: (state: AppState) => void;

  private isStreaming = false;
  private scannedResult: string | null = null;

  // Stable detection tracking
  private currentTopObject: string | null = null;
  private detectionStartTime = Date.now();
  private mode: 'OBJECT' | 'EMOTION' = 'OBJECT';

  constructor(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    onStateChange: (state: AppState) => void
  ) {
    this.video = video;
    this.canvas = canvas;
    this.model = new AIModel();
    this.view = new View(video, canvas);
    this.onStateChange = onStateChange;
  }

  async init() {
    try {
      await this.model.init();
      console.log("[SYSTEM] Model Loaded Successfully");
      this.onStateChange({ isReady: true });
    } catch (err) {
      console.error("[ERROR] AI Initialization failed:", err);
      this.onStateChange({ error: "Gagal memuat model AI." });
    }
  }

  setMode(mode: 'OBJECT' | 'EMOTION') {
    this.mode = mode;
  }

  async startWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      this.video.srcObject = stream;
      this.isStreaming = true;
      this.onStateChange({ isStreaming: true, error: null });
      this.requestRef = requestAnimationFrame(this.detectFrame);
    } catch (err) {
      this.onStateChange({
        error: "Gagal mengakses kamera. Pastikan Anda mengakses URL menggunakan awalan https:// dan memberikan izin akses kamera pada browser."
      });
    }
  }

  stopWebcam() {
    if (this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.isStreaming = false;
    this.currentTopObject = null;
    this.detectionStartTime = Date.now();
    if (this.requestRef) {
      cancelAnimationFrame(this.requestRef);
      this.requestRef = undefined;
    }
    this.onStateChange({ isStreaming: false });
  }

  handleResetScan() {
    this.scannedResult = null;
    this.currentTopObject = null;
    this.detectionStartTime = Date.now();
    this.onStateChange({ scannedResult: null });
    // Resume detection
    if (this.isStreaming && !this.requestRef) {
      this.requestRef = requestAnimationFrame(this.detectFrame);
    }
  }

  private detectFrame = () => {
    if (this.scannedResult) {
      this.requestRef = requestAnimationFrame(this.detectFrame);
      return;
    }

    if (this.video.readyState === 4) {
      // Sync canvas to video resolution for bbox alignment
      if (this.canvas.width !== this.video.videoWidth || this.canvas.height !== this.video.videoHeight) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      }

      if (this.mode === 'OBJECT') {
        this.model.detectObject(this.video).then(results => {
          this.view.draw(results, 'OBJECT');
          const predictions = results as Prediction[];
          this.onStateChange({ predictions });

          if (results.length > 0) {
            const topObject = results[0].class;
            const topScore = results[0].score;

            if (topObject === this.currentTopObject) {
              const elapsed = Date.now() - this.detectionStartTime;
              if (elapsed >= 3000) {
                console.log(`[AI VISION] Stable detection locked: ${topObject}`);
                this.scannedResult = topObject;
                this.onStateChange({ scannedResult: topObject });
              }
            } else {
              this.currentTopObject = topObject;
              this.detectionStartTime = Date.now();
            }

            console.log(`[AI VISION] Prediksi saat ini: ${topObject} (${(topScore * 100).toFixed(2)}%)`);
          } else {
            this.currentTopObject = null;
            this.detectionStartTime = Date.now();
          }
        }).catch(err => {
          console.error("[ERROR] Gagal melakukan klasifikasi:", err);
        });
      } else {
        this.model.detectEmotion(this.video).then(emotionData => {
          if (emotionData) {
            this.view.draw([], 'EMOTION', emotionData);

            // Stable detection for dominant emotion
            const topEmotion = emotionData.dominantEmotion;
            if (topEmotion === this.currentTopObject) {
              const elapsed = Date.now() - this.detectionStartTime;
              if (elapsed >= 3000) {
                console.log(`[AI VISION] Stable emotion locked: ${topEmotion}`);
                this.scannedResult = topEmotion;
                this.onStateChange({ scannedResult: topEmotion });
              }
            } else {
              this.currentTopObject = topEmotion;
              this.detectionStartTime = Date.now();
            }
          } else {
            this.view.draw([], 'EMOTION', null);
            this.currentTopObject = null;
            this.detectionStartTime = Date.now();
          }
        }).catch(err => {
          console.error("[ERROR] Emotion detection failed:", err);
        });
      }
    }

    this.requestRef = requestAnimationFrame(this.detectFrame);
  };

  destroy() {
    if (this.requestRef) {
      cancelAnimationFrame(this.requestRef);
    }
    this.stopWebcam();
  }
}