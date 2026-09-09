'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  // Personal Information State
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [bio, setBio] = useState('')
  const [pronouns, setPronouns] = useState('')

  // Agent Customization State
  const [agentName, setAgentName] = useState('Kio') // Changed default agent name from Aurora to Kio
  const [agentType, setAgentType] = useState('Companion')
  const [useCase, setUseCase] = useState('Mental Wellness')
  const [identity, setIdentity] = useState('')
  const [mission, setMission] = useState('')
  const [origin, setOrigin] = useState('')
  const [beliefs, setBeliefs] = useState('')
  const [communication, setCommunication] = useState('')
  const [strengths, setStrengths] = useState('')

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Personal info submitted:', { fullName, phoneNumber, bio, pronouns })
    setStep(2)
  }

  const handleAgentCustomizationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('[v0] Agent customization submitted:', {
      agentName,
      agentType,
      useCase,
      identity,
      mission,
      origin,
      beliefs,
      communication,
      strengths
    })
    router.push('/chat')
  }

  const handleSkip = () => {
    router.push('/chat')
  }

  return (
    <div className="min-h-screen gradient-aurora flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 1 ? 'bg-primary text-white' : 'bg-surface-elevated text-muted-foreground'
            }`}>
              1
            </div>
            <div className={`h-1 w-16 ${step === 2 ? 'bg-primary' : 'bg-surface-elevated'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step === 2 ? 'bg-primary text-white' : 'bg-surface-elevated text-muted-foreground'
            }`}>
              2
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {step === 1 ? 'Personal Information' : 'Customize Your AI Agent'}
          </p>
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Personal Information</h1>
              <p className="text-muted-foreground">Tell us a bit about yourself</p>
            </div>

            <form onSubmit={handlePersonalInfoSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Alex Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-surface-elevated border-border rounded-xl py-6"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-surface-elevated border-border rounded-xl py-6"
                />
              </div>

              

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Finding peace in the quiet moments."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="bg-surface-elevated border-border rounded-xl min-h-24 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-xl py-6"
                >
                  Continue
                </Button>
                <Button
                  type="button"
                  onClick={handleSkip}
                  variant="outline"
                  className="border-border hover:bg-surface-elevated text-foreground rounded-xl px-8 py-6"
                >
                  Skip
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Step 2: Customize Agent */}
        {step === 2 && (
          <div className="bg-surface border border-border rounded-2xl p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Customize Your AI Agent</h1>
              <p className="text-muted-foreground">
                You can provide neutral language and our LLM will help mold them into a cohesive personality
              </p>
            </div>

            <form onSubmit={handleAgentCustomizationSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                  id="agentName"
                  type="text"
                  placeholder="Kaya"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="bg-surface-elevated border-border rounded-xl py-6"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="agentType">Agent Type</Label>
                <Select value={agentType} onValueChange={setAgentType}>
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
                  Answer these questions to shape your agent's personality. Press Enter to use defaults, or type your customization.
                </p>

                <div className="space-y-2">
                  <Label htmlFor="identity">Define your agent's core identity - who they are and how they see themselves:</Label>
                  <Textarea
                    id="identity"
                    placeholder="e.g., A wise mentor who guides with empathy and patience..."
                    value={identity}
                    onChange={(e) => setIdentity(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mission">What is your agent's primary mission and driving purpose?</Label>
                  <Textarea
                    id="mission"
                    placeholder="e.g., To help people find inner peace and emotional clarity..."
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="origin">Describe your agent's origin story and formative experiences:</Label>
                  <Textarea
                    id="origin"
                    placeholder="e.g., Born from moments of silence where connection is needed..."
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beliefs">What core beliefs and values guide your agent's worldview?</Label>
                  <Textarea
                    id="beliefs"
                    placeholder="e.g., Everyone deserves emotional support without judgment..."
                    value={beliefs}
                    onChange={(e) => setBeliefs(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="communication">How does your agent communicate and interact with users?</Label>
                  <Textarea
                    id="communication"
                    placeholder="e.g., With warmth, gentle prompts, and active listening..."
                    value={communication}
                    onChange={(e) => setCommunication(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strengths">What are your agent's key strengths and specialties?</Label>
                  <Textarea
                    id="strengths"
                    placeholder="e.g., Crisis support, pattern recognition, emotional validation..."
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    className="bg-surface-elevated border-border rounded-xl min-h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="border-border hover:bg-surface-elevated text-foreground rounded-xl px-8 py-6"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-xl py-6"
                >
                  Complete Profile
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
