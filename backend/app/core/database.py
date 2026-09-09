"""
Database dependency for FastAPI endpoints.
Provides a get_database function for dependency injection.
"""

from app.db import db


async def get_database():
    """Get the database instance for dependency injection.

    Returns:
        PostgresDatabase: The global database instance
    """
    return db
