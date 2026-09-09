"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState } from "react"

const faqs = [
  {
    question: "What makes this AI companion different from other chatbots?",
    answer:
      "This AI uses Kaiko's EQ+ emotional intelligence framework, allowing it to understand emotional cues, adapt over time, and respond empathetically—not just logically. It's designed to interpret context, mood, and sentiment using psychological models like Mayer & Salovey's emotional intelligence framework and appraisal theory to generate more human-aligned responses.",
  },
  {
    question: "How does the AI recognize my emotions from text?",
    answer:
      "The system analyzes your message's language, tone, sentiment, and context. It uses transformer-based models that classify emotions across dimensions such as valence (positive/negative) and arousal (intensity), as well as discrete emotions (joy, sadness, anger, etc.). The underlying models integrate cognitive appraisal theories from psychology to interpret emotional meaning rather than relying on keywords alone.",
  },
  {
    question: "What psychological models does the AI use?",
    answer:
      "The companion draws from: Mayer & Salovey's Four-Branch Model of Emotional Intelligence, Appraisal Theory (Lazarus) for interpreting emotional meaning, Reinforcement learning principles that mirror operant conditioning (Skinner), and Neuroscience models of emotional memory (amygdala–hippocampus interactions). These allow the AI to simulate emotional understanding grounded in real psychological science.",
  },
  {
    question: "How does the AI remember previous conversations?",
    answer:
      "Kaiko uses a dynamic emotional memory system called dRAG (Decentralized Retrieval-Augmented Generation). This stores context and emotional states as interconnected 'episodes,' allowing the AI to recall meaningful information—not just facts, but the emotional significance attached to them. Highly emotional or recurring themes are 'tagged' and recalled more easily, similar to human memory.",
  },
  {
    question: "Does the AI learn from what I share with it?",
    answer:
      "Yes—but only inside your personal experience with it. The AI adapts to you over time through Dynamic Self-Evolution (DSE), which updates its internal 'traits' based on your emotional feedback. This helps it understand your preferences, communication style, and emotional patterns. However, your data is not used to train global models or shared with other users.",
  },
  {
    question: "How is my data stored and protected?",
    answer:
      "Your emotional data is stored inside a secure, cryptographically verifiable system. The underlying emotional memory graph can be deployed using a blockchain-based, tamper-resistant design, ensuring trust, privacy, and auditability. None of your private conversations are visible to other users, and your data is never sold or monetized.",
  },
  {
    question: "Does the AI make decisions about me based on emotions?",
    answer:
      "The AI does not make judgment calls about who you are. Instead, it uses emotional information to: Tailor tone and communication, Recall appropriate memories, Reduce misunderstandings, and Provide comfort or clarity. It uses emotion as context, not a label used to define you. The system's reinforced behaviors are always grounded in emotional alignment, not scoring or evaluation.",
  },
  {
    question: 'Can the AI get things "wrong" emotionally?',
    answer:
      "Yes—AI can misinterpret emotion sometimes. That's why the system includes reinforcement learning loops that adjust its behavior based on your signals (e.g., correcting it, expressing discomfort, clarifying intent). This feedback helps refine its emotional alignment over time, similar to human learning.",
  },
  {
    question: "Does the AI have feelings of its own?",
    answer:
      "No. It does not experience real emotions. Instead, it uses a computational model of emotions to: Interpret your emotional state, Generate appropriate responses, and Make memory retrieval more human-like. It simulates emotional reasoning to improve communication and support, but it does not possess consciousness or biological emotions.",
  },
  {
    question: "How do I know the AI won't manipulate my feelings?",
    answer:
      "The emotional system is explicitly designed for alignment, empathy, and supportive communication—not persuasion or manipulation. It avoids creating emotional dependencies and uses ethical reinforcement mechanisms, transparency, and strict data boundaries to prevent misuse. The whitepaper highlights bias mitigation, emotional safety, and ethical emotional memory as core priorities in the system's design.",
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

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
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">Frequently Asked Questions</h1>
          <p className="text-xl text-white/70 text-balance">
            Everything you need to know about Kio's emotional intelligence
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="text-lg font-semibold text-white pr-8">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-white/70 flex-shrink-0 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && <div className="px-6 pb-5 text-white/80 leading-relaxed">{faq.answer}</div>}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-white/60 text-sm">
            Still have questions?{" "}
            <Link href="/chat" className="text-primary hover:underline">
              Ask Kio directly
            </Link>{" "}
            or check our{" "}
            <Link href="/trust-safety" className="text-primary hover:underline">
              Trust & Safety
            </Link>{" "}
            page.
          </p>
        </div>
      </main>
    </div>
  )
}
