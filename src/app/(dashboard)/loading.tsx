export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-3">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="h-12 w-80 bg-muted rounded-lg mb-2" />
          <div className="h-6 w-48 bg-muted rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted rounded-lg" />
          <div className="h-10 w-32 bg-muted rounded-lg" />
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6">
            <div className="h-4 w-24 bg-muted rounded mb-3" />
            <div className="h-8 w-36 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          <div className="h-6 w-40 bg-muted rounded mb-4" />
          <div className="h-[300px] bg-muted/50 rounded-lg" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-6 w-24 bg-muted rounded mb-4" />
          <div className="h-[300px] bg-muted/50 rounded-lg" />
        </div>
      </div>

      {/* Wallets skeleton */}
      <div>
        <div className="h-8 w-32 bg-muted rounded mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
