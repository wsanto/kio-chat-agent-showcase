"""
Pydantic models for authentication.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str = Field(..., min_length=6)


class RegisterRequest(BaseModel):
    """Registration request model."""
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: Optional[str] = None


class TokenResponse(BaseModel):
    """Token response model."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    """Refresh token request model."""
    refresh_token: str


class UserResponse(BaseModel):
    """User response model."""
    user_id: str
    email: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    agent_config: Optional[dict] = None
    preferences: Optional[dict] = None


class AuthResponse(BaseModel):
    """Authentication response model."""
    user: UserResponse
    tokens: TokenResponse


class PasswordChangeRequest(BaseModel):
    """Password change request model."""
    current_password: str
    new_password: str = Field(..., min_length=6)
