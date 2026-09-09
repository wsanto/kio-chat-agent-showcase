/**
 * API Client for communicating with ANIMA Microservice
 * Handles HTTP requests, error handling, and type safety
 */

import type {
  ChatResponse,
  ChatSession,
  ChatSessionWithMessages,
  ChatMessageResponse,
  SendMessageRequest,
  CreateSessionRequest,
  HealthResponse,
  ApiResponse,
  Goal,
  Belief,
  BeliefGraph,
} from "@/lib/types/api"

const MICROSERVICE_URL =
  process.env.ANIMA_MICROSERVICE_URL || "http://localhost:8001"

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = MICROSERVICE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, "") // Remove trailing slash
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    }

    // Merge headers
    const headers = {
      ...defaultHeaders,
      ...(options.headers || {}),
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Parse JSON response
      const data = await response.json()

      // Handle HTTP errors
      if (!response.ok) {
        return {
          error: data.detail || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
        }
      }

      return {
        data: data as T,
        status: response.status,
      }
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      return {
        error: error instanceof Error ? error.message : "Network error",
        status: 500,
      }
    }
  }

  // ============================================================================
  // Health Check
  // ============================================================================

  async health(): Promise<ApiResponse<HealthResponse>> {
    return this.fetch<HealthResponse>("/health")
  }

  // ============================================================================
  // Chat Endpoints
  // ============================================================================

  /**
   * Send a message and get AI response
   */
  async sendMessage(
    request: SendMessageRequest
  ): Promise<ApiResponse<ChatResponse>> {
    return this.fetch<ChatResponse>("/api/v1/chat/message", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Create a new chat session
   */
  async createSession(
    request: CreateSessionRequest
  ): Promise<ApiResponse<ChatSession>> {
    return this.fetch<ChatSession>("/api/v1/chat/sessions", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(
    userId: string,
    options?: {
      limit?: number
      include_inactive?: boolean
    }
  ): Promise<ApiResponse<ChatSession[]>> {
    const params = new URLSearchParams()
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.include_inactive)
      params.append("include_inactive", "true")

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.fetch<ChatSession[]>(`/api/v1/chat/sessions/${userId}${query}`)
  }

  /**
   * Get a specific session with messages
   */
  async getSession(
    sessionId: string,
    options?: {
      message_limit?: number
    }
  ): Promise<ApiResponse<ChatSessionWithMessages>> {
    const params = new URLSearchParams()
    if (options?.message_limit)
      params.append("message_limit", options.message_limit.toString())

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.fetch<ChatSessionWithMessages>(
      `/api/v1/chat/sessions/${sessionId}${query}`
    )
  }

  /**
   * Get messages from a session
   */
  async getSessionMessages(
    sessionId: string,
    options?: {
      limit?: number
      offset?: number
    }
  ): Promise<ApiResponse<ChatMessageResponse[]>> {
    const params = new URLSearchParams()
    if (options?.limit) params.append("limit", options.limit.toString())
    if (options?.offset) params.append("offset", options.offset.toString())

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.fetch<ChatMessageResponse[]>(
      `/api/v1/chat/sessions/${sessionId}/messages${query}`
    )
  }

  // ============================================================================
  // Goals API
  // ============================================================================

  /**
   * Get user's goals
   */
  async getGoals(
    userId: string,
    options?: {
      status?: string | null
      category?: string | null
    }
  ): Promise<ApiResponse<{ goals: Goal[]; total: number }>> {
    const params = new URLSearchParams({ user_id: userId })
    if (options?.status) params.append("status", options.status)
    if (options?.category) params.append("category", options.category)

    return this.fetch<{ goals: Goal[]; total: number }>(
      `/api/v1/goals?${params.toString()}`
    )
  }

  /**
   * Get a specific goal
   */
  async getGoal(goalId: string, userId: string): Promise<ApiResponse<Goal>> {
    return this.fetch<Goal>(`/api/v1/goals/${goalId}?user_id=${userId}`)
  }

  /**
   * Create a new goal
   */
  async createGoal(request: {
    user_id: string
    title: string
    description: string
    category: string
    priority?: string
    target_date?: string | null
  }): Promise<ApiResponse<{ goal: Goal; message: string }>> {
    return this.fetch<{ goal: Goal; message: string }>("/api/v1/goals", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Generate goal plan with AI
   */
  async generateGoalPlan(request: {
    user_id: string
    goal_description: string
    category: string
    target_date?: string | null
    additional_context?: string | null
  }): Promise<ApiResponse<{ goal: Goal; message: string }>> {
    return this.fetch<{ goal: Goal; message: string }>(
      "/api/v1/goals/generate-plan",
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Update goal progress
   */
  async updateGoalProgress(
    goalId: string,
    userId: string,
    progress: number,
    status?: string | null
  ): Promise<ApiResponse<Goal>> {
    return this.fetch<Goal>(
      `/api/v1/goals/${goalId}/progress?user_id=${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ progress, status }),
      }
    )
  }

  /**
   * Update task status
   */
  async updateTaskStatus(
    goalId: string,
    userId: string,
    phaseId: string,
    taskId: string,
    status: string
  ): Promise<ApiResponse<Goal>> {
    return this.fetch<Goal>(
      `/api/v1/goals/${goalId}/phases/${phaseId}/tasks/${taskId}?user_id=${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }
    )
  }

  /**
   * Delete a goal
   */
  async deleteGoal(
    goalId: string,
    userId: string
  ): Promise<ApiResponse<{ message: string; goal_id: string }>> {
    return this.fetch<{ message: string; goal_id: string }>(
      `/api/v1/goals/${goalId}?user_id=${userId}`,
      {
        method: "DELETE",
      }
    )
  }

  // ============================================================================
  // Beliefs API
  // ============================================================================

  /**
   * Get user's beliefs
   */
  async getBeliefs(
    userId: string,
    options?: {
      category?: string | null
      confirmed_only?: boolean
      min_strength?: number
    }
  ): Promise<ApiResponse<{ beliefs: Belief[]; total: number }>> {
    const params = new URLSearchParams({ user_id: userId })
    if (options?.category) params.append("category", options.category)
    if (options?.confirmed_only) params.append("confirmed_only", "true")
    if (options?.min_strength !== undefined) {
      params.append("min_strength", options.min_strength.toString())
    }

    return this.fetch<{ beliefs: Belief[]; total: number }>(
      `/api/v1/beliefs?${params.toString()}`
    )
  }

  /**
   * Get a specific belief
   */
  async getBelief(beliefId: string, userId: string): Promise<ApiResponse<Belief>> {
    return this.fetch<Belief>(`/api/v1/beliefs/${beliefId}?user_id=${userId}`)
  }

  /**
   * Create a new belief
   */
  async createBelief(request: {
    user_id: string
    category: string
    belief_statement: string
    strength?: number
    origin_context?: string
  }): Promise<ApiResponse<{ belief: Belief; message: string }>> {
    return this.fetch<{ belief: Belief; message: string }>("/api/v1/beliefs", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  /**
   * Update a belief
   */
  async updateBelief(
    beliefId: string,
    userId: string,
    updates: {
      belief_statement?: string
      category?: string
      strength?: number
      confirmed?: boolean
    }
  ): Promise<ApiResponse<Belief>> {
    return this.fetch<Belief>(`/api/v1/beliefs/${beliefId}?user_id=${userId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  /**
   * Confirm or reject a belief
   */
  async confirmBelief(
    beliefId: string,
    userId: string,
    confirmed: boolean
  ): Promise<ApiResponse<Belief>> {
    return this.fetch<Belief>(`/api/v1/beliefs/${beliefId}?user_id=${userId}`, {
      method: "PATCH",
      body: JSON.stringify({ confirmed }),
    })
  }

  /**
   * Delete a belief
   */
  async deleteBelief(
    beliefId: string,
    userId: string
  ): Promise<ApiResponse<{ message: string; belief_id: string }>> {
    return this.fetch<{ message: string; belief_id: string }>(
      `/api/v1/beliefs/${beliefId}?user_id=${userId}`,
      {
        method: "DELETE",
      }
    )
  }

  /**
   * Get belief graph for visualization
   */
  async getBeliefGraph(userId: string): Promise<ApiResponse<BeliefGraph>> {
    return this.fetch<BeliefGraph>(`/api/v1/beliefs/graph/network?user_id=${userId}`)
  }

  /**
   * Detect beliefs from text using AI
   */
  async detectBeliefs(
    userId: string,
    text: string,
    context?: Record<string, any>
  ): Promise<ApiResponse<{ detected_beliefs: Belief[]; message: string }>> {
    return this.fetch<{ detected_beliefs: Belief[]; message: string }>(
      "/api/v1/beliefs/detect",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, text, context }),
      }
    )
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export class for testing or custom instances
export { ApiClient }
