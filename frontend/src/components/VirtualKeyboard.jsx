import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Keyboard as KeyboardIcon } from 'lucide-react';
import { getFingerForKey, FINGER_NAMES } from '../data/typingContent';

// Раскладка клавиш ANSI-клавиатуры
const KEYBOARD_ROWS = [
  // 1-й ряд (цифры и спецсимволы)
  [
    { code: 'Backquote', en: '`', enShift: '~', ru: 'ё', ruShift: 'Ё', finger: 'left-pinky', width: 'w-10' },
    { code: 'Digit1', en: '1', enShift: '!', ru: '1', ruShift: '!', finger: 'left-pinky', width: 'w-10' },
    { code: 'Digit2', en: '2', enShift: '@', ru: '2', ruShift: '"', finger: 'left-ring', width: 'w-10' },
    { code: 'Digit3', en: '3', enShift: '#', ru: '3', ruShift: '№', finger: 'left-middle', width: 'w-10' },
    { code: 'Digit4', en: '4', enShift: '$', ru: '4', ruShift: ';', finger: 'left-index', width: 'w-10' },
    { code: 'Digit5', en: '5', enShift: '%', ru: '5', ruShift: '%', finger: 'left-index', width: 'w-10' },
    { code: 'Digit6', en: '6', enShift: '^', ru: '6', ruShift: ':', finger: 'right-index', width: 'w-10' },
    { code: 'Digit7', en: '7', enShift: '&', ru: '7', ruShift: '?', finger: 'right-index', width: 'w-10' },
    { code: 'Digit8', en: '8', enShift: '*', ru: '8', ruShift: '*', finger: 'right-middle', width: 'w-10' },
    { code: 'Digit9', en: '9', enShift: '(', ru: '9', ruShift: '(', finger: 'right-ring', width: 'w-10' },
    { code: 'Digit0', en: '0', enShift: ')', ru: '0', ruShift: ')', finger: 'right-pinky', width: 'w-10' },
    { code: 'Minus', en: '-', enShift: '_', ru: '-', ruShift: '_', finger: 'right-pinky', width: 'w-10' },
    { code: 'Equal', en: '=', enShift: '+', ru: '=', ruShift: '+', finger: 'right-pinky', width: 'w-10' },
    { code: 'Backspace', label: 'Backspace', finger: 'right-pinky', width: 'flex-1', isSpecial: true },
  ],

  // 2-й ряд (Tab + верхний буквенный)
  [
    { code: 'Tab', label: 'Tab', finger: 'left-pinky', width: 'w-14', isSpecial: true },
    { code: 'KeyQ', en: 'q', enShift: 'Q', ru: 'й', ruShift: 'Й', finger: 'left-pinky', width: 'w-10' },
    { code: 'KeyW', en: 'w', enShift: 'W', ru: 'ц', ruShift: 'Ц', finger: 'left-ring', width: 'w-10' },
    { code: 'KeyE', en: 'e', enShift: 'E', ru: 'у', ruShift: 'У', finger: 'left-middle', width: 'w-10' },
    { code: 'KeyR', en: 'r', enShift: 'R', ru: 'к', ruShift: 'К', finger: 'left-index', width: 'w-10' },
    { code: 'KeyT', en: 't', enShift: 'T', ru: 'е', ruShift: 'Е', finger: 'left-index', width: 'w-10' },
    { code: 'KeyY', en: 'y', enShift: 'Y', ru: 'н', ruShift: 'Н', finger: 'right-index', width: 'w-10' },
    { code: 'KeyU', en: 'u', enShift: 'U', ru: 'г', ruShift: 'Г', finger: 'right-index', width: 'w-10' },
    { code: 'KeyI', en: 'i', enShift: 'I', ru: 'ш', ruShift: 'Ш', finger: 'right-middle', width: 'w-10' },
    { code: 'KeyO', en: 'o', enShift: 'O', ru: 'щ', ruShift: 'Щ', finger: 'right-ring', width: 'w-10' },
    { code: 'KeyP', en: 'p', enShift: 'P', ru: 'з', ruShift: 'З', finger: 'right-pinky', width: 'w-10' },
    { code: 'BracketLeft', en: '[', enShift: '{', ru: 'х', ruShift: 'Х', finger: 'right-pinky', width: 'w-10' },
    { code: 'BracketRight', en: ']', enShift: '}', ru: 'ъ', ruShift: 'Ъ', finger: 'right-pinky', width: 'w-10' },
    { code: 'Backslash', en: '\\', enShift: '|', ru: '\\', ruShift: '/', finger: 'right-pinky', width: 'w-12', isSpecial: true },
  ],

  // 3-й ряд (CapsLock + домашний ряд с рисками на А/О и F/J)
  [
    { code: 'CapsLock', label: 'Caps', finger: 'left-pinky', width: 'w-16', isSpecial: true },
    { code: 'KeyA', en: 'a', enShift: 'A', ru: 'ф', ruShift: 'Ф', finger: 'left-pinky', width: 'w-10' },
    { code: 'KeyS', en: 's', enShift: 'S', ru: 'ы', ruShift: 'Ы', finger: 'left-ring', width: 'w-10' },
    { code: 'KeyD', en: 'd', enShift: 'D', ru: 'в', ruShift: 'В', finger: 'left-middle', width: 'w-10' },
    { code: 'KeyF', en: 'f', enShift: 'F', ru: 'а', ruShift: 'А', finger: 'left-index', width: 'w-10', homing: true },
    { code: 'KeyG', en: 'g', enShift: 'G', ru: 'п', ruShift: 'П', finger: 'left-index', width: 'w-10' },
    { code: 'KeyH', en: 'h', enShift: 'H', ru: 'р', ruShift: 'Р', finger: 'right-index', width: 'w-10' },
    { code: 'KeyJ', en: 'j', enShift: 'J', ru: 'о', ruShift: 'О', finger: 'right-index', width: 'w-10', homing: true },
    { code: 'KeyK', en: 'k', enShift: 'K', ru: 'л', ruShift: 'Л', finger: 'right-middle', width: 'w-10' },
    { code: 'KeyL', en: 'l', enShift: 'L', ru: 'д', ruShift: 'Д', finger: 'right-ring', width: 'w-10' },
    { code: 'Semicolon', en: ';', enShift: ':', ru: 'ж', ruShift: 'Ж', finger: 'right-pinky', width: 'w-10' },
    { code: 'Quote', en: "'", enShift: '"', ru: 'э', ruShift: 'Э', finger: 'right-pinky', width: 'w-10' },
    { code: 'Enter', label: 'Enter', finger: 'right-pinky', width: 'flex-1', isSpecial: true },
  ],

  // 4-й ряд (Shift + нижний ряд)
  [
    { code: 'ShiftLeft', label: 'Shift', finger: 'left-pinky', width: 'w-20', isSpecial: true, isShift: true },
    { code: 'KeyZ', en: 'z', enShift: 'Z', ru: 'я', ruShift: 'Я', finger: 'left-pinky', width: 'w-10' },
    { code: 'KeyX', en: 'x', enShift: 'X', ru: 'ч', ruShift: 'Ч', finger: 'left-ring', width: 'w-10' },
    { code: 'KeyC', en: 'c', enShift: 'C', ru: 'с', ruShift: 'С', finger: 'left-middle', width: 'w-10' },
    { code: 'KeyV', en: 'v', enShift: 'V', ru: 'м', ruShift: 'М', finger: 'left-index', width: 'w-10' },
    { code: 'KeyB', en: 'b', enShift: 'B', ru: 'и', ruShift: 'И', finger: 'left-index', width: 'w-10' },
    { code: 'KeyN', en: 'n', enShift: 'N', ru: 'т', ruShift: 'Т', finger: 'right-index', width: 'w-10' },
    { code: 'KeyM', en: 'm', enShift: 'M', ru: 'ь', ruShift: 'Ь', finger: 'right-index', width: 'w-10' },
    { code: 'Comma', en: ',', enShift: '<', ru: 'б', ruShift: 'Б', finger: 'right-middle', width: 'w-10' },
    { code: 'Period', en: '.', enShift: '>', ru: 'ю', ruShift: 'Ю', finger: 'right-ring', width: 'w-10' },
    { code: 'Slash', en: '/', enShift: '?', ru: '.', ruShift: ',', finger: 'right-pinky', width: 'w-10' },
    { code: 'ShiftRight', label: 'Shift', finger: 'right-pinky', width: 'flex-1', isSpecial: true, isShift: true },
  ],

  // 5-й ряд (Пробел)
  [
    { code: 'ControlLeft', label: 'Ctrl', finger: 'left-pinky', width: 'w-14', isSpecial: true },
    { code: 'AltLeft', label: 'Alt', finger: 'thumbs', width: 'w-12', isSpecial: true },
    { code: 'Space', label: 'Пробел', finger: 'thumbs', width: 'flex-1 max-w-sm', isSpace: true },
    { code: 'AltRight', label: 'Alt', finger: 'thumbs', width: 'w-12', isSpecial: true },
    { code: 'ControlRight', label: 'Ctrl', finger: 'right-pinky', width: 'w-14', isSpecial: true },
  ],
];

// Цветовые зоны пальцев в спокойном состоянии
const FINGER_ZONE_STYLES = {
  'left-pinky': 'border-purple-500/25 bg-purple-950/20 text-purple-200/80',
  'left-ring': 'border-blue-500/25 bg-blue-950/20 text-blue-200/80',
  'left-middle': 'border-cyan-500/25 bg-cyan-950/20 text-cyan-200/80',
  'left-index': 'border-emerald-500/25 bg-emerald-950/20 text-emerald-200/80',
  'thumbs': 'border-zinc-600/30 bg-zinc-900/40 text-zinc-300/80',
  'right-index': 'border-amber-500/25 bg-amber-950/20 text-amber-200/80',
  'right-middle': 'border-teal-500/25 bg-teal-950/20 text-teal-200/80',
  'right-ring': 'border-sky-500/25 bg-sky-950/20 text-sky-200/80',
  'right-pinky': 'border-violet-500/25 bg-violet-950/20 text-violet-200/80',
};

// Определение необходимости нажатия Shift для символа
function checkRequiresShift(char, language) {
  if (!char || char === ' ' || char === '\n' || char === '\t' || char === 'Tab') return false;

  // Прописные буквы
  if (char !== char.toLowerCase() && /[A-ZА-ЯЁ]/.test(char)) {
    return true;
  }

  // Тире и дефисы не требуют Shift
  if (['—', '–', '−', '―', '‒', '-'].includes(char)) {
    return false;
  }

  // Спецсимволы с Shift
  const shiftSymbols = language === 'ru'
    ? '!№;%:?*()_+/\"'
    : '~!@#$%^&*()_+{}|:"<>?';

  return shiftSymbols.includes(char);
}

// Определение кода целевой клавиши по символу
function findTargetKeyCode(char, language) {
  if (!char) return null;
  if (char === ' ' || char === 'Space') return 'Space';
  if (char === '\n' || char === 'Enter') return 'Enter';
  if (char === '\t' || char === 'Tab') return 'Tab';
  if (['—', '–', '−', '―', '‒'].includes(char)) return 'Minus';

  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (language === 'ru') {
        if (key.ru === char || key.ruShift === char) return key.code;
      } else {
        if (key.en === char || key.enShift === char) return key.code;
      }
    }
  }

  // Поиск без учета регистра
  const lower = char.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (const key of row) {
      if (language === 'ru' && (key.ru === lower || key.ruShift === lower)) return key.code;
      if (language === 'en' && (key.en === lower || key.enShift === lower)) return key.code;
    }
  }

  return null;
}

export default function VirtualKeyboard({
  targetChar = '',
  language = 'ru',
  lastWrongChar = null,
  pressedChar = null,
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [wrongFlashKey, setWrongFlashKey] = useState(null);

  const fingerInfo = getFingerForKey(targetChar);
  const targetKeyCode = findTargetKeyCode(targetChar, language);
  const requiresShift = checkRequiresShift(targetChar, language);

  // Определение противоположного Shift для классического десятипальцевого метода
  const recommendedShiftCode = fingerInfo?.fingerId?.startsWith('left')
    ? 'ShiftRight'
    : 'ShiftLeft';

  // Вспышка красным цветом при ошибке
  useEffect(() => {
    if (lastWrongChar) {
      const wrongCode = findTargetKeyCode(lastWrongChar, language);
      if (wrongCode) {
        setWrongFlashKey(wrongCode);
        const timer = setTimeout(() => setWrongFlashKey(null), 300);
        return () => clearTimeout(timer);
      }
    }
  }, [lastWrongChar, language]);

  return (
    <div className="w-full flex flex-col items-center select-none transition-all duration-300">
      {/* Кнопка переключения видимости клавиатуры */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <KeyboardIcon className="w-4 h-4 text-indigo-400" />
          <span>Схема клавиатуры и рук</span>
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-300 uppercase">
            {language}
          </span>
        </div>

        <button
          onClick={() => setIsVisible((v) => !v)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
        >
          {isVisible ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Скрыть клавиатуру</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Показать клавиатуру</span>
            </>
          )}
        </button>
      </div>

      {isVisible && (
        <div className="w-full max-w-4xl flex flex-col gap-2 p-2.5 sm:p-3 rounded-xl bg-zinc-900/60 border border-zinc-850 backdrop-blur-md shadow-xl">
          {/* Информационная плашка с подсказкой текущего пальца */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold font-mono">
                Следующая клавиша:
              </span>
              <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-mono font-bold text-xs sm:text-sm">
                {targetChar === ' ' ? 'Пробел' : targetChar === '\n' || targetChar === '\r' ? 'Enter' : targetChar === '\t' || targetChar === 'Tab' ? 'Tab' : ['—', '–', '−', '―', '‒'].includes(targetChar) ? '-' : targetChar || '-'}
              </span>
              {requiresShift && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono">
                  + Shift ({recommendedShiftCode === 'ShiftLeft' ? 'Левый' : 'Правый'})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400">Палец:</span>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {fingerInfo?.fingerName || 'Любой палец'}
              </span>
            </div>
          </div>

          {/* Виртуальная ANSI-клавиатура */}
          <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-950/80 border border-zinc-850 shadow-inner">
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 justify-center w-full">
                {row.map((key) => {
                  const isTarget = key.code === targetKeyCode;
                  const isShiftTarget = requiresShift && (key.code === recommendedShiftCode || key.isShift);
                  const isWrong = key.code === wrongFlashKey;

                  // Символ для отображения
                  let mainChar = '';
                  let shiftChar = '';

                  if (language === 'ru') {
                    mainChar = key.ru || key.label || '';
                    shiftChar = key.ruShift || '';
                  } else {
                    mainChar = key.en || key.label || '';
                    shiftChar = key.enShift || '';
                  }

                  // Определение стиля клавиши
                  const zoneStyle = FINGER_ZONE_STYLES[key.finger] || 'border-zinc-800 bg-zinc-900/30 text-zinc-400';

                  let stateStyle = zoneStyle;
                  if (isTarget) {
                    stateStyle = 'bg-indigo-500/40 border-indigo-400 text-white shadow-md shadow-indigo-500/25 ring-2 ring-indigo-400/50 scale-[1.03] z-10 font-bold';
                  } else if (isShiftTarget) {
                    stateStyle = 'bg-amber-500/30 border-amber-400 text-amber-200 shadow-sm shadow-amber-500/20 ring-1 ring-amber-400/40 animate-pulse';
                  } else if (isWrong) {
                    stateStyle = 'bg-rose-500/40 border-rose-400 text-rose-100 shadow-md shadow-rose-500/30 ring-2 ring-rose-400/60 scale-[1.03] z-10';
                  }

                  return (
                    <div
                      key={key.code}
                      className={`relative flex flex-col items-center justify-center h-7 sm:h-8 rounded-md border transition-all duration-150 font-mono text-[11px] sm:text-xs ${key.width} ${stateStyle}`}
                    >
                      {/* Спецсимвол при Shift */}
                      {shiftChar && shiftChar !== mainChar && (
                        <span className="text-[8px] opacity-60 leading-none">
                          {shiftChar}
                        </span>
                      )}

                      {/* Основной символ */}
                      <span className="leading-none text-[11px] sm:text-xs font-semibold">
                        {mainChar}
                      </span>

                      {/* Тактильные риски на домашних клавишах F/А и J/О */}
                      {key.homing && (
                        <div className="absolute bottom-0.5 w-2.5 h-0.5 rounded-full bg-zinc-400/80" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* SVG-схема кистей рук с подсветкой пальца */}
          <div className="w-full flex justify-center py-0.5">
            <HandsDiagram activeFinger={fingerInfo?.fingerId} />
          </div>
        </div>
      )}
    </div>
  );
}

// Минималистичная SVG-схема левой и правой руки
function HandsDiagram({ activeFinger }) {
  // Список пальцев с их координатами и идентификаторами
  const FINGERS_DATA = [
    // Левая рука (слева направо: мизинец -> большой)
    { id: 'left-pinky', name: 'Л. мизинец', cx: 48, cy: 50, rx: 7, ry: 22, rot: -16 },
    { id: 'left-ring', name: 'Л. безымянный', cx: 72, cy: 36, rx: 7.5, ry: 26, rot: -7 },
    { id: 'left-middle', name: 'Л. средний', cx: 96, cy: 28, rx: 8, ry: 28, rot: 0 },
    { id: 'left-index', name: 'Л. указательный', cx: 120, cy: 38, rx: 7.5, ry: 25, rot: 8 },
    { id: 'thumbs', name: 'Большой', cx: 148, cy: 75, rx: 9, ry: 20, rot: 36, isThumb: true },

    // Правая рука (слева направо: большой -> мизинец)
    { id: 'thumbs', name: 'Большой', cx: 212, cy: 75, rx: 9, ry: 20, rot: -36, isThumb: true },
    { id: 'right-index', name: 'П. указательный', cx: 240, cy: 38, rx: 7.5, ry: 25, rot: -8 },
    { id: 'right-middle', name: 'П. средний', cx: 264, cy: 28, rx: 8, ry: 28, rot: 0 },
    { id: 'right-ring', name: 'П. безымянный', cx: 288, cy: 36, rx: 7.5, ry: 26, rot: 7 },
    { id: 'right-pinky', name: 'П. мизинец', cx: 312, cy: 50, rx: 7, ry: 22, rot: 16 },
  ];

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 360 120"
        className="w-full max-w-[260px] sm:max-w-xs h-12 sm:h-14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="finger-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Контур ладони левой руки */}
        <path
          d="M 45 75 C 40 105, 55 116, 85 118 C 115 118, 130 110, 135 90 C 130 75, 115 65, 95 65 C 75 65, 55 70, 45 75 Z"
          className="fill-zinc-900/60 stroke-zinc-800"
          strokeWidth="1.5"
        />

        {/* Контур ладони правой руки */}
        <path
          d="M 315 75 C 320 105, 305 116, 275 118 C 245 118, 230 110, 225 90 C 230 75, 245 65, 265 65 C 285 65, 305 70, 315 75 Z"
          className="fill-zinc-900/60 stroke-zinc-800"
          strokeWidth="1.5"
        />

        {/* Отрисовка пальцев */}
        {FINGERS_DATA.map((f, idx) => {
          const isActive = f.id === activeFinger;

          return (
            <g
              key={`${f.id}-${idx}`}
              transform={`rotate(${f.rot} ${f.cx} ${f.cy})`}
              className="transition-all duration-200"
            >
              <ellipse
                cx={f.cx}
                cy={f.cy}
                rx={f.rx}
                ry={f.ry}
                className={
                  isActive
                    ? 'fill-indigo-500 stroke-indigo-300 transition-all duration-150'
                    : 'fill-zinc-900/90 stroke-zinc-700/80 hover:stroke-zinc-500'
                }
                strokeWidth={isActive ? 2.5 : 1.2}
                filter={isActive ? 'url(#finger-glow)' : undefined}
              />
              {/* Тактильная подушечка пальца */}
              <circle
                cx={f.cx}
                cy={f.cy - f.ry + 8}
                r={isActive ? 3.5 : 2.5}
                className={isActive ? 'fill-white' : 'fill-zinc-600/60'}
              />
            </g>
          );
        })}

        {/* Подписи левой и правой руки */}
        <text x="90" y="105" textAnchor="middle" className="fill-zinc-500 text-[10px] font-mono tracking-wider">
          ЛЕВАЯ
        </text>
        <text x="270" y="105" textAnchor="middle" className="fill-zinc-500 text-[10px] font-mono tracking-wider">
          ПРАВАЯ
        </text>
      </svg>
    </div>
  );
}
