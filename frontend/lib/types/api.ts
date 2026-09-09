/**
 * TypeScript types for ANIMA Microservice API
 * Matches the Pydantic models from the FastAPI backend
 */

// ============================================================================
// Chat Types
// ============================================================================

export interface ChatMessage {
  message_id: string
  session_id: string
  user_id: string
  role: "user" | "assistant" | "system"
  content: string
  emotion?: string | null
  metadata: Record<string, any>
  created_at: string
}

export interface ChatMessageResponse extends ChatMessage {
  reasoning?: {
    emotion_analysis?: {
      primary_emotion: string
      confidence: number
      full_analysis?: Record<string, any>
    }
    context_used?: {
      conversation_length: number
      session_id: string
    }
    response_strategy?: string
  } | null
  chain_of_thought?: ChainOfThought | null
  trajectory_mood?: "improving" | "declining" | "stable" | null
}

export interface ChainOfThought {
  steps: string[]
  emotion_analysis?: string | null
  context_used: string[]
  response_strategy?: string | null
  llm_reasoning?: string | null
}

export interface EmotionAnalysis {
  primary_emotion: string
  confidence: number
  valence?: number | null
  arousal?: number | null
  dominance?: number | null
  emotions?: any[]
}

export interface ChatResponse {
  user_message: ChatMessageResponse
  agent_response: ChatMessageResponse
  emotion_analysis?: EmotionAnalysis | null
}

export interface ChatSession {
  session_id: string
  user_id: string
  context_id: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[]
}

// ============================================================================
// Request Types
// ============================================================================

export interface SendMessageRequest {
  user_id: string
  message: string
  session_id?: string | null
  context?: Record<string, any>
}

export interface CreateSessionRequest {
  user_id: string
  context_id?: string | null
  metadata?: Record<string, any>
}

// ============================================================================
// Goals Types
// ============================================================================

export interface Goal {
  goal_id: string
  user_id: string
  goal_statement: string
  category: string
  priority: "high" | "medium" | "low"
  status: "active" | "completed" | "paused" | "cancelled"
  progress: number // 0-100
  target_date?: string | null
  phases: GoalPhase[]
  milestones: Milestone[]
  created_at: string
  updated_at: string
}

export interface GoalPhase {
  phase_id: string
  phase_name: string
  description: string
  order: number
  status: "not_started" | "in_progress" | "completed"
  tasks: Task[]
}

export interface Task {
  task_id: string
  description: string
  status: "not_started" | "in_progress" | "completed" | "blocked"
  due_date?: string | null
}

export interface Milestone {
  milestone_id: string
  title: string
  description: string
  target_date: string
  achieved: boolean
  achieved_date?: string | null
}

// ============================================================================
// Beliefs Types
// ============================================================================

export interface Belief {
  belief_id: string
  user_id: string
  category: string
  belief_statement: string
  strength: number // 0-1
  origin_context?: string | null
  confirmed: boolean
  created_at: string
  updated_at: string
}

export interface BeliefGraphNode {
  id: string
  label: string
  category: string
  strength: number
}

export interface BeliefGraphEdge {
  source: string
  target: string
  relationship: string
  weight: number
}

export interface BeliefGraph {
  nodes: BeliefGraphNode[]
  edges: BeliefGraphEdge[]
}

// ============================================================================
// Auth Types
// ============================================================================

export interface User {
  user_id: string
  email: string
  name: string | null
  avatar_url: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  agent_config?: AgentConfig | null
  preferences?: Record<string, any>
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name?: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// ============================================================================
// User Profile Types
// ============================================================================

export interface AgentConfig {
  agent_name: string
  agent_type: "Companion" | "Coach" | "Mentor" | "Friend"
  use_case: string
  identity: string
  mission: string
  origin: string
  beliefs: string
  communication: string
  strengths: string
}

export interface UserProfile {
  user_id: string
  email: string
  name: string | null
  phone_number: string | null
  bio: string | null
  pronouns: string | null
  avatar_url: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  agent_config: AgentConfig | null
  preferences: UserPreferences | null
}

export interface UserPreferences {
  theme: "light" | "dark" | "system"
  notifications: boolean
  language: string
  email_updates: boolean
}

export interface UpdateProfileRequest {
  name?: string
  phone_number?: string
  bio?: string
  pronouns?: string
}

export interface UpdateAgentConfigRequest {
  agent_name?: string
  agent_type?: "Companion" | "Coach" | "Mentor" | "Friend"
  use_case?: string
  identity?: string
  mission?: string
  origin?: string
  beliefs?: string
  communication?: string
  strengths?: string
}

export interface UpdatePreferencesRequest {
  theme?: "light" | "dark" | "system"
  notifications?: boolean
  language?: string
  email_updates?: boolean
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

export interface HealthResponse {
  status: "healthy" | "unhealthy"
  databases: {
    postgres: string
    neo4j: string
  }
  version: string
}
