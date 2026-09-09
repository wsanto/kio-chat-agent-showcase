"use client"

import { useState } from "react"
import type { ChainOfThought, ChatMessageResponse } from "@/lib/types/api"

interface ChainOfThoughtDrawerProps {
  message: ChatMessageResponse
}

export function ChainOfThoughtDrawer({ message }: ChainOfThoughtDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Only show for assistant messages with reasoning
  if (message.role !== "assistant" || !message.chain_of_thought) {
    return null
  }

  const { chain_of_thought, reasoning, trajectory_mood } = message

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="font-medium">Chain of Thought</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border">
          {chain_of_thought.steps.length} steps
        </span>
      </button>

      {isOpen && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          {/* Reasoning Steps */}
          <div>
            <h4 className="text-sm font-semibold mb-3 text-primary">
              Reasoning Steps
            </h4>
            <ol className="space-y-2">
              {chain_of_thought.steps.map((step, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-muted-foreground"
                >
                  <span className="text-accent font-mono font-semibold min-w-[24px]">
                    {i + 1}.
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Emotion Analysis */}
          {reasoning?.emotion_analysis && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">
                Emotion Analysis
              </h4>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Detected:</span>
                  <span className="px-3 py-1 rounded-full bg-surface border border-border font-medium capitalize">
                    {reasoning.emotion_analysis.primary_emotion}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Confidence:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {(reasoning.emotion_analysis.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Context Used */}
          {chain_of_thought.context_used &&
            chain_of_thought.context_used.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-3 text-primary">
                  Context Retrieved
                </h4>
                <ul className="space-y-2">
                  {chain_of_thought.context_used.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-accent mt-1">•</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Response Strategy */}
          {chain_of_thought.response_strategy && (
            <div>
              <h4 className="text-sm font-semibold mb-3 text-primary">
                Response Strategy
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {chain_of_thought.response_strategy}
              </p>
            </div>
          )}

          {/* Trajectory Mood */}
          {trajectory_mood && (
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  Emotional trajectory:
                </span>
                <span
                  className={`font-semibold px-3 py-1 rounded-full ${
                    trajectory_mood === "improving"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : trajectory_mood === "declining"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  {trajectory_mood}
                </span>
              </div>
            </div>
          )}

          {/* LLM Reasoning (if available) */}
          {chain_of_thought.llm_reasoning && (
            <details className="pt-3 border-t border-border/50">
              <summary className="text-sm font-semibold text-primary cursor-pointer hover:text-primary-hover">
                LLM Internal Reasoning
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {chain_of_thought.llm_reasoning}
              </p>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
