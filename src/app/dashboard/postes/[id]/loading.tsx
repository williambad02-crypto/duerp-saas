export default function PosteDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-48 bg-gray-100 rounded" />
      {/* En-tête */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
        <div className="h-6 w-56 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>
      {/* Opérations */}
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
            <div className="h-7 w-20 bg-gray-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
