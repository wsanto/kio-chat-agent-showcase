"""
User profile service for ANIMA microservice.
Handles user profile, agent configuration, and preferences management.
"""

import json
from typing import Optional
from loguru import logger

from app.models.profile import (
    UserProfileResponse,
    UpdateProfileRequest,
    UpdateAgentConfigRequest,
    UpdatePreferencesRequest,
    AgentConfigModel,
    UserPreferencesModel,
)


class ProfileService:
    """Service for managing user profiles."""

    def __init__(self, db):
        self.db = db

    async def get_profile(self, user_id: str) -> Optional[UserProfileResponse]:
        """Get user profile by ID."""
        try:
            user = await self.db.fetch_one(
                """
                SELECT user_id, email, name, avatar_url,
                       is_active, is_verified, created_at, updated_at,
                       agent_config, preferences
                FROM users WHERE user_id = $1
                """,
                user_id
            )

            if not user:
                return None

            # Parse JSONB fields
            agent_config = None
            if user["agent_config"]:
                config_data = user["agent_config"] if isinstance(user["agent_config"], dict) else json.loads(user["agent_config"])
                agent_config = AgentConfigModel(**config_data)

            preferences = None
            if user["preferences"]:
                prefs_data = user["preferences"] if isinstance(user["preferences"], dict) else json.loads(user["preferences"])
                preferences = UserPreferencesModel(**prefs_data)

            return UserProfileResponse(
                user_id=user["user_id"],
                email=user["email"],
                name=user["name"],
                phone_number=None,  # Not in current schema, but can be added
                bio=None,  # Not in current schema
                pronouns=None,  # Not in current schema
                avatar_url=user["avatar_url"],
                is_active=user["is_active"],
                is_verified=user["is_verified"],
                created_at=user["created_at"].isoformat() if user["created_at"] else None,
                updated_at=user["updated_at"].isoformat() if user["updated_at"] else None,
                agent_config=agent_config,
                preferences=preferences,
            )
        except Exception as e:
            logger.error(f"Error getting profile: {e}")
            raise

    async def update_profile(
        self,
        user_id: str,
        data: UpdateProfileRequest
    ) -> Optional[UserProfileResponse]:
        """Update user profile fields."""
        try:
            # Build dynamic update query
            updates = []
            params = [user_id]
            param_idx = 2

            if data.name is not None:
                updates.append(f"name = ${param_idx}")
                params.append(data.name)
                param_idx += 1

            # Note: phone_number, bio, pronouns would need schema update
            # For now, we'll just update name

            if not updates:
                return await self.get_profile(user_id)

            updates.append("updated_at = NOW()")

            query = f"""
                UPDATE users
                SET {', '.join(updates)}
                WHERE user_id = $1
                RETURNING *
            """

            await self.db.execute(query, *params)

            logger.info(f"Profile updated for user: {user_id}")
            return await self.get_profile(user_id)
        except Exception as e:
            logger.error(f"Error updating profile: {e}")
            raise

    async def get_agent_config(self, user_id: str) -> Optional[AgentConfigModel]:
        """Get user's agent configuration."""
        try:
            result = await self.db.fetch_one(
                "SELECT agent_config FROM users WHERE user_id = $1",
                user_id
            )

            if not result or not result["agent_config"]:
                return AgentConfigModel()  # Return defaults

            config_data = result["agent_config"] if isinstance(result["agent_config"], dict) else json.loads(result["agent_config"])
            return AgentConfigModel(**config_data)
        except Exception as e:
            logger.error(f"Error getting agent config: {e}")
            raise

    async def update_agent_config(
        self,
        user_id: str,
        data: UpdateAgentConfigRequest
    ) -> AgentConfigModel:
        """Update user's agent configuration."""
        try:
            # Get current config
            current = await self.get_agent_config(user_id)
            current_dict = current.model_dump()

            # Merge with updates
            update_dict = data.model_dump(exclude_none=True)
            merged = {**current_dict, **update_dict}

            # Save to database
            await self.db.execute(
                """
                UPDATE users
                SET agent_config = $2, updated_at = NOW()
                WHERE user_id = $1
                """,
                user_id,
                json.dumps(merged)
            )

            logger.info(f"Agent config updated for user: {user_id}")
            return AgentConfigModel(**merged)
        except Exception as e:
            logger.error(f"Error updating agent config: {e}")
            raise

    async def get_preferences(self, user_id: str) -> Optional[UserPreferencesModel]:
        """Get user's preferences."""
        try:
            result = await self.db.fetch_one(
                "SELECT preferences FROM users WHERE user_id = $1",
                user_id
            )

            if not result or not result["preferences"]:
                return UserPreferencesModel()  # Return defaults

            prefs_data = result["preferences"] if isinstance(result["preferences"], dict) else json.loads(result["preferences"])
            return UserPreferencesModel(**prefs_data)
        except Exception as e:
            logger.error(f"Error getting preferences: {e}")
            raise

    async def update_preferences(
        self,
        user_id: str,
        data: UpdatePreferencesRequest
    ) -> UserPreferencesModel:
        """Update user's preferences."""
        try:
            # Get current preferences
            current = await self.get_preferences(user_id)
            current_dict = current.model_dump()

            # Merge with updates
            update_dict = data.model_dump(exclude_none=True)
            merged = {**current_dict, **update_dict}

            # Save to database
            await self.db.execute(
                """
                UPDATE users
                SET preferences = $2, updated_at = NOW()
                WHERE user_id = $1
                """,
                user_id,
                json.dumps(merged)
            )

            logger.info(f"Preferences updated for user: {user_id}")
            return UserPreferencesModel(**merged)
        except Exception as e:
            logger.error(f"Error updating preferences: {e}")
            raise

    async def update_avatar(self, user_id: str, avatar_url: str) -> str:
        """Update user's avatar URL."""
        try:
            await self.db.execute(
                """
                UPDATE users
                SET avatar_url = $2, updated_at = NOW()
                WHERE user_id = $1
                """,
                user_id,
                avatar_url
            )

            logger.info(f"Avatar updated for user: {user_id}")
            return avatar_url
        except Exception as e:
            logger.error(f"Error updating avatar: {e}")
            raise
