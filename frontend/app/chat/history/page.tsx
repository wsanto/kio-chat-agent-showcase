"use client"

import { useState, useEffect, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useChatHistory } from "@/lib/hooks/useChat"
import { useAuth } from "@/lib/contexts/AuthContext"
import type { ChatSession } from "@/lib/types/api"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ChatHistoryPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { sessions, isLoading, error, fetchSessions } = useChatHistory(user?.user_id || "")

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLimit, setSelectedLimit] = useState(20)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (user?.user_id) {
      fetchSessions({ limit: selectedLimit })
    }
  }, [selectedLimit, fetchSessions, user?.user_id])

  // Filter sessions based on search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions

    const query = searchQuery.toLowerCase()
    return sessions.filter((session) => {
      const preview = (session.metadata?.preview || "").toLowerCase()
      const sessionId = session.session_id.toLowerCase()
      return preview.includes(query) || sessionId.includes(query)
    })
  }, [sessions, searchQuery])

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat/conversation?sessionId=${sessionId}`)
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    if (deleteConfirm !== sessionId) {
      setDeleteConfirm(sessionId)
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/chat/sessions/${sessionId}?user_id=${user?.user_id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Refetch sessions after delete
        fetchSessions({ limit: selectedLimit })
      } else {
        console.error("Failed to delete session")
      }
    } catch (err) {
      console.error("Error deleting session:", err)
    } finally {
      setIsDeleting(false)
      setDeleteConfirm(null)
    }
  }

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setDeleteConfirm(null)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`
    } else if (diffDays === 1) {
      return "1 day ago"
    } else if (diffDays < 15) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Get user initials
  const getInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.[0]?.toUpperCase() || "U"
  }

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <MobileNav />
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Chat History</h1>

          <div className="flex items-center gap-3">
            <Link href="/chat/conversation">
              <Button className="rounded-full bg-primary hover:bg-primary-hover text-white">
                New Chat
              </Button>
            </Link>

            <Link href="/profile">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
                <span className="text-sm font-semibold text-white">{getInitials()}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-surface-elevated border-border rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Limit Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Show:</span>
                <div className="flex gap-1">
                  {[10, 20, 50].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => setSelectedLimit(limit)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedLimit === limit
                          ? "bg-primary text-white"
                          : "bg-surface-elevated text-foreground hover:bg-border"
                      }`}
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Search Results Count */}
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Found {filteredSessions.length} conversation{filteredSessions.length !== 1 ? "s" : ""} matching "{searchQuery}"
              </p>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3">
                  <svg
                    className="w-5 h-5 animate-spin text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="text-muted-foreground">Loading conversations...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="max-w-md mx-auto bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
                <strong>Error:</strong> {error}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && sessions.length === 0 && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground">No conversations yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Start your first conversation to begin exploring your thoughts and emotions.
                </p>
                <Link href="/chat/conversation">
                  <Button className="rounded-full bg-primary hover:bg-primary-hover text-white mt-4">
                    Start New Chat
                  </Button>
                </Link>
              </div>
            )}

            {/* No Search Results */}
            {!isLoading && !error && sessions.length > 0 && filteredSessions.length === 0 && searchQuery && (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-foreground">No matching conversations</h2>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or{" "}
                  <button onClick={() => setSearchQuery("")} className="text-primary hover:underline">
                    clear the search
                  </button>
                </p>
              </div>
            )}

            {/* Conversations List */}
            {!isLoading && !error && filteredSessions.length > 0 && (
              <div className="space-y-3">
                {filteredSessions.map((session: ChatSession) => {
                  const preview = session.metadata?.preview || "No messages yet"
                  const messageCount = session.metadata?.message_count || 0
                  const isConfirmingDelete = deleteConfirm === session.session_id

                  return (
                    <div
                      key={session.session_id}
                      onClick={() => !isConfirmingDelete && handleSessionClick(session.session_id)}
                      className={`w-full bg-surface-elevated border rounded-xl p-5 transition-all text-left group ${
                        isConfirmingDelete
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-border hover:bg-surface hover:border-primary cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Session ID as title */}
                          <h3 className="font-medium text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                            Session {session.session_id.slice(0, 8)}...
                          </h3>

                          {/* Preview */}
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{preview}</p>

                          {/* Metadata */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                              </svg>
                              {messageCount} messages
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {formatTimestamp(session.updated_at)}
                            </span>
                            {session.is_active && (
                              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                Active
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {isConfirmingDelete ? (
                            <>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={(e) => handleDeleteSession(session.session_id, e)}
                                disabled={isDeleting}
                                className="text-xs"
                              >
                                {isDeleting ? "Deleting..." : "Confirm"}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelDelete}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={(e) => handleDeleteSession(session.session_id, e)}
                                className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                title="Delete conversation"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                              <svg
                                className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
