'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen gradient-aurora flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Error Card */}
        <div className="bg-surface border border-border rounded-2xl p-8 space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Authentication Error</h1>
            <p className="text-muted-foreground">
              Something went wrong during authentication. Please try again.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/signin">
              <Button className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl py-6">
                Try Again
              </Button>
            </Link>

            <Link href="/">
              <Button variant="outline" className="w-full border-border rounded-xl py-6">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
