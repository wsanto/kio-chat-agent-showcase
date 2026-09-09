'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/contexts/AuthContext'

export default function SignUpPage() {
  const router = useRouter()
  const { signInWithGoogle, signUpWithEmail, isAuthenticated, isLoading: authLoading, error, clearError } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/chat')
    }
  }, [isAuthenticated, authLoading, router])

  // Clear errors when inputs change
  useEffect(() => {
    if (error) {
      clearError()
    }
    setValidationError('')
  }, [name, email, password, confirmPassword])

  const handleGoogleAuth = async () => {
    await signInWithGoogle()
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)

    try {
      const success = await signUpWithEmail(email, password, name || undefined)
      if (success) {
        router.push('/onboarding')
      }
    } catch (err) {
      // Error is handled by AuthContext
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-aurora flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const displayError = validationError || error

  return (
    <div className="min-h-screen gradient-aurora flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Sign Up Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="text-muted-foreground">Start your journey with Kio</p>
          </div>

          {/* Error Message */}
          {displayError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-sm text-center">
              {displayError}
            </div>
          )}

          {/* Google Auth Button */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleAuth}
              className="w-full bg-surface-elevated hover:bg-border text-foreground border border-border rounded-xl py-6"
              type="button"
              disabled={isSubmitting}
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-surface-elevated border-border rounded-xl py-6"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-surface-elevated border-border rounded-xl py-6"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-elevated border-border rounded-xl py-6"
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-surface-elevated border-border rounded-xl py-6"
                required
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/signin" className="text-primary hover:text-primary-hover font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
