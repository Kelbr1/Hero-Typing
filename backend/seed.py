from datetime import datetime, timedelta
import json
import random

ACHIEVEMENTS = {
    "first_step": {
        "id": "first_step",
        "title": "Первый шаг",
        "description": "Первая тренировка завершена",
        "icon": "🚀"
    },
    "speed_200_cpm": {
        "id": "speed_200_cpm",
        "title": "Быстрые пальцы",
        "description": "Скорость печати достигла 200 CPM (символов в минуту)",
        "icon": "⚡"
    },
    "typing_genius": {
        "id": "typing_genius",
        "title": "Печатный гений",
        "description": "Скорость печати >= 300 WPM или >= 600 CPM",
        "icon": "👑"
    },
    "steel_finger": {
        "id": "steel_finger",
        "title": "Стальной палец",
        "description": "Комбо от 100 нажатий подряд без единой ошибки",
        "icon": "🛡️"
    },
    "sniper": {
        "id": "sniper",
        "title": "Снайпер",
        "description": "Точность 100% при объёме текста от 100 символов",
        "icon": "🎯"
    },
    "code_master": {
        "id": "code_master",
        "title": "Мастер кода",
        "description": "Завершено 5 тренировок в режиме «Код»",
        "icon": "💻"
    },
    "veteran": {
        "id": "veteran",
        "title": "Ветеран клавиатуры",
        "description": "Достигнут 5 уровень игрока",
        "icon": "🎖️"
    }
}


def seed_data():
    """База данных и таблица лидеров изначально пустые - заполняются только реальными игроками."""
    pass
