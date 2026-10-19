import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Shield,
  Trophy,
  RotateCcw,
  Sparkles,
  Keyboard as KeyboardIcon,
  Crown,
  Users,
} from 'lucide-react';
import { playKeyClick, playError, playComplete } from '../utils/sound';
import { saveSession, getPvpTexts } from '../api';
import VirtualKeyboard from './VirtualKeyboard';

// Базовый список резервных дуэльных текстов
const FALLBACK_DUEL_TEXTS = {
  ru: [
    'Скорость реакции и точность движений определяют истинного победителя в битве за звание чемпиона арены.',
    'Каждое верное нажатие клавиши приближает победу. Сохраняй спокойствие и держи идеальный темп печати.',
    'Мастера слепой печати чувствуют рельеф символов инстинктивно, не опуская взгляда на клавиатуру.',
    'В скоростной дуэли побеждает не просто напор, а хирургическая точность каждого введенного слова.',
    'Чистый код и безупречный текст создаются непрерывным потоком мысли и отточенными движениями пальцев.',
    'Фокус и стальная концентрация побеждают хаос. Победа достается тому, кто не допускает лишних пауз.',
    'Путь героя клавиатуры лежит через сотни сражений и побед над собственными ошибками.',
  ],
  en: [
    'Speed and accuracy determine the ultimate champion in this intense battle for typing supremacy.',
    'Every correct keystroke counts toward victory. Stay calm, breathe evenly, and keep a steady flow.',
    'True keyboard masters never glance down; their fingers instinctively dance across every symbol.',
    'In a cyber duel, raw velocity is nothing without absolute precision and disciplined focus under pressure.',
    'Flawless code flows naturally when your hands effortlessly match the blazing speed of your thoughts.',
  ],
};

export default function PvpArena({ user, onUserUpdate, onOpenAuth }) {
  // Состояния: 'lobby' | 'searching' | 'versus' | 'racing' | 'result'
  const [gameState, setGameState] = useState('lobby');

  // Настройки матча
  const [language, setLanguage] = useState('ru');
  const [duelText, setDuelText] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);

  // Данные соперника
  const [opponent, setOpponent] = useState(null);
  const [matchId, setMatchId] = useState(null);

  // Обратный отсчет перед стартом (3... 2... 1... СТАРТ!)
  const [countdown, setCountdown] = useState(3);

  // Таймер поиска соперника
  const [searchTime, setSearchTime] = useState(0);
  const [searchStatus, setSearchStatus] = useState('Поиск соперника...');

  // Метрики текущего игрока
  const [charIndex, setCharIndex] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [errorsCount, setErrorsCount] = useState(0);
  const [playerWpm, setPlayerWpm] = useState(0);
  const [playerCpm, setPlayerCpm] = useState(0);
  const [playerAccuracy, setPlayerAccuracy] = useState(100);
  const [isPlayerDone, setIsPlayerDone] = useState(false);
  const [playerFinalTime, setPlayerFinalTime] = useState(0);

  // Метрики соперника
  const [opponentCharIndex, setOpponentCharIndex] = useState(0);
  const [opponentWpm, setOpponentWpm] = useState(0);
  const [opponentAccuracy, setOpponentAccuracy] = useState(100);
  const [isOpponentDone, setIsOpponentDone] = useState(false);
  const [opponentFinalTime, setOpponentFinalTime] = useState(0);

  // Результат матча: 'victory' | 'defeat'
  const [matchOutcome, setMatchOutcome] = useState(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [opponentLeftNotice, setOpponentLeftNotice] = useState(false);

  // Индикация ошибок
  const [lastWrongChar, setLastWrongChar] = useState(null);
  const [isWrongFlash, setIsWrongFlash] = useState(false);

  // Ссылки на сокеты и таймеры
  const wsRef = useRef(null);
  const searchTimerRef = useRef(null);
  const raceTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const finishHandledRef = useRef(false);

  // Текущий ожидаемый символ для игрока
  const targetChar = duelText[charIndex] || '';

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      cleanupTimers();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const cleanupTimers = () => {
    if (searchTimerRef.current) clearInterval(searchTimerRef.current);
    if (raceTimerRef.current) clearInterval(raceTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  };

  // -------------------------------------------------------------
  // Старт поиска реального соперника (без ботов, бесконечный поиск)
  // -------------------------------------------------------------
  const handleStartSearch = () => {
    cleanupTimers();
    setGameState('searching');
    setSearchTime(0);
    setSearchStatus('Сканирование сетевой арены...');
    setOpponentLeftNotice(false);
    finishHandledRef.current = false;

    // Таймер поиска: работает непрерывно, пока не найдется реальный игрок
    let seconds = 0;
    searchTimerRef.current = setInterval(() => {
      seconds += 1;
      setSearchTime(seconds);

      if (seconds <= 3) {
        setSearchStatus('Сканирование активных игроков в сети...');
      } else if (seconds <= 7) {
        setSearchStatus('Ожидание подключения второго игрока...');
      } else {
        setSearchStatus('Поиск соперника продолжается...');
      }
    }, 1000);

    // Подключение к WebSocket
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/pvp`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'join_queue',
            language,
            user: {
              username: user?.username || 'Герой_' + Math.floor(100 + Math.random() * 900),
              level: user?.level || 1,
              avatar: user?.username ? user.username.charAt(0).toUpperCase() : '⚡',
              max_wpm: user?.max_wpm || 0,
            },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'match_found') {
            clearInterval(searchTimerRef.current);
            setupMatch(msg.opponent, msg.text, msg.match_id);
          } else if (msg.type === 'opponent_progress') {
            setOpponentCharIndex(msg.char_index || 0);
            setOpponentWpm(Math.round(msg.wpm || 0));
            if (msg.done) {
              setIsOpponentDone(true);
            }
          } else if (msg.type === 'opponent_finished') {
            setOpponentWpm(Math.round(msg.wpm || 0));
            setOpponentAccuracy(Math.round(msg.accuracy || 100));
            setOpponentFinalTime(msg.time || 0);
            setIsOpponentDone(true);

            // Если соперник закончил раньше нас - он победил
            if (!finishHandledRef.current) {
              handleFinishMatch(false);
            }
          } else if (msg.type === 'opponent_disconnected') {
            if (gameState === 'racing' && !finishHandledRef.current) {
              setOpponentLeftNotice(true);
              handleFinishMatch(true, true);
            }
          }
        } catch (e) {
          console.error('Ошибка обработки сообщения WebSocket:', e);
        }
      };

      ws.onerror = (err) => {
        console.warn('Ошибка соединения WebSocket:', err);
      };

      ws.onclose = () => {};
    } catch (e) {
      console.error('Не удалось открыть WebSocket:', e);
    }
  };

  // Отмена поиска
  const handleCancelSearch = () => {
    cleanupTimers();
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'leave_queue' }));
      } catch (e) {}
      wsRef.current.close();
    }
    setGameState('lobby');
  };

  // -------------------------------------------------------------
  // Настройка матча и переход к Versus Screen
  // -------------------------------------------------------------
  const setupMatch = (opponentData, text, id) => {
    const cleanText = (text || '').replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-');
    setOpponent(opponentData);
    setDuelText(cleanText);
    setMatchId(id);

    // Сброс параметров
    setCharIndex(0);
    setStartTime(null);
    setElapsedSec(0);
    setCorrectKeystrokes(0);
    setTotalKeystrokes(0);
    setErrorsCount(0);
    setPlayerWpm(0);
    setPlayerCpm(0);
    setPlayerAccuracy(100);
    setIsPlayerDone(false);
    setPlayerFinalTime(0);

    setOpponentCharIndex(0);
    setOpponentWpm(0);
    setIsOpponentDone(false);
    setOpponentFinalTime(0);

    setMatchOutcome(null);
    setCountdown(3);
    setGameState('versus');

    // Плавный обратный отсчет 3... 2... 1... СТАРТ!
    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownIntervalRef.current);
        startRace();
      }
    }, 1000);
  };

  // -------------------------------------------------------------
  // Старт гонки печати
  // -------------------------------------------------------------
  const startRace = () => {
    setGameState('racing');
    const startTimestamp = Date.now();
    setStartTime(startTimestamp);

    raceTimerRef.current = setInterval(() => {
      const elapsed = Math.max(0.1, (Date.now() - startTimestamp) / 1000);
      setElapsedSec(elapsed);
    }, 100);
  };

  // -------------------------------------------------------------
  // Обработка ввода клавиш игроком
  // -------------------------------------------------------------
  useEffect(() => {
    if (gameState !== 'racing' || isPlayerDone) return;

    const handleKeyDown = (e) => {
      // Предотвращаем скролл страницы на Пробел и Enter
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
      }

      if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab'].includes(e.key)) {
        return;
      }

      const expectedChar = duelText[charIndex];
      if (!expectedChar) return;

      const isDashMatch =
        (e.key === '-' || e.key === '—' || e.key === '–') &&
        (expectedChar === '-' || expectedChar === '—' || expectedChar === '–' || expectedChar === '−');

      const isMatch =
        e.key === expectedChar ||
        (e.key === 'Enter' && (expectedChar === '\n' || expectedChar === '\r')) ||
        isDashMatch;

      setTotalKeystrokes((prev) => prev + 1);

      if (isMatch) {
        playKeyClick();
        const nextIndex = charIndex + 1;
        setCharIndex(nextIndex);
        setCorrectKeystrokes((prev) => prev + 1);

        const elapsed = Math.max(0.1, (Date.now() - (startTime || Date.now())) / 1000);
        const minutes = elapsed / 60;
        const words = nextIndex / 5;
        const currentWpm = Math.round(words / minutes);
        const currentCpm = Math.round(nextIndex / minutes);
        const currentAcc = Math.round(((correctKeystrokes + 1) / (totalKeystrokes + 1)) * 100);

        setPlayerWpm(currentWpm);
        setPlayerCpm(currentCpm);
        setPlayerAccuracy(currentAcc);

        // Отправка live-прогресса второму игроку через WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send(
              JSON.stringify({
                type: 'progress',
                match_id: matchId,
                char_index: nextIndex,
                wpm: currentWpm,
                accuracy: currentAcc,
                errors: errorsCount,
                done: nextIndex >= duelText.length,
              })
            );
          } catch (err) {}
        }

        // Завершение печати игроком
        if (nextIndex >= duelText.length) {
          setIsPlayerDone(true);
          const finalTime = Math.round(elapsed * 10) / 10;
          setPlayerFinalTime(finalTime);

          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(
                JSON.stringify({
                  type: 'finish',
                  match_id: matchId,
                  wpm: currentWpm,
                  accuracy: currentAcc,
                  time: finalTime,
                })
              );
            } catch (err) {}
          }

          // Игрок завершил первым - победа!
          handleFinishMatch(true);
        }
      } else {
        playError();
        setErrorsCount((prev) => prev + 1);
        setLastWrongChar(e.key);
        setIsWrongFlash(true);
        setTimeout(() => setIsWrongFlash(false), 250);

        const currentAcc = Math.round((correctKeystrokes / (totalKeystrokes + 1)) * 100);
        setPlayerAccuracy(currentAcc);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    gameState,
    charIndex,
    duelText,
    startTime,
    correctKeystrokes,
    totalKeystrokes,
    errorsCount,
    isPlayerDone,
    matchId,
  ]);

  // -------------------------------------------------------------
  // Завершение матча и начисление наград
  // -------------------------------------------------------------
  const handleFinishMatch = async (playerWon, opponentForfeited = false) => {
    if (finishHandledRef.current) return;
    finishHandledRef.current = true;

    cleanupTimers();

    const outcome = playerWon ? 'victory' : 'defeat';
    setMatchOutcome(outcome);
    setGameState('result');

    if (playerWon) {
      playComplete();
    }

    const earnedXp = playerWon ? 120 : 40;
    setXpEarned(earnedXp);

    setIsSaving(true);
    try {
      const finalWpm = playerWpm || Math.round((charIndex / 5) / (Math.max(1, elapsedSec) / 60));
      const finalCpm = playerCpm || Math.round(charIndex / (Math.max(1, elapsedSec) / 60));

      const payload = {
        mode: 'pvp',
        language,
        wpm: finalWpm,
        cpm: finalCpm,
        accuracy: playerAccuracy,
        errors_count: errorsCount,
        max_combo: correctKeystrokes,
        xp_earned: earnedXp,
        duration_sec: Math.max(1, Math.round(playerFinalTime || elapsedSec)),
        chars_count: charIndex,
      };

      const result = await saveSession(payload);
      if (result?.user && onUserUpdate) {
        onUserUpdate(result.user);
      }
    } catch (e) {
      console.warn('Не удалось сохранить сессию дуэли:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const textLength = duelText.length || 1;
  const playerProgress = Math.min(100, Math.round((charIndex / textLength) * 100));
  const opponentProgress = Math.min(100, Math.round((opponentCharIndex / textLength) * 100));
  const charDelta = charIndex - opponentCharIndex;

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* ======================================================== */}
      {/* 1. ЭКРАН ЛОББИ PVP */}
      {/* ======================================================== */}
      {gameState === 'lobby' && (
        <div className="w-full max-w-3xl flex flex-col items-center gap-6 py-4 animate-fade-in">
          <div className="text-center flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
              <Swords className="w-3.5 h-3.5 text-indigo-400" />
              <span>Сетевая дуэль 1 на 1</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight">
              Печатная Дуэль
            </h1>
            <p className="text-zinc-400 text-sm max-w-md">
              Сразись в реальном времени с другим игроком в сети на одинаковом тексте.
            </p>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Карточка текущего игрока */}
            <div className="card-base p-5 flex flex-col justify-between border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 to-zinc-900/60">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border-2 border-indigo-500/50 flex items-center justify-center text-indigo-300 font-extrabold text-2xl shadow-lg shadow-indigo-600/20">
                  {user?.username ? user.username.charAt(0).toUpperCase() : '⚡'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-100 text-lg">
                      {user?.username || 'Гость арены'}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold">
                      Ур. {user?.level || 1}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">Претендент дуэли</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-zinc-800/80">
                <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Рекорд WPM
                  </div>
                  <div className="text-lg font-mono font-bold text-indigo-300">
                    {user?.max_wpm ? `${Math.round(user.max_wpm)} WPM` : '-'}
                  </div>
                </div>

                <div className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-850">
                  <div className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
                    Опыт
                  </div>
                  <div className="text-lg font-mono font-bold text-amber-400">
                    {user?.xp ? `${user.xp} XP` : '0 XP'}
                  </div>
                </div>
              </div>
            </div>

            {/* Карточка правил дуэли */}
            <div className="card-base p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-zinc-200 text-sm mb-3 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>Правила арены</span>
                </h3>

                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>
                      <strong className="text-zinc-200">100% реальные игроки:</strong> соревнование происходит вживую по сети.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>
                      <strong className="text-zinc-200">Одинаковый текст:</strong> побеждает тот, кто первым финиширует без ошибок.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>
                      <strong className="text-emerald-300">+120 XP</strong> за победу,{' '}
                      <strong className="text-zinc-300">+40 XP</strong> за достойный бой.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Выбор языка */}
              <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Язык состязания:</span>
                <div className="inline-flex rounded-lg bg-zinc-950 p-1 border border-zinc-800 text-xs">
                  <button
                    onClick={() => setLanguage('ru')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${
                      language === 'ru'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    RU (Русский)
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${
                      language === 'en'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    EN (English)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartSearch}
            className="w-full sm:w-80 py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/25 border border-indigo-400/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Swords className="w-5 h-5 text-indigo-200 animate-pulse" />
            <span>Найти соперника</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ЭКРАН ПОИСКА СОПЕРНИКА (БЕСКОНЕЧНЫЙ ПОИСК БЕЗ БОТОВ) */}
      {/* ======================================================== */}
      {gameState === 'searching' && (
        <div className="w-full max-w-lg flex flex-col items-center gap-6 py-12 animate-fade-in text-center">
          {/* Анимированный круговой радар */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-indigo-500/20" />
            <div className="absolute inset-4 rounded-full border border-indigo-500/30" />
            <div className="absolute inset-10 rounded-full border border-indigo-500/40" />
            <div className="absolute inset-16 rounded-full border border-indigo-500/60" />

            <div className="absolute w-24 h-24 rounded-full bg-indigo-500/15 animate-ping-slow" />

            <div className="absolute inset-0 rounded-full overflow-hidden animate-radar pointer-events-none">
              <div
                className="w-1/2 h-1/2 origin-bottom-right"
                style={{
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.4) 0%, transparent 80%)',
                }}
              />
            </div>

            <div className="relative z-10 w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/30">
              <Swords className="w-8 h-8 text-indigo-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>{searchStatus}</span>
            </h2>
            <div className="text-zinc-500 font-mono text-sm">
              Время в очереди: {String(Math.floor(searchTime / 60)).padStart(2, '0')}:{String(searchTime % 60).padStart(2, '0')}
            </div>
            <p className="text-xs text-zinc-500 max-w-sm mt-2">
              Поиск будет продолжаться, пока в очередь не вступит другой игрок.
            </p>
          </div>

          <button
            onClick={handleCancelSearch}
            className="px-5 py-2 rounded-xl card-interactive text-zinc-400 hover:text-zinc-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Отменить поиск</span>
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ЭКРАН ВЕРСУСА (VS SCREEN) */}
      {/* ======================================================== */}
      {gameState === 'versus' && opponent && (
        <div className="w-full max-w-4xl flex flex-col items-center gap-8 py-8">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-indigo-400 font-bold">
              Соперник найден!
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-100">Приготовьтесь к старту</h2>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-5 items-center gap-4 sm:gap-2">
            {/* Левая карточка: Вы */}
            <div className="sm:col-span-2 card-base p-6 border-indigo-500/40 bg-gradient-to-r from-indigo-950/30 to-zinc-900/80 animate-slide-left flex flex-col items-center text-center shadow-xl shadow-indigo-950/40">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border-2 border-indigo-400 flex items-center justify-center text-indigo-200 font-black text-3xl shadow-lg shadow-indigo-500/30">
                  {user?.username ? user.username.charAt(0).toUpperCase() : '⚡'}
                </div>
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-indigo-500 text-white font-mono text-[11px] font-bold shadow-md">
                  Ур. {user?.level || 1}
                </div>
              </div>

              <h3 className="text-lg font-bold text-zinc-100 max-w-[200px] truncate">
                {user?.username || 'Вы (Герой)'}
              </h3>
              <span className="text-xs text-indigo-400 font-medium">Претендент</span>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full flex items-center justify-around text-xs">
                <div>
                  <div className="text-zinc-500">Рекорд WPM</div>
                  <div className="font-mono font-bold text-zinc-200">
                    {user?.max_wpm ? Math.round(user.max_wpm) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Статус</div>
                  <div className="font-bold text-emerald-400">Готов</div>
                </div>
              </div>
            </div>

            {/* Центральный блок: VS и Обратный отсчет */}
            <div className="sm:col-span-1 flex flex-col items-center justify-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-2xl animate-vs shadow-lg shadow-amber-500/20">
                VS
              </div>

              <div className="mt-4 flex flex-col items-center">
                <div className="text-4xl font-black font-mono text-amber-400 animate-count-bounce">
                  {countdown > 0 ? countdown : 'СТАРТ!'}
                </div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                  Секунды
                </span>
              </div>
            </div>

            {/* Правая карточка: Соперник */}
            <div className="sm:col-span-2 card-base p-6 border-amber-500/40 bg-gradient-to-l from-amber-950/20 to-zinc-900/80 animate-slide-right flex flex-col items-center text-center shadow-xl shadow-amber-950/30">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-2xl bg-amber-600/25 border-2 border-amber-400 flex items-center justify-center text-amber-200 font-black text-3xl shadow-lg shadow-amber-500/20">
                  {opponent.avatar || '⚔️'}
                </div>
                <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-amber-500 text-zinc-950 font-mono text-[11px] font-bold shadow-md">
                  Ур. {opponent.level || 1}
                </div>
              </div>

              <h3 className="text-lg font-bold text-zinc-100 max-w-[200px] truncate">
                {opponent.username}
              </h3>
              <span className="text-xs text-amber-400 font-medium">Сетевой соперник</span>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 w-full flex items-center justify-around text-xs">
                <div>
                  <div className="text-zinc-500">Рекорд WPM</div>
                  <div className="font-mono font-bold text-zinc-200">
                    {opponent.max_wpm ? Math.round(opponent.max_wpm) : '-'}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Статус</div>
                  <div className="font-bold text-emerald-400">В сети</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ЭКРАН СОРЕВНОВАНИЯ */}
      {/* ======================================================== */}
      {gameState === 'racing' && (
        <div className="w-full max-w-4xl flex flex-col gap-5 py-2 animate-fade-in">
          {/* Сдвоенный трек гонки */}
          <div className="card-base p-4 border-zinc-800 flex flex-col gap-3.5 bg-zinc-900/80 backdrop-blur-md">
            {/* Трек 1: Вы */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-indigo-200 font-bold text-[10px]">
                    {user?.username ? user.username.charAt(0).toUpperCase() : '⚡'}
                  </div>
                  <span className="font-bold text-zinc-200">{user?.username || 'Вы'}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-mono font-bold">
                    Ур. {user?.level || 1}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-indigo-400 font-bold">{playerWpm} WPM</span>
                  <span className="text-zinc-400">{playerAccuracy}% точность</span>
                  <span className="font-bold text-zinc-100">{playerProgress}%</span>
                </div>
              </div>

              <div className="relative w-full h-3.5 rounded-full bg-zinc-950 border border-zinc-800 overflow-visible">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 transition-all duration-150 ease-out shadow-sm shadow-indigo-500/30"
                  style={{ width: `${playerProgress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 shadow-md shadow-indigo-500 transition-all duration-150 ease-out pointer-events-none"
                  style={{ left: `${playerProgress}%` }}
                />
              </div>
            </div>

            {/* Центральная плашка дельты */}
            <div className="flex items-center justify-center">
              <div
                className={`px-3 py-0.5 rounded-full text-[11px] font-mono font-bold border transition ${
                  charDelta > 0
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : charDelta < 0
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                {charDelta > 0
                  ? `Лидируете на +${charDelta} симв.`
                  : charDelta < 0
                  ? `Отставание ${charDelta} симв.`
                  : 'Идёте вровень!'}
              </div>
            </div>

            {/* Трек 2: Соперник */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-amber-600/30 border border-amber-400 flex items-center justify-center text-amber-200 font-bold text-[10px]">
                    {opponent?.avatar || '⚔️'}
                  </div>
                  <span className="font-bold text-zinc-200">{opponent?.username}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono font-bold">
                    Ур. {opponent?.level || 1}
                  </span>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  <span className="text-amber-400 font-bold">{opponentWpm} WPM</span>
                  <span className="font-bold text-zinc-100">{opponentProgress}%</span>
                </div>
              </div>

              <div className="relative w-full h-3.5 rounded-full bg-zinc-950 border border-zinc-800 overflow-visible">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-150 ease-out shadow-sm shadow-amber-500/30"
                  style={{ width: `${opponentProgress}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-white border-2 border-amber-500 shadow-md shadow-amber-500 transition-all duration-150 ease-out pointer-events-none"
                  style={{ left: `${opponentProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Текст дуэли */}
          <div
            tabIndex={0}
            className={`card-base p-6 sm:p-8 outline-none border transition-all ${
              isWrongFlash ? 'border-rose-500 bg-rose-950/20' : 'border-zinc-800 focus:border-indigo-500/60'
            }`}
          >
            <div className="font-mono text-xl sm:text-2xl leading-relaxed tracking-wide select-none break-words">
              {duelText.split('').map((char, index) => {
                const isTyped = index < charIndex;
                const isCurrent = index === charIndex;

                let charStyle = 'text-zinc-600';
                if (isTyped) {
                  charStyle = 'text-emerald-400';
                } else if (isCurrent) {
                  charStyle = isWrongFlash
                    ? 'bg-rose-500/40 text-rose-200 border-b-2 border-rose-400'
                    : 'bg-indigo-500/25 border-b-2 border-indigo-400 text-white animate-pulse';
                }

                return (
                  <span key={index} className={`${charStyle} transition-colors duration-75`}>
                    {char}
                  </span>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-500 font-mono">
              <div className="flex items-center gap-2">
                <span>Следующий символ:</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-bold border border-zinc-700">
                  {targetChar === ' ' ? 'Пробел' : targetChar || 'Конец'}
                </span>
              </div>

              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition"
              >
                <KeyboardIcon className="w-3.5 h-3.5" />
                <span>{showKeyboard ? 'Скрыть клавиатуру' : 'Показать клавиатуру'}</span>
              </button>
            </div>
          </div>

          {showKeyboard && (
            <div className="w-full flex flex-col items-center animate-fade-in">
              <VirtualKeyboard
                targetChar={targetChar}
                language={language}
                lastWrongChar={lastWrongChar}
                isWrongActive={isWrongFlash}
              />
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ЭКРАН РЕЗУЛЬТАТОВ */}
      {/* ======================================================== */}
      {gameState === 'result' && (
        <div className="w-full max-w-2xl flex flex-col items-center gap-6 py-8 animate-fade-in text-center">
          <div className="flex flex-col items-center gap-3">
            {matchOutcome === 'victory' ? (
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-2xl shadow-amber-500/30 animate-bounce">
                <Trophy className="w-10 h-10 text-amber-400" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-zinc-800 border-2 border-zinc-600 flex items-center justify-center text-zinc-400 shadow-xl">
                <Shield className="w-10 h-10 text-zinc-400" />
              </div>
            )}

            <h1
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                matchOutcome === 'victory' ? 'text-amber-400' : 'text-zinc-300'
              }`}
            >
              {matchOutcome === 'victory' ? 'ТРИУМФ И ПОБЕДА!' : 'ДОСТОЙНЫЙ БОЙ'}
            </h1>

            <p className="text-zinc-400 text-sm max-w-md">
              {opponentLeftNotice
                ? `Соперник ${opponent?.username} отключился. Вам присуждена техническая победа!`
                : matchOutcome === 'victory'
                ? `Вы опередили игрока ${opponent?.username} и забрали победу в дуэли!`
                : `Игрок ${opponent?.username} финишировал быстрее. Тренируйтесь и возьмите реванш!`}
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold text-sm shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>+{xpEarned} Очков Опыта (XP) начислено!</span>
            </div>
          </div>

          {/* Сравнительная таблица */}
          <div className="w-full card-base p-6 border-zinc-800">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-4 text-left">
              Сравнение результатов дуэли
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead>
                  <tr className="border-b border-zinc-800 text-xs text-zinc-500">
                    <th className="pb-3">Метрика</th>
                    <th className="pb-3 text-center text-indigo-400">
                      Вы ({user?.username || 'Герой'})
                    </th>
                    <th className="pb-3 text-center text-amber-400">
                      {opponent?.username || 'Соперник'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  <tr>
                    <td className="py-3 text-zinc-400">Скорость (WPM)</td>
                    <td
                      className={`py-3 text-center font-bold ${
                        playerWpm >= opponentWpm ? 'text-emerald-400' : 'text-zinc-200'
                      }`}
                    >
                      {playerWpm} WPM
                    </td>
                    <td
                      className={`py-3 text-center font-bold ${
                        opponentWpm > playerWpm ? 'text-emerald-400' : 'text-zinc-200'
                      }`}
                    >
                      {opponentWpm} WPM
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 text-zinc-400">Точность (%)</td>
                    <td
                      className={`py-3 text-center font-bold ${
                        playerAccuracy >= opponentAccuracy ? 'text-emerald-400' : 'text-zinc-200'
                      }`}
                    >
                      {playerAccuracy}%
                    </td>
                    <td
                      className={`py-3 text-center font-bold ${
                        opponentAccuracy > playerAccuracy ? 'text-emerald-400' : 'text-zinc-200'
                      }`}
                    >
                      {opponentAccuracy}%
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 text-zinc-400">Время прохождения</td>
                    <td className="py-3 text-center font-bold text-zinc-200">
                      {playerFinalTime || Math.round(elapsedSec * 10) / 10} сек
                    </td>
                    <td className="py-3 text-center font-bold text-zinc-200">
                      {opponentFinalTime || Math.round((elapsedSec + 1.2) * 10) / 10} сек
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3 text-zinc-400">Ошибки</td>
                    <td className="py-3 text-center font-bold text-zinc-200">
                      {errorsCount}
                    </td>
                    <td className="py-3 text-center font-bold text-zinc-200">
                      {Math.max(0, Math.round(errorsCount * 0.8))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleStartSearch}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition transform hover:scale-[1.02]"
            >
              <Swords className="w-4 h-4" />
              <span>Искать новый матч</span>
            </button>

            <button
              onClick={() => setGameState('lobby')}
              className="w-full sm:w-auto px-5 py-3 rounded-xl card-interactive text-zinc-300 hover:text-zinc-100 font-semibold text-sm cursor-pointer transition"
            >
              <span>Вернуться в лобби ПВП</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
