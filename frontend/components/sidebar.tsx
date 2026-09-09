'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  const [chatHistory] = useState([
    { id: 1, title: 'Can you translate this paragrap...', date: 'Today' },
    { id: 2, title: 'Could you summarize this article...', date: 'Yesterday' },
    { id: 3, title: 'Can you write a simple calculator...', date: 'Yesterday' },
    { id: 4, title: 'Generate a business name', date: '2 days ago' },
    { id: 5, title: 'Code a simple calculator in Python...', date: '3 days ago' },
    { id: 6, title: 'Write a short poem about the oc...', date: '4 days ago' },
  ])

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${isCollapsed ? 'w-20' : 'w-64'} bg-surface border-r border-border flex flex-col h-screen
        transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary glow-ring flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {!isCollapsed && <span className="font-semibold text-lg">Kio</span>}
          </button>
          
          {!isCollapsed && (
            <button 
              onClick={() => {
                if (window.innerWidth < 1024) {
                  onToggle()
                } else {
                  setIsCollapsed(true)
                }
              }}
              className="p-2 rounded-lg hover:bg-surface-elevated transition-colors"
              title="Minimize sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* New Chat Button */}
        {!isCollapsed && (
          <div className="p-4">
            <Button className="w-full bg-primary hover:bg-primary-hover text-white rounded-xl justify-start gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New chat
            </Button>
          </div>
        )}
        
        {isCollapsed && (
          <div className="p-4 flex justify-center">
            <button className="w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <Link href="/chat/emotional-exploration">
            <button 
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === '/chat/emotional-exploration' ? 'bg-surface-elevated text-foreground' : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
              }`}
              title={isCollapsed ? 'Emotional Exploration' : ''}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {!isCollapsed && <span>Emotional Exploration</span>}
            </button>
          </Link>
          
          <Link href="/chat/history">
            <button 
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                pathname === '/chat/history' ? 'bg-surface-elevated text-foreground' : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
              }`}
              title={isCollapsed ? 'History' : ''}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {!isCollapsed && <span>History</span>}
            </button>
          </Link>

          {!isCollapsed && (
            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Chat history
              </div>
              <div className="space-y-1">
                {chatHistory.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition-colors text-left"
                  >
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{chat.title}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 pb-2 border-t border-border space-y-1">
            <Link href="/goals">
              <button
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === '/goals' ? 'bg-surface-elevated text-foreground' : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                }`}
                title={isCollapsed ? 'Goals' : ''}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {!isCollapsed && <span>Goals</span>}
              </button>
            </Link>

            <div
              className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm text-muted-foreground/50 cursor-not-allowed`}
              title={isCollapsed ? 'Core Memories (Coming Soon)' : ''}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {!isCollapsed && (
                <>
                  <span>Core Memories</span>
                  <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                </>
              )}
            </div>

            <Link href="/chat/core-beliefs">
              <button 
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  pathname === '/chat/core-beliefs' ? 'bg-surface-elevated text-foreground' : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground'
                }`}
                title={isCollapsed ? 'Core Beliefs' : ''}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {!isCollapsed && <span>Core Beliefs</span>}
              </button>
            </Link>
          </div>
        </nav>

        {/* Upgrade Section */}
        {!isCollapsed && (
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
              <Button className="w-full bg-primary hover:bg-primary-hover text-white rounded-lg text-sm py-2">
                Learn more
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
