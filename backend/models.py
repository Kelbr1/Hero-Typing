from datetime import datetime
import json
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    level = Column(Integer, default=1)
    xp = Column(Integer, default=0)
    total_sessions = Column(Integer, default=0)
    total_time_sec = Column(Integer, default=0)
    max_wpm = Column(Float, default=0.0)
    max_cpm = Column(Float, default=0.0)
    max_combo = Column(Integer, default=0)

    problem_keys_json = Column(Text, default="{}")
    achievements_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)

    sessions = relationship(
        "TypingSession",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(TypingSession.created_at)"
    )

    def get_problem_keys(self) -> dict:
        try:
            return json.loads(self.problem_keys_json or "{}")
        except Exception:
            return {}

    def get_achievements(self) -> list:
        try:
            return json.loads(self.achievements_json or "[]")
        except Exception:
            return []


class TypingSession(Base):
    __tablename__ = "typing_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    mode = Column(String(50), nullable=False)  # words, sentences, code, symbols, weak_keys
    language = Column(String(20), nullable=False)  # ru, en
    wpm = Column(Float, nullable=False)
    cpm = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    errors_count = Column(Integer, default=0)
    max_combo = Column(Integer, default=0)
    xp_earned = Column(Integer, default=0)
    duration_sec = Column(Float, default=0.0)
    problem_keys_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="sessions")

    def get_problem_keys(self) -> dict:
        try:
            return json.loads(self.problem_keys_json or "{}")
        except Exception:
            return {}
