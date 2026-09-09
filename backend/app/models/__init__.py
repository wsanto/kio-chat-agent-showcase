"""Pydantic models for API requests and responses."""

from .chat import (
    ChatMessageRequest,
    ChatMessageResponse,
    ChatMessage,
    ChatSession,
    ChatSessionWithMessages,
    CreateSessionRequest,
    ChatResponse,
    EmotionAnalysis,
    ChainOfThought,
)

from .goals import (
    Goal,
    GoalPhase,
    Task,
    Milestone,
    CreateGoalRequest,
    UpdateGoalProgressRequest,
    UpdateTaskStatusRequest,
    GenerateGoalPlanRequest,
    GoalListResponse,
    GoalCreatedResponse,
)

from .beliefs import (
    Belief,
    BeliefGraphNode,
    BeliefGraphEdge,
    BeliefGraph,
    CreateBeliefRequest,
    UpdateBeliefRequest,
    DetectBeliefsRequest,
    OnboardingQuestionResponse,
    ProcessOnboardingRequest,
    BeliefListResponse,
    BeliefCreatedResponse,
    DetectedBeliefsResponse,
    OnboardingProcessedResponse,
)

__all__ = [
    # Chat models
    "ChatMessageRequest",
    "ChatMessageResponse",
    "ChatMessage",
    "ChatSession",
    "ChatSessionWithMessages",
    "CreateSessionRequest",
    "ChatResponse",
    "EmotionAnalysis",
    "ChainOfThought",
    # Goals models
    "Goal",
    "GoalPhase",
    "Task",
    "Milestone",
    "CreateGoalRequest",
    "UpdateGoalProgressRequest",
    "UpdateTaskStatusRequest",
    "GenerateGoalPlanRequest",
    "GoalListResponse",
    "GoalCreatedResponse",
    # Beliefs models
    "Belief",
    "BeliefGraphNode",
    "BeliefGraphEdge",
    "BeliefGraph",
    "CreateBeliefRequest",
    "UpdateBeliefRequest",
    "DetectBeliefsRequest",
    "OnboardingQuestionResponse",
    "ProcessOnboardingRequest",
    "BeliefListResponse",
    "BeliefCreatedResponse",
    "DetectedBeliefsResponse",
    "OnboardingProcessedResponse",
]
