import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen gradient-aurora flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold gradient-text">How can Kio help you today?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Your personal AI companion for emotional exploration, goal setting, and meaningful conversations
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/auth/signin">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-6 text-lg rounded-xl"
            >
              Get Started
            </Button>
          </Link>
          <Link href="/auth/signin">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-border hover:bg-surface text-foreground px-8 py-6 text-lg rounded-xl bg-transparent"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 pt-16">
          <div className="gradient-card p-6 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Personalized Conversations</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customize your AI agent's personality and communication style
            </p>
          </div>

          <div className="gradient-card p-6 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Goal Tracking</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Set and achieve your personal goals with AI guidance
            </p>
          </div>

          <div className="gradient-card p-6 rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Memory & Context</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your conversations are remembered and organized automatically
            </p>
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-16 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <Link href="/pricing" className="hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link
            href="https://kaikostudios.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Kaiko Studios
          </Link>
          <Link href="/faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link href="/trust-safety" className="hover:text-foreground transition-colors">
            Trust & Safety
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
        </div>
      </div>
    </div>
  )
}
