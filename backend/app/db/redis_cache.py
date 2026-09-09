"""
Redis cache client for session and context caching.
Provides high-performance in-memory caching layer.
"""

import json
from typing import Any, Optional, Dict, List
from datetime import timedelta

import redis.asyncio as redis
from loguru import logger

from app.core.config import settings


class RedisCache:
    """Async Redis cache client with automatic serialization."""

    def __init__(self, url: str = None):
        """Initialize Redis connection.

        Args:
            url: Redis connection URL
        """
        self.url = url or settings.REDIS_URL
        self.client: Optional[redis.Redis] = None
        self._enabled = settings.CACHE_ENABLED

    async def connect(self) -> bool:
        """Establish connection to Redis.

        Returns:
            True if connected successfully, False otherwise
        """
        if not self._enabled:
            logger.info("Redis caching is disabled")
            return False

        try:
            self.client = redis.from_url(
                self.url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # Test connection
            await self.client.ping()
            logger.info(f"Connected to Redis at {self.url}")
            return True
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            self._enabled = False
            self.client = None
            return False

    async def disconnect(self) -> None:
        """Close Redis connection."""
        if self.client:
            await self.client.close()
            logger.info("Redis connection closed")

    @property
    def is_connected(self) -> bool:
        """Check if Redis is connected and enabled."""
        return self._enabled and self.client is not None

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache.

        Args:
            key: Cache key

        Returns:
            Cached value or None
        """
        if not self.is_connected:
            return None

        try:
            value = await self.client.get(key)
            if value:
                return json.loads(value)
            return None
        except Exception as e:
            logger.warning(f"Redis GET error for key {key}: {e}")
            return None

    async def set(
        self,
        key: str,
        value: Any,
        ttl: int = None
    ) -> bool:
        """Set value in cache.

        Args:
            key: Cache key
            value: Value to cache (will be JSON serialized)
            ttl: Time-to-live in seconds

        Returns:
            True if successful
        """
        if not self.is_connected:
            return False

        try:
            serialized = json.dumps(value, default=str)
            if ttl:
                await self.client.setex(key, ttl, serialized)
            else:
                await self.client.set(key, serialized)
            return True
        except Exception as e:
            logger.warning(f"Redis SET error for key {key}: {e}")
            return False

    async def delete(self, key: str) -> bool:
        """Delete key from cache.

        Args:
            key: Cache key

        Returns:
            True if deleted
        """
        if not self.is_connected:
            return False

        try:
            await self.client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Redis DELETE error for key {key}: {e}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching pattern.

        Args:
            pattern: Key pattern (e.g., "session:*")

        Returns:
            Number of keys deleted
        """
        if not self.is_connected:
            return 0

        try:
            keys = []
            async for key in self.client.scan_iter(match=pattern):
                keys.append(key)

            if keys:
                await self.client.delete(*keys)
            return len(keys)
        except Exception as e:
            logger.warning(f"Redis DELETE_PATTERN error for {pattern}: {e}")
            return 0

    async def exists(self, key: str) -> bool:
        """Check if key exists.

        Args:
            key: Cache key

        Returns:
            True if exists
        """
        if not self.is_connected:
            return False

        try:
            return await self.client.exists(key) > 0
        except Exception as e:
            logger.warning(f"Redis EXISTS error for key {key}: {e}")
            return False

    async def incr(self, key: str, ttl: int = None) -> Optional[int]:
        """Increment counter.

        Args:
            key: Counter key
            ttl: Time-to-live for new keys

        Returns:
            New counter value
        """
        if not self.is_connected:
            return None

        try:
            value = await self.client.incr(key)
            if ttl and value == 1:
                await self.client.expire(key, ttl)
            return value
        except Exception as e:
            logger.warning(f"Redis INCR error for key {key}: {e}")
            return None

    # Session caching methods
    async def cache_session(self, session_id: str, session_data: Dict) -> bool:
        """Cache session data.

        Args:
            session_id: Session identifier
            session_data: Session data dict

        Returns:
            True if cached
        """
        key = f"session:{session_id}"
        return await self.set(key, session_data, settings.CACHE_SESSION_TTL)

    async def get_cached_session(self, session_id: str) -> Optional[Dict]:
        """Get cached session.

        Args:
            session_id: Session identifier

        Returns:
            Session data or None
        """
        key = f"session:{session_id}"
        return await self.get(key)

    async def invalidate_session(self, session_id: str) -> bool:
        """Invalidate cached session.

        Args:
            session_id: Session identifier

        Returns:
            True if invalidated
        """
        key = f"session:{session_id}"
        return await self.delete(key)

    # User context caching
    async def cache_user_context(
        self,
        user_id: str,
        context: Dict[str, Any]
    ) -> bool:
        """Cache user context (goals, beliefs, emotions).

        Args:
            user_id: User identifier
            context: Context data

        Returns:
            True if cached
        """
        key = f"user_context:{user_id}"
        return await self.set(key, context, settings.CACHE_USER_CONTEXT_TTL)

    async def get_user_context(self, user_id: str) -> Optional[Dict]:
        """Get cached user context.

        Args:
            user_id: User identifier

        Returns:
            Context data or None
        """
        key = f"user_context:{user_id}"
        return await self.get(key)

    async def invalidate_user_context(self, user_id: str) -> bool:
        """Invalidate user context cache.

        Args:
            user_id: User identifier

        Returns:
            True if invalidated
        """
        key = f"user_context:{user_id}"
        return await self.delete(key)

    # Messages caching
    async def cache_messages(
        self,
        session_id: str,
        messages: List[Dict]
    ) -> bool:
        """Cache session messages.

        Args:
            session_id: Session identifier
            messages: List of message dicts

        Returns:
            True if cached
        """
        key = f"messages:{session_id}"
        return await self.set(key, messages, settings.CACHE_SESSION_TTL)

    async def get_cached_messages(self, session_id: str) -> Optional[List[Dict]]:
        """Get cached messages.

        Args:
            session_id: Session identifier

        Returns:
            List of messages or None
        """
        key = f"messages:{session_id}"
        return await self.get(key)

    async def invalidate_messages(self, session_id: str) -> bool:
        """Invalidate message cache for session.

        Args:
            session_id: Session identifier

        Returns:
            True if invalidated
        """
        key = f"messages:{session_id}"
        return await self.delete(key)

    # Rate limiting helpers
    async def check_rate_limit(
        self,
        identifier: str,
        limit: int = None,
        window: int = None
    ) -> tuple[bool, int]:
        """Check if rate limit exceeded.

        Args:
            identifier: Rate limit identifier (e.g., user_id or IP)
            limit: Max requests per window
            window: Window size in seconds

        Returns:
            Tuple of (is_allowed, remaining_requests)
        """
        if not self.is_connected:
            return True, limit or settings.RATE_LIMIT_REQUESTS

        limit = limit or settings.RATE_LIMIT_REQUESTS
        window = window or settings.RATE_LIMIT_WINDOW
        key = f"ratelimit:{identifier}"

        try:
            current = await self.incr(key, window)
            if current is None:
                return True, limit

            remaining = max(0, limit - current)
            return current <= limit, remaining
        except Exception as e:
            logger.warning(f"Rate limit check error: {e}")
            return True, limit


# Global cache instance
cache = RedisCache()
