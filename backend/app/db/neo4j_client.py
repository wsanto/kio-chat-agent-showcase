"""
Neo4j database connection and session management.
"""

from typing import Any, Dict, List, Optional
from contextlib import asynccontextmanager

from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession
from loguru import logger

from app.core.config import settings


class Neo4jDatabase:
    """Neo4j database connection manager."""

    def __init__(self):
        self.driver: AsyncDriver | None = None
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize the Neo4j driver."""
        if self._initialized:
            logger.warning("Neo4j driver already initialized")
            return

        logger.info("Initializing Neo4j driver...")

        try:
            self.driver = AsyncGraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
                database=settings.NEO4J_DATABASE,
                max_connection_pool_size=settings.NEO4J_POOL_SIZE,
                connection_timeout=settings.NEO4J_CONNECTION_TIMEOUT,
                max_transaction_retry_time=settings.NEO4J_MAX_RETRY_TIME
            )

            # Verify connectivity
            await self.driver.verify_connectivity()

            self._initialized = True
            logger.info("Neo4j driver initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Neo4j driver: {e}")
            raise

    async def close(self) -> None:
        """Close the Neo4j driver."""
        if self.driver:
            await self.driver.close()
            self._initialized = False
            logger.info("Neo4j driver closed")

    @asynccontextmanager
    async def session(self) -> AsyncSession:
        """Get a Neo4j session."""
        if not self._initialized or not self.driver:
            raise RuntimeError("Neo4j not initialized. Call initialize() first.")

        async with self.driver.session() as session:
            yield session

    async def execute_read(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Execute a read query and return results."""
        async with self.session() as session:
            result = await session.run(query, parameters or {})
            return [dict(record) async for record in result]

    async def execute_write(
        self,
        query: str,
        parameters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Execute a write query and return results."""
        async with self.session() as session:
            result = await session.run(query, parameters or {})
            return [dict(record) async for record in result]

    async def execute_write_transaction(
        self,
        queries: List[tuple[str, Dict[str, Any]]]
    ) -> None:
        """Execute multiple queries in a transaction."""
        async with self.session() as session:
            async with session.begin_transaction() as tx:
                for query, parameters in queries:
                    await tx.run(query, parameters)
                await tx.commit()


# Global Neo4j instance
neo4j_db = Neo4jDatabase()


async def get_neo4j() -> Neo4jDatabase:
    """Dependency for getting Neo4j instance."""
    return neo4j_db
