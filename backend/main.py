from contextlib import asynccontextmanager
from datetime import datetime, timedelta
import json
import random
import uuid
from typing import Optional, List

from fastapi import FastAPI, Depends, HTTPException, Query, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, desc, or_
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import User, TypingSession
from schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
    UserProfileResponse,
    SessionCreateRequest,
    SessionCreateResponse,
    SessionResponse,
    LeaderboardEntry,
    AchievementInfo,
)
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    get_optional_current_user,
)
from seed import ACHIEVEMENTS


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Печать героя API",
    description="Backend API для геймифицированного тренажёра слепой печати «Печать героя»",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def serialize_session(session: TypingSession) -> SessionResponse:
    return SessionResponse(
        id=session.id,
        user_id=session.user_id,
        mode=session.mode,
        language=session.language,
        wpm=round(session.wpm, 1),
        cpm=round(session.cpm, 1),
        accuracy=round(session.accuracy, 1),
        errors_count=session.errors_count,
        max_combo=session.max_combo,
        xp_earned=session.xp_earned,
        duration_sec=round(session.duration_sec, 1),
        problem_keys=session.get_problem_keys(),
        created_at=session.created_at,
    )


def serialize_user(user: User, include_sessions: bool = False, db: Optional[Session] = None) -> UserProfileResponse:
    problem_keys = user.get_problem_keys()
    achievements = user.get_achievements()
    achievements_details = [
        AchievementInfo(**ACHIEVEMENTS[aid])
        for aid in achievements
        if aid in ACHIEVEMENTS
    ]

    sessions_list = None
    if include_sessions and db is not None:
        recent = (
            db.query(TypingSession)
            .filter(TypingSession.user_id == user.id)
            .order_by(TypingSession.created_at.desc())
            .limit(30)
            .all()
        )
        # Reverse to chronological order (oldest -> newest) for plotting dynamics
        recent.reverse()
        sessions_list = [serialize_session(s) for s in recent]

    return UserProfileResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        level=user.level,
        xp=user.xp,
        total_sessions=user.total_sessions,
        total_time_sec=user.total_time_sec,
        max_wpm=round(user.max_wpm, 1),
        max_cpm=round(user.max_cpm, 1),
        max_combo=user.max_combo,
        problem_keys=problem_keys,
        achievements=achievements,
        achievements_details=achievements_details,
        created_at=user.created_at,
        sessions=sessions_list,
    )


def check_and_award_achievements(
    user: User,
    session: TypingSession,
    db: Session,
    chars_count: Optional[int] = None
) -> List[AchievementInfo]:
    unlocked = set(user.get_achievements())
    new_unlocked: List[AchievementInfo] = []

    def award(ach_id: str):
        if ach_id not in unlocked:
            unlocked.add(ach_id)
            if ach_id in ACHIEVEMENTS:
                new_unlocked.append(AchievementInfo(**ACHIEVEMENTS[ach_id]))

    # 1. first_step: Первая тренировка завершена
    if user.total_sessions >= 1:
        award("first_step")

    # 2. speed_200_cpm: Скорость >= 200 символов/мин (CPM)
    if session.cpm >= 200 or user.max_cpm >= 200:
        award("speed_200_cpm")

    # 3. typing_genius: «Печатный гений» - скорость >= 300 слов/мин (или >= 600 CPM)
    if session.wpm >= 300 or session.cpm >= 600 or user.max_wpm >= 300 or user.max_cpm >= 600:
        award("typing_genius")

    # 4. steel_finger: «Стальной палец» - комбо >= 1000 (или порог 100)
    if session.max_combo >= 100 or user.max_combo >= 100:
        award("steel_finger")

    # 5. sniper: «Снайпер» - точность 100% при длине текста от 100 символов
    approx_chars = chars_count if (chars_count is not None and chars_count > 0) else (session.cpm * session.duration_sec / 60.0)
    if session.accuracy >= 100.0 and approx_chars >= 95:
        award("sniper")

    # 6. code_master: Завершено 5 тренировок в режиме «Код»
    code_count = (
        db.query(TypingSession)
        .filter(TypingSession.user_id == user.id, TypingSession.mode == "code")
        .count()
    )
    if code_count >= 5:
        award("code_master")

    # 7. veteran: Достигнут 5 уровень игрока
    if user.level >= 5:
        award("veteran")

    user.achievements_json = json.dumps(sorted(list(unlocked)), ensure_ascii=False)
    return new_unlocked


# ---------------------------------------------------------
# Authentication Endpoints
# ---------------------------------------------------------

@app.post("/api/auth/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserRegisterRequest, db: Session = Depends(get_db)):
    clean_username = data.username.strip()
    clean_email = data.email.strip().lower()

    existing_user = db.query(User).filter(
        or_(
            func.lower(User.username) == clean_username.lower(),
            func.lower(User.email) == clean_email
        )
    ).first()

    if existing_user:
        if existing_user.username.lower() == clean_username.lower():
            raise HTTPException(status_code=400, detail="Пользователь с таким именем уже существует")
        else:
            raise HTTPException(status_code=400, detail="Пользователь с таким email уже зарегистрирован")

    user = User(
        username=clean_username,
        email=clean_email,
        password_hash=get_password_hash(data.password),
        level=1,
        xp=0,
        total_sessions=0,
        total_time_sec=0,
        max_wpm=0.0,
        max_cpm=0.0,
        max_combo=0,
        problem_keys_json="{}",
        achievements_json="[]",
        created_at=datetime.utcnow()
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "username": user.username})
    return AuthResponse(
        token=token,
        token_type="bearer",
        user=serialize_user(user, include_sessions=True, db=db)
    )


@app.post("/api/auth/login", response_model=AuthResponse)
def login(data: UserLoginRequest, db: Session = Depends(get_db)):
    identifier = (data.username or data.email or "").strip()
    if not identifier:
        raise HTTPException(status_code=400, detail="Укажите имя пользователя или email")

    user = db.query(User).filter(
        or_(
            func.lower(User.username) == identifier.lower(),
            func.lower(User.email) == identifier.lower()
        )
    ).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя/email или пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": str(user.id), "username": user.username})
    return AuthResponse(
        token=token,
        token_type="bearer",
        user=serialize_user(user, include_sessions=True, db=db)
    )


# ---------------------------------------------------------
# User Profile Endpoint
# ---------------------------------------------------------

@app.get("/api/user/me", response_model=UserProfileResponse)
def get_current_user_profile(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return serialize_user(user, include_sessions=True, db=db)


# ---------------------------------------------------------
# Typing Sessions Endpoints
# ---------------------------------------------------------

@app.post("/api/sessions", response_model=SessionCreateResponse)
def create_session(
    data: SessionCreateRequest,
    user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    # Calculate XP if not provided by client
    xp_earned = data.xp_earned
    if xp_earned is None:
        duration_min = max(0.1, data.duration_sec / 60.0)
        cpm_factor = data.cpm * (data.accuracy / 100.0)
        combo_bonus = max(0, data.max_combo // 10)
        xp_earned = int(cpm_factor * duration_min) + combo_bonus

    problem_keys = data.problem_keys or {}
    problem_keys_str = json.dumps(problem_keys, ensure_ascii=False)

    session = TypingSession(
        user_id=user.id if user else None,
        mode=data.mode,
        language=data.language,
        wpm=data.wpm,
        cpm=data.cpm,
        accuracy=data.accuracy,
        errors_count=data.errors_count,
        max_combo=data.max_combo,
        xp_earned=xp_earned,
        duration_sec=data.duration_sec,
        problem_keys_json=problem_keys_str,
        created_at=datetime.utcnow()
    )
    db.add(session)
    db.flush()

    new_achievements: List[AchievementInfo] = []
    user_profile = None

    if user:
        # Update user stats
        user.xp += xp_earned
        user.level = 1 + (user.xp // 500)
        user.total_sessions += 1
        user.total_time_sec += int(data.duration_sec)
        user.max_wpm = max(user.max_wpm, data.wpm)
        user.max_cpm = max(user.max_cpm, data.cpm)
        user.max_combo = max(user.max_combo, data.max_combo)

        # Merge problem keys
        user_problem_keys = user.get_problem_keys()
        for k, v in problem_keys.items():
            user_problem_keys[k] = user_problem_keys.get(k, 0) + v
        user.problem_keys_json = json.dumps(user_problem_keys, ensure_ascii=False)

        # Check and award achievements
        new_achievements = check_and_award_achievements(
            user=user,
            session=session,
            db=db,
            chars_count=data.chars_count
        )

        db.commit()
        db.refresh(user)
        user_profile = serialize_user(user, include_sessions=True, db=db)
    else:
        db.commit()

    db.refresh(session)
    return SessionCreateResponse(
        session=serialize_session(session),
        user=user_profile,
        new_achievements=new_achievements
    )


# ---------------------------------------------------------
# Leaderboard Endpoint
# ---------------------------------------------------------

@app.get("/api/leaderboard", response_model=List[LeaderboardEntry])
def get_leaderboard(
    sort_by: str = Query("xp", pattern="^(wpm|cpm|accuracy|xp)$"),
    period: str = Query("all", pattern="^(today|week|all)$"),
    db: Session = Depends(get_db)
):
    now = datetime.utcnow()

    if period == "today":
        period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        period_start = now - timedelta(days=7)
    else:
        period_start = None

    if period_start is not None:
        # Aggregate stats over the given period
        stats_query = (
            db.query(
                TypingSession.user_id.label("user_id"),
                User.username.label("username"),
                User.level.label("level"),
                func.max(TypingSession.wpm).label("wpm"),
                func.max(TypingSession.cpm).label("cpm"),
                func.avg(TypingSession.accuracy).label("accuracy"),
                func.sum(TypingSession.xp_earned).label("xp"),
                func.count(TypingSession.id).label("sessions_count")
            )
            .join(User, TypingSession.user_id == User.id)
            .filter(TypingSession.created_at >= period_start)
            .group_by(TypingSession.user_id, User.username, User.level)
        )
    else:
        # All-time stats based on User model and aggregated accuracy/sessions
        stats_query = (
            db.query(
                User.id.label("user_id"),
                User.username.label("username"),
                User.level.label("level"),
                func.coalesce(func.max(TypingSession.wpm), User.max_wpm).label("wpm"),
                func.coalesce(func.max(TypingSession.cpm), User.max_cpm).label("cpm"),
                func.coalesce(func.avg(TypingSession.accuracy), 100.0).label("accuracy"),
                User.xp.label("xp"),
                func.count(TypingSession.id).label("sessions_count")
            )
            .outerjoin(TypingSession, User.id == TypingSession.user_id)
            .group_by(User.id, User.username, User.level, User.max_wpm, User.max_cpm, User.xp)
        )

    # Apply sorting
    if sort_by == "wpm":
        stats_query = stats_query.order_by(desc("wpm"), desc("xp"))
    elif sort_by == "cpm":
        stats_query = stats_query.order_by(desc("cpm"), desc("xp"))
    elif sort_by == "accuracy":
        stats_query = stats_query.order_by(desc("accuracy"), desc("xp"))
    else:  # xp
        stats_query = stats_query.order_by(desc("xp"), desc("cpm"))

    results = stats_query.limit(20).all()

    leaderboard = []
    for rank, row in enumerate(results, start=1):
        leaderboard.append(
            LeaderboardEntry(
                rank=rank,
                user_id=row.user_id,
                username=row.username,
                level=row.level,
                wpm=round(float(row.wpm or 0.0), 1),
                cpm=round(float(row.cpm or 0.0), 1),
                accuracy=round(float(row.accuracy or 0.0), 1),
                xp=int(row.xp or 0),
                sessions_count=int(row.sessions_count or 0),
            )
        )

    return leaderboard


# ---------------------------------------------------------
# Achievements List & Health Check
# ---------------------------------------------------------

@app.get("/api/achievements", response_model=List[AchievementInfo])
def list_achievements():
    return [AchievementInfo(**item) for item in ACHIEVEMENTS.values()]


@app.get("/api/health")
def health():
    return {"status": "ok", "app": "Печать героя API"}


# ---------------------------------------------------------
# PVP Duel System (WebSocket Real-Time Matchmaking)
# ---------------------------------------------------------

PVP_DUEL_TEXTS = {
    "ru": [
        "Скорость реакции и точность движений определяют истинного победителя в битве за звание чемпиона арены.",
        "Каждое верное нажатие клавиши приближает победу. Сохраняй спокойствие и держи идеальный темп печати.",
        "Мастера слепой печати чувствуют рельеф символов инстинктивно, не опуская взгляда на клавиатуру.",
        "В скоростной дуэли побеждает не просто напор, а хирургическая точность каждого введенного слова.",
        "Чистый код и безупречный текст создаются непрерывным потоком мысли и отточенными движениями пальцев.",
        "Фокус и стальная концентрация побеждают хаос. Победа достается тому, кто не допускает лишних пауз.",
        "Путь героя клавиатуры лежит через сотни сражений и побед над собственными ошибками.",
    ],
    "en": [
        "Speed and accuracy determine the ultimate champion in this intense battle for typing supremacy.",
        "Every correct keystroke counts toward victory. Stay calm, breathe evenly, and keep a steady flow.",
        "True keyboard masters never glance down; their fingers instinctively dance across every symbol.",
        "In a cyber duel, raw velocity is nothing without absolute precision and disciplined focus under pressure.",
        "Flawless code flows naturally when your hands effortlessly match the blazing speed of your thoughts.",
    ]
}

class PVPManager:
    def __init__(self):
        # Waiting queue: list of {"ws": WebSocket, "user": dict, "language": str}
        self.queue: List[dict] = []
        # Active matches: match_id -> dict
        self.matches: dict = {}

    async def connect(self, ws: WebSocket):
        await ws.accept()

    async def disconnect(self, ws: WebSocket):
        self.queue = [p for p in self.queue if p["ws"] != ws]
        for match_id, match in list(self.matches.items()):
            for p in match["players"]:
                if p["ws"] == ws:
                    for other in match["players"]:
                        if other["ws"] != ws:
                            try:
                                await other["ws"].send_json({"type": "opponent_disconnected"})
                            except Exception:
                                pass
                    self.matches.pop(match_id, None)
                    break

    async def join_queue(self, ws: WebSocket, user_info: dict, language: str = "ru"):
        # Filter alive sockets
        alive = []
        for p in self.queue:
            try:
                if p["ws"].client_state.name == "CONNECTED":
                    alive.append(p)
            except Exception:
                pass
        self.queue = alive

        # Match with an existing player
        matched_idx = None
        for i, p in enumerate(self.queue):
            if p["ws"] != ws and p.get("language") == language:
                matched_idx = i
                break

        if matched_idx is not None:
            opponent_item = self.queue.pop(matched_idx)
            match_id = str(uuid.uuid4())[:8]
            duel_texts = PVP_DUEL_TEXTS.get(language, PVP_DUEL_TEXTS["ru"])
            match_text = random.choice(duel_texts)

            match = {
                "id": match_id,
                "text": match_text,
                "language": language,
                "players": [
                    {"ws": opponent_item["ws"], "user": opponent_item["user"]},
                    {"ws": ws, "user": user_info},
                ]
            }
            self.matches[match_id] = match

            # Send match confirmation to opponent
            await opponent_item["ws"].send_json({
                "type": "match_found",
                "match_id": match_id,
                "opponent": user_info,
                "text": match_text,
                "is_bot": False,
            })

            # Send match confirmation to current player
            await ws.send_json({
                "type": "match_found",
                "match_id": match_id,
                "opponent": opponent_item["user"],
                "text": match_text,
                "is_bot": False,
            })
        else:
            self.queue.append({
                "ws": ws,
                "user": user_info,
                "language": language,
            })

    async def leave_queue(self, ws: WebSocket):
        self.queue = [p for p in self.queue if p["ws"] != ws]

    async def broadcast_progress(self, ws: WebSocket, match_id: str, data: dict):
        match = self.matches.get(match_id)
        if not match:
            return
        for p in match["players"]:
            if p["ws"] != ws:
                try:
                    await p["ws"].send_json({
                        "type": "opponent_progress",
                        "progress": data.get("progress", 0),
                        "wpm": data.get("wpm", 0),
                        "char_index": data.get("char_index", 0),
                        "errors": data.get("errors", 0),
                        "done": data.get("done", False),
                    })
                except Exception:
                    pass

    async def broadcast_finish(self, ws: WebSocket, match_id: str, data: dict):
        match = self.matches.get(match_id)
        if not match:
            return
        for p in match["players"]:
            if p["ws"] != ws:
                try:
                    await p["ws"].send_json({
                        "type": "opponent_finished",
                        "wpm": data.get("wpm", 0),
                        "accuracy": data.get("accuracy", 100),
                        "time": data.get("time", 0),
                    })
                except Exception:
                    pass


pvp_manager = PVPManager()


@app.get("/api/pvp/texts")
def get_pvp_texts(language: str = "ru"):
    return PVP_DUEL_TEXTS.get(language, PVP_DUEL_TEXTS["ru"])


@app.websocket("/ws/pvp")
async def websocket_pvp_endpoint(websocket: WebSocket):
    await pvp_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "join_queue":
                user_info = data.get("user", {})
                language = data.get("language", "ru")
                await pvp_manager.join_queue(websocket, user_info, language)

            elif msg_type == "leave_queue":
                await pvp_manager.leave_queue(websocket)

            elif msg_type == "progress":
                match_id = data.get("match_id")
                if match_id:
                    await pvp_manager.broadcast_progress(websocket, match_id, data)

            elif msg_type == "finish":
                match_id = data.get("match_id")
                if match_id:
                    await pvp_manager.broadcast_finish(websocket, match_id, data)

    except WebSocketDisconnect:
        await pvp_manager.disconnect(websocket)
    except Exception:
        await pvp_manager.disconnect(websocket)
