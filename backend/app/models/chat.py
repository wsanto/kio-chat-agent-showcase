"""
Chat-related Pydantic models for request/response validation.
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


# ═══════════════════════════════════════════════════════════════
# Request Models
# ═══════════════════════════════════════════════════════════════

class ChatMessageRequest(BaseModel):
    """Request model for sending a chat message."""

    user_id: str = Field(..., description="User identifier")
    session_id: Optional[str] = Field(None, description="Session ID (creates new if not provided)")
    message: str = Field(..., min_length=1, description="User message content")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context")


class CreateSessionRequest(BaseModel):
    """Request model for creating a new chat session."""

    user_id: str = Field(..., description="User identifier")
    context_id: Optional[str] = Field(None, description="Context identifier")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Session metadata")


# ═══════════════════════════════════════════════════════════════
# Response Models
# ═══════════════════════════════════════════════════════════════

class EmotionAnalysis(BaseModel):
    """Emotion analysis from SYNAPSE."""

    primary_emotion: str
    confidence: float
    valence: Optional[float] = None
    arousal: Optional[float] = None
    dominance: Optional[float] = None
    emotions: List[Dict[str, Any]] = Field(default_factory=list)


class ChainOfThought(BaseModel):
    """Chain of thought reasoning steps."""

    steps: List[str] = Field(default_factory=list)
    emotion_analysis: Optional[str] = None
    context_used: List[str] = Field(default_factory=list)
    response_strategy: Optional[str] = None


class ChatMessageResponse(BaseModel):
    """Response model for chat message."""

    message_id: str
    session_id: str
    user_id: str
    role: str
    content: str
    emotion: Optional[str] = None

    # Chain of thought
    reasoning: Optional[Dict[str, Any]] = None
    chain_of_thought: Optional[ChainOfThought] = None
    trajectory_mood: Optional[str] = None

    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessage(BaseModel):
    """Chat message model."""

    message_id: str
    session_id: str
    user_id: str
    role: str
    content: str
    emotion: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    class Config:
        from_attributes = True


class ChatSession(BaseModel):
    """Chat session model."""

    session_id: str
    user_id: str
    context_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True


class ChatSessionWithMessages(ChatSession):
    """Chat session with recent messages."""

    messages: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    """Complete chat response with user message and agent response."""

    user_message: ChatMessageResponse
    agent_response: ChatMessageResponse
    emotion_analysis: Optional[EmotionAnalysis] = None
