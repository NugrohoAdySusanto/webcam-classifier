import { AIModel } from './model';
import { View } from './view';
import type { Prediction } from '../types';

export class Controller {
  private model: AIModel;
  private view: View;
  private video: HTMLVideoElement;
  private animFrameId: number | null = null;
  private isProcessing = false;
  private lastFrameTime = 0;
  private readonly FRAME_INTERVAL = 100;
  private onPredictionsUpdate?: (predictions: Prediction[]) => void;

  constructor(model: AIModel, view: View, video: HTMLVideoElement, onPredictionsUpdate?: (predictions: Prediction[]) => void) {
    this.model = model;
    this.view = view;
    this.video = video;
    this.onPredictionsUpdate = onPredictionsUpdate;
  }

  start() {
    const loop = (timestamp: number) => {
      if (timestamp - this.lastFrameTime < this.FRAME_INTERVAL || this.isProcessing) {
        this.animFrameId = requestAnimationFrame(loop);
        return;
      }

      this.isProcessing = true;
      this.lastFrameTime = timestamp;

      this.detectAndDrawObjects().finally(() => {
        this.isProcessing = false;
      });

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
      this.view.draw(predictions);
      
      // Update the react state via callback if provided
      if (this.onPredictionsUpdate) {
        this.onPredictionsUpdate(predictions);
      }
    } catch (err) {
      console.error('Detection error:', err);
    }
  }
}