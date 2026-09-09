"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Check } from "lucide-react"

const pricingPlans = [
  {
    name: "Free Trial",
    price: "$0",
    period: "14 days",
    description: "Try Kio with full access for 14 days",
    features: [
      "Full access to all features",
      "Unlimited conversations",
      "Emotional memory & insights",
      "Core beliefs mapping",
      "No credit card required",
    ],
    cta: "Start Free Trial",
    href: "/auth/signup",
    highlighted: false,
  },
  {
    name: "Standard",
    price: "$20",
    period: "per month",
    description: "Perfect for regular users",
    features: [
      "Up to 300 credits per month",
      "Full emotional intelligence",
      "Priority support",
      "Advanced memory features",
      "Emotional exploration reports",
    ],
    cta: "Subscribe Now",
    stripeLink: "https://buy.stripe.com/your-standard-plan-link",
    highlighted: true,
  },
  {
    name: "Unlimited",
    price: "$50",
    period: "per month",
    description: "For power users who need unlimited access",
    features: [
      "Unlimited credits",
      "All Standard features",
      "Priority AI responses",
      "Advanced analytics",
      "Early access to new features",
      "Dedicated support",
    ],
    cta: "Go Unlimited",
    stripeLink: "https://buy.stripe.com/your-unlimited-plan-link",
    highlighted: false,
  },
]

export default function PricingPage() {
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
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance">Choose Your Plan</h1>
          <p className="text-xl text-white/70 text-balance">
            Start with a free trial, then pick the plan that works for you
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border rounded-3xl p-8 flex flex-col ${
                plan.highlighted ? "border-primary shadow-2xl shadow-primary/20 scale-105" : "border-white/20"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary px-6 py-1 rounded-full text-sm font-semibold text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/60 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60">/ {plan.period}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.stripeLink ? (
                <a href={plan.stripeLink} target="_blank" rel="noopener noreferrer">
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                        : "bg-white/10 hover:bg-white/20"
                    } text-white font-semibold py-6 text-lg`}
                  >
                    {plan.cta}
                  </Button>
                </a>
              ) : (
                <Link href={plan.href || "/auth/signup"}>
                  <Button className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-6 text-lg">
                    {plan.cta}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <p className="text-white/60 text-sm">
            All plans include a 14-day free trial. No credit card required to start.
          </p>
          <p className="text-white/60 text-sm mt-2">
            Questions?{" "}
            <Link href="/faq" className="text-primary hover:underline">
              Check our FAQ
            </Link>{" "}
            or contact support.
          </p>
        </div>
      </main>
    </div>
  )
}
