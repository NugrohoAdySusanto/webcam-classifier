import { AIModel } from './model';
import { View } from './view';
import type { Prediction, EmotionResult } from '../types';

export class Controller {
  private model: AIModel;
  private view: View;
  private video: HTMLVideoElement;
  private mode: 'OBJECT' | 'EMOTION' = 'OBJECT';
  private animFrameId: number | null = null;
  private isProcessing = false;
  private lastFrameTime = 0;
  private readonly FRAME_INTERVAL = 100;

  constructor(model: AIModel, view: View, video: HTMLVideoElement) {
    this.model = model;
    this.view = view;
    this.video = video;
  }

  async toggleMode(): Promise<'OBJECT' | 'EMOTION'> {
    if (this.mode === 'EMOTION' || !this.model.isFaceModelsLoaded) {
      this.mode = 'OBJECT';
    } else {
      this.mode = 'EMOTION';
    }
    return this.mode;
  }

  getMode(): 'OBJECT' | 'EMOTION' {
    return this.mode;
  }

  start() {
    const loop = (timestamp: number) => {
      if (timestamp - this.lastFrameTime < this.FRAME_INTERVAL || this.isProcessing) {
        this.animFrameId = requestAnimationFrame(loop);
        return;
      }

      this.isProcessing = true;
      this.lastFrameTime = timestamp;

      if (this.mode === 'OBJECT') {
        this.detectAndDrawObjects().finally(() => {
          this.isProcessing = false;
        });
      } else {
        this.detectAndDrawEmotion().finally(() => {
          this.isProcessing = false;
        });
      }

      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private async detectAndDrawObjects() {
    try {
      const predictions: Prediction[] = await this.model.detectObject(this.video);
      this.view.draw(predictions, 'OBJECT');
      this.updateStatus(predictions, null);
    } catch (err) {
      console.error('Detection error:', err);
    }
  }

  private async detectAndDrawEmotion() {
    try {
      const emotionData: EmotionResult | null = await this.model.detectEmotion(this.video);
      this.view.draw([], 'EMOTION', emotionData);
      this.updateStatus([], emotionData);
    } catch (err) {
      console.error('Emotion detection error:', err);
    }
  }

  private updateStatus(predictions: Prediction[], emotion: EmotionResult | null) {
    const statusEl = document.getElementById('status');
    if (!statusEl) return;

    if (this.mode === 'OBJECT' && predictions.length > 0) {
      const top = predictions[0];
      statusEl.textContent = `Detected: ${top.class} (${(top.score * 100).toFixed(0)}%)`;
    } else if (this.mode === 'EMOTION' && emotion) {
      statusEl.textContent = `Emotion: ${emotion.dominantEmotion} (${(emotion.dominantScore * 100).toFixed(0)}%)`;
    } else {
      statusEl.textContent = 'No detection';
    }
  }
}