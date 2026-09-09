"""
PostgreSQL database connection and session management.
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import psycopg
from psycopg import AsyncConnection
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool
from loguru import logger

from app.core.config import settings


class PostgresDatabase:
    """PostgreSQL database connection manager."""

    def __init__(self):
        self.pool: AsyncConnectionPool | None = None
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize the database connection pool."""
        if self._initialized:
            logger.warning("PostgreSQL pool already initialized")
            return

        logger.info("Initializing PostgreSQL connection pool...")

        try:
            self.pool = AsyncConnectionPool(
                conninfo=settings.DATABASE_URL,
                min_size=settings.DB_POOL_MIN_SIZE,
                max_size=settings.DB_POOL_MAX_SIZE,
                timeout=settings.DB_POOL_TIMEOUT,
                max_lifetime=settings.DB_POOL_MAX_LIFETIME,
                kwargs={"row_factory": dict_row}
            )

            # Test connection
            async with self.pool.connection() as conn:
                await conn.execute("SELECT 1")

            self._initialized = True
            logger.info("PostgreSQL connection pool initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize PostgreSQL pool: {e}")
            raise

    async def close(self) -> None:
        """Close the database connection pool."""
        if self.pool:
            await self.pool.close()
            self._initialized = False
            logger.info("PostgreSQL connection pool closed")

    @asynccontextmanager
    async def connection(self) -> AsyncGenerator[AsyncConnection, None]:
        """Get a database connection from the pool."""
        if not self._initialized or not self.pool:
            raise RuntimeError("Database not initialized. Call initialize() first.")

        async with self.pool.connection() as conn:
            yield conn

    async def execute(self, query: str, params: tuple | dict | None = None):
        """Execute a query and return results."""
        async with self.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, params)
                if cur.description:
                    return await cur.fetchall()
                return None

    async def execute_one(self, query: str, params: tuple | dict | None = None):
        """Execute a query and return a single result."""
        async with self.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(query, params)
                if cur.description:
                    return await cur.fetchone()
                return None

    async def execute_many(self, query: str, params_list: list):
        """Execute a query with multiple parameter sets."""
        async with self.connection() as conn:
            async with conn.cursor() as cur:
                await cur.executemany(query, params_list)


# Global database instance
db = PostgresDatabase()


async def get_db() -> PostgresDatabase:
    """Dependency for getting database instance."""
    return db
