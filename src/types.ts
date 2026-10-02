export type AgeGroup = '3세' | '5세' | '3~5세';

export type InputMode = 'presets' | 'text' | 'image' | 'random';

export interface QuizItem {
  id: string;
  target: string;
  category: string;
  emoji: string;
  riddle: string;
  praiseComment: string;
  formattedOutput: string;
  soundClue?: string;
  curiosityTip?: string;
  userImage?: string;
  solved?: boolean;
  ageGroup?: AgeGroup;
  createdAt: number;
}

export interface PresetCard {
  name: string;
  emoji: string;
  category: 'animal' | 'food' | 'vehicle';
  tag: string;
  bgGradient: string;
}
