"""
Chat API endpoints.
"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from loguru import logger

from app.models.chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatSession,
    ChatSessionWithMessages,
    CreateSessionRequest,
    ChatResponse,
    ChainOfThought,
)
from app.services import AgentService
from app.api.dependencies import get_agent_service


router = APIRouter()


@router.post("/message", response_model=ChatResponse, summary="Send a chat message")
async def send_message(
    request: ChatMessageRequest,
    agent: AgentService = Depends(get_agent_service)
):
    """
    Send a message to the AI agent and get a response.

    This endpoint:
    1. Analyzes the user's emotion using SYNAPSE
    2. Stores the user's message
    3. Generates an AI response using Mistral
    4. Tracks chain of thought reasoning
    5. Returns both messages with emotion analysis

    Args:
        request: Chat message request with user_id, message, and optional session_id

    Returns:
        ChatResponse with user message, agent response, and emotion analysis
    """
    try:
        logger.info(f"Processing chat message from user {request.user_id}")

        # Call agent service
        result = await agent.chat(
            user_id=request.user_id,
            message=request.message,
            session_id=request.session_id,
            context=request.context
        )

        # Build response
        user_msg_data = result["user_message"]
        agent_msg_data = result["agent_response"]
        emotion = result["emotion_analysis"]

        # Build chain of thought from agent response
        chain_of_thought = None
        if agent_msg_data.get("chain_of_thought"):
            cot_data = agent_msg_data["chain_of_thought"]
            chain_of_thought = ChainOfThought(
                steps=cot_data.get("steps", []),
                emotion_analysis=cot_data.get("emotion_analysis"),
                context_used=cot_data.get("context_used", []),
                response_strategy=cot_data.get("response_strategy")
            )

        response = ChatResponse(
            user_message=ChatMessageResponse(
                message_id=user_msg_data["message_id"],
                session_id=user_msg_data["session_id"],
                user_id=user_msg_data["user_id"],
                role=user_msg_data["role"],
                content=user_msg_data["content"],
                emotion=user_msg_data.get("emotion"),
                metadata=user_msg_data.get("metadata", {}),
                created_at=user_msg_data["created_at"]
            ),
            agent_response=ChatMessageResponse(
                message_id=agent_msg_data["message_id"],
                session_id=agent_msg_data["session_id"],
                user_id=agent_msg_data["user_id"],
                role=agent_msg_data["role"],
                content=agent_msg_data["content"],
                reasoning=agent_msg_data.get("reasoning"),
                chain_of_thought=chain_of_thought,
                trajectory_mood=agent_msg_data.get("trajectory_mood"),
                metadata=agent_msg_data.get("metadata", {}),
                created_at=agent_msg_data["created_at"]
            ),
            emotion_analysis=emotion
        )

        logger.info(f"Successfully processed message for session {result['session_id']}")
        return response

    except Exception as e:
        import traceback
        logger.error(f"Error processing chat message: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sessions", response_model=ChatSession, summary="Create a new chat session")
async def create_session(
    request: CreateSessionRequest,
    agent: AgentService = Depends(get_agent_service)
):
    """
    Create a new chat session for a user.

    Args:
        request: Session creation request with user_id and optional metadata

    Returns:
        ChatSession object with session details
    """
    try:
        logger.info(f"Creating new session for user {request.user_id}")

        session_id = await agent.memory.create_session(
            user_id=request.user_id,
            context_id=request.context_id,
            metadata=request.metadata
        )

        session = await agent.memory.get_session(session_id)

        if not session:
            raise HTTPException(status_code=500, detail="Failed to create session")

        logger.info(f"Created session {session_id}")
        return session

    except Exception as e:
        logger.error(f"Error creating session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{user_id}", response_model=List[ChatSession], summary="Get user's chat sessions")
async def get_user_sessions(
    user_id: str,
    limit: int = 10,
    include_inactive: bool = False,
    agent: AgentService = Depends(get_agent_service)
):
    """
    Get all chat sessions for a user.

    Args:
        user_id: User identifier
        limit: Maximum number of sessions to return (default: 10)
        include_inactive: Include inactive sessions (default: False)

    Returns:
        List of ChatSession objects
    """
    try:
        logger.info(f"Fetching sessions for user {user_id}")

        sessions = await agent.memory.get_user_sessions(
            user_id=user_id,
            limit=limit,
            include_inactive=include_inactive
        )

        logger.info(f"Found {len(sessions)} sessions for user {user_id}")
        return sessions

    except Exception as e:
        logger.error(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse], summary="Get session messages")
async def get_session_messages(
    session_id: str,
    limit: int = 50,
    agent: AgentService = Depends(get_agent_service)
):
    """
    Get all messages in a chat session.

    Args:
        session_id: Session identifier
        limit: Maximum number of messages to return (default: 50)

    Returns:
        List of ChatMessageResponse objects with full message details
    """
    try:
        logger.info(f"Fetching messages for session {session_id}")

        # Verify session exists
        session = await agent.memory.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

        messages = await agent.memory.get_messages(session_id, limit=limit)

        # For now, return simplified responses
        # In production, you'd want to fetch full message data including reasoning
        response_messages = [
            ChatMessageResponse(
                message_id=msg.message_id,
                session_id=msg.session_id,
                user_id=msg.user_id,
                role=msg.role,
                content=msg.content,
                emotion=msg.emotion,
                metadata=msg.metadata,
                created_at=msg.created_at
            )
            for msg in messages
        ]

        logger.info(f"Found {len(messages)} messages in session {session_id}")
        return response_messages

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/sessions/{session_id}", response_model=ChatSessionWithMessages, summary="Get session with messages")
async def get_session_with_messages(
    session_id: str,
    message_limit: int = 20,
    agent: AgentService = Depends(get_agent_service)
):
    """
    Get a chat session with its recent messages.

    Args:
        session_id: Session identifier
        message_limit: Maximum number of messages to include (default: 20)

    Returns:
        ChatSessionWithMessages object including session details and messages
    """
    try:
        logger.info(f"Fetching session {session_id} with messages")

        # Get session
        session = await agent.memory.get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail=f"Session {session_id} not found")

        # Get messages
        messages = await agent.memory.get_messages(session_id, limit=message_limit)

        # Build response
        session_with_messages = ChatSessionWithMessages(
            **session.model_dump(),
            messages=messages
        )

        logger.info(f"Retrieved session {session_id} with {len(messages)} messages")
        return session_with_messages

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching session with messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))
