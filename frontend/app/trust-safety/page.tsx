"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, Lock, Eye, Heart, Users, AlertCircle, FileCheck, CheckCircle, UserCheck, Settings } from "lucide-react"

export default function TrustSafetyPage() {
  const sections = [
    {
      icon: Lock,
      title: "Your Data Belongs to You",
      content: [
        {
          heading: "We never sell your data. Period.",
          text: "Anything you share stays between you and your AI companion. Your messages are not sold, rented, or shared with advertisers, data brokers, or third parties.",
        },
        {
          heading: "Your conversations are private.",
          text: "Your chats are stored securely and used only to improve your one-to-one experience with the AI—not to train models used by other people.",
        },
        {
          heading: "You can delete your data anytime.",
          text: "Your data is yours. You can request deletion at any time, and we will permanently erase: your conversation history, your emotional memory graph, and all personal preferences or tags.",
        },
      ],
    },
    {
      icon: Heart,
      title: "How Emotional Data Is Used",
      content: [
        {
          heading: "The AI interprets emotion to better support you—not to judge or profile you.",
          text: "Our system analyzes tone, sentiment, and context in your messages to understand how you may be feeling. This helps the AI adapt its tone, offer support, and reduce misunderstandings.",
        },
        {
          heading: "Emotion is used as context, not identity.",
          text: 'The AI never labels you as an "anxious person," "angry person," or anything similar. It simply responds to the moment you\'re in.',
        },
        {
          heading: "Emotional memory exists only inside your private experience.",
          text: "The AI remembers things like: the tone you prefer, topics that bring you stress or joy, communication patterns, and past emotional context. This is stored in an emotionally tagged memory graph, but only for your personal interactions.",
        },
      ],
    },
    {
      icon: Shield,
      title: "How Your Data Is Protected",
      content: [
        {
          heading: "Encryption by default",
          text: "Your messages and emotional data are encrypted in transit and at rest.",
        },
        {
          heading: "Tamper-resistant storage",
          text: "Emotional memory can optionally use a secure, verifiable storage layer that prevents unauthorized alterations.",
        },
        {
          heading: "Strict access controls",
          text: "No team member can view your messages unless you explicitly authorize it for support purposes.",
        },
      ],
    },
    {
      icon: AlertCircle,
      title: "Safety in Emotional Interaction",
      content: [
        {
          heading: "The AI is supportive, not directive.",
          text: "It will never: tell you what decisions to make, encourage harmful behavior, exploit emotional states, or attempt to manipulate your feelings.",
        },
        {
          heading: "The AI is not a substitute for medical or crisis support.",
          text: "If you express severe distress, the AI will gently encourage you to seek help from appropriate professional resources and may provide crisis hotline information.",
        },
        {
          heading: "Empathy without dependency",
          text: "The AI is designed to be emotionally intelligent—not emotionally manipulative. It avoids creating unhealthy attachment or replacing human relationships.",
        },
      ],
    },
    {
      icon: Eye,
      title: "Transparency in How the AI Works",
      content: [
        {
          heading: "No hidden agendas",
          text: "You will always know: when data is stored, how emotional information is used, what the AI can and cannot do, when a memory is being retrieved, and how you can turn off or delete features.",
        },
        {
          heading: "Explainable emotional reasoning",
          text: 'You can ask the AI questions like: "Why did you interpret my message this way?", "Why did you use that tone?", "What emotional signals did you think you saw?" And it will give you a clear, understandable explanation.',
        },
      ],
    },
    {
      icon: Settings,
      title: "Your Control at Every Step",
      content: [
        {
          heading: "You can customize:",
          text: "What the AI remembers, whether emotional memory is on or off, whether the AI adapts to your communication style, how much emotional depth the AI uses in responses, and whether the AI uses reinforcement to evolve with you.",
        },
        { heading: "", text: "You can also reset the AI's emotional understanding at any time." },
      ],
    },
    {
      icon: FileCheck,
      title: "Ethical Foundations",
      content: [
        {
          heading: "",
          text: "We designed the system using validated psychological and neuroscientific principles, but with strict safeguards to avoid: emotional manipulation, bias amplification, harmful personalization, and cultural insensitivity.",
        },
        {
          heading: "",
          text: "We continually review and audit the system to ensure it remains aligned with ethical emotional intelligence, not exploitative emotional analysis.",
        },
      ],
    },
    {
      icon: UserCheck,
      title: "Responsible AI That Evolves With Oversight",
      content: [
        {
          heading: "Dynamic Self-Evolution (DSE)",
          text: "While the AI adapts to you based on your feedback, it does not modify itself in ways that could reduce safety. Adaptation is bounded, monitored, and transparent.",
        },
        {
          heading: "Emotionally-aware memory (dRAG)",
          text: "The system organizes memories with emotional context to better support you—but it never uses this memory to influence or manipulate decisions.",
        },
        {
          heading: "Bias and fairness safeguards",
          text: "Processes are in place to prevent emotional tagging from reinforcing negative stereotypes or misinterpreting emotional signals across cultures.",
        },
      ],
    },
    {
      icon: Users,
      title: "Crisis & Well-Being Safeguards",
      content: [
        {
          heading: "The AI is programmed to:",
          text: "De-escalate emotional tension, avoid harmful or triggering phrasing, encourage grounding and reflection, recommend professional support when needed, and never provide medical, legal, or life-altering advice.",
        },
        {
          heading: "",
          text: "If you express signs of immediate risk, the AI responds with care and directs you to appropriate help resources.",
        },
      ],
    },
    {
      icon: CheckCircle,
      title: "Our Commitment to You",
      content: [
        {
          heading: "You deserve technology that:",
          text: "Respects your privacy, prioritizes your well-being, protects your emotional information, communicates with empathy, and earns your trust every day.",
        },
        {
          heading: "",
          text: "We are committed to transparency, safety, and ethical emotional intelligence at every step of your experience.",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/chat" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">Kio</span>
        </Link>

        <Link href="/chat">
          <Button variant="ghost" className="text-white hover:text-primary">
            Back to Chat
          </Button>
        </Link>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">Trust & Safety</h1>
          <p className="text-xl text-white/70 text-balance">Your well-being, privacy, and confidence come first.</p>
          <p className="text-white/60 mt-6 leading-relaxed max-w-3xl mx-auto">
            We built this AI companion on Kaiko's EQ+ emotional-intelligence system to make interactions feel more
            supportive, understanding, and human. But emotional intelligence also requires responsibility. This page
            explains exactly how your data is handled, how your emotional information is used, and what safeguards are
            in place to ensure your experience is safe, transparent, and fully in your control.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white flex-1">{section.title}</h2>
                </div>

                <div className="space-y-4 pl-0 md:pl-16">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      {item.heading && <h3 className="text-white font-semibold mb-2">{item.heading}</h3>}
                      <p className="text-white/80 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-white/60 text-sm">
            Questions about our safety practices?{" "}
            <Link href="/faq" className="text-primary hover:underline">
              Visit our FAQ
            </Link>{" "}
            or{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              read our Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  )
}
