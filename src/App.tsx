import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Trophy, History, BookOpen, Music, Heart, Dices, RotateCcw } from 'lucide-react';
import { MCCharacter } from './components/MCCharacter';
import { QuizCreator } from './components/QuizCreator';
import { QuizStage } from './components/QuizStage';
import { StickerBoard } from './components/StickerBoard';
import { ALL_PRESETS, SAMPLE_INITIAL_QUIZ, presetToQuizItem, PresetItem } from './data/presets';
import { AgeGroup, InputMode, QuizItem } from './types';
import { playPopSound, playSparkleChime, speakKoreanText, stopSpeaking } from './utils/audio';

export default function App() {
  const [currentQuiz, setCurrentQuiz] = useState<QuizItem>(SAMPLE_INITIAL_QUIZ);
  const [solvedQuizzes, setSolvedQuizzes] = useState<QuizItem[]>([]);
  const [quizHistory, setQuizHistory] = useState<QuizItem[]>([SAMPLE_INITIAL_QUIZ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('3~5세');
  const [mcSpeechText, setMcSpeechText] = useState<string>(
    '안녕 친구들! 랄라 MC예요! 오늘의 58가지 알쏭달쏭 비밀 수수께끼를 맞춰볼까요? 🎤'
  );
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Load saved solved quizzes from localStorage on mount
  useEffect(() => {
    try {
      const savedSolved = localStorage.getItem('toddler_quiz_solved');
      if (savedSolved) {
        setSolvedQuizzes(JSON.parse(savedSolved));
      }
    } catch (e) {
      console.warn('Failed to load storage:', e);
    }
  }, []);

  // Save solved quizzes to localStorage
  const handleSolveQuiz = (quizId: string) => {
    if (!solvedQuizzes.some((q) => q.target === currentQuiz.target)) {
      const updated = [currentQuiz, ...solvedQuizzes];
      setSolvedQuizzes(updated);
      try {
        localStorage.setItem('toddler_quiz_solved', JSON.stringify(updated));
      } catch (e) {}
    }
    setMcSpeechText(
      `우와아! 정답 [${currentQuiz.target}]을 맞혔어요! 짝짝짝! ⭐️ 참 잘했어요! 정말 멋진 수수께끼 탐험가예요!`
    );
  };

  // Directly select preset card (instant 0ms response!)
  const handleSelectPresetDirect = useCallback((preset: PresetItem) => {
    stopSpeaking();
    setIsSpeaking(false);
    playPopSound();

    const newQuiz = presetToQuizItem(preset, ageGroup);
    setCurrentQuiz(newQuiz);
    setQuizHistory((prev) => [newQuiz, ...prev.filter((q) => q.target !== newQuiz.target)]);
    setMcSpeechText(`쨘! [${preset.name}] 수수께끼가 도착했어요! 어떤 친구일까요? 들어보세요! 🎤`);
    playSparkleChime();

    // Scroll smoothly to stage
    window.scrollTo({ top: 100, behavior: 'smooth' });
  }, [ageGroup]);

  // Next Random Quiz Handler (guarantees a DIFFERENT quiz from 58+ items!)
  const handleNextQuiz = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    playPopSound();

    // Exclude current target so it NEVER repeats the same quiz
    const available = ALL_PRESETS.filter((p) => p.name !== currentQuiz.target);

    // Prefer unvisited ones from the 58 collection
    const unvisited = available.filter(
      (p) => !solvedQuizzes.some((s) => s.target === p.name) &&
             !quizHistory.slice(0, 5).some((h) => h.target === p.name)
    );

    const pool = unvisited.length > 0 ? unvisited : available;
    const picked = pool[Math.floor(Math.random() * pool.length)];

    const newQuiz = presetToQuizItem(picked, ageGroup);
    setCurrentQuiz(newQuiz);
    setQuizHistory((prev) => [newQuiz, ...prev.filter((q) => q.target !== newQuiz.target)]);
    setMcSpeechText(
      `쨘! 새로운 비밀 퀴즈예요! 이번엔 과연 누구일까요? 귀를 쫑긋 세워보세요! 🎤`
    );
    playSparkleChime();

    window.scrollTo({ top: 100, behavior: 'smooth' });
  }, [currentQuiz.target, solvedQuizzes, quizHistory, ageGroup]);

  // AI-powered custom quiz generator (for photo upload, direct custom word, or AI exploration)
  const handleGenerateQuiz = async (params: {
    inputMode: InputMode;
    targetName?: string;
    category?: string;
    imageData?: string;
    mimeType?: string;
    ageGroup: AgeGroup;
  }) => {
    setIsLoading(true);
    stopSpeaking();
    setIsSpeaking(false);
    setMcSpeechText('랄라 MC가 신나는 맞춤 수수께끼를 준비하고 있어요! 잠시만 기다려주세요~ 🎈');

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          // Exclude currently played targets so AI never repeats
          excludeList: quizHistory.slice(0, 10).map((q) => q.target),
        }),
      });

      const resData = await response.json();
      if (!resData.success || !resData.data) {
        throw new Error(resData.error || '퀴즈를 불러오지 못했습니다.');
      }

      const generated = resData.data;
      const newQuiz: QuizItem = {
        id: `ai-quiz-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        target: generated.target,
        category: generated.category || '동물/음식',
        emoji: generated.emoji || '✨',
        riddle: generated.riddle,
        praiseComment: generated.praiseComment,
        formattedOutput: generated.formattedOutput,
        soundClue: generated.soundClue,
        curiosityTip: generated.curiosityTip,
        userImage: params.imageData ? `data:${params.mimeType || 'image/jpeg'};base64,${params.imageData}` : undefined,
        solved: false,
        ageGroup: params.ageGroup,
        createdAt: Date.now(),
      };

      setCurrentQuiz(newQuiz);
      setQuizHistory((prev) => [newQuiz, ...prev.filter((q) => q.target !== newQuiz.target)]);
      setMcSpeechText(
        `비밀 퀴즈가 도착했어요! 어떤 친구일까요? 귀를 쫑긋 세우고 들어보세요! 🎤`
      );
      playSparkleChime();

      window.scrollTo({ top: 100, behavior: 'smooth' });
    } catch (err: any) {
      console.warn('AI quiz creation fallback to local presets:', err);
      // Seamlessly fallback to next local preset so user never gets stuck!
      handleNextQuiz();
    } finally {
      setIsLoading(false);
    }
  };

  // Handle MC character click
  const handleMcGreeting = () => {
    playPopSound();
    const greetings = [
      '안녕! 랄라 MC예요! 우리 친구 오늘도 신나게 놀아볼까요?',
      '반가워요! 58가지 과일과 동물 친구들이 수수께끼를 준비했어요!',
      '두 귀를 쫑긋! 힌트를 잘 들으면 정답이 쏙쏙 보여요!',
      '와아! 수수께끼를 풀고 멋진 별 도장을 모아보세요!',
    ];
    const picked = greetings[Math.floor(Math.random() * greetings.length)];
    setMcSpeechText(picked);
    speakKoreanText(picked, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-rose-50 to-sky-100 py-6 px-3 sm:px-6">
      {/* Container */}
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Festive Party Garland Top Banner */}
        <header className="text-center relative pt-2">
          {/* Garland Flags Decoration */}
          <div className="flex justify-center gap-2 mb-2 select-none overflow-hidden">
            {['🚩', '🎈', '⭐️', '🎪', '🍎', '🦁', '🍓', '🍭', '✨', '🎈', '🚩'].map((deco, idx) => (
              <span
                key={idx}
                className="text-xl sm:text-2xl animate-bounce-slight"
                style={{ animationDelay: `${idx * 0.12}s` }}
              >
                {deco}
              </span>
            ))}
          </div>

          <div className="inline-block bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full border-4 border-amber-300 shadow-lg">
            <h1 className="font-jua text-2xl sm:text-4xl text-rose-600 flex items-center justify-center gap-2 tracking-wide">
              <span>🎤</span>
              <span>우당탕탕 비밀 퀴즈쇼 MC</span>
              <span>✨</span>
            </h1>
          </div>
          <p className="font-jua text-slate-600 text-sm sm:text-base mt-2">
            3세·5세 눈높이 맞춤! 과일, 동물, 사물 <strong className="text-rose-600 font-black">58가지</strong> 비밀 수수께끼 놀이
          </p>
        </header>

        {/* MC Lala Interactive Character */}
        <MCCharacter
          isSpeaking={isSpeaking}
          statusText={mcSpeechText}
          onCharacterClick={handleMcGreeting}
        />

        {/* Main Active Quiz Stage */}
        <main>
          <QuizStage
            quiz={currentQuiz}
            onSolveQuiz={handleSolveQuiz}
            onNextQuiz={handleNextQuiz}
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
          />
        </main>

        {/* Quiz Creator Controls (58 Presets, Photo, Custom Word, Mystery Box) */}
        <section aria-label="새로운 수수께끼 만들기">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="font-jua text-lg sm:text-xl text-slate-800 flex items-center gap-1.5">
              <span>🎨</span>
              <span>58가지 비밀 수수께끼 골라 풀기</span>
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleNextQuiz}
                className="text-xs sm:text-sm font-black text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1 rounded-xl flex items-center gap-1 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>랜덤 다음 퀴즈</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHistoryModal(true)}
                className="text-xs sm:text-sm font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl flex items-center gap-1 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                <span>풀어본 퀴즈 ({quizHistory.length})</span>
              </button>
            </div>
          </div>

          <QuizCreator
            onGenerateQuiz={handleGenerateQuiz}
            isLoading={isLoading}
            ageGroup={ageGroup}
            onAgeGroupChange={setAgeGroup}
            onSelectPresetDirect={handleSelectPresetDirect}
            onSurpriseRandom={handleNextQuiz}
          />
        </section>

        {/* Sticker / Stamp Board */}
        <section aria-label="수수께끼 도장판">
          <StickerBoard solvedQuizzes={solvedQuizzes} />
        </section>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 font-sans-kr py-4 space-y-1">
          <p>
            💖 3세, 5세 유아를 위한 다정한 비밀 퀴즈쇼 MC • 58가지 과일·채소·동물·탈것 수수께끼
          </p>
          <p className="text-[11px] text-slate-400">
            소리와 함께 들으면 아이의 어휘력과 상상력이 쑥쑥 자라나요! 🌱
          </p>
        </footer>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl border-4 border-amber-300 space-y-4">
            <div className="flex items-center justify-between border-b-2 border-amber-100 pb-3">
              <h3 className="font-jua text-xl text-slate-800 flex items-center gap-2">
                <span>📚</span>
                <span>오늘 풀어본 비밀 수수께끼 모음</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {quizHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentQuiz(item);
                    setShowHistoryModal(false);
                    playPopSound();
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                  }}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all hover:scale-101 flex items-start gap-3 ${
                    currentQuiz.id === item.id
                      ? 'bg-amber-100/70 border-amber-400 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-amber-50'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm border border-slate-200 flex-shrink-0">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800">
                        {item.target}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 font-jua pt-0.5">
                      "{item.riddle}"
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold rounded-2xl transition-colors shadow-sm"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
