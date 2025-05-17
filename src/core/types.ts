export interface PendingData {
  generatedAt: string;
  source: string; // 'AI' | 'manual' 등
  words: string[];
}

export interface SentData {
  generatedAt: string;
  source: string; // 'AI' | 'manual' 등
  words: string[];
}