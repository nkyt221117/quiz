import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  HelpCircle,
  Award,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Star,
  PartyPopper,
} from 'lucide-react';
import { QuizItem } from '../types';
import {
  playDrumroll,
  playFanfare,
  playPopSound,
  playSparkleChime,
  speakKoreanText,
  stopSpeaking,
} from '../utils/audio';

interface QuizStageProps {
  quiz: QuizItem;
  onSolveQuiz: (quizId: string) => void;
  onNextQuiz: () => void;
  isSpeaking: boolean;
  setIsSpeaking: (speaking: boolean) => void;
}

export const QuizStage: React.FC<QuizStageProps> = ({
  quiz,
  onSolveQuiz,
  onNextQuiz,
  isSpeaking,
  setIsSpeaking,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stampEarned, setStampEarned] = useState(false);

  // Reset revelation state when quiz changes
  useEffect(() => {
    setIsRevealed(false);
    setStampEarned(false);
    setShowRawText(false);

    // Speak the riddle initially
    speakRiddle();

    return () => {
      stopSpeaking();
    };
  }, [quiz.id]);

  const speakRiddle = () => {
    speakKoreanText(
      `비밀 퀴즈쇼 코너! 수수께끼를 들어보세요. ${quiz.riddle}`,
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      }
    );
  };

  const speakAnswer = () => {
    speakKoreanText(
      `정답 확인 코너! 정답은 바로 ${quiz.target}! ${quiz.praiseComment}`,
      {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
      }
    );
  };

  const handleRevealAnswer = () => {
    if (isRevealed) return;

    playDrumroll();

    setTimeout(() => {
      setIsRevealed(true);
      setStampEarned(true);
      onSolveQuiz(quiz.id);
      playFanfare();

      // Fire festive colorful confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#3b82f6', '#10b981', '#a855f7'],
      });

      // Voice praise announcement
      speakAnswer();
    }, 600);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(quiz.formattedOutput);
    setCopied(true);
    playPopSound();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-gradient-to-b from-amber-50 via-white to-pink-50 rounded-3xl p-5 sm:p-7 border-4 border-amber-300 shadow-2xl overflow-hidden space-y-6">
      {/* Decorative Stage Curtains Header */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 shadow-sm" />
      <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mt-1">
        <div className="flex items-center gap-2">
          <span className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs sm:text-sm font-bold shadow-sm inline-flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            비밀 퀴즈 무대
          </span>
          <span className="text-xs text-slate-500 font-sans-kr">
            {quiz.category} • {quiz.ageGroup || '3~5세'}
          </span>
        </div>

        {/* Audio Riddle Play/Stop Button */}
        <button
          type="button"
          onClick={() => {
            if (isSpeaking) {
              stopSpeaking();
              setIsSpeaking(false);
            } else {
              if (isRevealed) {
                speakAnswer();
              } else {
                speakRiddle();
              }
            }
          }}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
            isSpeaking
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-300'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>소리 멈추기</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{isRevealed ? '정답 다시 듣기' : '퀴즈 다시 듣기'}</span>
            </>
          )}
        </button>
      </div>

      {/* SECTION 1: 🎤 [비밀 퀴즈쇼 코너] */}
      <div className="bg-gradient-to-br from-yellow-50 to-amber-100/70 p-5 sm:p-6 rounded-3xl border-3 border-amber-300 shadow-inner relative space-y-4">
        {/* Corner Badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-sm sm:text-base px-4 py-1.5 rounded-2xl shadow-md">
            <span>🎤 [비밀 퀴즈쇼 코너]</span>
          </div>

          {quiz.soundClue && (
            <span className="text-xs sm:text-sm font-bold text-amber-900 bg-amber-200/80 px-3 py-1 rounded-xl">
              힌트 팡팡: {quiz.soundClue}
            </span>
          )}
        </div>

        {/* 2~3 Line Child Friendly Riddle */}
        <div className="py-2">
          <p className="text-xl sm:text-2xl md:text-3xl font-jua text-slate-800 leading-relaxed tracking-wide text-center sm:text-left drop-shadow-sm">
            "{quiz.riddle}"
          </p>
        </div>

        {/* Optional User Uploaded Image Mystery Silhouette */}
        {quiz.userImage && (
          <div className="flex justify-center pt-2">
            <div className="relative group">
              <img
                src={quiz.userImage}
                alt="수수께끼 사진"
                className={`w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-2xl border-4 border-amber-300 shadow-md transition-all duration-700 ${
                  isRevealed ? 'filter-none scale-105' : 'filter blur-md brightness-90'
                }`}
              />
              {!isRevealed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
                  <span className="text-3xl animate-bounce">❓</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* The Prominent "✨ 정답 알기! ✨" Button (Before Reveal) */}
      {!isRevealed ? (
        <div className="text-center py-3 space-y-3">
          <button
            type="button"
            onClick={handleRevealAnswer}
            className="w-full sm:w-auto px-8 sm:px-14 py-4 sm:py-5 rounded-3xl bg-gradient-to-r from-amber-400 via-rose-400 to-amber-400 text-slate-950 font-black text-xl sm:text-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all transform animate-pulse-glow border-4 border-white flex items-center justify-center gap-3 mx-auto group"
          >
            <Sparkles className="w-7 h-7 text-amber-900 group-hover:rotate-45 transition-transform" />
            <span>✨ 정답 알기! (두근두근 톡!) ✨</span>
            <Sparkles className="w-7 h-7 text-amber-900 group-hover:-rotate-45 transition-transform" />
          </button>
          <p className="text-xs sm:text-sm text-slate-500 font-sans-kr">
            버튼을 콕 누르면 랄라 MC가 정답과 함께 신나는 축하를 해줘요! 🎉
          </p>
        </div>
      ) : (
        /* SECTION 2: ✨ [정답 확인 코너] (After Reveal) */
        <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 p-5 sm:p-7 rounded-3xl border-4 border-rose-300 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-500">
          {/* Header Badge */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm sm:text-base px-4 py-1.5 rounded-2xl shadow-md">
              <PartyPopper className="w-4 h-4" />
              <span>✨ [정답 확인 코너]</span>
            </div>

            {stampEarned && (
              <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-yellow-950 font-black px-3.5 py-1 rounded-2xl shadow-sm text-xs sm:text-sm animate-wiggle">
                <Star className="w-4 h-4 fill-yellow-950" />
                <span>참 잘했어요! +1 도장</span>
              </div>
            )}
          </div>

          {/* Big Answer Display [정답: OOO] */}
          <div className="bg-white/90 p-4 sm:p-5 rounded-2xl border-2 border-rose-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-100 to-pink-100 flex items-center justify-center text-5xl sm:text-6xl shadow-inner border-2 border-rose-200 animate-bounce-slight flex-shrink-0">
              {quiz.emoji}
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-sm font-bold text-rose-500 tracking-wide">
                [정답: {quiz.target}]
              </div>
              <div className="text-2xl sm:text-3xl font-black text-rose-950">
                🎉 정답은 바로 <span className="text-rose-600 underline decoration-amber-400 decoration-wavy">{quiz.target}</span>!
              </div>
              <p className="text-base sm:text-lg font-jua text-slate-700 leading-relaxed pt-1">
                "{quiz.praiseComment}"
              </p>
            </div>
          </div>

          {/* Curiosity Tip */}
          {quiz.curiosityTip && (
            <div className="bg-amber-100/70 p-3 rounded-2xl border border-amber-300 text-xs sm:text-sm text-amber-900 flex items-center gap-2">
              <span className="text-lg">💡</span>
              <span className="font-sans-kr font-medium">{quiz.curiosityTip}</span>
            </div>
          )}

          {/* Action Buttons for Next Round */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={speakAnswer}
              className="px-4 py-2 rounded-2xl bg-white border-2 border-rose-200 text-rose-700 font-bold text-xs sm:text-sm hover:bg-rose-50 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>신나는 축하 멘트 다시 듣기</span>
            </button>

            <button
              type="button"
              onClick={onNextQuiz}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-95 transition-transform flex items-center gap-1.5 ml-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>다음 비밀 퀴즈 또 할래요! 🚀</span>
            </button>
          </div>
        </div>
      )}

      {/* Raw Output Format Inspection for Teachers/Parents/Evaluator */}
      <div className="border-t-2 border-dashed border-amber-200 pt-3">
        <button
          type="button"
          onClick={() => setShowRawText(!showRawText)}
          className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 transition-colors"
        >
          {showRawText ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>[출력 형식 원문 보기 / 복사하기]</span>
        </button>

        {showRawText && (
          <div className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto relative">
            <button
              type="button"
              onClick={handleCopyText}
              className="absolute top-2 right-2 bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? '복사됨!' : '텍스트 복사'}</span>
            </button>
            <pre className="whitespace-pre-wrap">{quiz.formattedOutput}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
