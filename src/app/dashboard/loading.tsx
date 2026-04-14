export default function DashboardLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-56 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded" />
      </div>
      {/* Cartes stat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
            <div className="h-3 w-24 bg-gray-100 rounded" />
            <div className="h-8 w-12 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
      {/* Section risques */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
      {/* Top 5 */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50">
            <div className="h-5 w-12 bg-gray-100 rounded-full" />
            <div className="h-4 flex-1 bg-gray-100 rounded" />
            <div className="h-4 w-12 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
