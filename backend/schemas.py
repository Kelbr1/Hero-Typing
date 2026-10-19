from datetime import datetime
from typing import Optional, Dict, List, Any
from pydantic import BaseModel, Field, field_validator


class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        v = v.strip().lower()
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError("Некорректный формат email")
        return v



class UserLoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str


class SessionCreateRequest(BaseModel):
    mode: str = "words"  # words, sentences, code, symbols, weak_keys
    language: str = "ru"  # ru, en
    wpm: float = 0.0
    cpm: float = 0.0
    accuracy: float = 100.0
    errors_count: int = 0
    max_combo: int = 0
    xp_earned: Optional[int] = None
    duration_sec: float = 0.0
    problem_keys: Optional[Dict[str, int]] = None
    chars_count: Optional[int] = None


class SessionResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    mode: str
    language: str
    wpm: float
    cpm: float
    accuracy: float
    errors_count: int
    max_combo: int
    xp_earned: int
    duration_sec: float
    problem_keys: Dict[str, int]
    created_at: datetime

    class Config:
        from_attributes = True


class AchievementInfo(BaseModel):
    id: str
    title: str
    description: str
    icon: str


class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    level: int
    xp: int
    total_sessions: int
    total_time_sec: int
    max_wpm: float
    max_cpm: float
    max_combo: int
    problem_keys: Dict[str, int]
    achievements: List[str]
    achievements_details: Optional[List[AchievementInfo]] = None
    created_at: datetime
    sessions: Optional[List[SessionResponse]] = None

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class SessionCreateResponse(BaseModel):
    session: SessionResponse
    user: Optional[UserProfileResponse] = None
    new_achievements: List[AchievementInfo] = []


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    level: int
    wpm: float
    cpm: float
    accuracy: float
    xp: int
    sessions_count: int
