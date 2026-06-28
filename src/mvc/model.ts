import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import type { Prediction } from '../types';

const YOLO_CLASSES = [
  "bottle-cup", "laptop"
];

export class AIModel {
  private yoloModel: tf.GraphModel | null = null;
  private cocoSsdModel: cocoSsd.ObjectDetection | null = null;

  async init() {
    await tf.ready();
    const [yolo, coco] = await Promise.all([
      tf.loadGraphModel('/model/model.json'),
      cocoSsd.load()
    ]);
    this.yoloModel = yolo;
    this.cocoSsdModel = coco;
  }

  get isFaceModelsLoaded() {
    return false; // Removed face models
  }

  async detectObject(videoElement: HTMLVideoElement): Promise<Prediction[]> {
    if (!this.yoloModel || !this.cocoSsdModel) throw new Error('Models not fully loaded');

    const videoWidth = videoElement.videoWidth;
    const videoHeight = videoElement.videoHeight;
    if (videoWidth === 0 || videoHeight === 0) return [];

    let predictions: Prediction[] = [];

    try {
      const tensor = tf.tidy(() => {
        const pixels = tf.browser.fromPixels(videoElement);
        const resized = tf.image.resizeBilinear(pixels, [640, 640]);
        const normalized = resized.cast('float32'); // Model expects 0-255, no div(255)
        return normalized.expandDims(0);
      });

      const result = this.yoloModel.execute(tensor) as tf.Tensor;

      const res = tf.tidy(() => {
        const squeezed = result.squeeze([0]);
        const transposed = squeezed.transpose();
        return transposed.arraySync() as number[][];
      });

      const boxes: number[][] = [];
      const scores: number[] = [];
      const classes: number[] = [];

      for (let i = 0; i < res.length; i++) {
        const row = res[i];
        const box = row.slice(0, 4); // [cx, cy, w, h]
        const classScores = row.slice(4);
        let maxScore = -1;
        let maxClassIndex = -1;

        for (let j = 0; j < classScores.length; j++) {
          if (classScores[j] > maxScore) {
            maxScore = classScores[j];
            maxClassIndex = j;
          }
        }

        if (maxScore > 0.5) { // Confidence threshold
          const cx = box[0];
          const cy = box[1];
          const w = box[2];
          const h = box[3];

          const xMin = cx - w / 2;
          const yMin = cy - h / 2;

          boxes.push([xMin, yMin, w, h]);
          scores.push(maxScore);
          classes.push(maxClassIndex);
        }
      }

      if (boxes.length > 0) {
        // Non-Maximum Suppression (NMS)
        // Convert to [yMin, xMin, yMax, xMax] for TFJS NMS
        const nmsBoxes = boxes.map(b => [b[1], b[0], b[1] + b[3], b[0] + b[2]]);
        const nmsBoxesTensor = tf.tensor2d(nmsBoxes, [nmsBoxes.length, 4]);
        const scoresTensor = tf.tensor1d(scores);

        const indicesTensor = await tf.image.nonMaxSuppressionAsync(nmsBoxesTensor, scoresTensor, 20, 0.45, 0.5);
        const indices = await indicesTensor.array();

        indicesTensor.dispose();
        nmsBoxesTensor.dispose();
        scoresTensor.dispose();

        const xRatio = videoWidth / 640;
        const yRatio = videoHeight / 640;

        for (const idx of indices) {
          const box = boxes[idx];
          const x = box[0] * xRatio;
          const y = box[1] * yRatio;
          const w = box[2] * xRatio;
          const h = box[3] * yRatio;

          predictions.push({
            bbox: [x, y, w, h],
            class: YOLO_CLASSES[classes[idx]] || `Class ${classes[idx]}`,
            score: scores[idx]
          });
        }
      }

      tf.dispose([tensor, result]);
    } catch (err) {
      console.error(err);
    }

    try {
      // Run COCO-SSD concurrently or sequentially (sequential here because of async block above)
      // COCO-SSD is very fast.
      const cocoPredictions = await this.cocoSsdModel.detect(videoElement);

      // Filter out overlapping general classes that our YOLOv8 custom model handles better
      const filteredCoco = cocoPredictions.filter(
        p => !['laptop'].includes(p.class)
      );

      // Merge both predictions
      predictions = [...predictions, ...filteredCoco];
    } catch (err) {
      console.error('COCO-SSD Detection error:', err);
    }

    return predictions;
  }
}