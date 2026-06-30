import type { Emotion } from '@/types/journal';

export interface EmotionConfig {
  id: Emotion;
  label: string;
  emoji: string;
  bg: string;
  text: string;
  dot: string;
}

export const EMOTIONS: Record<Emotion, EmotionConfig> = {
  joy: {
    id: 'joy',
    label: 'Joy',
    emoji: '😊',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  peace: {
    id: 'peace',
    label: 'Peace',
    emoji: '😌',
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    dot: 'bg-sky-400',
  },
  gratitude: {
    id: 'gratitude',
    label: 'Gratitude',
    emoji: '❤️',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  hopeful: {
    id: 'hopeful',
    label: 'Hopeful',
    emoji: '🌱',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    dot: 'bg-teal-400',
  },
  anxiety: {
    id: 'anxiety',
    label: 'Anxiety',
    emoji: '😟',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  sadness: {
    id: 'sadness',
    label: 'Sadness',
    emoji: '😔',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-400',
  },
  frustration: {
    id: 'frustration',
    label: 'Frustration',
    emoji: '😤',
    bg: 'bg-red-50',
    text: 'text-red-700',
    dot: 'bg-red-400',
  },
  tired: {
    id: 'tired',
    label: 'Tired',
    emoji: '😴',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    dot: 'bg-purple-400',
  },
  uncertain: {
    id: 'uncertain',
    label: 'Uncertain',
    emoji: '🤔',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    dot: 'bg-indigo-400',
  },
  overwhelmed: {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    emoji: '😶',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
  },
};

export const EMOTION_LIST = Object.values(EMOTIONS);

export function getEmotionConfig(emotion: Emotion | string | null | undefined): EmotionConfig | null {
  if (!emotion) return null;
  return EMOTIONS[emotion as Emotion] ?? null;
}
