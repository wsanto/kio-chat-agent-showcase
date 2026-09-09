"""
ANIMA Microservice - FastAPI Application
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from loguru import logger

from app.core.config import settings
from app.db import db, neo4j_db
from app.db.redis_cache import cache
from app.services import MistralClient, SynapseClient, MemoryService, AgentService
from app.services.beliefs import BeliefsService
from app.api.dependencies import set_global_services
from app.api.rate_limiter import limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")

    # Initialize databases
    try:
        await db.initialize()
        await neo4j_db.initialize()
        logger.info("All database connections initialized")
    except Exception as e:
        logger.error(f"Failed to initialize databases: {e}")
        raise

    # Initialize Redis cache (optional - graceful degradation)
    try:
        redis_connected = await cache.connect()
        if redis_connected:
            logger.info("Redis cache connected")
        else:
            logger.warning("Redis cache disabled - running without caching")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}. Continuing without cache.")

    # Initialize services
    try:
        # LLM Client
        llm_client = MistralClient(
            api_key=settings.MISTRAL_API_KEY
        )
        logger.info("Mistral LLM client initialized")

        # Emotion Client
        emotion_client = SynapseClient(
            api_key=settings.SYNAPSE_API_KEY,
            base_url=settings.SYNAPSE_BASE_URL
        )
        logger.info("SYNAPSE emotion client initialized")

        # Memory Service
        memory_service = MemoryService(db)
        logger.info("Memory service initialized")

        # Beliefs Service (for personalized AI responses)
        beliefs_service = BeliefsService(neo4j_db, llm_client)
        logger.info("Beliefs service initialized")

        # Agent Service (with beliefs integration)
        agent_service = AgentService(
            llm_client=llm_client,
            emotion_client=emotion_client,
            memory_service=memory_service,
            beliefs_service=beliefs_service
        )
        logger.info("Agent service initialized with beliefs integration")

        # Set global services for dependency injection
        set_global_services(llm_client, emotion_client, agent_service)
        logger.info("All services initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize services: {e}")
        raise

    yield

    # Shutdown
    logger.info("Shutting down application...")
    await llm_client.close()
    await emotion_client.close()
    await cache.disconnect()
    await db.close()
    await neo4j_db.close()
    logger.info("Application shutdown complete")


# OpenAPI tags metadata
tags_metadata = [
    {
        "name": "chat",
        "description": "Chat and messaging endpoints. Send messages to the AI agent, manage sessions, and retrieve conversation history.",
    },
    {
        "name": "chat-stream",
        "description": "Real-time streaming chat endpoints using Server-Sent Events (SSE) for live response streaming.",
    },
    {
        "name": "goals",
        "description": "Goal management endpoints. Create, track, and manage user goals with AI-powered planning.",
    },
    {
        "name": "beliefs",
        "description": "Core beliefs management. Store and retrieve user's core beliefs and values.",
    },
    {
        "name": "diagnostics",
        "description": "System diagnostics and health check endpoints for monitoring and debugging.",
    },
]

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## ANIMA Agent Kit Microservice

An emotion-aware AI agent with Goals, Beliefs, and Memory capabilities.

### Features

- **Emotion Detection**: Real-time emotion analysis using SYNAPSE API
- **Goal Tracking**: AI-powered goal planning and progress tracking
- **Core Beliefs**: Store and leverage user's beliefs for personalized responses
- **Memory System**: Dual-database architecture for short-term and long-term memory
- **Streaming Responses**: Real-time response streaming via SSE

### Architecture

- **PostgreSQL**: Short-term memory (sessions, messages)
- **Neo4j**: Long-term memory (goals, beliefs, knowledge graph)
- **Redis**: High-performance caching layer
- **Mistral AI**: LLM for intelligent responses

### Rate Limiting

API endpoints are rate-limited to ensure fair usage. Default: 100 requests/minute per user.
    """,
    lifespan=lifespan,
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    contact={
        "name": "ANIMA Team",
        "email": "support@example.com",
    },
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "ANIMA Microservice is operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    # Check database connections
    postgres_healthy = db._initialized
    neo4j_healthy = neo4j_db._initialized
    redis_healthy = cache.is_connected

    return {
        "status": "healthy" if (postgres_healthy and neo4j_healthy) else "degraded",
        "databases": {
            "postgres": "connected" if postgres_healthy else "disconnected",
            "neo4j": "connected" if neo4j_healthy else "disconnected"
        },
        "cache": {
            "redis": "connected" if redis_healthy else "disabled"
        },
        "version": settings.APP_VERSION
    }


# API Routes
from app.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
