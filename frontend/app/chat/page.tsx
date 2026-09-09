"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { MobileNav } from "@/components/mobile-nav"

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "user",
      content: "Why does an apple fall down and not sideways?",
      timestamp: new Date(),
    },
    {
      id: 2,
      role: "assistant",
      content:
        'Because gravity pulls everything toward the center of the Earth. That "downward" direction is the shortest path to the center, so objects always fall that way unless something pushes them in another direction.',
      timestamp: new Date(),
    },
    {
      id: 3,
      role: "user",
      content: "What exactly is gravity?",
      timestamp: new Date(),
    },
    {
      id: 4,
      role: "assistant",
      content:
        "Gravity is a force that pulls any two objects with mass toward each other. The bigger the mass, the stronger the pull. Since Earth is huge, its gravity is strong enough to pull everything nearby toward its center – including you and the apple.",
      timestamp: new Date(),
    },
    {
      id: 5,
      role: "user",
      content: "Is it like a magnet?",
      timestamp: new Date(),
    },
    {
      id: 6,
      role: "assistant",
      content:
        "It's a little similar, since both are invisible forces that pull things – but they're not the same. A magnet only works on certain materials like iron. Gravity, on the other hand, affects everything that has mass: people, rocks, air, even light.",
      timestamp: new Date(),
    },
    {
      id: 7,
      role: "user",
      content: "Is there gravity in space?",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [selectedMode, setSelectedMode] = useState<string | null>(null)
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)

  const modeOptions = ["Ask Advice", "Set Goals", "Explore"]
  const styleOptions = ["Balanced", "Therapeutic", "Crisis", "Coaching", "Casual", "Task", "Analytical"]

  const handleSend = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: messages.length + 1,
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages([...messages, newMessage])
    setInputValue("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        role: "assistant",
        content: "This is a simulated response. In production, this would connect to your AI backend.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const handleStartChat = () => {
    if (!inputValue.trim()) return

    const conversationId = Date.now().toString()
    router.push(
      `/chat/conversation?message=${encodeURIComponent(inputValue)}&mode=${selectedMode || "Ask Advice"}&style=${selectedStyle || "Balanced"}`,
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleStartChat()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] relative overflow-hidden">
      <MobileNav />

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 h-16 flex items-center justify-center pl-16 lg:pl-8 px-8 py-6 border-b border-white/10">
        <nav className="flex items-center gap-3">
          <Link href="/chat/conversation">
            <button className="px-5 py-2 rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-primary transition-all text-sm font-medium">
              Chat
            </button>
          </Link>
          
          <Link href="/chat/history">
            <button className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm font-medium">
              Chat History
            </button>
          </Link>
        </nav>

        <Link href="/profile" className="absolute right-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            <span className="text-sm font-semibold text-white">JD</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-8 pt-12 pb-24">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary rounded-full blur-2xl opacity-50 animate-pulse"></div>
          <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary via-secondary to-primary p-1 glow-ring-strong">
            <div className="w-full h-full rounded-full bg-[#1a0b2e] flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/80 via-secondary/80 to-primary/80"></div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl text-white/80 mb-2 text-balance">Hey Johnathan</h1>
        <h2 className="text-4xl text-white font-light mb-12 text-balance">How can Kio help you today?</h2>

        <div className="w-full max-w-2xl mb-8 space-y-4">
          <div className="text-center">
            <p className="text-sm text-white/60 mb-3">Choose a mode to personalize our conversation</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              {modeOptions.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSelectedMode(mode)}
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    selectedMode === mode
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  onClick={() => setSelectedStyle(style)}
                  className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                    selectedStyle === style
                      ? "bg-white/20 text-white border border-white/30"
                      : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full max-w-3xl">
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-2 glow-ring">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="How are you feeling today?"
              className="w-full bg-transparent border-0 text-white placeholder:text-white/40 text-lg pr-20 min-h-[80px] resize-none focus:outline-none focus:ring-0"
            />
            <Button
              onClick={handleStartChat}
              size="icon"
              className="absolute right-3 bottom-3 bg-white hover:bg-white/90 text-black rounded-2xl w-14 h-14 shadow-lg hover:scale-105 transition-transform"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Button>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-0 w-full z-10 flex items-center justify-center gap-6 py-6 text-sm text-white/50">
        <Link href="/pricing" className="hover:text-white/80 transition-colors">
          Pricing
        </Link>
        <Link
          href="https://kaikostudios.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/80 transition-colors"
        >
          Kaiko Studios
        </Link>
        <Link href="/faq" className="hover:text-white/80 transition-colors">
          FAQ
        </Link>
        <Link href="/trust-safety" className="hover:text-white/80 transition-colors">
          Trust & Safety
        </Link>
        <Link href="/privacy" className="hover:text-white/80 transition-colors">
          Privacy
        </Link>
      </footer>

      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto"></div>
      </div>
    </div>
  )
}
