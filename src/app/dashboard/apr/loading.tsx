export default function APRLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
      <div>
        <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded" />
      </div>
      {/* Barre de filtres */}
      <div className="h-14 bg-gray-100 rounded-xl" />
      {/* Tableau */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="h-10 bg-gray-50 border-b border-gray-200" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3 border-b border-gray-100">
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-4 w-20 bg-gray-100 rounded" />
            <div className="h-5 w-12 bg-gray-100 rounded-full" />
            <div className="h-4 w-24 bg-gray-100 rounded" />
            <div className="h-4 w-10 bg-gray-100 rounded" />
            <div className="h-5 w-12 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
