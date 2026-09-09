"use client"

import type React from "react"

import { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChainOfThoughtDrawer } from "@/components/chain-of-thought-drawer"
import { useStreamingChat, type StreamingMessage, type ConnectionStatus } from "@/lib/hooks/useStreamingChat"
import { useAuth } from "@/lib/contexts/AuthContext"
import Link from "next/link"

// Connection status indicator component
function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const statusConfig = {
    connected: { color: "bg-green-500", text: "Connected", pulse: false },
    connecting: { color: "bg-yellow-500", text: "Connecting...", pulse: true },
    disconnected: { color: "bg-gray-500", text: "Disconnected", pulse: false },
    error: { color: "bg-red-500", text: "Error", pulse: false },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full ${config.color} ${config.pulse ? "animate-pulse" : ""}`} />
      <span>{config.text}</span>
    </div>
  )
}

// Thinking indicator component
function ThinkingIndicator({ step }: { step: string }) {
  return (
    <div className="flex gap-4 justify-start">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div className="max-w-2xl rounded-2xl px-5 py-3.5 bg-surface-elevated border border-border">
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-sm">{step}</span>
        </div>
      </div>
    </div>
  )
}

// Streaming message component with typing effect
function StreamingMessageBubble({ message }: { message: StreamingMessage }) {
  const isStreaming = message.isStreaming && message.role === "assistant"

  return (
    <div className={`flex gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      {message.role === "assistant" && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center flex-shrink-0">
          <svg className={`w-4 h-4 text-white ${isStreaming ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      )}

      <div className="flex-1 max-w-2xl">
        <div
          className={`rounded-2xl px-5 py-3.5 ${
            message.role === "user"
              ? "bg-primary text-white ml-auto"
              : "bg-surface-elevated border border-border text-foreground"
          }`}
        >
          <p className="leading-relaxed whitespace-pre-wrap">
            {message.content}
            {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
          </p>

          {/* Show emotion badge for user messages */}
          {message.role === "user" && message.emotion && (
            <div className="mt-3 pt-3 border-t border-white/20">
              <span className="text-xs px-3 py-1 rounded-full bg-white/20 font-medium capitalize">
                {message.emotion}
              </span>
            </div>
          )}
        </div>

        {/* Chain of Thought for assistant messages */}
        {message.role === "assistant" && !isStreaming && message.chain_of_thought && (
          <ChainOfThoughtDrawer message={message as any} />
        )}
      </div>

      {message.role === "user" && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-white">YOU</span>
        </div>
      )}
    </div>
  )
}

function StreamingConversationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const initialMessage = searchParams.get("message")
  const mode = searchParams.get("mode") || "Ask Advice"
  const style = searchParams.get("style") || "Balanced"

  const [inputValue, setInputValue] = useState("")
  const [conversationMode, setConversationMode] = useState(mode)
  const [conversationStyle, setConversationStyle] = useState(style)
  const [showOptions, setShowOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [authLoading, isAuthenticated, router])

  const {
    messages,
    sessionId,
    isStreaming,
    connectionStatus,
    error,
    currentThinkingStep,
    currentEmotion,
    sendMessage,
    clearSession,
    connect,
  } = useStreamingChat(user?.user_id || "")

  const modeOptions = ["Ask Advice", "Set Goals", "Explore"]
  const styleOptions = ["Balanced", "Therapeutic", "Crisis", "Coaching", "Casual", "Task", "Analytical"]

  // Handle initial message from query params
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      sendMessage(initialMessage, { mode: conversationMode, style: conversationStyle })
    }
  }, [initialMessage])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, currentThinkingStep])

  const handleSend = async () => {
    if (!inputValue.trim() || isStreaming) return

    try {
      await sendMessage(inputValue, { mode: conversationMode, style: conversationStyle })
      setInputValue("")
    } catch (err) {
      console.error("Failed to send message:", err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewConversation = () => {
    clearSession()
    setInputValue("")
  }

  return (
    <div className="flex h-screen bg-background">
      <MobileNav />
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-center px-6 relative">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleNewConversation}
              className="rounded-full"
              disabled={isStreaming}
            >
              New Chat
            </Button>

            <Link href="/chat/history">
              <button className="px-5 py-2 rounded-full bg-surface-elevated border border-border text-foreground hover:bg-border hover:border-primary transition-all text-sm font-medium">
                Chat History
              </button>
            </Link>

            {sessionId && (
              <span className="text-xs text-muted-foreground font-mono">
                Session: {sessionId.slice(0, 8)}...
              </span>
            )}
          </div>

          <div className="absolute left-6">
            <ConnectionIndicator status={connectionStatus} />
          </div>

          <div className="absolute right-6 flex items-center gap-3">
            {currentEmotion && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Emotion:</span>
                <span className="px-2 py-1 rounded-full bg-primary/20 text-primary capitalize">
                  {currentEmotion.primary_emotion}
                </span>
              </div>
            )}
            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <span className="text-sm font-semibold text-white">KIO</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {messages.length === 0 && !isStreaming && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-foreground">Welcome to Kio</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start a conversation to explore your thoughts, set goals, or get personalized advice.
                  I'm here to help you understand yourself better.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Streaming enabled
                  </span>
                </div>
              </div>
            )}

            {messages.length > 0 && (
              <div className="text-center text-sm text-muted-foreground mb-8">
                Today {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
              </div>
            )}

            {messages.map((message) => (
              <StreamingMessageBubble key={message.message_id} message={message} />
            ))}

            {/* Thinking indicator */}
            {currentThinkingStep && <ThinkingIndicator step={currentThinkingStep} />}

            {/* Error message */}
            {error && (
              <div className="flex justify-center">
                <div className="max-w-md bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
                  <div className="flex items-center justify-between">
                    <span><strong>Error:</strong> {error}</span>
                    {connectionStatus === "error" && (
                      <Button variant="ghost" size="sm" onClick={connect} className="text-red-400 hover:text-red-300">
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="space-y-3">
              {/* Toggle Button */}
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className={`w-4 h-4 transition-transform ${showOptions ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span>Conversation Settings</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-surface-elevated border border-border">
                  {conversationMode} • {conversationStyle}
                </span>
              </button>

              {/* Collapsible Options */}
              {showOptions && (
                <div className="space-y-3 pl-6 animate-in slide-in-from-top-2 duration-200">
                  {/* Mode Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground min-w-[60px]">Mode</span>
                    <div className="flex gap-2">
                      {modeOptions.map((m) => (
                        <button
                          key={m}
                          onClick={() => setConversationMode(m)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            conversationMode === m
                              ? "bg-primary text-white"
                              : "bg-surface-elevated text-foreground hover:bg-border"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Selector */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground min-w-[60px]">Style</span>
                    <div className="flex gap-2 flex-wrap">
                      {styleOptions.map((s) => (
                        <button
                          key={s}
                          onClick={() => setConversationStyle(s)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            conversationStyle === s
                              ? "bg-primary text-white"
                              : "bg-surface-elevated text-foreground hover:bg-border"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="relative">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... (Streaming enabled)"
                className="w-full bg-surface-elevated border-border rounded-2xl pr-32 min-h-16 resize-none"
                disabled={isStreaming}
              />
              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </Button>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </Button>
                <Button
                  onClick={handleSend}
                  size="icon"
                  className="bg-primary hover:bg-primary-hover text-white rounded-xl w-10 h-10"
                  disabled={isStreaming || !inputValue.trim()}
                >
                  {isStreaming ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function StreamingConversationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-background">
          <div className="text-muted-foreground">Loading streaming conversation...</div>
        </div>
      }
    >
      <StreamingConversationContent />
    </Suspense>
  )
}
