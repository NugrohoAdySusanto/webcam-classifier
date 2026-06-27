import * as faceapi from '@vladmandic/face-api';
import type { Prediction, EmotionResult } from '../types';

export class View {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  draw(results: Prediction[], mode: 'OBJECT' | 'EMOTION', emotionData?: EmotionResult | null) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (mode === 'OBJECT') {
      this.drawObjects(results);
    } else if (mode === 'EMOTION' && emotionData) {
      this.drawEmotion(emotionData);
    }
  }

  private drawObjects(predictions: Prediction[]) {
    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      this.ctx.strokeStyle = '#00FFFF';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.fillStyle = '#00FFFF';
      this.ctx.fillText(`${prediction.class} (${(prediction.score * 100).toFixed(1)}%)`, x, y > 10 ? y - 5 : 10);
    });
  }

  private drawEmotion(emotionData: EmotionResult) {
    const dims = faceapi.matchDimensions(this.canvas, this.video, true);
    const resized = faceapi.resizeResults(emotionData.detection, dims);
    faceapi.draw.drawDetections(this.canvas, resized);
    
    const text = `${emotionData.dominantEmotion} (${(emotionData.dominantScore * 100).toFixed(1)}%)`;
    const { x, y } = resized.detection.box;
    this.ctx.fillStyle = '#FF00FF';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(text, x, y - 10);
  }
}