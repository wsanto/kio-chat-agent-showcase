"use client"

import { useState, useCallback } from "react"
import type {
  UserProfile,
  AgentConfig,
  UserPreferences,
  UpdateProfileRequest,
  UpdateAgentConfigRequest,
  UpdatePreferencesRequest,
} from "@/lib/types/api"

interface UseUserProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null

  // Profile operations
  fetchProfile: () => Promise<void>
  updateProfile: (data: UpdateProfileRequest) => Promise<UserProfile | null>
  updateAvatar: (file: File) => Promise<string | null>

  // Agent configuration
  agentConfig: AgentConfig | null
  updateAgentConfig: (config: UpdateAgentConfigRequest) => Promise<AgentConfig | null>

  // Preferences
  preferences: UserPreferences | null
  updatePreferences: (prefs: UpdatePreferencesRequest) => Promise<UserPreferences | null>
}

/**
 * Hook for managing user profile, agent configuration, and preferences.
 */
export function useUserProfile(): UseUserProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("kio_access_token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile")
      }

      setProfile(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch profile"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: UpdateProfileRequest): Promise<UserProfile | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("kio_access_token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update profile")
      }

      setProfile(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update profile"
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateAvatar = useCallback(async (file: File): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("kio_access_token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/users/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to upload avatar")
      }

      // Update profile with new avatar URL
      if (profile) {
        setProfile({ ...profile, avatar_url: result.avatar_url })
      }

      return result.avatar_url
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to upload avatar"
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [profile])

  const updateAgentConfig = useCallback(async (config: UpdateAgentConfigRequest): Promise<AgentConfig | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("kio_access_token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/users/agent-config", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(config),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update agent config")
      }

      // Update profile with new agent config
      if (profile) {
        setProfile({ ...profile, agent_config: result })
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update agent config"
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [profile])

  const updatePreferences = useCallback(async (prefs: UpdatePreferencesRequest): Promise<UserPreferences | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("kio_access_token")
      if (!token) {
        throw new Error("Not authenticated")
      }

      const response = await fetch("/api/users/preferences", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(prefs),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to update preferences")
      }

      // Update profile with new preferences
      if (profile) {
        setProfile({ ...profile, preferences: result })
      }

      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update preferences"
      setError(message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [profile])

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    agentConfig: profile?.agent_config || null,
    updateAgentConfig,
    preferences: profile?.preferences || null,
    updatePreferences,
  }
}
