import type { Prediction } from '../types';

export class View {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  draw(results: Prediction[]) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawObjects(results);
  }

  private drawObjects(predictions: Prediction[]) {
    this.ctx.font = '16px "Inter", sans-serif';
    this.ctx.textBaseline = 'top';

    predictions.forEach(prediction => {
      const [x, y, width, height] = prediction.bbox;
      const text = `${prediction.class} ${(prediction.score * 100).toFixed(1)}%`;
      const textWidth = this.ctx.measureText(text).width;
      const textHeight = 16;
      
      const textY = y > 20 ? y - 24 : 10;
      
      // Draw Bounding Box
      this.ctx.strokeStyle = '#3b82f6'; // Tailwind blue-500
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(x, y, width, height);
      
      // Draw Label Background
      this.ctx.fillStyle = '#3b82f6';
      this.ctx.fillRect(x, textY, textWidth + 8, textHeight + 8);
      
      // Draw Label Text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillText(text, x + 4, textY + 4);
    });
  }
}