"""
User profile API endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from loguru import logger

from app.models.profile import (
    UserProfileResponse,
    UpdateProfileRequest,
    UpdateAgentConfigRequest,
    UpdatePreferencesRequest,
    AgentConfigModel,
    UserPreferencesModel,
    AvatarUploadResponse,
)
from app.services.profile import ProfileService
from app.services.auth import AuthService
from app.core.database import get_database


router = APIRouter(prefix="/users")


async def get_current_user_id(authorization: str = None) -> str:
    """Extract user ID from JWT token."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.replace("Bearer ", "")

    try:
        db = await get_database()
        auth_service = AuthService(db)
        payload = auth_service.decode_token(token)

        if not payload:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        return payload.get("sub")
    except Exception as e:
        logger.error(f"Token validation error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.get("/profile", response_model=UserProfileResponse)
async def get_profile(
    authorization: str = None,
):
    """Get current user's profile."""
    from fastapi import Header
    # Re-import to use as dependency
    pass


@router.get("/profile")
async def get_user_profile(authorization: str | None = None):
    """Get current user's profile."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = await get_current_user_id(authorization)

    try:
        db = await get_database()
        profile_service = ProfileService(db)
        profile = await profile_service.get_profile(user_id)

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")


@router.patch("/profile")
async def update_user_profile(
    data: UpdateProfileRequest,
    authorization: str | None = None,
):
    """Update current user's profile."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = await get_current_user_id(authorization)

    try:
        db = await get_database()
        profile_service = ProfileService(db)
        profile = await profile_service.update_profile(user_id, data)

        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")

        return profile
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


@router.get("/agent-config")
async def get_agent_config(authorization: str | None = None):
    """Get current user's agent configuration."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = await get_current_user_id(authorization)

    try:
        db = await get_database()
        profile_service = ProfileService(db)
        config = await profile_service.get_agent_config(user_id)

        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting agent config: {e}")
        raise HTTPException(status_code=500, detail="Failed to get agent config")


@router.patch("/agent-config")
async def update_agent_config(
    data: UpdateAgentConfigRequest,
    authorization: str | None = None,
):
    """Update current user's agent configuration."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = await get_current_user_id(authorization)

    try:
        db = await get_database()
        profile_service = ProfileService(db)
        config = await profile_service.update_agent_config(user_id, data)

        return config
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating agent config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update agent config")


@router.get("/preferences")
async def get_preferences(authorization: str | None = None):
    """Get current user's preferences."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = await get_current_user_id(authorization)

    try:
        db = await get_database()
        profile_service = ProfileService(db)
        prefs = await profile_service.get_preferences(user_id)

        return prefs
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to get preferences")


@router.patch("/preferences")
async def update_preferences(
    data: UpdatePreferencesRequest,
    authorization: str | None = None,
):
    """Update current user's preferences."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = await get_current_user_id(authorization)

    try:
        db = await get_database()
        profile_service = ProfileService(db)
        prefs = await profile_service.update_preferences(user_id, data)

        return prefs
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating preferences: {e}")
        raise HTTPException(status_code=500, detail="Failed to update preferences")


@router.post("/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    authorization: str | None = None,
):
    """Upload user avatar."""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    user_id = await get_current_user_id(authorization)

    try:
        # For now, we'll store a placeholder URL
        # In production, this would upload to S3/Cloudinary/etc.
        # and return the actual URL
        avatar_url = f"/avatars/{user_id}/{avatar.filename}"

        db = await get_database()
        profile_service = ProfileService(db)
        await profile_service.update_avatar(user_id, avatar_url)

        return AvatarUploadResponse(avatar_url=avatar_url)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading avatar: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload avatar")
