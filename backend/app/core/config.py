"""
Configuration management for ANIMA Microservice.
"""

from typing import List, Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "anima-microservice"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    PORT: int = 8000  # Railway sets this via environment variable

    # API
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] | str = "http://localhost:3000"

    # PostgreSQL (Short-Term Memory)
    DATABASE_URL: str = Field(
        default="postgresql://anima:anima_secure_pass@localhost:5432/anima_stm"
    )

    # Neo4j (Long-Term Memory)
    NEO4J_URI: str = "bolt://localhost:7687"
    NEO4J_USERNAME: str = "neo4j"
    NEO4J_PASSWORD: str = "anima123"
    NEO4J_DATABASE: str = "neo4j"

    # LLM Provider
    LLM_PROVIDER: str = "mistral"
    MISTRAL_API_KEY: Optional[str] = None
    MISTRAL_MODEL: str = "mistral-large-latest"
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    ANTHROPIC_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-3-opus-20240229"

    # SYNAPSE Emotion API
    SYNAPSE_API_KEY: Optional[str] = None
    SYNAPSE_BASE_URL: str = "https://api.kaikostudios.xyz"

    # Embedding Provider
    VOYAGE_API_KEY: Optional[str] = None
    VOYAGE_MODEL: str = "voyage-2"
    EMBEDDING_DIMENSION: int = 1024

    # Web Search
    TAVILY_API_KEY: Optional[str] = None

    # Security
    SECRET_KEY: str = "your-secret-key-min-32-chars-long-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Memory Configuration
    MEMORY_RETENTION_DAYS: int = 90
    CONVERSATION_RETENTION_DAYS: int = 30
    MAX_CONTEXT_TOKENS: int = 80000
    MAX_RESPONSE_TOKENS: int = 10000

    # Agent Configuration
    DEFAULT_AGENT_NAME: str = "anima"
    ENABLE_BELIEFS: bool = True
    ENABLE_GOALS: bool = True
    ENABLE_WONDER: bool = True
    ENABLE_CHAIN_OF_THOUGHT: bool = True

    # Emotional Response Enhancement Feature Flags
    ENABLE_ENHANCED_PERSONA: bool = False  # Rich backstory and personality traits
    ENABLE_SPEECH_PATTERNS: bool = False  # Natural speech patterns library
    SPEECH_PATTERN_COUNT: int = 3  # Patterns per category to inject
    SPEECH_PATTERN_INTENSITY_SCALE: bool = True  # Scale by emotion intensity

    # Redis Cache Configuration
    REDIS_URL: str = "redis://localhost:6379/0"
    CACHE_SESSION_TTL: int = 3600  # 1 hour
    CACHE_USER_CONTEXT_TTL: int = 300  # 5 minutes
    CACHE_ENABLED: bool = True

    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100  # requests per window
    RATE_LIMIT_WINDOW: int = 60  # window in seconds

    # Database Connection Pooling
    DB_POOL_MIN_SIZE: int = 2
    DB_POOL_MAX_SIZE: int = 20
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_MAX_LIFETIME: int = 3600  # 1 hour
    NEO4J_POOL_SIZE: int = 50
    NEO4J_CONNECTION_TIMEOUT: int = 30
    NEO4J_MAX_RETRY_TIME: int = 15

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str) -> List[str]:
        """Parse comma-separated CORS origins."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        """Get CORS origins as a list."""
        origins = self.CORS_ORIGINS
        if isinstance(origins, str):
            return [origin.strip() for origin in origins.split(",")]
        return origins


# Global settings instance
settings = Settings()
