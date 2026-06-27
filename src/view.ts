export class View {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  draw(results: any[], mode: 'OBJECT' | 'EMOTION', emotionData?: any) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

    if (mode === 'OBJECT') {
      results.forEach((res) => {
        const [x, y, w, h] = res.bbox;
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);
        this.ctx.fillStyle = 'red';
        this.ctx.fillText(`${res.class} (${Math.round(res.score * 100)}%)`, x, y > 10 ? y - 5 : 10);
      });
    } else if (mode === 'EMOTION' && emotionData) {
      const { detection, dominantEmotion } = emotionData;
      const { x, y, width, height } = detection.detection.box;
      this.ctx.strokeStyle = 'blue';
      this.ctx.strokeRect(x, y, width, height);
      this.ctx.fillStyle = 'blue';
      this.ctx.fillText(dominantEmotion, x, y > 10 ? y - 5 : 10);
    }
  }
}