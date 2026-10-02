import React, { useState, useRef, useMemo } from 'react';
import { Camera, Sparkles, Wand2, Dices, Search, Send, RefreshCw, Layers } from 'lucide-react';
import { ALL_PRESETS, FRUIT_PRESETS, ANIMAL_PRESETS, PresetItem } from '../data/presets';
import { AgeGroup, InputMode } from '../types';
import { playPopSound } from '../utils/audio';

interface QuizCreatorProps {
  onGenerateQuiz: (params: {
    inputMode: InputMode;
    targetName?: string;
    category?: string;
    imageData?: string;
    mimeType?: string;
    ageGroup: AgeGroup;
    presetItem?: PresetItem;
  }) => void;
  isLoading: boolean;
  ageGroup: AgeGroup;
  onAgeGroupChange: (age: AgeGroup) => void;
  onSelectPresetDirect: (preset: PresetItem) => void;
  onSurpriseRandom: () => void;
}

export const QuizCreator: React.FC<QuizCreatorProps> = ({
  onGenerateQuiz,
  isLoading,
  ageGroup,
  onAgeGroupChange,
  onSelectPresetDirect,
  onSurpriseRandom,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'photo'>('presets');
  const [presetCategory, setPresetCategory] = useState<'all' | 'fruit' | 'animal' | 'vehicle'>('fruit');
  const [searchTerm, setSearchTerm] = useState('');
  const [customText, setCustomText] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string; preview: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered preset cards
  const filteredPresets = useMemo(() => {
    let list = ALL_PRESETS;
    if (presetCategory === 'fruit') {
      list = FRUIT_PRESETS;
    } else if (presetCategory === 'animal') {
      list = ANIMAL_PRESETS.filter((item) => item.category === 'animal');
    } else if (presetCategory === 'vehicle') {
      list = ANIMAL_PRESETS.filter((item) => item.category === 'vehicle');
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q));
    }
    return list;
  }, [presetCategory, searchTerm]);

  const handleCardClick = (preset: PresetItem) => {
    playPopSound();
    onSelectPresetDirect(preset);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customText.trim() || isLoading) return;
    playPopSound();
    onGenerateQuiz({
      inputMode: 'text',
      targetName: customText.trim(),
      category: '동물/음식',
      ageGroup,
    });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      setSelectedImage({
        data: base64Data,
        mimeType: file.type || 'image/jpeg',
        preview: result,
      });
      playPopSound();
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoQuizSubmit = () => {
    if (!selectedImage || isLoading) return;
    playPopSound();
    onGenerateQuiz({
      inputMode: 'image',
      imageData: selectedImage.data,
      mimeType: selectedImage.mimeType,
      ageGroup,
    });
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border-4 border-amber-200 shadow-xl space-y-4">
      {/* Top Header: Child Age Selector & Surprise Random Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-amber-100 pb-3">
        {/* Child Age Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-500">우리 아이 눈높이:</span>
          <div className="inline-flex bg-amber-50 p-1 rounded-2xl border-2 border-amber-200">
            {(['3세', '5세', '3~5세'] as AgeGroup[]).map((age) => (
              <button
                key={age}
                type="button"
                onClick={() => {
                  playPopSound();
                  onAgeGroupChange(age);
                }}
                className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  ageGroup === age
                    ? 'bg-amber-400 text-amber-950 shadow-sm scale-105'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {age === '3세' ? '🐥 3세' : age === '5세' ? '🦄 5세' : '🐣 3~5세'}
              </button>
            ))}
          </div>
        </div>

        {/* Big Surprise Mystery Button */}
        <button
          type="button"
          onClick={() => {
            playPopSound();
            onSurpriseRandom();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg active:scale-95 transition-transform"
        >
          <Dices className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
          <span>🎲 58가지 중 랜덤 뽑기!</span>
        </button>
      </div>

      {/* Main Tab Selection */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => {
            playPopSound();
            setActiveTab('presets');
          }}
          className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'presets'
              ? 'bg-amber-400 text-amber-950 shadow-md scale-102 border-2 border-amber-500'
              : 'bg-amber-50 text-slate-600 hover:bg-amber-100 border-2 border-transparent'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-800" />
          <span>🍎 🦁 수수께끼 모음 (58종)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playPopSound();
            setActiveTab('photo');
          }}
          className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'photo'
              ? 'bg-pink-400 text-pink-950 shadow-md scale-102 border-2 border-pink-500'
              : 'bg-pink-50 text-slate-600 hover:bg-pink-100 border-2 border-transparent'
          }`}
        >
          <Camera className="w-4 h-4 text-pink-600" />
          <span>📸 사진으로 퀴즈</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playPopSound();
            setActiveTab('custom');
          }}
          className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'custom'
              ? 'bg-emerald-400 text-emerald-950 shadow-md scale-102 border-2 border-emerald-500'
              : 'bg-emerald-50 text-slate-600 hover:bg-emerald-100 border-2 border-transparent'
          }`}
        >
          <Wand2 className="w-4 h-4 text-emerald-700" />
          <span>✍️ 이름 직접 쓰기</span>
        </button>
      </div>

      {/* TAB 1: 58 PRESET CARDS WITH SUBCATEGORIES & SEARCH */}
      {activeTab === 'presets' && (
        <div className="space-y-3">
          {/* Sub-category Pill Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full">
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setPresetCategory('fruit');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  presetCategory === 'fruit'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🍎 과일 & 채소 ({FRUIT_PRESETS.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setPresetCategory('animal');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  presetCategory === 'animal'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🦁 동물 친구들 ({ANIMAL_PRESETS.filter((a) => a.category === 'animal').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setPresetCategory('vehicle');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  presetCategory === 'vehicle'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🚗 탈것 & 간식 ({ANIMAL_PRESETS.filter((a) => a.category === 'vehicle').length})
              </button>
              <button
                type="button"
                onClick={() => {
                  playPopSound();
                  setPresetCategory('all');
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
                  presetCategory === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                ✨ 전체 ({ALL_PRESETS.length})
              </button>
            </div>

            {/* Quick Search Input */}
            <div className="relative w-full sm:w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="낱말 검색 (사과, 사자...)"
                className="w-full pl-8 pr-2 py-1 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-300 font-sans-kr"
              />
            </div>
          </div>

          {/* Preset Cards Grid (58 items) */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5 max-h-64 overflow-y-auto p-1 border border-amber-100 rounded-2xl bg-amber-50/30">
            {filteredPresets.map((card) => (
              <button
                key={card.id}
                type="button"
                onClick={() => handleCardClick(card)}
                className={`flex flex-col items-center p-2 rounded-2xl bg-gradient-to-b ${card.bgGradient} border-2 border-white shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all text-center group cursor-pointer`}
              >
                <span className="text-2xl sm:text-3xl mb-0.5 group-hover:scale-110 transition-transform">
                  {card.emoji}
                </span>
                <span className="font-black text-xs sm:text-sm tracking-tight">{card.name}</span>
                <span className="text-[10px] text-slate-500 truncate max-w-full font-sans-kr opacity-85">
                  {card.tag}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              💡 총 <strong className="text-amber-600 font-bold">{filteredPresets.length}가지</strong> 낱말 수수께끼가 준비되어 있어요!
            </span>
            <span className="font-sans-kr text-slate-400">카드를 콕 누르면 즉시 시작돼요!</span>
          </div>
        </div>
      )}

      {/* TAB 2: PHOTO UPLOAD */}
      {activeTab === 'photo' && (
        <div className="space-y-4 text-center py-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          {!selectedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-3 border-dashed border-pink-300 rounded-3xl p-6 hover:bg-pink-50/50 cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 group-hover:scale-110 transition-transform shadow-inner">
                <Camera className="w-8 h-8" />
              </div>
              <p className="font-bold text-sm sm:text-base text-slate-700">
                아이의 그림, 장난감, 냉장고 속 과일 사진을 올려주세요!
              </p>
              <p className="text-xs text-slate-500 font-sans-kr">
                여기를 누르거나 사진을 불러오면 AI MC가 사진을 보고 맞춤 퀴즈를 내요 ✨
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative inline-block mx-auto">
                <img
                  src={selectedImage.preview}
                  alt="업로드한 사진"
                  className="w-36 h-36 sm:w-44 sm:h-44 object-cover rounded-3xl border-4 border-pink-400 shadow-md mx-auto"
                />
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow hover:bg-rose-600 text-xs font-bold w-6 h-6 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  다른 사진 선택
                </button>
                <button
                  type="button"
                  onClick={handlePhotoQuizSubmit}
                  disabled={isLoading}
                  className="px-5 py-2 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-sm shadow-md hover:shadow-lg active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>이 사진으로 퀴즈 만들기!</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: CUSTOM TEXT INPUT */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="space-y-3 py-1">
          <div className="flex gap-2">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="예: 공룡, 솜사탕, 치타, 헬리콥터..."
              className="flex-1 px-4 py-3 rounded-2xl border-2 border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-200 text-slate-800 text-base font-jua placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isLoading || !customText.trim()}
              className="px-5 py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-md hover:bg-emerald-600 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>퀴즈 만들기</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>추천 예시:</span>
            <div className="flex gap-1.5 flex-wrap">
              {['공룡', '치타', '솜사탕', '포크레인', '돌고래'].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => {
                    setCustomText(sample);
                    playPopSound();
                  }}
                  className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200 hover:bg-emerald-100"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-3 p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 animate-pulse text-amber-900 font-bold text-sm">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
          <span>랄라 MC가 신나는 비밀 퀴즈를 뚝딱뚝딱 만드는 중... 🎨</span>
        </div>
      )}
    </div>
  );
};
