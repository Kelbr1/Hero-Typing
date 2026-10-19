import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Zap,
  Target,
  Clock,
  RefreshCw,
  Search,
  Crown,
} from 'lucide-react';
import { getLeaderboard } from '../api';

const PERIOD_OPTIONS = [
  { id: 'today', label: 'За сегодня' },
  { id: 'week', label: 'За неделю' },
  { id: 'all', label: 'За всё время' },
];

const SORT_OPTIONS = [
  { id: 'xp', label: 'По опыту (XP)' },
  { id: 'wpm', label: 'По скорости (WPM)' },
  { id: 'accuracy', label: 'По точности (%)' },
];

export default function LeaderboardView({ currentUser }) {
  const [period, setPeriod] = useState('all');
  const [sortBy, setSortBy] = useState('xp');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLeaderboard = async (targetPeriod = period, targetSort = sortBy) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard({ period: targetPeriod, sortBy: targetSort });
      setLeaderboard(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Ошибка загрузки таблицы лидеров:', err);
      setError('Не удалось загрузить таблицу лидеров. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(period, sortBy);
  }, [period, sortBy]);

  // Стили бейджа ранга (Топ-1, Топ-2, Топ-3)
  const getRankBadge = (rank) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold flex items-center justify-center text-xs shadow-sm shadow-amber-400/20">
          <Crown className="w-4 h-4 text-amber-400" />
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-lg bg-zinc-300/20 border border-zinc-300/40 text-zinc-200 font-bold flex items-center justify-center text-xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-700/40 text-amber-500 font-bold flex items-center justify-center text-xs">
          3
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-lg text-zinc-500 font-mono font-medium flex items-center justify-center text-xs">
        {rank}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 pb-12 font-sans select-none">
      {/* Заголовок и фильтры */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-100 tracking-tight flex items-center gap-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            Таблица лидеров
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Рейтинг сильнейших мастеров печати по скорости, точности и опыту
          </p>
        </div>

        <button
          onClick={() => loadLeaderboard(period, sortBy)}
          disabled={loading}
          className="self-start sm:self-auto p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
          title="Обновить рейтинг"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Панель переключателей: Период и Сортировка */}
      <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2 rounded-2xl bg-zinc-900/60 border border-zinc-850 backdrop-blur-md">
        {/* Фильтр по периоду */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/80 border border-zinc-850 text-xs font-medium">
          {PERIOD_OPTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition ${
                period === p.id
                  ? 'bg-zinc-800 text-indigo-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Сортировка */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/80 border border-zinc-850 text-xs font-medium">
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition ${
                sortBy === s.id
                  ? 'bg-zinc-800 text-zinc-100 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="card-base p-4 border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadLeaderboard(period, sortBy)}
            className="underline hover:text-rose-200 font-medium ml-3"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Таблица лидеров */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                <th className="py-3.5 pl-4 pr-2 text-center w-14">Ранг</th>
                <th className="py-3.5 px-4">Игрок</th>
                <th className="py-3.5 px-4 text-center">Уровень</th>
                <th className="py-3.5 px-4 text-right">Скорость</th>
                <th className="py-3.5 px-4 text-right">Точность</th>
                <th className="py-3.5 px-4 text-right">Опыт XP</th>
                <th className="py-3.5 pr-4 pl-2 text-right hidden sm:table-cell">Сессии</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-sm font-mono">
              {loading ? (
                // Скелетон загрузки
                Array.from({ length: 7 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 pl-4 pr-2 text-center">
                      <div className="w-6 h-6 rounded bg-zinc-800 mx-auto" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="w-28 h-4 rounded bg-zinc-800" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="w-10 h-4 rounded bg-zinc-800 mx-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-16 h-4 rounded bg-zinc-800 ml-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-12 h-4 rounded bg-zinc-800 ml-auto" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-14 h-4 rounded bg-zinc-800 ml-auto" />
                    </td>
                    <td className="py-4 pr-4 pl-2 text-right hidden sm:table-cell">
                      <div className="w-8 h-4 rounded bg-zinc-800 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : leaderboard.length > 0 ? (
                leaderboard.map((item) => {
                  const isCurrent = currentUser && currentUser.id === item.user_id;

                  return (
                    <tr
                      key={item.user_id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-indigo-950/30 border-l-2 border-indigo-500'
                          : 'hover:bg-zinc-850/40'
                      }`}
                    >
                      {/* Ранг */}
                      <td className="py-3 pl-4 pr-2 text-center">
                        <div className="flex justify-center">{getRankBadge(item.rank)}</div>
                      </td>

                      {/* Имя игрока */}
                      <td className="py-3 px-4 font-sans font-medium text-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className={isCurrent ? 'text-indigo-300 font-bold' : ''}>
                            {item.username}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                              Вы
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Уровень */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800/80 border border-zinc-700/50 text-zinc-300">
                          Ур. {item.level}
                        </span>
                      </td>

                      {/* Скорость WPM & CPM */}
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span className="text-base font-bold text-zinc-100">
                          {item.wpm}
                        </span>
                        <span className="text-xs text-zinc-400 ml-1">WPM</span>
                        <span className="text-xs text-zinc-500 ml-1.5 hidden md:inline">
                          ({item.cpm} CPM)
                        </span>
                      </td>

                      {/* Точность */}
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span
                          className={`font-semibold ${
                            item.accuracy >= 98
                              ? 'text-emerald-400'
                              : item.accuracy >= 93
                              ? 'text-zinc-200'
                              : 'text-zinc-400'
                          }`}
                        >
                          {item.accuracy}%
                        </span>
                      </td>

                      {/* Опыт XP */}
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span className="text-indigo-400 font-bold">
                          {item.xp.toLocaleString()}
                        </span>
                      </td>

                      {/* Количество сессий */}
                      <td className="py-3 pr-4 pl-2 text-right tabular-nums text-zinc-500 hidden sm:table-cell">
                        {item.sessions_count}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-1">
                        <Trophy className="w-6 h-6 text-zinc-600" />
                      </div>
                      <p className="text-sm font-semibold text-zinc-300">Таблица лидеров пока пуста</p>
                      <p className="text-xs text-zinc-500 max-w-sm">
                        Завершите тренировку или победите в дуэли, чтобы занять первое место в рейтинге!
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
