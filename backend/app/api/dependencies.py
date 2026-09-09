"""
FastAPI dependencies for dependency injection.
"""

from fastapi import Depends

from app.core.config import settings
from app.db import get_db, get_neo4j
from app.db.postgres import PostgresDatabase
from app.db.neo4j_client import Neo4jDatabase
from app.services import (
    MistralClient,
    SynapseClient,
    MemoryService,
    AgentService,
    GoalsService,
    BeliefsService
)


# Global service instances (initialized in main.py lifespan)
_llm_client: MistralClient | None = None
_emotion_client: SynapseClient | None = None
_agent_service: AgentService | None = None


def set_global_services(
    llm: MistralClient,
    emotion: SynapseClient,
    agent: AgentService
):
    """Set global service instances (called from main.py lifespan)."""
    global _llm_client, _emotion_client, _agent_service
    _llm_client = llm
    _emotion_client = emotion
    _agent_service = agent


async def get_llm_client() -> MistralClient:
    """Get LLM client instance."""
    if _llm_client is None:
        raise RuntimeError("LLM client not initialized")
    return _llm_client


async def get_emotion_client() -> SynapseClient:
    """Get emotion analysis client instance."""
    if _emotion_client is None:
        raise RuntimeError("Emotion client not initialized")
    return _emotion_client


async def get_memory_service(db: PostgresDatabase = Depends(get_db)) -> MemoryService:
    """Get memory service instance."""
    return MemoryService(db)


async def get_agent_service() -> AgentService:
    """Get agent service instance."""
    if _agent_service is None:
        raise RuntimeError("Agent service not initialized")
    return _agent_service


async def get_goals_service(neo4j: Neo4jDatabase = Depends(get_neo4j)) -> GoalsService:
    """Get goals service instance."""
    return GoalsService(neo4j)


async def get_beliefs_service(
    neo4j: Neo4jDatabase = Depends(get_neo4j),
    llm: MistralClient = Depends(get_llm_client)
) -> BeliefsService:
    """Get beliefs service instance."""
    return BeliefsService(neo4j, llm)
