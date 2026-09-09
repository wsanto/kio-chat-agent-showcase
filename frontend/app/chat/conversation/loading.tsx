export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary animate-pulse glow-ring" />
        <p className="text-muted-foreground">Loading conversation...</p>
      </div>
    </div>
  )
}
