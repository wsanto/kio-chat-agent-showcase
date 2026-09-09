/**
 * React hook for streaming chat with WebSocket
 * Provides real-time AI responses with emotion and reasoning updates
 */

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { ChatMessageResponse } from "@/lib/types/api"

// WebSocket event types
export type StreamEventType =
  | "session"
  | "emotion"
  | "thinking"
  | "chunk"
  | "reasoning"
  | "complete"
  | "error"

export interface StreamEvent {
  type: StreamEventType
  data: Record<string, unknown>
}

export interface EmotionData {
  primary_emotion: string
  confidence: number
  valence?: number
  arousal?: number
}

export interface ChainOfThought {
  steps: string[]
  emotion_analysis?: string
  context_used?: string[]
  response_strategy?: string
}

export interface ReasoningData {
  chain_of_thought: ChainOfThought
  trajectory_mood: string
}

export interface StreamingMessage {
  message_id: string
  session_id: string
  user_id: string
  role: "user" | "assistant"
  content: string
  emotion?: string
  isStreaming?: boolean
  streamedContent?: string
  emotionData?: EmotionData
  reasoning?: ReasoningData
  chain_of_thought?: ChainOfThought
  trajectory_mood?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error"

export function useStreamingChat(userId: string, initialSessionId?: string) {
  const [messages, setMessages] = useState<StreamingMessage[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId)
  const [isStreaming, setIsStreaming] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected")
  const [error, setError] = useState<string | null>(null)
  const [currentThinkingStep, setCurrentThinkingStep] = useState<string | null>(null)
  const [currentEmotion, setCurrentEmotion] = useState<EmotionData | null>(null)

  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const currentStreamingMessageRef = useRef<string>("")

  // Get WebSocket URL from environment or default
  const getWebSocketUrl = useCallback(() => {
    // Use the microservice URL for WebSocket
    const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:"
    const baseUrl = process.env.NEXT_PUBLIC_MICROSERVICE_URL || "http://localhost:8001"
    const wsUrl = baseUrl.replace(/^https?:/, wsProtocol)
    return `${wsUrl}/api/v1/chat/stream`
  }, [])

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionStatus("connecting")
    setError(null)

    try {
      const ws = new WebSocket(getWebSocketUrl())

      ws.onopen = () => {
        console.log("WebSocket connected")
        setConnectionStatus("connected")
        setError(null)
      }

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason)
        setConnectionStatus("disconnected")
        wsRef.current = null

        // Attempt to reconnect after 3 seconds if not a normal close
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...")
            connect()
          }, 3000)
        }
      }

      ws.onerror = (event) => {
        console.error("WebSocket error:", event)
        setConnectionStatus("error")
        setError("WebSocket connection failed. Using fallback mode.")
      }

      ws.onmessage = (event) => {
        try {
          const streamEvent: StreamEvent = JSON.parse(event.data)
          handleStreamEvent(streamEvent)
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e)
        }
      }

      wsRef.current = ws
    } catch (e) {
      console.error("Failed to create WebSocket:", e)
      setConnectionStatus("error")
      setError("Failed to establish WebSocket connection")
    }
  }, [getWebSocketUrl])

  // Handle stream events
  const handleStreamEvent = useCallback((event: StreamEvent) => {
    switch (event.type) {
      case "session":
        const newSessionId = event.data.session_id as string
        setSessionId(newSessionId)
        break

      case "emotion":
        const emotionData = event.data as EmotionData
        setCurrentEmotion(emotionData)
        break

      case "thinking":
        const step = event.data.step as string
        setCurrentThinkingStep(step)
        break

      case "chunk":
        const content = event.data.content as string
        currentStreamingMessageRef.current += content

        // Update the streaming message in state
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                content: currentStreamingMessageRef.current,
                streamedContent: currentStreamingMessageRef.current,
              },
            ]
          }
          return prev
        })
        break

      case "reasoning":
        const reasoningData = event.data as ReasoningData
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                chain_of_thought: reasoningData.chain_of_thought,
                trajectory_mood: reasoningData.trajectory_mood,
              },
            ]
          }
          return prev
        })
        break

      case "complete":
        const completeData = event.data as {
          message_id: string
          user_message_id: string
          session_id: string
          full_response: string
        }

        // Finalize the streaming message
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1]
          if (lastMessage && lastMessage.isStreaming) {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMessage,
                message_id: completeData.message_id,
                content: completeData.full_response,
                isStreaming: false,
              },
            ]
          }
          return prev
        })

        // Update user message ID
        setMessages((prev) => {
          return prev.map((msg) => {
            if (msg.message_id.startsWith("temp-") && msg.role === "user") {
              return { ...msg, message_id: completeData.user_message_id }
            }
            return msg
          })
        })

        setIsStreaming(false)
        setCurrentThinkingStep(null)
        currentStreamingMessageRef.current = ""
        break

      case "error":
        const errorMessage = event.data.message as string
        setError(errorMessage)
        setIsStreaming(false)
        setCurrentThinkingStep(null)
        break
    }
  }, [])

  // Send a message via WebSocket
  const sendMessageStreaming = useCallback(
    async (content: string, context?: Record<string, unknown>) => {
      if (!content.trim()) return

      // If WebSocket is not connected, try to connect
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect()
        // Wait a bit for connection
        await new Promise((resolve) => setTimeout(resolve, 500))

        // If still not connected, fall back to REST API
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          console.log("WebSocket not available, using REST fallback")
          return sendMessageREST(content, context)
        }
      }

      setIsStreaming(true)
      setError(null)
      currentStreamingMessageRef.current = ""

      // Add user message optimistically
      const tempUserMessage: StreamingMessage = {
        message_id: `temp-${Date.now()}`,
        session_id: sessionId || "",
        user_id: userId,
        role: "user",
        content,
        metadata: {},
        created_at: new Date().toISOString(),
      }

      // Add placeholder for streaming assistant message
      const streamingAssistantMessage: StreamingMessage = {
        message_id: `streaming-${Date.now()}`,
        session_id: sessionId || "",
        user_id: userId,
        role: "assistant",
        content: "",
        isStreaming: true,
        streamedContent: "",
        metadata: {},
        created_at: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, tempUserMessage, streamingAssistantMessage])

      // Send message to WebSocket
      wsRef.current.send(
        JSON.stringify({
          user_id: userId,
          message: content,
          session_id: sessionId,
          context: context || {},
        })
      )
    },
    [userId, sessionId, connect]
  )

  // Fallback REST API method
  const sendMessageREST = useCallback(
    async (content: string, context?: Record<string, unknown>) => {
      setIsStreaming(true)
      setError(null)

      const tempUserMessage: StreamingMessage = {
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
        const response = await fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            message: content,
            session_id: sessionId,
            context,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to send message")
        }

        const data = await response.json()

        if (!sessionId) {
          setSessionId(data.user_message.session_id)
        }

        // Replace temp message with real messages
        setMessages((prev) => [
          ...prev.slice(0, -1),
          {
            ...data.user_message,
            role: "user" as const,
          },
          {
            ...data.agent_response,
            role: "assistant" as const,
          },
        ])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsStreaming(false)
      }
    },
    [userId, sessionId]
  )

  // Disconnect WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected")
      wsRef.current = null
    }
    setConnectionStatus("disconnected")
  }, [])

  // Clear session
  const clearSession = useCallback(() => {
    setSessionId(undefined)
    setMessages([])
    setError(null)
    setCurrentThinkingStep(null)
    setCurrentEmotion(null)
  }, [])

  // Load session messages
  const loadSession = useCallback(async (sid: string) => {
    setError(null)

    try {
      const response = await fetch(`/api/chat/sessions/${sid}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to load session")
      }

      const data = await response.json()

      setSessionId(sid)
      setMessages(
        data.messages?.map((msg: ChatMessageResponse) => ({
          ...msg,
          isStreaming: false,
        })) || []
      )

      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Auto-connect when component mounts
  useEffect(() => {
    connect()
  }, [connect])

  return {
    messages,
    sessionId,
    isStreaming,
    connectionStatus,
    error,
    currentThinkingStep,
    currentEmotion,
    sendMessage: sendMessageStreaming,
    sendMessageREST,
    connect,
    disconnect,
    clearSession,
    loadSession,
  }
}
