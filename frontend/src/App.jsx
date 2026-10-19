import React, { useState, useEffect } from 'react';
import {
  Keyboard,
  BarChart3,
  Trophy,
  Volume2,
  VolumeX,
  User as UserIcon,
  LogOut,
  Zap,
  Swords,
} from 'lucide-react';
import { isSoundEnabled, toggleSound, playKeyClick } from './utils/sound';
import { getMe, removeToken, getToken } from './api';
import TypingArena from './components/TypingArena';
import PvpArena from './components/PvpArena';
import StatsView from './components/StatsView';
import LeaderboardView from './components/LeaderboardView';
import AuthModal from './components/AuthModal';

const TABS = [
  { id: 'arena', label: 'Тренажёр', icon: Keyboard },
  { id: 'pvp', label: 'ПВП', icon: Swords, isHot: true },
  { id: 'stats', label: 'Статистика и достижения', icon: BarChart3 },
  { id: 'leaderboard', label: 'Таблица лидеров', icon: Trophy },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('arena');
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [arenaMode, setArenaMode] = useState('words');

  // Загрузка профиля текущего пользователя при наличии токена
  const refreshUser = () => {
    const token = getToken();
    if (token) {
      getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          removeToken();
          setUser(null);
        });
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleToggleSound = () => {
    const updated = toggleSound();
    setSoundOn(updated);
    if (updated) playKeyClick();
  };

  const handleLogout = () => {
    removeToken();
    setUser(null);
  };

  // Переход к тренировке слабых клавиш из раздела статистики
  const handleTrainWeakKeys = () => {
    setArenaMode('weak_keys');
    setActiveTab('arena');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-indigo-500/30">
      {/* Верхний хедер */}
      <header className="border-b border-zinc-850 bg-zinc-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Логотип */}
          <div
            onClick={() => setActiveTab('arena')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-sm shadow-indigo-500/10">
              <Keyboard className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-zinc-100 uppercase">
              Печать героя
            </span>
          </div>

          {/* Навигация по вкладкам */}
          <nav className="flex items-center gap-1 p-1 rounded-xl bg-zinc-950/80 border border-zinc-850 text-xs font-medium">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-indigo-300 font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.isHot && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse hidden sm:inline-block" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Правая панель: Звук и Виджет пользователя */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Кнопка переключения звука */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl card-interactive text-zinc-400 hover:text-zinc-100"
              title={soundOn ? 'Выключить звук' : 'Включить звук'}
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-indigo-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {/* Виджет пользователя */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                <div
                  onClick={() => setActiveTab('stats')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl card-interactive cursor-pointer select-none"
                  title="Открыть профиль и статистику"
                >
                  <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-semibold text-[11px]">
                    {user.username.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-zinc-200 max-w-[80px] sm:max-w-[110px] truncate">
                        {user.username}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono font-bold">
                        Ур. {user.level}
                      </span>
                    </div>

                    {/* Компактная шкала XP */}
                    <div className="w-20 sm:w-24 h-1 rounded-full bg-zinc-800 overflow-hidden mt-1">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${Math.min(100, Math.round(((user.xp % 500) / 500) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-950/20 transition"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition shadow-md shadow-indigo-600/20 whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Войти / Регистрация</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Основной контент активной вкладки */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-2 sm:py-3.5 flex flex-col items-center">
        {activeTab === 'arena' && (
          <TypingArena
            user={user}
            onUserUpdate={setUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            initialMode={arenaMode}
          />
        )}

        {activeTab === 'pvp' && (
          <PvpArena
            user={user}
            onUserUpdate={setUser}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            user={user}
            onTrainWeakKeys={handleTrainWeakKeys}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView currentUser={user} />
        )}
      </main>

      {/* Футер */}
      <footer className="border-t border-zinc-900 py-4 text-center text-xs text-zinc-600 font-mono">
        Печать героя &copy; 2026
      </footer>

      {/* Модальное окно авторизации */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          refreshUser();
        }}
      />
    </div>
  );
}
