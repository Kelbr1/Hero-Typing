// Названия пальцев на русском языке
export const FINGER_NAMES = {
  'left-pinky': 'Левый мизинец',
  'left-ring': 'Левый безымянный',
  'left-middle': 'Левый средний',
  'left-index': 'Левый указательный',
  'thumbs': 'Большой палец',
  'right-index': 'Правый указательный',
  'right-middle': 'Правый средний',
  'right-ring': 'Правый безымянный',
  'right-pinky': 'Правый мизинец',
};

// Привязка символов и клавиш к пальцам
export const KEY_TO_FINGER = {
  // Большие пальцы
  ' ': 'thumbs',

  // Левый мизинец
  '1': 'left-pinky', '!': 'left-pinky',
  'q': 'left-pinky', 'Q': 'left-pinky', 'й': 'left-pinky', 'Й': 'left-pinky',
  'a': 'left-pinky', 'A': 'left-pinky', 'ф': 'left-pinky', 'Ф': 'left-pinky',
  'z': 'left-pinky', 'Z': 'left-pinky', 'я': 'left-pinky', 'Я': 'left-pinky',
  '`': 'left-pinky', '~': 'left-pinky', 'ё': 'left-pinky', 'Ё': 'left-pinky',
  'Tab': 'left-pinky', '\t': 'left-pinky', 'CapsLock': 'left-pinky', 'ShiftLeft': 'left-pinky',

  // Левый безымянный
  '2': 'left-ring', '@': 'left-ring', '"': 'left-ring',
  'w': 'left-ring', 'W': 'left-ring', 'ц': 'left-ring', 'Ц': 'left-ring',
  's': 'left-ring', 'S': 'left-ring', 'ы': 'left-ring', 'Ы': 'left-ring',
  'x': 'left-ring', 'X': 'left-ring', 'ч': 'left-ring', 'Ч': 'left-ring',

  // Левый средний
  '3': 'left-middle', '#': 'left-middle', '№': 'left-middle',
  'e': 'left-middle', 'E': 'left-middle', 'у': 'left-middle', 'У': 'left-middle',
  'd': 'left-middle', 'D': 'left-middle', 'в': 'left-middle', 'В': 'left-middle',
  'c': 'left-middle', 'C': 'left-middle', 'с': 'left-middle', 'С': 'left-middle',

  // Левый указательный
  '4': 'left-index', '$': 'left-index', ';': 'left-index',
  '5': 'left-index', '%': 'left-index',
  'r': 'left-index', 'R': 'left-index', 'к': 'left-index', 'К': 'left-index',
  't': 'left-index', 'T': 'left-index', 'е': 'left-index', 'Е': 'left-index',
  'f': 'left-index', 'F': 'left-index', 'а': 'left-index', 'А': 'left-index',
  'g': 'left-index', 'G': 'left-index', 'п': 'left-index', 'П': 'left-index',
  'v': 'left-index', 'V': 'left-index', 'м': 'left-index', 'М': 'left-index',
  'b': 'left-index', 'B': 'left-index', 'и': 'left-index', 'И': 'left-index',

  // Правый указательный
  '6': 'right-index', '^': 'right-index', ':': 'right-index',
  '7': 'right-index', '&': 'right-index', '?': 'right-index',
  'y': 'right-index', 'Y': 'right-index', 'н': 'right-index', 'Н': 'right-index',
  'u': 'right-index', 'U': 'right-index', 'г': 'right-index', 'Г': 'right-index',
  'h': 'right-index', 'H': 'right-index', 'р': 'right-index', 'Р': 'right-index',
  'j': 'right-index', 'J': 'right-index', 'о': 'right-index', 'О': 'right-index',
  'n': 'right-index', 'N': 'right-index', 'т': 'right-index', 'Т': 'right-index',
  'm': 'right-index', 'M': 'right-index', 'ь': 'right-index', 'Ь': 'right-index',

  // Правый средний
  '8': 'right-middle', '*': 'right-middle',
  'i': 'right-middle', 'I': 'right-middle', 'ш': 'right-middle', 'Ш': 'right-middle',
  'k': 'right-middle', 'K': 'right-middle', 'л': 'right-middle', 'Л': 'right-middle',
  ',': 'right-middle', '<': 'right-middle', 'б': 'right-middle', 'Б': 'right-middle',

  // Правый безымянный
  '9': 'right-ring', '(': 'right-ring',
  'o': 'right-ring', 'O': 'right-ring', 'щ': 'right-ring', 'Щ': 'right-ring',
  'l': 'right-ring', 'L': 'right-ring', 'д': 'right-ring', 'Д': 'right-ring',
  '.': 'right-ring', '>': 'right-ring', 'ю': 'right-ring', 'Ю': 'right-ring',

  // Правый мизинец
  '0': 'right-pinky', ')': 'right-pinky',
  '-': 'right-pinky', '_': 'right-pinky',
  '—': 'right-pinky', '–': 'right-pinky', '−': 'right-pinky',
  '=': 'right-pinky', '+': 'right-pinky',
  'p': 'right-pinky', 'P': 'right-pinky', 'з': 'right-pinky', 'З': 'right-pinky',
  '[': 'right-pinky', '{': 'right-pinky', 'х': 'right-pinky', 'Х': 'right-pinky',
  ']': 'right-pinky', '}': 'right-pinky', 'ъ': 'right-pinky', 'Ъ': 'right-pinky',
  '\\': 'right-pinky', '|': 'right-pinky', '/': 'right-pinky',
  ';': 'right-pinky', "'": 'right-pinky', 'ж': 'right-pinky', 'Ж': 'right-pinky',
  'э': 'right-pinky', 'Э': 'right-pinky',
  'Enter': 'right-pinky', '\n': 'right-pinky', '\r': 'right-pinky',
  'Backspace': 'right-pinky', 'ShiftRight': 'right-pinky',
};

// Получение информации о пальце для конкретного символа
export function getFingerForKey(char) {
  if (!char) return null;
  const lookup = char === '\n' ? 'Enter' : (char === '\t' || char === 'Tab') ? 'Tab' : char;
  const fingerId = KEY_TO_FINGER[lookup] || KEY_TO_FINGER[lookup.toLowerCase()] || 'thumbs';
  return {
    fingerId,
    fingerName: FINGER_NAMES[fingerId] || 'Любой палец',
  };
}

// Банк контента по режимам, языкам и сложности
export const TYPING_CONTENT = {
  words: {
    ru: {
      easy: [
        'дом кот лес сыр чай мяч день час путь стол мост глаз сон мир шаг',
        'друг рука поле вода рыба река нога окно лето снег лист хлеб свет звон',
        'звук цвет дело тело дело песня книга трава земля птица голос утро вечер осень',
        'город стена школа весна берег ветер дождь огонь трава сосна озеро лодка берег зерно',
      ],
      medium: {
        list: [
          'герой', 'печать', 'скорость', 'точность', 'тренажёр', 'клавиатура', 'символ', 'пальцы',
          'память', 'навык', 'успех', 'победа', 'рекорд', 'секунда', 'минута', 'прогресс',
          'развитие', 'практика', 'мастер', 'уровень', 'энергия', 'фокус', 'внимание', 'реакция',
          'ритм', 'плавность', 'легкость', 'гибкость', 'ловкость', 'уверенность', 'стремление',
        ],
      },
      hard: {
        list: [
          'синхронизация', 'производительность', 'эффективность', 'концентрация', 'программирование',
          'автоматизация', 'модернизация', 'дифференциация', 'ответственность', 'индивидуальность',
          'бескомпромиссность', 'самосовершенствование', 'перпендикулярный', 'предосторожность',
          'целеустремленность', 'светочувствительность', 'последовательность', 'взаимодействие',
        ],
      },
    },
    en: {
      easy: [
        'cat dog sun red run sky pen cup box sea car top bus map bed',
        'time year bird tree book fish moon star road rock rain hand mind fire',
        'water light sound house green white night plant black earth peace power river heart',
      ],
      medium: {
        list: [
          'hero', 'typing', 'speed', 'accuracy', 'keyboard', 'finger', 'memory', 'focus',
          'rhythm', 'master', 'level', 'record', 'practice', 'progress', 'energy', 'action',
          'fluent', 'smooth', 'motion', 'reflex', 'button', 'switch', 'tactile', 'victory',
        ],
      },
      hard: {
        list: [
          'synchronization', 'performance', 'productivity', 'concentration', 'programming',
          'infrastructure', 'differentiation', 'responsibility', 'compatibility', 'extraordinary',
          'sophisticated', 'unprecedented', 'determination', 'comprehension', 'perseverance',
        ],
      },
    },
  },

  sentences: {
    ru: {
      easy: [
        'Быстрый и точный ввод текста развивает мозг.',
        'Каждый день тренировки делает пальцы быстрее.',
        'Слепая печать экономит много часов в неделю.',
        'Спокойный ритм важнее суетливой спешки.',
        'Смотри на экран, а пальцы найдут нужные клавиши сами.',
      ],
      medium: [
        'Настоящее мастерство печати приходит тогда, когда ты перестаешь думать о расположении букв.',
        'Мышечная память формируется постепенно: главное - соблюдать точность и не допускать ошибок.',
        'Эргономика рабочего места и правильная посадка защищают кисти рук от усталости.',
        'Регулярные короткие занятия по пятнадцать минут дают лучший результат, чем редкие марафоны.',
        'Когда пальцы двигаются независимо друг от друга, скорость возрастает в несколько раз.',
      ],
      hard: [
        'Слепой десятипальцевый метод базируется на тактильных метках клавиш А и О, служащих отправной точкой.',
        'Когнитивная нагрузка при наборе текста исчезает, освобождая внимание для глубоких размышлений и творчества.',
        'Достигнув отметки в четыреста знаков в минуту, человек опережает скорость формулирования мыслей вслух.',
        'Анализ проблемных клавиш позволяет выявить индивидуальные слабые зоны и точечно скорректировать траекторию движений.',
      ],
    },
    en: {
      easy: [
        'Focus on accuracy and typing speed will follow naturally.',
        'Keep your fingers resting on the home row keys.',
        'Touch typing is a superpower for modern developers.',
        'Smooth rhythm is much better than rushing and making typos.',
      ],
      medium: [
        'Muscle memory takes time to develop, so practice daily without looking down at the keyboard.',
        'Clean keystrokes and deliberate movements will help you achieve high words per minute score.',
        'When you eliminate typos, your typing becomes an effortless extension of your thoughts.',
        'The quick brown fox jumps over the lazy dog and tests every letter in the alphabet.',
      ],
      hard: [
        'Advanced touch typists perceive whole words and phrases as unified neuromuscular patterns rather than single keys.',
        'Maintaining ergonomic posture and relaxed wrists prevents repetitive strain injuries during long sessions.',
        'Consistent practice across diverse character sets trains mental adaptability and micro-precision reflexes.',
      ],
    },
  },

  code: {
    python: {
      easy: [
        'def add(a, b):\n\treturn a + b',
        'for i in range(10):\n\tprint("Value:", i)',
        'numbers = [1, 2, 3, 4, 5]\ntotal = sum(numbers)',
      ],
      medium: [
        'def fibonacci(n):\n\ta, b = 0, 1\n\tfor _ in range(n):\n\t\tyield a\n\t\ta, b = b, a + b',
        'class User:\n\tdef __init__(self, username, level=1):\n\t\tself.username = username\n\t\tself.level = level',
        'def get_evens(nums):\n\treturn [x for x in nums if x % 2 == 0]',
      ],
      hard: [
        'def quick_sort(arr):\n\tif len(arr) <= 1:\n\t\treturn arr\n\tpivot = arr[len(arr) // 2]\n\tleft = [x for x in arr if x < pivot]\n\tmiddle = [x for x in arr if x == pivot]\n\tright = [x for x in arr if x > pivot]\n\treturn quick_sort(left) + middle + quick_sort(right)',
        'import asyncio\nasync def fetch_all(urls):\n\ttasks = [fetch_one(u) for u in urls]\n\treturn await asyncio.gather(*tasks)',
      ],
    },
    javascript: {
      easy: [
        'const sum = (a, b) => a + b;\nconsole.log(sum(5, 7));',
        'let count = 0;\ncount += 1;\nconsole.log(count);',
        'const fruits = ["apple", "banana", "orange"];',
      ],
      medium: [
        'export function binarySearch(arr, target) {\n\tlet left = 0, right = arr.length - 1;\n\twhile (left <= right) {\n\t\tconst mid = Math.floor((left + right) / 2);\n\t\tif (arr[mid] === target) return mid;\n\t\tif (arr[mid] < target) left = mid + 1;\n\t\telse right = mid - 1;\n\t}\n\treturn -1;\n}',
        'const filterActive = (users) => users.filter(u => u.isActive && u.level >= 5);',
      ],
      hard: [
        'const debounce = (fn, delay = 300) => {\n\tlet timer = null;\n\treturn (...args) => {\n\t\tclearTimeout(timer);\n\t\ttimer = setTimeout(() => fn(...args), delay);\n\t};\n};',
        'class EventEmitter {\n\tconstructor() {\n\t\tthis.events = new Map();\n\t}\n\ton(name, fn) {\n\t\tif (!this.events.has(name)) this.events.set(name, []);\n\t\tthis.events.get(name).push(fn);\n\t}\n}',
      ],
    },
    html_css: {
      easy: [
        '<div class="flex items-center gap-2">\n\t<span class="text-sm">Hello</span>\n</div>',
        '<button type="button" class="btn-primary">\n\tОтправить\n</button>',
        '<input type="text" placeholder="Введите имя..." />',
      ],
      medium: [
        '.card {\n\tdisplay: flex;\n\tborder-radius: 8px;\n\tbackground: #18181b;\n\tborder: 1px solid #27272a;\n}',
        '@media (min-width: 768px) {\n\t.container {\n\t\tmax-width: 720px;\n\t\tmargin: 0 auto;\n\t}\n}',
      ],
      hard: [
        ':root {\n\t--primary: #6366f1;\n\t--background: #09090b;\n\t--text: #f4f4f5;\n\t--transition: all 0.2s ease;\n}\n.glow {\n\tbox-shadow: 0 0 20px rgba(99, 102, 241, 0.35);\n}',
      ],
    },
    ru: {
      easy: ['def greet(name):\n\treturn f"Привет, {name}!"'],
      medium: ['def fibonacci(n):\n\ta, b = 0, 1\n\tfor _ in range(n):\n\t\tyield a\n\t\ta, b = b, a + b'],
      hard: ['def quick_sort(arr):\n\treturn arr'],
    },
    en: {
      easy: ['const sum = (a, b) => a + b;'],
      medium: ['const filterActive = (users) => users.filter(u => u.isActive);'],
      hard: ['const debounce = (fn, delay) => { let timer; return () => {}; };'],
    },
  },

  symbols: {
    ru: {
      easy: [
        '123 456 789 012 345 678 901',
        '№1, №2, №3, №4, №5, №6, №7, №8, №9, №10.',
        '(тест) [параметры] {данные} <значение>',
      ],
      medium: [
        '10 + 20 = 30; 100 - 45 = 55; 8 * 9 = 72; 144 / 12 = 12.',
        'Цена: 1 500 руб. Скидка: -15%. Итого: 1 275 руб. (без НДС).',
        'Email: hero_type.2026@domain.ru; Тел: +7 (999) 000-11-22!',
      ],
      hard: [
        'SELECT * FROM users WHERE age >= 18 AND status = "active";',
        'Regex: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$/;',
        'JSON: {"id": 101, "score": 98.5, "tags": ["wpm", "cpm", "#hero"]};',
      ],
    },
    en: {
      easy: [
        '10 20 30 40 50 60 70 80 90 100',
        '(foo) [bar] {baz} <qux> "hello" \'world\'',
        '1 + 2 = 3; 4 * 5 = 20; 10 / 2 = 5;',
      ],
      medium: [
        'Total: $1,250.00 | Discount: 15% | Net: $1,062.50 [VAT incl.]',
        'Config: port=8080, host="127.0.0.1", ssl=true, max_conns=1000;',
        'math.pow(2, 10) === 1024 && math.sqrt(256) === 16;',
      ],
      hard: [
        'git commit -m "feat(auth): add JWT & bcrypt #142" --no-verify',
        'const pattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}/gi;',
        'docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=secret postgres:16',
      ],
    },
  },
};

// Генерация текста тренировки по заданным параметрам
export function getRandomTypingText(mode = 'words', language = 'ru', difficulty = 'medium', codeLang = 'python') {
  const modeData = TYPING_CONTENT[mode] || TYPING_CONTENT.words;
  const langKey = mode === 'code' ? (codeLang || 'python') : language;
  const langData = modeData[langKey] || modeData[language] || modeData.ru || modeData.en;
  const levelData = langData ? (langData[difficulty] || langData.medium || langData.easy) : null;

  let selectedText = '';

  if (Array.isArray(levelData)) {
    selectedText = levelData[Math.floor(Math.random() * levelData.length)];
  } else if (levelData && Array.isArray(levelData.list)) {
    // Собираем последовательность из 20-30 случайных слов
    const count = difficulty === 'hard' ? 18 : 25;
    const selected = [];
    for (let i = 0; i < count; i++) {
      const w = levelData.list[Math.floor(Math.random() * levelData.list.length)];
      selected.push(w);
    }
    selectedText = selected.join(' ');
  } else {
    selectedText = 'Печать героя - тренируй слепую печать каждый день.';
  }

  // Для режима кода: приводим отступы в начале строк к знакам табуляции (\t) для набора через клавишу Tab
  if (mode === 'code' && selectedText) {
    selectedText = selectedText.split('\n').map(line => {
      const match = line.match(/^ +/);
      if (!match) return line;
      const spaces = match[0].length;
      if (spaces % 4 === 0) {
        return '\t'.repeat(spaces / 4) + line.slice(spaces);
      }
      if (spaces % 2 === 0) {
        return '\t'.repeat(spaces / 2) + line.slice(spaces);
      }
      return '\t'.repeat(Math.max(1, Math.round(spaces / 2))) + line.slice(spaces);
    }).join('\n');
  }

  // Заменяем любые длинные и средние тире на стандартный дефис/тире '-'
  return (selectedText || '').replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-');
}

// Обширные словари полноценных слов для персональной тренировки слабых клавиш
const WEAK_KEYS_WORDS_RU = [
  'автоматика', 'акцент', 'анализ', 'арена', 'архив', 'баланс', 'барьер', 'безопасность', 'библиотека', 'быстрота',
  'вектор', 'вершина', 'внимание', 'возможность', 'волна', 'время', 'вызов', 'выносливость', 'высота', 'гармония',
  'генератор', 'герой', 'гибкость', 'главный', 'глубина', 'горизонт', 'город', 'градус', 'границы', 'движение',
  'действие', 'диалог', 'динамика', 'дистанция', 'дифференциал', 'доверие', 'достижение', 'доступ', 'драйв', 'дыхание',
  'единство', 'емкость', 'естественный', 'желание', 'железо', 'жизнь', 'журнал', 'задача', 'замысел', 'защита',
  'звезда', 'звук', 'знание', 'значение', 'золото', 'идеал', 'измерение', 'импульс', 'индикатор', 'инициатива',
  'инструмент', 'интуиция', 'искра', 'канал', 'качество', 'клавиша', 'клиент', 'команда', 'комплекс', 'контроль',
  'координация', 'критерий', 'курс', 'лидер', 'линия', 'ловкость', 'логика', 'лучший', 'максимум', 'мастерство',
  'механизм', 'минимум', 'минута', 'модуль', 'момент', 'мотивация', 'мощность', 'навык', 'надежность', 'направление',
  'настройка', 'начало', 'номинал', 'образ', 'обучение', 'объем', 'огонь', 'оптимизация', 'опыт', 'ориентир',
  'основа', 'отклик', 'память', 'панель', 'параметр', 'пальцы', 'печать', 'пик', 'плавность', 'платформа',
  'победа', 'подвиг', 'позиция', 'поиск', 'полет', 'понимание', 'порядок', 'потенциал', 'поток', 'правило',
  'практика', 'предел', 'принцип', 'проверка', 'программа', 'прогресс', 'прорыв', 'процесс', 'путь', 'работа',
  'радар', 'развитие', 'разгон', 'ракета', 'реакция', 'реализация', 'режим', 'результат', 'рекорд', 'ресурс',
  'решение', 'ритм', 'рубеж', 'самоконтроль', 'секунда', 'сервер', 'сеть', 'сигнал', 'символ', 'синхронизация',
  'система', 'скорость', 'совершенство', 'созидание', 'сосредоточение', 'состояние', 'сохранение', 'специалист',
  'способность', 'спринт', 'стабильность', 'стандарт', 'старт', 'стимул', 'стихия', 'стратегия', 'стремление',
  'структура', 'тактика', 'талант', 'темп', 'теория', 'терпение', 'техника', 'технология', 'точность', 'траектория',
  'тренировка', 'триумф', 'уверенность', 'удар', 'удача', 'узел', 'умение', 'универсал', 'управление', 'упорство',
  'уровень', 'ускорение', 'успех', 'устойчивость', 'фактор', 'финал', 'фокус', 'форма', 'формула', 'функция',
  'характер', 'хватка', 'ход', 'храбрость', 'целеустремленность', 'цель', 'центр', 'цикл', 'цифра', 'частота',
  'чемпион', 'черта', 'чистота', 'шаг', 'шанс', 'шкала', 'штурм', 'щедрость', 'щит', 'эволюция',
  'экран', 'эксперт', 'элемент', 'энергия', 'эпицентр', 'эталон', 'этап', 'эффект', 'эффективность', 'ювелир',
  'юность', 'ядро', 'яркость', 'ясность'
];

const WEAK_KEYS_WORDS_EN = [
  'accuracy', 'action', 'active', 'adaptive', 'advanced', 'agility', 'algorithm', 'altitude', 'amplitude', 'anchor',
  'balance', 'barrier', 'battery', 'benchmark', 'blazing', 'booster', 'bravery', 'buffer', 'builder', 'button',
  'cadence', 'caliber', 'capacity', 'capture', 'catalyst', 'champion', 'channel', 'circuit', 'clarity', 'command',
  'compact', 'complex', 'concept', 'conquest', 'constant', 'control', 'courage', 'current', 'database', 'decimal',
  'decisive', 'density', 'developer', 'dexterity', 'dialog', 'digital', 'direct', 'discipline', 'distance', 'dynamic',
  'element', 'elevation', 'engine', 'essence', 'evolution', 'execute', 'expert', 'factor', 'feedback', 'fighter',
  'filter', 'finger', 'flight', 'fluent', 'focus', 'formula', 'forward', 'fraction', 'freedom', 'frequency',
  'friction', 'frontier', 'future', 'galaxy', 'gateway', 'genius', 'gradient', 'gravity', 'guidance', 'hardware',
  'harmony', 'header', 'height', 'horizon', 'identity', 'impact', 'impulse', 'index', 'indicator', 'infinite',
  'insight', 'instant', 'integer', 'intensity', 'interface', 'interval', 'journey', 'judgment', 'junction', 'keyboard',
  'keystroke', 'kinetic', 'launch', 'layout', 'leader', 'legend', 'level', 'lightning', 'linear', 'logic',
  'magnitude', 'mastery', 'matrix', 'maximum', 'measure', 'mechanism', 'melody', 'memory', 'method', 'metric',
  'minimum', 'mission', 'module', 'momentum', 'monitor', 'motion', 'navigate', 'network', 'neutral', 'objective',
  'operator', 'optimal', 'orbit', 'origin', 'output', 'pacemaker', 'parallel', 'parameter', 'pattern', 'performance',
  'phantom', 'pioneer', 'pipeline', 'platform', 'pointer', 'position', 'power', 'precision', 'preview', 'primary',
  'priority', 'process', 'profile', 'progress', 'protocol', 'pulse', 'quantum', 'quickness', 'radiant', 'radius',
  'reaction', 'record', 'reflex', 'register', 'regular', 'reliable', 'request', 'resonance', 'response', 'restart',
  'result', 'rhythm', 'routine', 'running', 'runtime', 'sample', 'scale', 'scanner', 'schedule', 'segment',
  'sequence', 'signal', 'simplicity', 'skill', 'smooth', 'software', 'spectrum', 'speed', 'spiral', 'stamina',
  'standard', 'station', 'stealth', 'storage', 'strategy', 'strength', 'structure', 'success', 'summit', 'swift',
  'symbol', 'symmetry', 'synchrony', 'system', 'tactile', 'target', 'technique', 'terminal', 'texture', 'theory',
  'threshold', 'timeline', 'tolerance', 'torque', 'tracking', 'training', 'transit', 'trigger', 'triumph', 'ultimate',
  'universal', 'upgrade', 'valiant', 'velocity', 'venture', 'version', 'vertical', 'vessel', 'vibration', 'victory',
  'vigilant', 'virtual', 'vision', 'vortex', 'warrior', 'wavelength', 'weapon', 'weight', 'winner', 'wireless',
  'wizard', 'zenith'
];

// Генерация текста для режима работы над ошибками
export function generateWeakKeysText(problemKeys = {}, language = 'ru', wordCount = 20) {
  // Получаем список проблемных символов, отсортированных по частоте ошибок
  const keys = Object.entries(problemKeys)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0].toLowerCase())
    .filter(k => k.trim().length > 0 && k !== 'enter' && k !== 'tab');

  const dict = language === 'en' ? WEAK_KEYS_WORDS_EN : WEAK_KEYS_WORDS_RU;

  // Если проблемных клавиш пока нет, возвращаем стандартные слова
  if (keys.length === 0) {
    return getRandomTypingText('words', language, 'medium');
  }

  // Оцениваем слова по содержанию проблемных символов (чем выше в топе ошибок буква, тем больше вес слова)
  const scoredWords = dict.map(word => {
    const lowerWord = word.toLowerCase();
    let score = 0;
    keys.forEach((key, idx) => {
      if (lowerWord.includes(key)) {
        score += Math.max(1, (keys.length - idx) * 3);
      }
    });
    return { word, score };
  }).filter(item => item.score > 0);

  const pool = scoredWords.length >= 8
    ? scoredWords
    : dict.map(w => ({ word: w, score: 1 }));

  // Сортируем по весу соответствия проблемным буквам
  pool.sort((a, b) => b.score - a.score);

  // Выбираем пул наиболее релевантных слов
  const candidatePool = pool.slice(0, Math.max(wordCount * 2, 25));

  const resultWords = [];
  let prevWord = '';

  for (let i = 0; i < wordCount; i++) {
    const available = candidatePool.filter(c => c.word !== prevWord);
    const chosen = available.length > 0
      ? available[Math.floor(Math.random() * available.length)].word
      : candidatePool[Math.floor(Math.random() * candidatePool.length)].word;

    resultWords.push(chosen);
    prevWord = chosen;
  }

  return resultWords.join(' ').replace(/[\u2012\u2013\u2014\u2015\u2212]/g, '-');
}

// Справочник всех достижений
export const ACHIEVEMENTS_CATALOG = [
  {
    id: 'first_step',
    title: 'Первый шаг',
    description: 'Первая тренировка завершена',
    icon: '🚀',
    condition: 'Завершить 1 тренировку',
  },
  {
    id: 'speed_200_cpm',
    title: 'Быстрые пальцы',
    description: 'Скорость печати достигла 200 CPM (символов/мин)',
    icon: '⚡',
    condition: 'Скорость >= 200 CPM',
  },
  {
    id: 'typing_genius',
    title: 'Печатный гений',
    description: 'Скорость печати >= 300 WPM или >= 600 CPM',
    icon: '👑',
    condition: 'Скорость >= 300 WPM или 600 CPM',
  },
  {
    id: 'steel_finger',
    title: 'Стальной палец',
    description: 'Комбо от 100 нажатий подряд без единой ошибки',
    icon: '🛡️',
    condition: 'Комбо >= 100',
  },
  {
    id: 'sniper',
    title: 'Снайпер',
    description: 'Точность 100% при объёме текста от 100 символов',
    icon: '🎯',
    condition: 'Точность 100% при длине >= 100 символов',
  },
  {
    id: 'code_master',
    title: 'Мастер кода',
    description: 'Завершено 5 тренировок в режиме «Код»',
    icon: '💻',
    condition: '5 сессий в режиме «Код»',
  },
  {
    id: 'veteran',
    title: 'Ветеран клавиатуры',
    description: 'Достигнут 5 уровень игрока',
    icon: '🎖️',
    condition: 'Уровень игрока >= 5',
  },
];
