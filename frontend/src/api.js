const TOKEN_KEY = 'hero_typing_token';

// Получение сохраненного токена
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Сохранение токена
export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

// Удаление токена
export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Базовый метод отправки HTTP-запросов
async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.detail || data?.message || `Ошибка сервера (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

// Вход в систему
export async function login({ username, email, password }) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  if (data?.token) {
    setToken(data.token);
  }
  return data;
}

// Регистрация нового аккаунта
export async function register({ username, email, password }) {
  const data = await request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
  if (data?.token) {
    setToken(data.token);
  }
  return data;
}

// Получение профиля текущего пользователя
export async function getMe() {
  return request('/api/user/me');
}

// Сохранение тренировочной сессии
export async function saveSession(sessionData) {
  return request('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}

// Загрузка таблицы лидеров
export async function getLeaderboard({ sortBy = 'xp', period = 'all' } = {}) {
  const params = new URLSearchParams({
    sort_by: sortBy,
    period,
  });
  return request(`/api/leaderboard?${params.toString()}`);
}

// Получение списка всех достижений
export async function getAchievements() {
  return request('/api/achievements');
}

// Получение текстов для PVP дуэлей
export async function getPvpTexts(language = 'ru') {
  return request(`/api/pvp/texts?language=${language}`);
}
