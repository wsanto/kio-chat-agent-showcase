"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center shadow-xl"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeMenu}
        />
      )}

      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <Link href="/chat" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-lg">Kio</span>
          </Link>

          <button onClick={closeMenu} className="p-2 rounded-lg hover:bg-surface-elevated transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <Link href="/chat/emotional-exploration" onClick={closeMenu}>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === "/chat/emotional-exploration"
                  ? "bg-surface-elevated text-foreground"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>Emotional Exploration</span>
            </button>
          </Link>

          <Link href="/chat/history" onClick={closeMenu}>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === "/chat/history"
                  ? "bg-surface-elevated text-foreground"
                  : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
              }`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>History</span>
            </button>
          </Link>

          <div className="pt-2 pb-2 border-t border-border space-y-1 mt-2">
            <Link href="/goals" onClick={closeMenu}>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Goals</span>
                <span className="ml-auto text-xs text-muted-foreground">Soon</span>
              </button>
            </Link>

            <div className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span>Core Memories</span>
              <span className="ml-auto text-xs text-muted-foreground">Soon</span>
            </div>

            <Link href="/chat/core-beliefs" onClick={closeMenu}>
              <button
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === "/chat/core-beliefs"
                    ? "bg-surface-elevated text-foreground"
                    : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span>Core Beliefs</span>
              </button>
            </Link>
          </div>
        </nav>

        {/* Upgrade Section */}
        <div className="p-4 border-t border-border">
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-semibold">Upgrade to PRO</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Enjoy quicker replies, cool image creations, and a better search experience!
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
