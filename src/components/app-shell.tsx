'use client'

import { BottomNav } from './bottom-nav'

interface AppShellProps {
  children: React.ReactNode
  hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-md flex-1 pb-20">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
