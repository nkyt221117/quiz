import React from 'react';
import { Volume2, Sparkles, Heart, Star } from 'lucide-react';

interface MCCharacterProps {
  isSpeaking: boolean;
  statusText?: string;
  onCharacterClick?: () => void;
}

export const MCCharacter: React.FC<MCCharacterProps> = ({
  isSpeaking,
  statusText = '안녕 친구들! 랄라 MC와 함께 비밀 수수께끼 맞춰볼까요? 🎤',
  onCharacterClick,
}) => {
  return (
    <div className="relative flex items-center gap-3 sm:gap-5 bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 p-3 sm:p-4 rounded-3xl border-4 border-amber-300 shadow-md">
      {/* Decorative Star & Heart floating badges */}
      <div className="absolute -top-3 -left-2 text-amber-500 animate-wiggle">
        <Star className="w-6 h-6 fill-amber-400" />
      </div>
      <div className="absolute -top-3 -right-2 text-rose-500 animate-bounce-slight">
        <Heart className="w-6 h-6 fill-rose-400" />
      </div>

      {/* MC Lala Avatar with Sparkly Mic */}
      <div
        onClick={onCharacterClick}
        className="relative group cursor-pointer flex-shrink-0"
        title="랄라 MC 콕 찔러보기!"
      >
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-200 via-pink-200 to-amber-300 border-4 border-white shadow-lg flex items-center justify-center transition-transform ${
            isSpeaking ? 'scale-105 animate-pulse-glow ring-4 ring-pink-400' : 'hover:scale-105 animate-bounce-slight'
          }`}
        >
          {/* Animated Cute Rabbit Host */}
          <div className="text-4xl sm:text-5xl select-none relative">
            🐰
            {/* Sparkly Party Hat / Crown */}
            <span className="absolute -top-3 left-2 text-lg sm:text-xl animate-wiggle">👑</span>
            {/* Golden Mic */}
            <span className="absolute -bottom-1 -right-2 text-2xl filter drop-shadow">🎤</span>
          </div>
        </div>

        {/* Audio Wave Indicator when Speaking */}
        {isSpeaking && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-end gap-1 bg-pink-600 px-2 py-0.5 rounded-full shadow">
            <span className="w-1 bg-white rounded-full sound-bar-1" />
            <span className="w-1 bg-white rounded-full sound-bar-2" />
            <span className="w-1 bg-white rounded-full sound-bar-3" />
            <span className="w-1 bg-white rounded-full sound-bar-4" />
          </div>
        )}
      </div>

      {/* MC Speech Bubble */}
      <div className="flex-1 relative bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
        {/* Little triangle arrow pointing to MC */}
        <div className="absolute top-5 -left-2.5 w-0 h-0 border-y-8 border-y-transparent border-r-8 border-r-white/90" />

        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-rose-500 mb-1">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>다정한 유아 퀴즈쇼 MC 랄라</span>
          {isSpeaking && (
            <span className="inline-flex items-center gap-1 text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full animate-pulse ml-auto">
              <Volume2 className="w-3 h-3" />
              말하는 중...
            </span>
          )}
        </div>
        <p className="text-slate-800 text-sm sm:text-base font-jua leading-relaxed">
          {statusText}
        </p>
      </div>
    </div>
  );
};
