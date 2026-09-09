"""
Pydantic models for user profile management.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class AgentConfigModel(BaseModel):
    """Agent configuration model."""
    agent_name: str = Field(default="Kio")
    agent_type: Literal["Companion", "Coach", "Mentor", "Friend"] = Field(default="Companion")
    use_case: str = Field(default="Mental Wellness")
    identity: str = Field(default="A wise mentor who guides with empathy and patience...")
    mission: str = Field(default="To help people find inner peace and emotional clarity...")
    origin: str = Field(default="Born from moments of silence where connection is needed...")
    beliefs: str = Field(default="Everyone deserves emotional support without judgment...")
    communication: str = Field(default="With warmth, gentle prompts, and active listening...")
    strengths: str = Field(default="Crisis support, pattern recognition, emotional validation...")


class UserPreferencesModel(BaseModel):
    """User preferences model."""
    theme: Literal["light", "dark", "system"] = Field(default="dark")
    notifications: bool = Field(default=True)
    language: str = Field(default="en")
    email_updates: bool = Field(default=True)


class UserProfileResponse(BaseModel):
    """User profile response model."""
    user_id: str
    email: str
    name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    pronouns: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    agent_config: Optional[AgentConfigModel] = None
    preferences: Optional[UserPreferencesModel] = None


class UpdateProfileRequest(BaseModel):
    """Update profile request model."""
    name: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    pronouns: Optional[str] = None


class UpdateAgentConfigRequest(BaseModel):
    """Update agent config request model."""
    agent_name: Optional[str] = None
    agent_type: Optional[Literal["Companion", "Coach", "Mentor", "Friend"]] = None
    use_case: Optional[str] = None
    identity: Optional[str] = None
    mission: Optional[str] = None
    origin: Optional[str] = None
    beliefs: Optional[str] = None
    communication: Optional[str] = None
    strengths: Optional[str] = None


class UpdatePreferencesRequest(BaseModel):
    """Update preferences request model."""
    theme: Optional[Literal["light", "dark", "system"]] = None
    notifications: Optional[bool] = None
    language: Optional[str] = None
    email_updates: Optional[bool] = None


class AvatarUploadResponse(BaseModel):
    """Avatar upload response model."""
    avatar_url: str
    message: str = "Avatar uploaded successfully"
