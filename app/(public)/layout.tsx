export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flow-gradient flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="w-full max-w-md relative z-10">{children}</div>
    </div>
  )
}
