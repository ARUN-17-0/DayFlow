export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-df-border overflow-hidden p-4 space-y-3">
      <div className="h-8 bg-mist-grey rounded-lg skeleton-shimmer w-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2 border-b border-df-border/50">
          <div className="w-9 h-9 rounded-full bg-mist-grey skeleton-shimmer flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-mist-grey rounded skeleton-shimmer w-1/3" />
            <div className="h-3 bg-mist-grey rounded skeleton-shimmer w-1/4" />
          </div>
          <div className="w-20 h-6 bg-mist-grey rounded-full skeleton-shimmer" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-df-border space-y-3">
          <div className="h-4 bg-mist-grey rounded skeleton-shimmer w-1/2" />
          <div className="h-8 bg-mist-grey rounded skeleton-shimmer w-3/4" />
          <div className="h-3 bg-mist-grey rounded skeleton-shimmer w-1/3" />
        </div>
      ))}
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-df-border p-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-mist-grey skeleton-shimmer" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-mist-grey rounded skeleton-shimmer w-48" />
          <div className="h-4 bg-mist-grey rounded skeleton-shimmer w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-12 bg-mist-grey rounded-xl skeleton-shimmer" />
        <div className="h-12 bg-mist-grey rounded-xl skeleton-shimmer" />
      </div>
    </div>
  )
}
