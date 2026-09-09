"""
Authentication API endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from typing import Optional
from loguru import logger

from app.models.auth import (
    LoginRequest,
    RegisterRequest,
    RefreshTokenRequest,
    AuthResponse,
    UserResponse,
    TokenResponse,
)
from app.services.auth import AuthService
from app.db.postgres import get_db, PostgresDatabase


router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(db: PostgresDatabase = Depends(get_db)) -> AuthService:
    """Get auth service instance."""
    return AuthService(db)


async def get_current_user(
    authorization: Optional[str] = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
) -> dict:
    """Dependency to get current authenticated user."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.split(" ")[1]
    payload = auth_service.decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    user_id = payload.get("sub")
    user = await auth_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    req: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new user."""
    try:
        user = await auth_service.register_user(
            email=request.email,
            password=request.password,
            name=request.name
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        
        # Generate tokens
        tokens = auth_service.generate_tokens(user["user_id"])
        
        # Store refresh token
        await auth_service.store_refresh_token(
            user_id=user["user_id"],
            token_hash=tokens["refresh_hash"],
            user_agent=req.headers.get("user-agent"),
            ip_address=req.client.host if req.client else None
        )
        
        logger.info(f"User registered successfully: {user['user_id']}")
        
        return AuthResponse(
            user=UserResponse(**user),
            tokens=TokenResponse(
                access_token=tokens["access_token"],
                refresh_token=tokens["refresh_token"],
                token_type=tokens["token_type"],
                expires_in=tokens["expires_in"]
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    req: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Login with email and password."""
    try:
        user = await auth_service.authenticate_user(
            email=request.email,
            password=request.password
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Generate tokens
        tokens = auth_service.generate_tokens(user["user_id"])
        
        # Store refresh token
        await auth_service.store_refresh_token(
            user_id=user["user_id"],
            token_hash=tokens["refresh_hash"],
            user_agent=req.headers.get("user-agent"),
            ip_address=req.client.host if req.client else None
        )
        
        logger.info(f"User logged in: {user['user_id']}")
        
        return AuthResponse(
            user=UserResponse(**user),
            tokens=TokenResponse(
                access_token=tokens["access_token"],
                refresh_token=tokens["refresh_token"],
                token_type=tokens["token_type"],
                expires_in=tokens["expires_in"]
            )
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    current_user: dict = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Logout and revoke all tokens."""
    try:
        await auth_service.revoke_all_tokens(current_user["user_id"])
        logger.info(f"User logged out: {current_user['user_id']}")
    except Exception as e:
        logger.error(f"Logout error: {e}")
        # Don't raise - logout should succeed even if token revocation fails


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    req: Request,
    authorization: Optional[str] = Header(None),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Refresh access token using refresh token."""
    try:
        # Decode expired access token to get user_id
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing authorization header"
            )
        
        token = authorization.split(" ")[1]
        # Decode without verifying expiration
        payload = auth_service.decode_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        user_id = payload.get("sub")
        
        # Validate refresh token
        is_valid = await auth_service.validate_refresh_token(
            request.refresh_token,
            user_id
        )
        
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Revoke old refresh token
        await auth_service.revoke_refresh_token(request.refresh_token, user_id)
        
        # Generate new tokens
        tokens = auth_service.generate_tokens(user_id)
        
        # Store new refresh token
        await auth_service.store_refresh_token(
            user_id=user_id,
            token_hash=tokens["refresh_hash"],
            user_agent=req.headers.get("user-agent"),
            ip_address=req.client.host if req.client else None
        )
        
        return TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type=tokens["token_type"],
            expires_in=tokens["expires_in"]
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """Get current authenticated user info."""
    return UserResponse(**current_user)
