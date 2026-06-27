export interface Prediction {
  bbox: number[];
  class: string;
  score: number;
}

export interface EmotionResult {
  expressions: Record<string, number>;
  dominantEmotion: string;
  dominantScore: number;
  detection: any;
}

export type AppMode = 'OBJECT' | 'EMOTION';