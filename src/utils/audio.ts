// Web Audio API Synthesizer and Web Speech API utilities for toddler sound effects

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Play joyful bubble pop
export function playPopSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch (e) {
    // audio context might fail before user interaction
  }
}

// Play drumroll / exciting buildup
export function playDrumroll() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 1.0;

    for (let i = 0; i < 16; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + (i * duration) / 16;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, t);

      const vol = 0.05 + (i / 16) * 0.25;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    }
  } catch (e) {}
}

// Play triumphant fanfare celebration chime
export function playFanfare() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Chords: C5 (523), E5 (659), G5 (784), C6 (1046)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.15 },
      { freq: 659.25, time: 0.12, dur: 0.15 },
      { freq: 783.99, time: 0.24, dur: 0.18 },
      { freq: 1046.5, time: 0.38, dur: 0.5 },
    ];

    notes.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + time;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + dur);
    });
  } catch (e) {}
}

// Play sweet sparkle chime
export function playSparkleChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const freqs = [784, 988, 1175, 1568];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.3);
    });
  } catch (e) {}
}

// Speech synthesis wrapper for Korean kid-friendly voice
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentAudioElement: HTMLAudioElement | null = null;

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.src = '';
    currentAudioElement = null;
  }
  currentUtterance = null;
}

export function speakKoreanText(
  text: string,
  options: {
    pitch?: number;
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
) {
  stopSpeaking();

  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    options.onEnd?.();
    return;
  }

  const cleanText = text
    .replace(/[#*`~_\[\]()]/g, '')
    .replace(/🎤|✨|와아!|짝짝짝!/g, (m) => (m === '짝짝짝!' ? '짝짝짝!' : m))
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ko-KR';
  utterance.pitch = options.pitch ?? 1.25; // slightly cheerful high pitch for cute MC
  utterance.rate = options.rate ?? 0.92; // clear, comfortable speed for 3~5yo

  // Find best Korean voice if available
  const voices = window.speechSynthesis.getVoices();
  const koVoice = voices.find((v) => v.lang.startsWith('ko') && !v.name.includes('Google'));
  if (koVoice) {
    utterance.voice = koVoice;
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    currentUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    console.error('Speech synthesis error:', e);
    currentUtterance = null;
    options.onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

// Play Server TTS WAV audio
export function playBase64Audio(
  base64Data: string,
  mimeType: string = 'audio/wav',
  onEnd?: () => void
) {
  stopSpeaking();
  const audio = new Audio(`data:${mimeType};base64,${base64Data}`);
  currentAudioElement = audio;

  audio.onended = () => {
    currentAudioElement = null;
    onEnd?.();
  };
  audio.onerror = () => {
    currentAudioElement = null;
    onEnd?.();
  };

  audio.play().catch((err) => {
    console.warn('Audio playback failed:', err);
    onEnd?.();
  });
}
