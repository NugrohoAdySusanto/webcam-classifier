import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as faceapi from '@vladmandic/face-api';
import type { Prediction, EmotionResult } from '../types';

const FACE_MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export class AIModel {
  private cocoModel: any = null;
  private faceModelsLoaded = false;

  async init() {
    await tf.ready();
    const [cocoModel] = await Promise.all([
      cocoSsd.load(),
      this.loadFaceModels(),
    ]);
    this.cocoModel = cocoModel;
  }

  private async loadFaceModels() {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(FACE_MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(FACE_MODEL_URL),
      ]);
      this.faceModelsLoaded = true;
    } catch (err) {
      console.warn('Face models load failed, emotion mode unavailable:', err);
      this.faceModelsLoaded = false;
    }
  }

  get isFaceModelsLoaded() {
    return this.faceModelsLoaded;
  }

  async detectObject(videoElement: HTMLVideoElement): Promise<Prediction[]> {
    if (!this.cocoModel) throw new Error('COCO-SSD model not loaded');
    return await this.cocoModel.detect(videoElement);
  }

  async detectEmotion(videoElement: HTMLVideoElement): Promise<EmotionResult | null> {
    if (!this.faceModelsLoaded) throw new Error('Face models not loaded');

    const detection = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!detection) return null;

    const expressions = detection.expressions as unknown as Record<string, number>;

    // Debugging: Log raw scores
    console.log("[EMOTION RAW SCORES]", expressions);

    // --- Micro-expression sensitivity logic ---
    // Find strongest emotion EXCLUDING neutral
    let bestEmotion = 'neutral';
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(expressions)) {
      if (emotion !== 'neutral' && score > maxScore) {
        maxScore = score;
        bestEmotion = emotion;
      }
    }

    // Threshold: if non-neutral emotion > 5% (0.05), use it; otherwise fallback to neutral
    const THRESHOLD = 0.05;
    const dominantEmotion = maxScore > THRESHOLD ? bestEmotion : 'neutral';
    const dominantScore = maxScore > THRESHOLD ? maxScore : expressions.neutral;

    return { expressions, dominantEmotion, dominantScore, detection };
  }
}