export const MOOD_OPTIONS = [
  { key: 'good', label: '맑음' },
  { key: 'neutral', label: '차분함' },
  { key: 'tired', label: '지침' },
] as const;

export type MoodOption = (typeof MOOD_OPTIONS)[number];
export type MoodKey = MoodOption['key'];
