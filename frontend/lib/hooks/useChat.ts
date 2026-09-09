/**
 * React hooks for chat functionality
 * Provides easy-to-use client-side API
 */

"use client"

import { useState, useCallback } from "react"
import type {
  ChatResponse,
  ChatSession,
  ChatMessageResponse,
  SendMessageRequest,
} from "@/lib/types/api"

export function useChat(userId: string, initialSessionId?: string) {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>(
    initialSessionId
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Send a message and get AI response
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setIsLoading(true)
      setError(null)

      // Optimistically add user message to UI
      const tempUserMessage: ChatMessageResponse = {
        message_id: `temp-${Date.now()}`,
        session_id: sessionId || "",
        user_id: userId,
        role: "user",
        content,
        metadata: {},
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, tempUserMessage])

      try {
        const request: SendMessageRequest = {
          user_id: userId,
          message: content,
          session_id: sessionId,
        }

        const response = await fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to send message")
        }

        const data: ChatResponse = await response.json()

        // Update session ID if this was the first message
        if (!sessionId) {
          setSessionId(data.user_message.session_id)
        }

        // Replace temp message with real messages
        setMessages((prev) => [
          ...prev.slice(0, -1), // Remove temp message
          data.user_message,
          data.agent_response,
        ])

        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")

        // Remove temp message on error
        setMessages((prev) => prev.slice(0, -1))

        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [userId, sessionId]
  )

  /**
   * Load messages from an existing session
   */
  const loadSession = useCallback(async (sid: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/chat/sessions/${sid}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load session")
      }

      const data = await response.json()

      setSessionId(sid)
      setMessages(data.messages || [])

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Create a new session
   */
  const createNewSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create session")
      }

      const data: ChatSession = await response.json()

      setSessionId(data.session_id)
      setMessages([])

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  /**
   * Clear current session and messages
   */
  const clearSession = useCallback(() => {
    setSessionId(undefined)
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    sessionId,
    isLoading,
    error,
    sendMessage,
    loadSession,
    createNewSession,
    clearSession,
  }
}

/**
 * Hook for fetching user's chat history/sessions
 */
export function useChatHistory(userId: string) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(
    async (options?: { limit?: number; include_inactive?: boolean }) => {
      setIsLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({ user_id: userId })
        if (options?.limit) params.append("limit", options.limit.toString())
        if (options?.include_inactive) params.append("include_inactive", "true")

        const response = await fetch(`/api/chat/sessions?${params.toString()}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch sessions")
        }

        const data: ChatSession[] = await response.json()
        setSessions(data)

        return data
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [userId]
  )

  return {
    sessions,
    isLoading,
    error,
    fetchSessions,
    refetch: fetchSessions,
  }
}
