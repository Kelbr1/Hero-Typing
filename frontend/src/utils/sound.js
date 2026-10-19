const SOUND_KEY = 'hero_typing_sound_enabled';

let audioCtx = null;
let tapAudioBuffer = null;
let isBufferLoading = false;

// Получение или инициализация аудиоконтекста
function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Загрузка и декодирование tap.mp3 в AudioBuffer
async function loadTapBuffer() {
  if (tapAudioBuffer || isBufferLoading) return tapAudioBuffer;
  const ctx = getAudioContext();
  if (!ctx) return null;

  try {
    isBufferLoading = true;
    const response = await fetch('/tap.mp3');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    tapAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
    return tapAudioBuffer;
  } catch (err) {
    console.warn('Не удалось загрузить /tap.mp3, используется синтезатор:', err);
    return null;
  } finally {
    isBufferLoading = false;
  }
}

// Автоматическая предзагрузка звука при первом взаимодействии пользователя
if (typeof window !== 'undefined') {
  const initAudio = () => {
    loadTapBuffer();
    window.removeEventListener('click', initAudio);
    window.removeEventListener('keydown', initAudio);
  };
  window.addEventListener('click', initAudio);
  window.addEventListener('keydown', initAudio);
}

// Проверка включен ли звук
export function isSoundEnabled() {
  const saved = localStorage.getItem(SOUND_KEY);
  return saved === null ? true : saved === 'true';
}

// Установка флага звука
export function setSoundEnabled(enabled) {
  localStorage.setItem(SOUND_KEY, enabled ? 'true' : 'false');
}

// Переключение звука
export function toggleSound() {
  const newState = !isSoundEnabled();
  setSoundEnabled(newState);
  return newState;
}

// Синтезированный щелчок (резервный вариант)
function playSyntheticClick(ctx) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  const freq = 600 + Math.random() * 250;
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1400, now);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.045);
}

// Звук нажатия клавиши (воспроизведение tap.mp3)
export function playKeyClick() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  if (tapAudioBuffer) {
    const source = ctx.createBufferSource();
    source.buffer = tapAudioBuffer;

    // Небольшая вариация высоты тона для реалистичности механики
    source.playbackRate.value = 0.97 + Math.random() * 0.06;

    const gain = ctx.createGain();
    gain.gain.value = 0.9;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start(0);
  } else {
    loadTapBuffer();
    playSyntheticClick(ctx);
  }
}

// Звук глухой ошибки
export function playError() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(350, now);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.13);
}

// Звук завершения тренировки (мажорный аккорд)
export function playComplete() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + i * 0.08;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.15, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.52);
  });
}

export const playSuccess = playComplete;

// Звук получения нового достижения
export function playAchievement() {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + i * 0.09;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.62);
  });
}
