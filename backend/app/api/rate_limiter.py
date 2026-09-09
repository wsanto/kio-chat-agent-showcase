"""
Rate limiting middleware using SlowAPI with Redis backend.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request
from starlette.responses import JSONResponse
from loguru import logger

from app.core.config import settings


def get_identifier(request: Request) -> str:
    """Get rate limit identifier from request.

    Prioritizes user_id from query/body, falls back to IP.
    """
    # Try to get user_id from query params
    user_id = request.query_params.get("user_id")
    if user_id:
        return f"user:{user_id}"

    # Fall back to IP address
    return get_remote_address(request)


# Create limiter instance
limiter = Limiter(
    key_func=get_identifier,
    default_limits=[f"{settings.RATE_LIMIT_REQUESTS}/minute"],
    enabled=settings.RATE_LIMIT_ENABLED,
    storage_uri=settings.REDIS_URL if settings.CACHE_ENABLED else None
)


async def rate_limit_exceeded_handler(
    request: Request,
    exc: RateLimitExceeded
) -> JSONResponse:
    """Handle rate limit exceeded errors."""
    logger.warning(
        f"Rate limit exceeded for {get_identifier(request)}: {exc.detail}"
    )
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "message": "Too many requests. Please slow down.",
            "detail": str(exc.detail),
            "retry_after": exc.detail.split("per")[1].strip() if "per" in str(exc.detail) else "60 seconds"
        }
    )


# Common rate limit decorators
def chat_rate_limit():
    """Rate limit for chat endpoints (more generous)."""
    return limiter.limit("30/minute")


def auth_rate_limit():
    """Rate limit for auth endpoints (strict)."""
    return limiter.limit("10/minute")


def api_rate_limit():
    """Standard API rate limit."""
    return limiter.limit(f"{settings.RATE_LIMIT_REQUESTS}/minute")
