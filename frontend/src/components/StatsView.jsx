import React, { useState, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Clock,
  Target,
  Zap,
  TrendingUp,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ACHIEVEMENTS_CATALOG } from '../data/typingContent';

// Регистрация модулей Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StatsView({ user, onTrainWeakKeys, onOpenAuth }) {
  const [chartMode, setChartMode] = useState('speed'); // 'speed' или 'accuracy'

  // Расчёт средней точности по последним сессиям
  const avgAccuracy = useMemo(() => {
    if (!user?.sessions || user.sessions.length === 0) return 0;
    const sum = user.sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0);
    return Math.round((sum / user.sessions.length) * 10) / 10;
  }, [user]);

  // Форматирование общего времени
  const formattedTime = useMemo(() => {
    const totalSec = user?.total_time_sec || 0;
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    if (hours > 0) {
      return `${hours} ч ${minutes} мин`;
    }
    return `${minutes} мин ${totalSec % 60} сек`;
  }, [user]);

  // Сортировка проблемных клавиш
  const sortedProblemKeys = useMemo(() => {
    const keys = user?.problem_keys || {};
    return Object.entries(keys)
      .sort((a, b) => b[1] - a[1])
      .filter(([k]) => k.trim().length > 0);
  }, [user]);

  const maxKeyErrors = useMemo(() => {
    if (sortedProblemKeys.length === 0) return 1;
    return sortedProblemKeys[0][1];
  }, [sortedProblemKeys]);

  // Множество ID открытых достижений
  const unlockedAchievementIds = useMemo(() => {
    return new Set(user?.achievements || []);
  }, [user]);

  // Данные для графиков Chart.js
  const sessions = user?.sessions || [];
  const chartLabels = sessions.map((_, idx) => `#${idx + 1}`);

  const chartData = useMemo(() => {
    if (chartMode === 'speed') {
      return {
        labels: chartLabels,
        datasets: [
          {
            label: 'WPM (слов/мин)',
            data: sessions.map((s) => s.wpm),
            borderColor: '#6366f1', // indigo-500
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            pointRadius: 3,
            tension: 0.35,
            fill: true,
          },
          {
            label: 'CPM (символов/мин)',
            data: sessions.map((s) => s.cpm),
            borderColor: '#a855f7', // purple-500
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointRadius: 0,
            tension: 0.35,
          },
        ],
      };
    } else {
      return {
        labels: chartLabels,
        datasets: [
          {
            label: 'Точность (%)',
            data: sessions.map((s) => s.accuracy),
            borderColor: '#34d399', // emerald-400
            backgroundColor: 'rgba(52, 211, 153, 0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#34d399',
            pointRadius: 3,
            tension: 0.35,
            fill: true,
          },
        ],
      };
    }
  }, [chartMode, sessions, chartLabels]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#a1a1aa',
          font: { family: 'Inter', size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#a1a1aa',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        bodyFont: { family: 'JetBrains Mono' },
      },
    },
    scales: {
      x: {
        grid: { color: '#27272a' },
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 11 } },
      },
      y: {
        grid: { color: '#27272a' },
        ticks: { color: '#71717a', font: { family: 'JetBrains Mono', size: 11 } },
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-10">
      {/* Баннер для неавторизованных пользователей */}
      {!user && (
        <div className="card-base p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-indigo-500/30 bg-indigo-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">Гостевой режим</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Войдите в аккаунт, чтобы сохранять динамику скорости, разблокировать достижения и соревноваться в рейтинге.
              </p>
            </div>
          </div>

          {onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20 whitespace-nowrap"
            >
              Войти в профиль
            </button>
          )}
        </div>
      )}

      {/* 1. Сводные карточки ключевых показателей */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          Сводная статистика
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono">
          <div className="card-base p-4 flex flex-col">
            <span className="text-xs uppercase text-zinc-500">Всего сессий</span>
            <div className="text-2xl font-bold text-zinc-100 mt-1 tabular-nums">
              {user?.total_sessions || 0}
            </div>
            <span className="text-[11px] text-zinc-500 mt-auto">тренировок</span>
          </div>

          <div className="card-base p-4 flex flex-col">
            <span className="text-xs uppercase text-zinc-500">Время печати</span>
            <div className="text-lg font-bold text-zinc-100 mt-1 tabular-nums leading-tight">
              {formattedTime}
            </div>
            <span className="text-[11px] text-zinc-500 mt-auto">чистого времени</span>
          </div>

          <div className="card-base p-4 flex flex-col">
            <span className="text-xs uppercase text-zinc-500">Лучшая скорость</span>
            <div className="text-2xl font-bold text-indigo-400 mt-1 tabular-nums">
              {user?.max_wpm || 0} <span className="text-xs text-zinc-400">WPM</span>
            </div>
            <span className="text-[11px] text-zinc-500 mt-auto tabular-nums">
              {user?.max_cpm || 0} CPM
            </span>
          </div>

          <div className="card-base p-4 flex flex-col">
            <span className="text-xs uppercase text-zinc-500">Ср. точность</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">
              {avgAccuracy}%
            </div>
            <span className="text-[11px] text-zinc-500 mt-auto">за 30 сессий</span>
          </div>

          <div className="card-base p-4 flex flex-col col-span-2 sm:col-span-1">
            <span className="text-xs uppercase text-zinc-500">Макс. комбо</span>
            <div className="text-2xl font-bold text-amber-400 mt-1 tabular-nums">
              {user?.max_combo || 0}
            </div>
            <span className="text-[11px] text-zinc-500 mt-auto">без ошибок</span>
          </div>
        </div>
      </div>

      {/* 2. Графики динамики Chart.js */}
      <div className="card-base p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Динамика тренировок
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Показатели последних {sessions.length} тренировок
            </p>
          </div>

          {/* Переключатель скорости и точности */}
          <div className="flex rounded-xl bg-zinc-950 p-1 border border-zinc-850 text-xs font-mono self-start sm:self-auto">
            <button
              onClick={() => setChartMode('speed')}
              className={`px-3 py-1.5 rounded-lg transition ${
                chartMode === 'speed'
                  ? 'bg-zinc-800 text-indigo-300 font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Скорость (WPM / CPM)
            </button>
            <button
              onClick={() => setChartMode('accuracy')}
              className={`px-3 py-1.5 rounded-lg transition ${
                chartMode === 'accuracy'
                  ? 'bg-zinc-800 text-emerald-300 font-semibold shadow'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Точность (%)
            </button>
          </div>
        </div>

        {sessions.length > 0 ? (
          <div className="h-64 sm:h-72 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center text-zinc-500 text-xs">
            <BarChart3 className="w-8 h-8 text-zinc-700 mb-2" />
            <span>Тренировок пока нет. Пройдите несколько упражнений, чтобы построить график.</span>
          </div>
        )}
      </div>

      {/* 3. Блок «Анализ слабых клавиш» */}
      <div className="card-base p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Анализ проблемных клавиш
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Символы, на которых вы допускаете больше всего опечаток
            </p>
          </div>

          {sortedProblemKeys.length > 0 && onTrainWeakKeys && (
            <button
              onClick={onTrainWeakKeys}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition self-start sm:self-auto"
            >
              <span>Тренировать проблемные клавиши</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {sortedProblemKeys.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 font-mono">
            {sortedProblemKeys.slice(0, 12).map(([char, count]) => {
              const percent = Math.round((count / maxKeyErrors) * 100);
              return (
                <div
                  key={char}
                  className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700/60 flex items-center justify-center text-sm font-bold text-zinc-100">
                      {char}
                    </span>
                    <span className="text-xs text-rose-400 font-semibold tabular-nums">
                      {count} ош.
                    </span>
                  </div>

                  {/* Визуальная шкала частоты ошибок */}
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mt-auto">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-500 text-xs rounded-xl bg-zinc-950/40 border border-zinc-850">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2 opacity-80" />
            <span>У вас пока нет зарегистрированных ошибок. Пальцы работают безупречно!</span>
          </div>
        )}
      </div>

      {/* 4. Витрина всех достижений */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Достижения и регалии
          </h2>
          <span className="text-xs text-zinc-500 font-mono tabular-nums">
            {unlockedAchievementIds.size} из {ACHIEVEMENTS_CATALOG.length} открыто
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {ACHIEVEMENTS_CATALOG.map((ach) => {
            const isUnlocked = unlockedAchievementIds.has(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'card-interactive border-indigo-500/30 bg-zinc-900/80'
                    : 'bg-zinc-950/50 border-zinc-850/60 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`text-2xl p-2 rounded-xl border ${
                      isUnlocked
                        ? 'bg-zinc-850 border-zinc-700/80'
                        : 'bg-zinc-900/60 border-zinc-800/40 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-sm font-semibold text-zinc-100 truncate">
                        {ach.title}
                      </h4>
                      {isUnlocked && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                      {ach.description}
                    </p>

                    <div className="mt-2 text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                      <span>Условие:</span>
                      <span className="text-zinc-400">{ach.condition}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
