"""
Authentication service for ANIMA microservice.
Handles user registration, login, and token management.
"""

import uuid
from datetime import datetime, timedelta
from typing import Optional
import hashlib
import secrets

from jose import jwt, JWTError
from passlib.context import CryptContext
from loguru import logger

from app.core.config import settings


# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = settings.SECRET_KEY or "anima-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_DAYS = 7


class AuthService:
    """Service for handling authentication operations."""

    def __init__(self, db):
        self.db = db

    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt."""
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, user_id: str, expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = {
            "sub": user_id,
            "exp": expire,
            "type": "access"
        }
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    def create_refresh_token(self, user_id: str) -> tuple[str, str]:
        """Create a refresh token and its hash for storage."""
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        return token, token_hash

    def decode_token(self, token: str) -> Optional[dict]:
        """Decode and validate a JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError as e:
            logger.warning(f"Token decode error: {e}")
            return None

    async def register_user(
        self,
        email: str,
        password: str,
        name: Optional[str] = None
    ) -> Optional[dict]:
        """Register a new user."""
        try:
            # Check if user exists
            existing = await self.db.fetch_one(
                "SELECT user_id FROM users WHERE email = $1",
                email.lower()
            )
            if existing:
                logger.warning(f"Registration attempt for existing email: {email}")
                return None

            # Create user
            user_id = str(uuid.uuid4())
            password_hash = self.hash_password(password)
            
            await self.db.execute(
                """
                INSERT INTO users (user_id, email, password_hash, name, created_at, updated_at)
                VALUES ($1, $2, $3, $4, NOW(), NOW())
                """,
                user_id,
                email.lower(),
                password_hash,
                name
            )

            logger.info(f"User registered: {user_id}")
            
            # Return user data
            return await self.get_user_by_id(user_id)
        except Exception as e:
            logger.error(f"Registration error: {e}")
            raise

    async def authenticate_user(self, email: str, password: str) -> Optional[dict]:
        """Authenticate a user with email and password."""
        try:
            user = await self.db.fetch_one(
                """
                SELECT user_id, email, password_hash, name, avatar_url, 
                       is_active, is_verified, created_at, updated_at,
                       agent_config, preferences
                FROM users WHERE email = $1
                """,
                email.lower()
            )
            
            if not user:
                logger.warning(f"Login attempt for non-existent user: {email}")
                return None
            
            if not self.verify_password(password, user["password_hash"]):
                logger.warning(f"Invalid password for user: {email}")
                return None
            
            if not user["is_active"]:
                logger.warning(f"Login attempt for inactive user: {email}")
                return None

            # Update last login
            await self.db.execute(
                "UPDATE users SET last_login = NOW() WHERE user_id = $1",
                user["user_id"]
            )

            # Return user without password hash
            return {
                "user_id": user["user_id"],
                "email": user["email"],
                "name": user["name"],
                "avatar_url": user["avatar_url"],
                "is_active": user["is_active"],
                "is_verified": user["is_verified"],
                "created_at": user["created_at"].isoformat() if user["created_at"] else None,
                "updated_at": user["updated_at"].isoformat() if user["updated_at"] else None,
                "agent_config": user["agent_config"],
                "preferences": user["preferences"]
            }
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise

    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID."""
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
            
            return {
                "user_id": user["user_id"],
                "email": user["email"],
                "name": user["name"],
                "avatar_url": user["avatar_url"],
                "is_active": user["is_active"],
                "is_verified": user["is_verified"],
                "created_at": user["created_at"].isoformat() if user["created_at"] else None,
                "updated_at": user["updated_at"].isoformat() if user["updated_at"] else None,
                "agent_config": user["agent_config"],
                "preferences": user["preferences"]
            }
        except Exception as e:
            logger.error(f"Get user error: {e}")
            raise

    async def store_refresh_token(
        self,
        user_id: str,
        token_hash: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> None:
        """Store a refresh token hash in the database."""
        expires_at = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        await self.db.execute(
            """
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
            VALUES ($1, $2, $3, $4, $5)
            """,
            user_id,
            token_hash,
            expires_at,
            user_agent,
            ip_address
        )

    async def validate_refresh_token(self, token: str, user_id: str) -> bool:
        """Validate a refresh token."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        result = await self.db.fetch_one(
            """
            SELECT token_id FROM refresh_tokens
            WHERE user_id = $1 AND token_hash = $2 
            AND expires_at > NOW() AND revoked_at IS NULL
            """,
            user_id,
            token_hash
        )
        return result is not None

    async def revoke_refresh_token(self, token: str, user_id: str) -> None:
        """Revoke a refresh token."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        await self.db.execute(
            """
            UPDATE refresh_tokens SET revoked_at = NOW()
            WHERE user_id = $1 AND token_hash = $2
            """,
            user_id,
            token_hash
        )

    async def revoke_all_tokens(self, user_id: str) -> None:
        """Revoke all refresh tokens for a user."""
        await self.db.execute(
            "UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1",
            user_id
        )

    def generate_tokens(self, user_id: str) -> dict:
        """Generate both access and refresh tokens."""
        access_token = self.create_access_token(user_id)
        refresh_token, refresh_hash = self.create_refresh_token(user_id)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "refresh_hash": refresh_hash,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
