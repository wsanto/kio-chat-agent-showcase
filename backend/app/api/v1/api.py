"""
API v1 router configuration.
"""

from fastapi import APIRouter

from app.api.v1.endpoints import chat, goals, beliefs, chat_stream, diagnostics, auth, profile, emotions


api_router = APIRouter()

# Include auth endpoints (no prefix - uses /auth from router)
api_router.include_router(auth.router, tags=["auth"])

# Include user profile endpoints
api_router.include_router(profile.router, tags=["users"])

# Include chat endpoints
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

# Include streaming chat endpoints (WebSocket)
api_router.include_router(chat_stream.router, prefix="/chat", tags=["chat-stream"])

# Include goals endpoints
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])

# Include beliefs endpoints
api_router.include_router(beliefs.router, prefix="/beliefs", tags=["beliefs"])

# Diagnostic endpoints
api_router.include_router(diagnostics.router, prefix="/diagnostics", tags=["diagnostics"])

# Emotion analytics endpoints
api_router.include_router(emotions.router, prefix="/emotions", tags=["emotions"])
