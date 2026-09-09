"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/contexts/AuthContext"
import { useUserProfile } from "@/lib/hooks/useUserProfile"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    profile,
    isLoading: profileLoading,
    error,
    fetchProfile,
    updateProfile,
    updateAgentConfig,
  } = useUserProfile()

  // Personal Information State
  const [fullName, setFullName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [bio, setBio] = useState("")
  const [pronouns, setPronouns] = useState("")

  // Agent Customization State
  const [agentName, setAgentName] = useState("Kio")
  const [agentType, setAgentType] = useState<"Companion" | "Coach" | "Mentor" | "Friend">("Companion")
  const [useCase, setUseCase] = useState("Mental Wellness")
  const [identity, setIdentity] = useState("A wise mentor who guides with empathy and patience...")
  const [mission, setMission] = useState("To help people find inner peace and emotional clarity...")
  const [origin, setOrigin] = useState("Born from moments of silence where connection is needed...")
  const [beliefs, setBeliefs] = useState("Everyone deserves emotional support without judgment...")
  const [communication, setCommunication] = useState("With warmth, gentle prompts, and active listening...")
  const [strengths, setStrengths] = useState("Crisis support, pattern recognition, emotional validation...")

  const [isSavingPersonal, setIsSavingPersonal] = useState(false)
  const [isSavingAgent, setIsSavingAgent] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  // Redirect to signin if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/signin")
    }
  }, [authLoading, isAuthenticated, router])

  // Fetch profile on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile()
    }
  }, [isAuthenticated, fetchProfile])

  // Populate form with profile data
  useEffect(() => {
    if (profile) {
      setFullName(profile.name || "")
      setPhoneNumber(profile.phone_number || "")
      setBio(profile.bio || "")
      setPronouns(profile.pronouns || "")

      if (profile.agent_config) {
        setAgentName(profile.agent_config.agent_name || "Kio")
        setAgentType(profile.agent_config.agent_type || "Companion")
        setUseCase(profile.agent_config.use_case || "Mental Wellness")
        setIdentity(profile.agent_config.identity || "")
        setMission(profile.agent_config.mission || "")
        setOrigin(profile.agent_config.origin || "")
        setBeliefs(profile.agent_config.beliefs || "")
        setCommunication(profile.agent_config.communication || "")
        setStrengths(profile.agent_config.strengths || "")
      }
    }
  }, [profile])

  const handleSavePersonalInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingPersonal(true)
    setSaveSuccess(null)

    try {
      await updateProfile({
        name: fullName,
        phone_number: phoneNumber,
        bio: bio,
        pronouns: pronouns,
      })
      setSaveSuccess("Personal information saved successfully!")
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (err) {
      console.error("Failed to save personal info:", err)
    } finally {
      setIsSavingPersonal(false)
    }
  }

  const handleSaveAgentProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingAgent(true)
    setSaveSuccess(null)

    try {
      await updateAgentConfig({
        agent_name: agentName,
        agent_type: agentType,
        use_case: useCase,
        identity: identity,
        mission: mission,
        origin: origin,
        beliefs: beliefs,
        communication: communication,
        strengths: strengths,
      })
      setSaveSuccess("Agent profile saved successfully!")
      setTimeout(() => setSaveSuccess(null), 3000)
    } catch (err) {
      console.error("Failed to save agent profile:", err)
    } finally {
      setIsSavingAgent(false)
    }
  }

  // Get user initials for avatar
  const getInitials = () => {
    if (fullName) {
      return fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || "U"
  }

  if (authLoading || profileLoading) {
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
        <header className="h-16 border-b border-border flex items-center justify-center px-6 relative pl-16 lg:pl-6">
          <div className="flex items-center gap-3">
            <Link href="/chat/conversation">
              <button className="px-5 py-2 rounded-full bg-surface-elevated border border-border text-foreground hover:bg-border hover:border-primary transition-all text-sm font-medium">
                Chat
              </button>
            </Link>
            <Link href="/chat/history">
              <button className="px-5 py-2 rounded-full bg-surface-elevated border border-border text-foreground hover:bg-border hover:border-primary transition-all text-sm font-medium">
                Chat History
              </button>
            </Link>
          </div>

          <div className="absolute right-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ring-2 ring-primary">
              <span className="text-sm font-semibold text-white">{getInitials()}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Success Message */}
            {saveSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-500 text-sm text-center">
                {saveSuccess}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            {/* Personal Information Section */}
            <div className="bg-surface border border-border rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <span className="text-2xl font-semibold text-white">{getInitials()}</span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-hover transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Personal Information</h2>
                  <p className="text-muted-foreground">Manage your personal details</p>
                  {user?.email && (
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSavePersonalInfo} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl py-6"
                    placeholder="Enter your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl py-6"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Select value={pronouns} onValueChange={setPronouns}>
                    <SelectTrigger className="bg-surface-elevated border-border rounded-xl py-6">
                      <SelectValue placeholder="Select pronouns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="he/him">He/Him</SelectItem>
                      <SelectItem value="she/her">She/Her</SelectItem>
                      <SelectItem value="they/them">They/Them</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl min-h-24 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white rounded-xl px-8 py-3"
                  disabled={isSavingPersonal}
                >
                  {isSavingPersonal ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save Personal Information"
                  )}
                </Button>
              </form>
            </div>

            {/* Agent Customization Section */}
            <div className="bg-surface border border-border rounded-2xl p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Customize Your AI Agent</h2>
                <p className="text-muted-foreground">
                  Shape your agent's personality to match your preferences
                </p>
              </div>

              <form onSubmit={handleSaveAgentProfile} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl py-6"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentType">Agent Type</Label>
                  <Select value={agentType} onValueChange={(v) => setAgentType(v as typeof agentType)}>
                    <SelectTrigger className="bg-surface-elevated border-border rounded-xl py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Companion">Companion</SelectItem>
                      <SelectItem value="Coach">Coach</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="useCase">Select Use Case</Label>
                  <Select value={useCase} onValueChange={setUseCase}>
                    <SelectTrigger className="bg-surface-elevated border-border rounded-xl py-6">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mental Wellness">Mental Wellness</SelectItem>
                      <SelectItem value="Productivity">Productivity</SelectItem>
                      <SelectItem value="Creativity">Creativity</SelectItem>
                      <SelectItem value="Learning">Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 space-y-5">
                  <h3 className="text-lg font-semibold">Customize Agent Personality</h3>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Define your agent's personality traits and communication style.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="identity">Core Identity</Label>
                    <Textarea
                      id="identity"
                      value={identity}
                      onChange={(e) => setIdentity(e.target.value)}
                      className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mission">Mission</Label>
                    <Textarea
                      id="mission"
                      value={mission}
                      onChange={(e) => setMission(e.target.value)}
                      className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="origin">Origin Story</Label>
                    <Textarea
                      id="origin"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="beliefs">Core Beliefs</Label>
                    <Textarea
                      id="beliefs"
                      value={beliefs}
                      onChange={(e) => setBeliefs(e.target.value)}
                      className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communication">Communication Style</Label>
                    <Textarea
                      id="communication"
                      value={communication}
                      onChange={(e) => setCommunication(e.target.value)}
                      className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="strengths">Key Strengths</Label>
                    <Textarea
                      id="strengths"
                      value={strengths}
                      onChange={(e) => setStrengths(e.target.value)}
                      className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-hover text-white rounded-xl px-8 py-3"
                  disabled={isSavingAgent}
                >
                  {isSavingAgent ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Saving...
                    </span>
                  ) : (
                    "Save Agent Profile"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
