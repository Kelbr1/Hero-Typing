import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RefreshCw,
  Trophy,
  Flame,
  Zap,
  Clock,
  Target,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  getRandomTypingText,
  generateWeakKeysText,
  ACHIEVEMENTS_CATALOG,
} from '../data/typingContent';
import { playKeyClick, playError, playComplete, playAchievement } from '../utils/sound';
import { saveSession } from '../api';
import VirtualKeyboard from './VirtualKeyboard';

const MODES = [
  { id: 'words', label: 'Слова' },
  { id: 'sentences', label: 'Предложения' },
  { id: 'code', label: 'Код' },
  { id: 'symbols', label: 'Символы' },
];

const DIFFICULTIES = [
  { id: 'easy', label: 'Базовый (Ур. 1)', bonus: null, multiplier: 1.0 },
  { id: 'medium', label: 'Продвинутый (Ур. 2)', bonus: '+25% XP', multiplier: 1.25 },
  { id: 'hard', label: 'Эксперт (Ур. 3)', bonus: '+50% XP', multiplier: 1.5 },
];

const CODE_LANGUAGES = [
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'html_css', label: 'HTML / CSS' },
];

export default function TypingArena({ user, onUserUpdate, onOpenAuth, initialMode = 'words' }) {
  // Настройки режима
  const [mode, setMode] = useState(initialMode);
  const [language, setLanguage] = useState('ru');
  const [codeLang, setCodeLang] = useState('python');
  const [difficulty, setDifficulty] = useState('medium');

  // Синхронизация режима при передаче извне (например, тренировка слабых клавиш)
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Текст и позиция ввода
  const [text, setText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  // Метрики сессии
  const [startTime, setStartTime] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [score, setScore] = useState(0);

  // Комбо
  const [comboStreak, setComboStreak] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [comboPulse, setComboPulse] = useState(false);

  // Ошибки и раскладка
  const [lastWrongChar, setLastWrongChar] = useState(null);
  const [isWrongCharActive, setIsWrongCharActive] = useState(false);
  const [problemKeys, setProblemKeys] = useState({});
  const [wrongLayoutWarning, setWrongLayoutWarning] = useState(false);

  // Завершение тренировки
  const [isFinished, setIsFinished] = useState(false);
  const [sessionResults, setSessionResults] = useState(null);
  const [newAchievements, setNewAchievements] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Определение актуального языка для клавиатуры
  const activeKeyboardLanguage = mode === 'code' ? 'en' : language;

  // Проверка наличия проблемных клавиш у пользователя
  const userProblemKeys = useMemo(() => {
    return user?.problem_keys || {};
  }, [user]);

  const hasWeakKeys = useMemo(() => {
    return Object.keys(userProblemKeys).length > 0;
  }, [userProblemKeys]);

  // Расчёт множителя комбо
  const comboMultiplier = useMemo(() => {
    if (comboStreak >= 70) return 5;
    if (comboStreak >= 35) return 3;
    if (comboStreak >= 15) return 2;
    return 1;
  }, [comboStreak]);

  // Генерация текста тренировки
  const initExercise = (targetMode = mode, targetLang = language, targetDiff = difficulty, targetCode = codeLang) => {
    let newText = '';
    if (targetMode === 'weak_keys') {
      newText = generateWeakKeysText(userProblemKeys, targetLang, 22);
    } else {
      newText = getRandomTypingText(targetMode, targetLang, targetDiff, targetCode);
    }

    newText = (newText || '').replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-');
    setText(newText);
    setCharIndex(0);
    setStartTime(null);
    setElapsedSec(0);
    setCorrectKeystrokes(0);
    setTotalKeystrokes(0);
    setErrorsCount(0);
    setScore(0);
    setComboStreak(0);
    setMaxCombo(0);
    setLastWrongChar(null);
    setIsWrongCharActive(false);
    setProblemKeys({});
    setWrongLayoutWarning(false);
    setIsFinished(false);
    setSessionResults(null);
    setNewAchievements([]);
  };

  // Инициализация при монтировании и смене параметров
  useEffect(() => {
    initExercise(mode, language, difficulty, codeLang);
  }, [mode, language, difficulty, codeLang]);

  // Таймер сессии
  useEffect(() => {
    let interval = null;
    if (startTime && !isFinished) {
      interval = setInterval(() => {
        setElapsedSec(Math.max(0.1, (Date.now() - startTime) / 1000));
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [startTime, isFinished]);

  // Расчёт текущих показателей WPM, CPM, Accuracy
  const liveCPM = useMemo(() => {
    if (!startTime || elapsedSec <= 0) return 0;
    return Math.round((correctKeystrokes / elapsedSec) * 60);
  }, [correctKeystrokes, elapsedSec, startTime]);

  const liveWPM = useMemo(() => {
    return Math.round(liveCPM / 5);
  }, [liveCPM]);

  const liveAccuracy = useMemo(() => {
    if (totalKeystrokes === 0) return 100;
    return Math.round((correctKeystrokes / totalKeystrokes) * 100);
  }, [correctKeystrokes, totalKeystrokes]);

  // Стили бейджа комбо в зависимости от множителя
  const comboBadgeStyle = useMemo(() => {
    switch (comboMultiplier) {
      case 5:
        return 'border-amber-400/80 bg-amber-500/20 text-amber-300 ring-2 ring-amber-400/30';
      case 3:
        return 'border-emerald-400/80 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30';
      case 2:
        return 'border-indigo-400/80 bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30';
      default:
        return 'border-zinc-800 bg-zinc-900/60 text-zinc-400';
    }
  }, [comboMultiplier]);

  // Завершение тренировочной сессии
  const finishSession = async () => {
    const finalElapsed = Math.max(1, (Date.now() - startTime) / 1000);
    const finalCPM = Math.round((text.length / finalElapsed) * 60);
    const finalWPM = Math.round(finalCPM / 5);
    const finalAccuracy = totalKeystrokes > 0 ? Math.round((text.length / totalKeystrokes) * 100) : 100;

    const diffObj = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[0];
    const baseXP = Math.round((finalCPM * (finalAccuracy / 100.0)) * (finalElapsed / 60.0)) + Math.floor(maxCombo / 10);
    const earnedXP = Math.max(10, Math.round(baseXP * diffObj.multiplier));

    setIsFinished(true);
    setElapsedSec(finalElapsed);

    const results = {
      wpm: finalWPM,
      cpm: finalCPM,
      accuracy: finalAccuracy,
      duration_sec: finalElapsed,
      max_combo: maxCombo,
      errors_count: errorsCount,
      xp_earned: earnedXP,
      score,
      problem_keys: problemKeys,
    };
    setSessionResults(results);

    // Сохранение результатов сессии
    try {
      setIsSaving(true);
      const res = await saveSession({
        mode,
        language: activeKeyboardLanguage,
        wpm: finalWPM,
        cpm: finalCPM,
        accuracy: finalAccuracy,
        errors_count: errorsCount,
        max_combo: maxCombo,
        xp_earned: earnedXP,
        duration_sec: finalElapsed,
        problem_keys: problemKeys,
        chars_count: text.length,
      });

      if (res?.new_achievements?.length > 0) {
        setNewAchievements(res.new_achievements);
        playAchievement();
      } else {
        playComplete();
      }

      if (res?.user && onUserUpdate) {
        onUserUpdate(res.user);
      }
    } catch (err) {
      console.error('Ошибка сохранения тренировки:', err);
      playComplete();
    } finally {
      setIsSaving(false);
    }
  };

  // Обработка клавиатурного ввода
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Предотвращаем скролл страницы браузера при нажатии пробела и Enter
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
      }

      // Горячие клавиши на экране результатов (Enter или Tab+Enter)
      if (isFinished) {
        if (e.key === 'Enter') {
          initExercise(mode, language, difficulty, codeLang);
        }
        return;
      }

      // Служебные клавиши
      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      // Проверка на неверную раскладку
      const isCyrillicKey = /[а-яёА-ЯЁ]/.test(e.key);
      const isLatinKey = /[a-zA-Z]/.test(e.key);

      if (activeKeyboardLanguage === 'ru' && isLatinKey) {
        setWrongLayoutWarning(true);
      } else if (activeKeyboardLanguage === 'en' && isCyrillicKey) {
        setWrongLayoutWarning(true);
      } else {
        setWrongLayoutWarning(false);
      }

      // Запуск таймера при первом нажатии
      if (!startTime) {
        setStartTime(Date.now());
      }

      const expectedChar = text[charIndex];
      setTotalKeystrokes((prev) => prev + 1);

      // Проверка совпадения (учитываем, что клавиша Enter соответствует переносу строки \n или \r, а дефис соответствует тире)
      const isDashMatch =
        (e.key === '-' || e.key === '—' || e.key === '–') &&
        (expectedChar === '-' || expectedChar === '—' || expectedChar === '–' || expectedChar === '−');

      const isCorrectKey =
        e.key === expectedChar ||
        (e.key === 'Enter' && (expectedChar === '\n' || expectedChar === '\r')) ||
        isDashMatch;

      if (isCorrectKey) {
        // Правильное нажатие
        playKeyClick();
        setIsWrongCharActive(false);
        setLastWrongChar(null);

        const newStreak = comboStreak + 1;
        setComboStreak(newStreak);
        setMaxCombo((prev) => Math.max(prev, newStreak));

        // Импульс при достижении нового множителя комбо
        if (newStreak === 15 || newStreak === 35 || newStreak === 70) {
          setComboPulse(true);
          setTimeout(() => setComboPulse(false), 300);
        }

        const diffObj = DIFFICULTIES.find((d) => d.id === difficulty) || DIFFICULTIES[0];
        setScore((prev) => prev + Math.round(10 * comboMultiplier * diffObj.multiplier));
        setCorrectKeystrokes((prev) => prev + 1);

        const nextIndex = charIndex + 1;
        setCharIndex(nextIndex);

        if (nextIndex >= text.length) {
          finishSession();
        }
      } else {
        // Неверное нажатие
        playError();
        setIsWrongCharActive(true);
        setLastWrongChar(e.key);
        setErrorsCount((prev) => prev + 1);
        setComboStreak(0);

        // Запись проблемного символа
        const problemChar = (expectedChar === '\n' || expectedChar === '\r') ? 'Enter' : expectedChar;
        if (problemChar && problemChar !== ' ') {
          setProblemKeys((prev) => ({
            ...prev,
            [problemChar]: (prev[problemChar] || 0) + 1,
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    text,
    charIndex,
    startTime,
    isFinished,
    comboStreak,
    comboMultiplier,
    difficulty,
    activeKeyboardLanguage,
    mode,
    language,
    codeLang,
    maxCombo,
    errorsCount,
    score,
    problemKeys,
  ]);

  const targetChar = text[charIndex] || '';

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none font-sans">
      {/* 1. Верхняя панель настроек (Segmented Controls) */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mb-2.5 p-1.5 rounded-xl bg-zinc-900/60 border border-zinc-850 backdrop-blur-md">
        {/* Выбор режима */}
        <div className="flex flex-wrap items-center gap-1 p-0.5 rounded-lg bg-zinc-950/80 border border-zinc-850 text-xs font-medium">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-2.5 py-1 rounded-md transition-all ${
                mode === m.id
                  ? 'bg-zinc-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}

          {/* Режим «Слабые клавиши» */}
          <button
            onClick={() => hasWeakKeys && setMode('weak_keys')}
            disabled={!hasWeakKeys}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
              mode === 'weak_keys'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : hasWeakKeys
                ? 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                : 'text-zinc-600 cursor-not-allowed opacity-50'
            }`}
            title={hasWeakKeys ? 'Тренировка ошибок' : 'Сначала совершите несколько ошибок на тренировках'}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Слабые клавиши</span>
          </button>
        </div>

        {/* Выбор языка и подкатегорий кода */}
        <div className="flex items-center gap-1.5">
          {mode === 'code' ? (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950/80 border border-zinc-850 text-xs font-mono">
              {CODE_LANGUAGES.map((cl) => (
                <button
                  key={cl.id}
                  onClick={() => setCodeLang(cl.id)}
                  className={`px-2 py-0.5 rounded-md transition ${
                    codeLang === cl.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cl.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950/80 border border-zinc-850 text-xs font-mono">
              <button
                onClick={() => setLanguage('ru')}
                className={`px-2 py-0.5 rounded-md transition ${
                  language === 'ru'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                RU
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 rounded-md transition ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                EN
              </button>
            </div>
          )}

          {/* Выбор сложности */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-950/80 border border-zinc-850 text-xs">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`relative px-2 py-0.5 rounded-md transition ${
                  difficulty === d.id
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span>{d.id === 'easy' ? 'Ур. 1' : d.id === 'medium' ? 'Ур. 2' : 'Ур. 3'}</span>
                {Boolean(d.bonus) && (
                  <span className="ml-1 text-[9px] text-amber-400 font-mono hidden sm:inline">
                    {d.bonus}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Кнопка сброса */}
          <button
            onClick={() => initExercise(mode, language, difficulty, codeLang)}
            className="p-1.5 rounded-lg bg-zinc-950/80 border border-zinc-850 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition"
            title="Перезапустить упражнение"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Предупреждение о неверной раскладке */}
      {wrongLayoutWarning && (
        <div className="w-full flex items-center justify-center gap-2 mb-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Похоже, у вас включена другая раскладка клавиатуры (нажмите Alt + Shift)</span>
        </div>
      )}

      {/* 2. Живая панель метрик */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 mb-2.5 font-mono">
        {/* Скорость: WPM & CPM */}
        <div className="card-base p-2 sm:p-2.5 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Скорость
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-zinc-100 tabular-nums">
              {liveWPM}
            </span>
            <span className="text-[11px] text-zinc-400">WPM</span>
            <span className="text-[10px] text-zinc-500 tabular-nums">({liveCPM})</span>
          </div>
        </div>

        {/* Точность */}
        <div className="card-base p-2 sm:p-2.5 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Точность
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl sm:text-2xl font-bold tabular-nums ${liveAccuracy >= 98 ? 'text-emerald-400' : liveAccuracy >= 92 ? 'text-zinc-100' : 'text-rose-400'}`}>
              {liveAccuracy}
            </span>
            <span className="text-xs text-zinc-400">%</span>
          </div>
        </div>

        {/* Ошибки */}
        <div className="card-base p-2 sm:p-2.5 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Ошибки
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-xl sm:text-2xl font-bold tabular-nums ${errorsCount === 0 ? 'text-zinc-100' : 'text-rose-400'}`}>
              {errorsCount}
            </span>
          </div>
        </div>

        {/* Очки Score */}
        <div className="card-base p-2 sm:p-2.5 flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            Очки
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold text-indigo-400 tabular-nums">
              {score}
            </span>
          </div>
        </div>

        {/* Множитель комбо */}
        <div className={`card-base p-2 sm:p-2.5 flex flex-col transition-all duration-200 ${comboBadgeStyle} ${comboPulse ? 'scale-105' : ''}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Комбо
            </span>
            <span className="text-xs font-bold font-mono">
              x{comboMultiplier}
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-bold tabular-nums">
              {comboStreak}
            </span>
            <span className="text-[10px] opacity-70">подряд</span>
          </div>
        </div>
      </div>

      {/* 3. Поле отображения текста или Экран результатов */}
      {!isFinished ? (
        <div className="w-full card-base p-3.5 sm:p-4 mb-2.5 transition-all">
          <div className="relative font-mono text-xl sm:text-2xl leading-normal sm:leading-relaxed tracking-wide select-none p-3.5 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-850 shadow-inner min-h-[90px] flex flex-wrap items-center">
            {text.split('').map((char, idx) => {
              let charStyle = 'text-zinc-600'; // untyped
              let isCurrent = idx === charIndex;

              if (idx < charIndex) {
                charStyle = 'text-emerald-400/90 font-medium'; // correct
              } else if (isCurrent) {
                charStyle = isWrongCharActive
                  ? 'bg-rose-500/30 text-rose-300 border-b-2 border-rose-400 rounded-sm px-0.5 animate-pulse'
                  : 'bg-indigo-500/25 border-b-2 border-indigo-400 text-white rounded-sm px-0.5 animate-pulse';
              }

              // Отображение переносов строк и пробелов
              if (char === '\n') {
                return (
                  <React.Fragment key={idx}>
                    <span className={`inline-block text-xs opacity-60 px-1 font-mono rounded ${isCurrent ? 'bg-indigo-500/30 text-indigo-300 ring-1 ring-indigo-400' : charStyle}`}>
                      ↵
                    </span>
                    <div className="w-full h-0" />
                  </React.Fragment>
                );
              }

              return (
                <span key={idx} className={charStyle}>
                  {char === ' ' ? '␣' : char}
                </span>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2.5 text-xs font-mono text-zinc-500">
            <span>
              Прогресс: {charIndex} / {text.length} символов
            </span>
            <span>
              {startTime
                ? elapsedSec >= 60
                  ? `${Math.floor(elapsedSec / 60)} мин. ${Math.round(elapsedSec % 60)} сек.`
                  : `${Math.round(elapsedSec)} сек.`
                : 'Начните ввод на клавиатуре'}
            </span>
          </div>
        </div>
      ) : (
        /* 5. Карточка завершения тренировки (Result Summary) */
        <div className="w-full card-base p-6 sm:p-8 mb-6 border-indigo-500/30 bg-zinc-900/90 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight">
              Тренировка завершена!
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              Отличный результат. Показатели успешно зафиксированы.
            </p>
          </div>

          {/* Итоговые метрики */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 font-mono">
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-center">
              <span className="text-xs uppercase text-zinc-500">Скорость</span>
              <div className="text-3xl font-bold text-zinc-100 mt-1 tabular-nums">
                {sessionResults?.wpm} <span className="text-xs text-zinc-400">WPM</span>
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">
                {sessionResults?.cpm} CPM
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-center">
              <span className="text-xs uppercase text-zinc-500">Точность</span>
              <div className="text-3xl font-bold text-emerald-400 mt-1 tabular-nums">
                {sessionResults?.accuracy}%
              </div>
              <span className="text-xs text-zinc-500 tabular-nums">
                {sessionResults?.errors_count} ош.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-center">
              <span className="text-xs uppercase text-zinc-500">Макс. комбо</span>
              <div className="text-3xl font-bold text-amber-400 mt-1 tabular-nums">
                {sessionResults?.max_combo}
              </div>
              <span className="text-xs text-zinc-500">нажатий подряд</span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 text-center">
              <span className="text-xs uppercase text-zinc-500">Опыт</span>
              <div className="text-3xl font-bold text-indigo-400 mt-1 tabular-nums">
                +{sessionResults?.xp_earned}
              </div>
              <span className="text-xs text-zinc-500">XP получено</span>
            </div>
          </div>

          {/* Уровень игрока и прогресс-бар */}
          {user ? (
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-850 mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-zinc-300">
                  Уровень игрока {user.level}
                </span>
                <span className="font-mono text-zinc-400">
                  {user.xp % 500} / 500 XP до Ур. {user.level + 1}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((user.xp % 500) / 500) * 100))}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs mb-6">
              <div className="flex items-center gap-2 text-zinc-300">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>Войдите или зарегистрируйтесь, чтобы сохранять опыт в глобальном рейтинге</span>
              </div>
              {onOpenAuth && (
                <button
                  onClick={onOpenAuth}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
                >
                  Войти
                </button>
              )}
            </div>
          )}

          {/* Новые достижения */}
          {newAchievements.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Разблокировано новое достижение!
              </div>
              <div className="flex flex-col gap-2">
                {newAchievements.map((ach) => (
                  <div key={ach.id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-2xl">{ach.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{ach.title}</div>
                      <div className="text-xs text-zinc-400">{ach.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => initExercise(mode, language, difficulty, codeLang)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium flex items-center justify-center gap-2 transition shadow-lg shadow-indigo-600/25"
            >
              <span>Следующее упражнение</span>
              <span className="text-xs opacity-70 font-mono">(Enter)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCharIndex(0);
                setStartTime(null);
                setElapsedSec(0);
                setCorrectKeystrokes(0);
                setTotalKeystrokes(0);
                setErrorsCount(0);
                setScore(0);
                setComboStreak(0);
                setMaxCombo(0);
                setIsFinished(false);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium flex items-center justify-center gap-2 transition border border-zinc-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Повторить текст</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Интеграция VirtualKeyboard */}
      {!isFinished && (
        <VirtualKeyboard
          targetChar={targetChar}
          language={activeKeyboardLanguage}
          lastWrongChar={lastWrongChar}
        />
      )}
    </div>
  );
}
