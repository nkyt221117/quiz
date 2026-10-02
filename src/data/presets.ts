import { QuizItem } from '../types';
import { FRUIT_PRESETS, PresetItem } from './fruitPresets';
import { ANIMAL_PRESETS } from './animalPresets';

export { FRUIT_PRESETS } from './fruitPresets';
export { ANIMAL_PRESETS } from './animalPresets';
export type { PresetItem } from './fruitPresets';

// Combined database of 58+ items
export const ALL_PRESETS: PresetItem[] = [...FRUIT_PRESETS, ...ANIMAL_PRESETS];

// Helper to convert PresetItem to QuizItem
export function presetToQuizItem(item: PresetItem, ageGroup: '3세' | '5세' | '3~5세' = '3~5세'): QuizItem {
  return {
    id: `preset-${item.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    target: item.name,
    category: item.categoryLabel,
    emoji: item.emoji,
    riddle: item.riddle,
    praiseComment: item.praiseComment,
    formattedOutput: `---
🎤 [비밀 퀴즈쇼 코너]
${item.riddle}

✨ [정답 확인 코너]
- 정답: ${item.name}
- 해설 멘트: "${item.praiseComment}"
---`,
    soundClue: item.soundClue,
    curiosityTip: item.curiosityTip,
    solved: false,
    ageGroup,
    createdAt: Date.now(),
  };
}

// Initial sample quiz is Rabbit
export const SAMPLE_INITIAL_QUIZ: QuizItem = presetToQuizItem(
  ANIMAL_PRESETS.find((a) => a.name === '토끼') || ANIMAL_PRESETS[0]
);
