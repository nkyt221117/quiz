import React from 'react';
import { Star, Trophy, Sparkles, Heart } from 'lucide-react';
import { QuizItem } from '../types';

interface StickerBoardProps {
  solvedQuizzes: QuizItem[];
}

export const StickerBoard: React.FC<StickerBoardProps> = ({ solvedQuizzes }) => {
  const count = solvedQuizzes.length;

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-4 sm:p-5 border-3 border-amber-300 shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center text-amber-950 font-bold shadow-sm">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-jua text-base sm:text-lg text-slate-800 leading-tight">
              우리 아이 수수께끼 도장판 ⭐️
            </h3>
            <p className="text-xs text-slate-500 font-sans-kr">
              퀴즈를 맞힐 때마다 멋진 스티커가 모여요!
            </p>
          </div>
        </div>

        <div className="bg-white px-3 py-1 rounded-2xl border-2 border-amber-300 font-black text-amber-600 text-sm shadow-inner flex items-center gap-1">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{count} 개 획득!</span>
        </div>
      </div>

      {/* Grid of earned stamps */}
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 pt-1">
        {Array.from({ length: Math.max(10, count + (10 - (count % 10 || 10))) }).map((_, idx) => {
          const quiz = solvedQuizzes[idx];
          if (quiz) {
            return (
              <div
                key={quiz.id || idx}
                title={`${quiz.target} 수수께끼 완료!`}
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-300 to-yellow-200 border-2 border-white shadow-sm flex items-center justify-center text-xl sm:text-2xl animate-in zoom-in-50 duration-300 cursor-default hover:scale-110 transition-transform"
              >
                {quiz.emoji}
              </div>
            );
          }

          return (
            <div
              key={`empty-${idx}`}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/60 border-2 border-dashed border-amber-200 flex items-center justify-center text-xs text-amber-300 font-bold"
            >
              {idx + 1}
            </div>
          );
        })}
      </div>

      {count > 0 && (
        <div className="flex items-center justify-between text-xs text-amber-800 bg-amber-100/60 px-3 py-1.5 rounded-xl font-sans-kr">
          <span>
            {count >= 5 ? '🎉 와아! 수수께끼 대장으로 임명합니다!' : '조금만 더 맞추면 칭찬 뱃지를 받아요!'}
          </span>
          <span className="font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            최고 멋쟁이
          </span>
        </div>
      )}
    </div>
  );
};
